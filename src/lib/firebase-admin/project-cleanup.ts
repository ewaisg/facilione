import { adminDb } from "@/lib/firebase-admin"

const PROJECT_SUBCOLLECTIONS = ["phases", "weeklyUpdates", "sitefolio"]
const TASK_PROJECT_SUBCOLLECTIONS = ["tasks", "history", "customFields", "nextSteps"]
const QUERY_DELETE_BATCH_SIZE = 400

export interface ProjectDeleteSummary {
  projectId: string
  projectDeleted: boolean
  projectSubcollectionDocsDeleted: number
  taskProjectsDeleted: number
  taskProjectDocsDeleted: number
  estimatesDeleted: number
  aiSessionsDeleted: number
}

export async function deleteProjectCascade(projectId: string): Promise<ProjectDeleteSummary> {
  const projectRef = adminDb.collection("projects").doc(projectId)
  const projectSnap = await projectRef.get()
  const summary: ProjectDeleteSummary = {
    projectId,
    projectDeleted: projectSnap.exists,
    projectSubcollectionDocsDeleted: 0,
    taskProjectsDeleted: 0,
    taskProjectDocsDeleted: 0,
    estimatesDeleted: 0,
    aiSessionsDeleted: 0,
  }

  for (const subcollection of PROJECT_SUBCOLLECTIONS) {
    summary.projectSubcollectionDocsDeleted += await deleteCollection(
      projectRef.collection(subcollection),
    )
  }

  const taskProjectsSnap = await adminDb
    .collection("taskProjects")
    .where("linkedProjectId", "==", projectId)
    .get()

  for (const taskProjectDoc of taskProjectsSnap.docs) {
    summary.taskProjectDocsDeleted += await deleteTaskProjectCascade(taskProjectDoc.ref)
    summary.taskProjectsDeleted += 1
  }

  summary.estimatesDeleted = await deleteQuery(
    adminDb.collection("estimates").where("projectId", "==", projectId),
  )

  summary.aiSessionsDeleted = await deleteQuery(
    adminDb.collection("ai-sessions").where("projectId", "==", projectId),
  )

  if (projectSnap.exists) {
    await projectRef.delete()
  }

  return summary
}

async function deleteTaskProjectCascade(
  taskProjectRef: FirebaseFirestore.DocumentReference,
) {
  let deleted = 0

  for (const subcollection of TASK_PROJECT_SUBCOLLECTIONS) {
    deleted += await deleteCollection(taskProjectRef.collection(subcollection))
  }

  const sectionsSnap = await taskProjectRef.collection("sections").get()
  for (const sectionDoc of sectionsSnap.docs) {
    deleted += await deleteCollection(sectionDoc.ref.collection("tasks"))
    await sectionDoc.ref.delete()
    deleted += 1
  }

  await taskProjectRef.delete()
  deleted += 1

  return deleted
}

async function deleteCollection(collectionRef: FirebaseFirestore.CollectionReference) {
  let deleted = 0

  while (true) {
    const snap = await collectionRef.limit(QUERY_DELETE_BATCH_SIZE).get()
    if (snap.empty) return deleted

    const batch = adminDb.batch()
    snap.docs.forEach((doc) => batch.delete(doc.ref))
    await batch.commit()
    deleted += snap.size
  }
}

async function deleteQuery(queryRef: FirebaseFirestore.Query) {
  let deleted = 0

  while (true) {
    const snap = await queryRef.limit(QUERY_DELETE_BATCH_SIZE).get()
    if (snap.empty) return deleted

    const batch = adminDb.batch()
    snap.docs.forEach((doc) => batch.delete(doc.ref))
    await batch.commit()
    deleted += snap.size
  }
}
