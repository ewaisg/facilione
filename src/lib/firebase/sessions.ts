/**
 * User Session Management
 *
 * Tracks active user sessions across devices for security and session management.
 */

import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  writeBatch,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { UserSession } from "@/types"

/**
 * Parse user agent string to extract device info
 */
function parseUserAgent(userAgent: string): {
  browser: string
  os: string
  platform: string
} {
  let browser = "Unknown"
  let os = "Unknown"
  let platform = "desktop"

  // Browser detection
  if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
    browser = "Chrome"
  } else if (userAgent.includes("Edg")) {
    browser = "Edge"
  } else if (userAgent.includes("Firefox")) {
    browser = "Firefox"
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    browser = "Safari"
  }

  // OS detection
  if (userAgent.includes("Windows")) {
    os = "Windows"
  } else if (userAgent.includes("Mac")) {
    os = "macOS"
  } else if (userAgent.includes("Linux")) {
    os = "Linux"
  } else if (userAgent.includes("Android")) {
    os = "Android"
    platform = "mobile"
  } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    os = "iOS"
    platform = userAgent.includes("iPad") ? "tablet" : "mobile"
  }

  return { browser, os, platform }
}

/**
 * Create or update a session for the current device
 */
export async function createOrUpdateSession(
  userId: string,
  sessionId: string,
): Promise<void> {
  const userAgent = typeof window !== "undefined" ? window.navigator.userAgent : "Unknown"
  const deviceInfo = parseUserAgent(userAgent)

  const sessionRef = doc(db, "userSessions", sessionId)
  const now = new Date().toISOString()

  await setDoc(
    sessionRef,
    {
      userId,
      createdAt: now,
      lastActiveAt: now,
      deviceInfo: {
        userAgent,
        ...deviceInfo,
      },
    },
    { merge: true },
  )
}

/**
 * Update session last active timestamp
 */
export async function updateSessionActivity(sessionId: string): Promise<void> {
  const sessionRef = doc(db, "userSessions", sessionId)
  await setDoc(
    sessionRef,
    {
      lastActiveAt: new Date().toISOString(),
    },
    { merge: true },
  )
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: string): Promise<UserSession[]> {
  const sessionsRef = collection(db, "userSessions")
  const q = query(
    sessionsRef,
    where("userId", "==", userId),
    orderBy("lastActiveAt", "desc"),
  )

  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as UserSession)
}

/**
 * Delete a specific session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await deleteDoc(doc(db, "userSessions", sessionId))
}

/**
 * Delete all sessions for a user
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
  const sessionsRef = collection(db, "userSessions")
  const q = query(sessionsRef, where("userId", "==", userId))

  const snap = await getDocs(q)
  const batch = writeBatch(db)

  snap.docs.forEach((d) => {
    batch.delete(d.ref)
  })

  await batch.commit()
}

/**
 * Clean up stale sessions (older than 7 days)
 */
export async function cleanupStaleSessions(): Promise<number> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 7)
  const cutoffISO = cutoff.toISOString()

  const sessionsRef = collection(db, "userSessions")
  const snap = await getDocs(sessionsRef)

  const batch = writeBatch(db)
  let deleteCount = 0

  snap.docs.forEach((d) => {
    const session = d.data() as UserSession
    if (session.lastActiveAt < cutoffISO) {
      batch.delete(d.ref)
      deleteCount++
    }
  })

  await batch.commit()
  return deleteCount
}
