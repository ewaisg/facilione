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
