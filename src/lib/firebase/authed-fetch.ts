import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "./index"

function waitForUser(): Promise<User | null> {
  if (auth.currentUser) return Promise.resolve(auth.currentUser)
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}

/**
 * Wrapper around fetch that attaches a fresh Firebase ID token as a Bearer header.
 * Waits for Firebase Auth to initialize if currentUser isn't available yet.
 */
export async function authedFetch(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const currentUser = await waitForUser()
  if (!currentUser) {
    throw new Error("Not authenticated")
  }

  const token = await currentUser.getIdToken()

  const headers = new Headers(options?.headers)
  headers.set("Authorization", `Bearer ${token}`)

  return fetch(url, { ...options, headers })
}
