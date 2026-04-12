import { adminDb } from "@/lib/firebase-admin"
import type { SFCookieSession } from "./playwright-auth"

const SESSION_DOC = "sitefolio_sessions/current"

export interface StoredSFSession extends SFCookieSession {
  refreshedBy: "playwright-manual" | "playwright-auto"
  refreshedAt: string
}

export async function getStoredSession(): Promise<SFCookieSession | null> {
  const snap = await adminDb.doc(SESSION_DOC).get()
  if (!snap.exists) return null

  const data = snap.data() as StoredSFSession
  if (Date.now() >= data.expiresAt) return null

  return data
}

export async function storeSession(session: SFCookieSession): Promise<void> {
  const doc: StoredSFSession = {
    ...session,
    refreshedBy: "playwright-manual",
    refreshedAt: new Date().toISOString(),
  }
  await adminDb.doc(SESSION_DOC).set(doc)
}

export async function getSessionStatus(): Promise<{
  active: boolean
  memberId?: number
  enterpriseId?: number
  obtainedAt?: string
  expiresAt?: string
  expiresInDays?: number
}> {
  const session = await getStoredSession()
  if (!session) return { active: false }

  return {
    active: true,
    memberId: session.memberId,
    enterpriseId: session.enterpriseId,
    obtainedAt: new Date(session.obtainedAt).toISOString(),
    expiresAt: new Date(session.expiresAt).toISOString(),
    expiresInDays: Math.round((session.expiresAt - Date.now()) / 86400000),
  }
}
