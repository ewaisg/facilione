/**
 * Firestore Estimate Data Access
 *
 * CRUD operations for the /estimates/{estimateId} collection.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Estimate, EstimateProjectInfo, EstimateSection, EstimateComparisonContext } from "@/types/estimate"

const COLLECTION = "estimates"

/**
 * Save an estimate (create or update).
 */
export async function saveEstimate(estimate: {
  id?: string
  userId: string
  projectId: string | null
  projectInfo: EstimateProjectInfo
  sections: EstimateSection[]
  comparisonContext?: EstimateComparisonContext
}): Promise<string> {
  const now = new Date().toISOString()
  const ref = estimate.id
    ? doc(db, COLLECTION, estimate.id)
    : doc(collection(db, COLLECTION))

  const data = {
    userId: estimate.userId,
    projectId: estimate.projectId,
    projectInfo: estimate.projectInfo,
    sections: estimate.sections,
    comparisonContext: estimate.comparisonContext || null,
    updatedAt: now,
    ...(!estimate.id ? { createdAt: now } : {}),
  }

  await setDoc(ref, data, { merge: true })
  return ref.id
}

/**
 * Load a single estimate by ID.
 */
export async function getEstimate(estimateId: string): Promise<Estimate | null> {
  const snap = await getDoc(doc(db, COLLECTION, estimateId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Estimate
}

/**
 * List all estimates for a given user, ordered by most recent.
 */
export async function listEstimatesForUser(userId: string): Promise<Estimate[]> {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc"),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Estimate)
}

/**
 * List all estimates for a given project.
 */
export async function listEstimatesForProject(projectId: string): Promise<Estimate[]> {
  const q = query(
    collection(db, COLLECTION),
    where("projectId", "==", projectId),
    orderBy("updatedAt", "desc"),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Estimate)
}

/**
 * List recent estimates for a project, with a fallback for legacy records.
 */
export async function listRecentEstimatesForProject(projectId: string): Promise<Estimate[]> {
  const projectList = await listEstimatesForProject(projectId)
  if (projectList.length > 0) return projectList

  const fallbackQuery = query(
    collection(db, COLLECTION),
    orderBy("updatedAt", "desc"),
    limit(50),
  )
  const snap = await getDocs(fallbackQuery)
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Estimate)
    .filter((estimate) => {
      const legacyStore = String(estimate.projectInfo?.store || "").trim()
      return estimate.projectId === projectId || legacyStore === projectId
    })
}

/**
 * Delete an estimate by ID.
 */
export async function deleteEstimate(estimateId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, estimateId))
}
