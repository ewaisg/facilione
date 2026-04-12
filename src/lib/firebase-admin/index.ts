import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

/**
 * Firebase Admin SDK — lazy initialization.
 *
 * Defers initialization until first use so the build step
 * (which has no env vars) does not fail.
 */

let _app: App | null = null

function getAdminApp(): App {
  if (_app) return _app
  if (getApps().length > 0) {
    _app = getApps()[0]
    return _app
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin SDK: Missing environment variables. " +
        "Ensure FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and " +
        "FIREBASE_ADMIN_PRIVATE_KEY are set.",
    )
  }

  _app = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  })
  return _app
}

/** Lazy accessor for Firebase Admin Auth */
export const adminAuth = {
  get instance() {
    return getAuth(getAdminApp())
  },
  createUser(...args: Parameters<ReturnType<typeof getAuth>["createUser"]>) {
    return getAuth(getAdminApp()).createUser(...args)
  },
  getUser(...args: Parameters<ReturnType<typeof getAuth>["getUser"]>) {
    return getAuth(getAdminApp()).getUser(...args)
  },
  deleteUser(...args: Parameters<ReturnType<typeof getAuth>["deleteUser"]>) {
    return getAuth(getAdminApp()).deleteUser(...args)
  },
  listUsers(...args: Parameters<ReturnType<typeof getAuth>["listUsers"]>) {
    return getAuth(getAdminApp()).listUsers(...args)
  },
  updateUser(...args: Parameters<ReturnType<typeof getAuth>["updateUser"]>) {
    return getAuth(getAdminApp()).updateUser(...args)
  },
}

/** Lazy accessor for Firebase Admin Firestore */
export const adminDb = {
  get instance() {
    return getFirestore(getAdminApp())
  },
  collection(...args: Parameters<ReturnType<typeof getFirestore>["collection"]>) {
    return getFirestore(getAdminApp()).collection(...args)
  },
  doc(...args: Parameters<ReturnType<typeof getFirestore>["doc"]>) {
    return getFirestore(getAdminApp()).doc(...args)
  },
  batch() {
    return getFirestore(getAdminApp()).batch()
  },
}
