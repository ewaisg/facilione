/**
 * Firebase Storage Service
 * Handles file uploads and other file operations
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "./index"

/**
 * Delete a file from Firebase Storage
 */
export async function deleteStorageFile(path: string): Promise<void> {
  const fileRef = ref(storage, path)
  await deleteObject(fileRef)
}

/**
 * Upload a project parsing HTML artifact to Firebase Storage.
 */
export async function uploadProjectImportFile(
  file: File,
  projectId: string,
  parserType: string
): Promise<{ path: string; downloadUrl: string }> {
  const timestamp = Date.now()
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
  const storagePath = `projects/${projectId}/imports/${parserType}/${timestamp}_${safeFileName}`

  const storageRef = ref(storage, storagePath)
  const snapshot = await uploadBytes(storageRef, file)
  const downloadUrl = await getDownloadURL(snapshot.ref)

  return { path: storagePath, downloadUrl }
}
