/**
 * Firestore Data Access Layer
 *
 * All project read/write operations go through this module.
 * Replaces hardcoded mock data throughout the app.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Project, ProjectWeeklyUpdate } from "@/types/project"
import type { Phase } from "@/types/schedule"
import type { AppUser } from "@/types/user"

// ─── Projects ─────────────────────────────────────────────────

/**
 * Create a new project and seed its phases in a single batch write.
 * Returns the new project document ID.
 */
export async function createProjectWithPhases(
  projectData: Omit<Project, "id" | "createdAt" | "updatedAt">,
  phases: Phase[],
): Promise<string> {
  const batch = writeBatch(db)

  // Create project document
  const projectRef = doc(collection(db, "projects"))
  const now = new Date().toISOString()
  batch.set(projectRef, {
    ...projectData,
    createdAt: now,
    updatedAt: now,
  })

  // Create phase sub-documents
  for (const phase of phases) {
    const phaseRef = doc(
      collection(db, "projects", projectRef.id, "phases"),
      phase.id,
    )
    batch.set(phaseRef, {
      ...phase,
      projectId: projectRef.id,
    })
  }

  await batch.commit()
  return projectRef.id
}

/**
 * Fetch a single project by ID.
 */
export async function getProject(
  projectId: string,
): Promise<Project | null> {
  const snap = await getDoc(doc(db, "projects", projectId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Project
}

/**
 * Fetch all projects for a given user based on their role.
 * - PM: only assigned projects (pmUserId == uid)
 * - CM: projects where pmUserId is in managedUserIds
 * - Admin: all projects in org
 */
export async function getProjectsForUser(
  user: AppUser,
): Promise<Project[]> {
  const projectsRef = collection(db, "projects")
  let q

  switch (user.role) {
    case "pm":
      q = query(projectsRef, where("pmUserId", "==", user.uid), orderBy("updatedAt", "desc"))
      break
    case "cm":
      // CM sees projects for all their managed PMs
      if (!Array.isArray(user.managedUserIds) || user.managedUserIds.length === 0) return []
      // Firestore 'in' supports up to 30 values
      q = query(
        projectsRef,
        where("pmUserId", "in", user.managedUserIds.slice(0, 30)),
        orderBy("updatedAt", "desc"),
      )
      break
    case "admin":
      // Admins are global and should see all projects.
      q = query(projectsRef, orderBy("updatedAt", "desc"))
      break
    default:
      return []
  }

  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Project)
}

/**
 * Subscribe to real-time project list updates.
 * Returns an unsubscribe function.
 */
export function subscribeToProjects(
  user: AppUser,
  onData: (projects: Project[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const projectsRef = collection(db, "projects")
  let q

  switch (user.role) {
    case "pm":
      q = query(projectsRef, where("pmUserId", "==", user.uid), orderBy("updatedAt", "desc"))
      break
    case "cm":
      if (!Array.isArray(user.managedUserIds) || user.managedUserIds.length === 0) {
        onData([])
        return () => {}
      }
      q = query(
        projectsRef,
        where("pmUserId", "in", user.managedUserIds.slice(0, 30)),
        orderBy("updatedAt", "desc"),
      )
      break
    case "admin":
      q = query(projectsRef, orderBy("updatedAt", "desc"))
      break
    default:
      onData([])
      return () => {}
  }

  return onSnapshot(
    q,
    (snap) => {
      const projects = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Project)
      onData(projects)
    },
    onError,
  )
}

/**
 * Update a project document.
 */
export async function updateProject(
  projectId: string,
  data: Partial<Project>,
): Promise<void> {
  await updateDoc(doc(db, "projects", projectId), {
    ...data,
    updatedAt: new Date().toISOString(),
  })
}

// ─── Phases ───────────────────────────────────────────────────

/**
 * Fetch all phases for a project, ordered by phaseNumber.
 */
export async function getProjectPhases(
  projectId: string,
): Promise<Phase[]> {
  const phasesRef = collection(db, "projects", projectId, "phases")
  const q = query(phasesRef, orderBy("phaseNumber", "asc"))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Phase)
}

/**
 * Subscribe to real-time phase updates for a project.
 */
export function subscribeToPhases(
  projectId: string,
  onData: (phases: Phase[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const phasesRef = collection(db, "projects", projectId, "phases")
  const q = query(phasesRef, orderBy("phaseNumber", "asc"))
  return onSnapshot(
    q,
    (snap) => {
      const phases = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Phase)
      onData(phases)
    },
    onError,
  )
}

/**
 * Update a milestone's completion date within a phase.
 */
export async function updateMilestoneDate(
  projectId: string,
  phaseId: string,
  itemId: string,
  newDate: string,
): Promise<void> {
  const phaseRef = doc(db, "projects", projectId, "phases", phaseId)
  const phaseSnap = await getDoc(phaseRef)

  if (!phaseSnap.exists()) {
    throw new Error(`Phase ${phaseId} not found`)
  }

  const phase = phaseSnap.data() as Phase
  const updatedItems = phase.checklistItems.map((item) =>
    item.id === itemId
      ? { ...item, completedDate: newDate, status: "complete" as const }
      : item,
  )

  await updateDoc(phaseRef, {
    checklistItems: updatedItems,
  })
}

// ─── Weekly Updates (Control Center) ─────────────────────────

/**
 * Upsert a weekly update for a project (1 entry per project per weekStart).
 */
export async function upsertProjectWeeklyUpdate(
  projectId: string,
  payload: {
    weekStart: string
    comment: string
    userId: string
    userName: string
  },
): Promise<string> {
  const updateId = `${payload.weekStart}_${payload.userId}`
  const updateRef = doc(db, "projects", projectId, "weeklyUpdates", updateId)
  const now = new Date().toISOString()

  await setDoc(
    updateRef,
    {
      projectId,
      weekStart: payload.weekStart,
      comment: payload.comment,
      createdBy: payload.userId,
      createdByName: payload.userName,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true },
  )

  return updateId
}

/**
 * Get latest weekly update for a project.
 */
export async function getLatestProjectWeeklyUpdate(
  projectId: string,
): Promise<ProjectWeeklyUpdate | null> {
  const updatesRef = collection(db, "projects", projectId, "weeklyUpdates")
  const q = query(updatesRef, orderBy("weekStart", "desc"), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null

  const d = snap.docs[0]
  return { id: d.id, ...d.data() } as ProjectWeeklyUpdate
}

// ─── Portfolio AI Cache ─────────────────────────────────────

/**
 * Get cached portfolio AI insights for a user.
 * Returns null if cache doesn't exist.
 */
export async function getPortfolioAiCache(
  userId: string,
): Promise<import("@/types").PortfolioAiCache | null> {
  const cacheRef = doc(db, "portfolioAiCache", userId)
  const snap = await getDoc(cacheRef)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as import("@/types").PortfolioAiCache
}

/**
 * Save portfolio AI insights cache for a user.
 */
export async function savePortfolioAiCache(
  userId: string,
  summary: string,
  metricsSnapshot: {
    activeProjects: number
    totalBudget: number
    atRiskCount: number
    overdueGoCount: number
    dueSoonGoCount: number
    scheduleOverdueCount: number
    weeklyStaleCount: number
  },
): Promise<void> {
  const cacheRef = doc(db, "portfolioAiCache", userId)
  await setDoc(cacheRef, {
    summary,
    lastGeneratedAt: new Date().toISOString(),
    metricsSnapshot,
  })
}

// ─── Task Projects ─────────────────────────────────────────

/**
 * Create a new task project with optional sections and next steps
 */
export async function createTaskProject(
  projectData: Omit<import("@/types").TaskProject, "id" | "createdAt" | "updatedAt">,
  sections?: Omit<import("@/types").TaskSection, "id" | "projectId" | "createdAt" | "updatedAt">[],
  nextSteps?: string[],
): Promise<string> {
  const batch = writeBatch(db)
  const projectRef = doc(collection(db, "taskProjects"))
  const now = new Date().toISOString()

  batch.set(projectRef, {
    ...projectData,
    createdAt: now,
    updatedAt: now,
  })

  // Create initial sections if provided
  if (sections) {
    sections.forEach((sec, idx) => {
      const secRef = doc(collection(db, "taskProjects", projectRef.id, "sections"))
      batch.set(secRef, {
        ...sec,
        projectId: projectRef.id,
        sortOrder: idx,
        createdAt: now,
        updatedAt: now,
      })
    })
  }

  // Create next steps if provided
  if (nextSteps) {
    nextSteps.forEach((text, idx) => {
      const stepRef = doc(collection(db, "taskProjects", projectRef.id, "nextSteps"))
      batch.set(stepRef, {
        text,
        projectId: projectRef.id,
        sortOrder: idx,
        createdAt: now,
      })
    })
  }

  await batch.commit()
  return projectRef.id
}

/**
 * Get all task projects for a user
 */
export async function getTaskProjects(
  user: AppUser,
): Promise<import("@/types").TaskProject[]> {
  const projectsRef = collection(db, "taskProjects")
  let q

  if (user.role === "admin") {
    q = query(projectsRef, where("orgId", "==", user.orgId), orderBy("updatedAt", "desc"))
  } else {
    q = query(projectsRef, where("createdBy", "==", user.uid), orderBy("updatedAt", "desc"))
  }

  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as import("@/types").TaskProject)
}

/**
 * Get a single task project by ID
 */
export async function getTaskProject(
  projectId: string,
): Promise<import("@/types").TaskProject | null> {
  const snap = await getDoc(doc(db, "taskProjects", projectId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as import("@/types").TaskProject
}

/**
 * Update a task project
 */
export async function updateTaskProject(
  projectId: string,
  updates: Partial<Omit<import("@/types").TaskProject, "id" | "createdAt">>,
): Promise<void> {
  await updateDoc(doc(db, "taskProjects", projectId), {
    ...updates,
    updatedAt: new Date().toISOString(),
  })
}

/**
 * Delete a task project and all its subcollections
 */
export async function deleteTaskProject(projectId: string): Promise<void> {
  const batch = writeBatch(db)

  // Delete sections and their tasks
  const sectionsSnap = await getDocs(collection(db, "taskProjects", projectId, "sections"))
  for (const secDoc of sectionsSnap.docs) {
    const tasksSnap = await getDocs(collection(db, "taskProjects", projectId, "sections", secDoc.id, "tasks"))
    tasksSnap.docs.forEach((taskDoc) => {
      batch.delete(taskDoc.ref)
    })
    batch.delete(secDoc.ref)
  }

  // Delete next steps
  const stepsSnap = await getDocs(collection(db, "taskProjects", projectId, "nextSteps"))
  stepsSnap.docs.forEach((stepDoc) => {
    batch.delete(stepDoc.ref)
  })

  // Delete project
  batch.delete(doc(db, "taskProjects", projectId))

  await batch.commit()
}

/**
 * Subscribe to task projects for real-time updates
 */
export function subscribeToTaskProjects(
  user: AppUser,
  onData: (projects: import("@/types").TaskProject[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const projectsRef = collection(db, "taskProjects")
  let q

  if (user.role === "admin") {
    q = query(projectsRef, where("orgId", "==", user.orgId), orderBy("updatedAt", "desc"))
  } else {
    q = query(projectsRef, where("createdBy", "==", user.uid), orderBy("updatedAt", "desc"))
  }

  return onSnapshot(
    q,
    (snap) => {
      const projects = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as import("@/types").TaskProject)
      onData(projects)
    },
    onError,
  )
}

// ─── Task Sections ─────────────────────────────────────────

/**
 * Get all sections for a task project
 */
export async function getTaskSections(
  projectId: string,
): Promise<import("@/types").TaskSection[]> {
  const sectionsRef = collection(db, "taskProjects", projectId, "sections")
  const q = query(sectionsRef, orderBy("sortOrder"))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as import("@/types").TaskSection)
}

/**
 * Subscribe to sections for real-time updates
 */
export function subscribeToTaskSections(
  projectId: string,
  onData: (sections: import("@/types").TaskSection[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const sectionsRef = collection(db, "taskProjects", projectId, "sections")
  const q = query(sectionsRef, orderBy("sortOrder"))

  return onSnapshot(
    q,
    (snap) => {
      const sections = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as import("@/types").TaskSection)
      onData(sections)
    },
    onError,
  )
}

/**
 * Create a new section
 */
export async function createTaskSection(
  projectId: string,
  sectionData: Omit<import("@/types").TaskSection, "id" | "projectId" | "createdAt" | "updatedAt">,
): Promise<string> {
  const secRef = doc(collection(db, "taskProjects", projectId, "sections"))
  const now = new Date().toISOString()

  await setDoc(secRef, {
    ...sectionData,
    projectId,
    createdAt: now,
    updatedAt: now,
  })

  // Update project timestamp
  await updateDoc(doc(db, "taskProjects", projectId), {
    updatedAt: now,
  })

  return secRef.id
}

/**
 * Update a section
 */
export async function updateTaskSection(
  projectId: string,
  sectionId: string,
  updates: Partial<Omit<import("@/types").TaskSection, "id" | "projectId" | "createdAt">>,
): Promise<void> {
  const now = new Date().toISOString()

  await updateDoc(doc(db, "taskProjects", projectId, "sections", sectionId), {
    ...updates,
    updatedAt: now,
  })

  // Update project timestamp
  await updateDoc(doc(db, "taskProjects", projectId), {
    updatedAt: now,
  })
}

/**
 * Delete a section and all its tasks
 */
export async function deleteTaskSection(
  projectId: string,
  sectionId: string,
): Promise<void> {
  const batch = writeBatch(db)

  // Delete all tasks in section
  const tasksSnap = await getDocs(collection(db, "taskProjects", projectId, "sections", sectionId, "tasks"))
  tasksSnap.docs.forEach((taskDoc) => {
    batch.delete(taskDoc.ref)
  })

  // Delete section
  batch.delete(doc(db, "taskProjects", projectId, "sections", sectionId))

  // Update project timestamp
  batch.update(doc(db, "taskProjects", projectId), {
    updatedAt: new Date().toISOString(),
  })

  await batch.commit()
}

// ─── Tasks ─────────────────────────────────────────────────

/**
 * Get all tasks for a section
 */
export async function getTasks(
  projectId: string,
  sectionId: string,
): Promise<import("@/types").Task[]> {
  const tasksRef = collection(db, "taskProjects", projectId, "sections", sectionId, "tasks")
  const q = query(tasksRef, orderBy("sortOrder"))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as import("@/types").Task)
}

/**
 * Subscribe to tasks for real-time updates
 */
export function subscribeToTasks(
  projectId: string,
  sectionId: string,
  onData: (tasks: import("@/types").Task[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const tasksRef = collection(db, "taskProjects", projectId, "sections", sectionId, "tasks")
  const q = query(tasksRef, orderBy("sortOrder"))

  return onSnapshot(
    q,
    (snap) => {
      const tasks = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as import("@/types").Task)
      onData(tasks)
    },
    onError,
  )
}

/**
 * Create a new task
 */
export async function createTask(
  projectId: string,
  sectionId: string,
  taskData: Omit<import("@/types").Task, "id" | "projectId" | "sectionId" | "createdAt" | "updatedAt">,
): Promise<string> {
  const taskRef = doc(collection(db, "taskProjects", projectId, "sections", sectionId, "tasks"))
  const now = new Date().toISOString()

  await setDoc(taskRef, {
    ...taskData,
    projectId,
    sectionId,
    createdAt: now,
    updatedAt: now,
  })

  // Update section and project timestamps
  await updateDoc(doc(db, "taskProjects", projectId, "sections", sectionId), {
    updatedAt: now,
  })
  await updateDoc(doc(db, "taskProjects", projectId), {
    updatedAt: now,
  })

  return taskRef.id
}

/**
 * Update a task
 */
export async function updateTask(
  projectId: string,
  sectionId: string,
  taskId: string,
  updates: Partial<Omit<import("@/types").Task, "id" | "projectId" | "sectionId" | "createdAt">>,
): Promise<void> {
  const now = new Date().toISOString()

  await updateDoc(doc(db, "taskProjects", projectId, "sections", sectionId, "tasks", taskId), {
    ...updates,
    updatedAt: now,
  })

  // Update section and project timestamps
  await updateDoc(doc(db, "taskProjects", projectId, "sections", sectionId), {
    updatedAt: now,
  })
  await updateDoc(doc(db, "taskProjects", projectId), {
    updatedAt: now,
  })
}

/**
 * Delete a task
 */
export async function deleteTask(
  projectId: string,
  sectionId: string,
  taskId: string,
): Promise<void> {
  const batch = writeBatch(db)
  const now = new Date().toISOString()

  batch.delete(doc(db, "taskProjects", projectId, "sections", sectionId, "tasks", taskId))
  batch.update(doc(db, "taskProjects", projectId, "sections", sectionId), {
    updatedAt: now,
  })
  batch.update(doc(db, "taskProjects", projectId), {
    updatedAt: now,
  })

  await batch.commit()
}

// ─── Next Steps ────────────────────────────────────────────

/**
 * Get all next steps for a task project
 */
export async function getNextSteps(
  projectId: string,
): Promise<import("@/types").NextStep[]> {
  const stepsRef = collection(db, "taskProjects", projectId, "nextSteps")
  const q = query(stepsRef, orderBy("sortOrder"))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as import("@/types").NextStep)
}

/**
 * Subscribe to next steps for real-time updates
 */
export function subscribeToNextSteps(
  projectId: string,
  onData: (steps: import("@/types").NextStep[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const stepsRef = collection(db, "taskProjects", projectId, "nextSteps")
  const q = query(stepsRef, orderBy("sortOrder"))

  return onSnapshot(
    q,
    (snap) => {
      const steps = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as import("@/types").NextStep)
      onData(steps)
    },
    onError,
  )
}

/**
 * Create a new next step
 */
export async function createNextStep(
  projectId: string,
  text: string,
  sortOrder: number,
): Promise<string> {
  const stepRef = doc(collection(db, "taskProjects", projectId, "nextSteps"))
  const now = new Date().toISOString()

  await setDoc(stepRef, {
    text,
    projectId,
    sortOrder,
    createdAt: now,
  })

  await updateDoc(doc(db, "taskProjects", projectId), {
    updatedAt: now,
  })

  return stepRef.id
}

/**
 * Update a next step
 */
export async function updateNextStep(
  projectId: string,
  stepId: string,
  text: string,
): Promise<void> {
  const now = new Date().toISOString()

  await updateDoc(doc(db, "taskProjects", projectId, "nextSteps", stepId), {
    text,
  })

  await updateDoc(doc(db, "taskProjects", projectId), {
    updatedAt: now,
  })
}

/**
 * Delete a next step
 */
export async function deleteNextStep(
  projectId: string,
  stepId: string,
): Promise<void> {
  const batch = writeBatch(db)
  const now = new Date().toISOString()

  batch.delete(doc(db, "taskProjects", projectId, "nextSteps", stepId))
  batch.update(doc(db, "taskProjects", projectId), {
    updatedAt: now,
  })

  await batch.commit()
}
