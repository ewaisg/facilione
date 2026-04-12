import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  type DocumentData,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { AiSession, AiMessage } from "@/types/ai-session"

// ─── Sessions ─────────────────────────────────────────────────

export async function createSession(
  session: Omit<AiSession, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  const now = new Date().toISOString()
  const ref = doc(collection(db, "ai-sessions"))
  await setDoc(ref, {
    ...session,
    createdAt: now,
    updatedAt: now,
  })
  return ref.id
}

export async function listUserSessions(userId: string): Promise<AiSession[]> {
  const q = query(
    collection(db, "ai-sessions"),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc"),
    limit(50),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AiSession)
}

export async function deleteSession(sessionId: string): Promise<void> {
  await deleteDoc(doc(db, "ai-sessions", sessionId))
}

export async function updateSessionTitle(
  sessionId: string,
  title: string,
): Promise<void> {
  const { updateDoc } = await import("firebase/firestore")
  await updateDoc(doc(db, "ai-sessions", sessionId), {
    title,
    updatedAt: new Date().toISOString(),
  })
}

// ─── Messages ─────────────────────────────────────────────────

export async function addMessage(
  sessionId: string,
  message: Omit<AiMessage, "id" | "timestamp">,
): Promise<string> {
  const messagesRef = collection(db, "ai-sessions", sessionId, "messages")
  const ref = await addDoc(messagesRef, {
    ...message,
    timestamp: new Date().toISOString(),
  })

  // Touch session updatedAt
  const { updateDoc } = await import("firebase/firestore")
  await updateDoc(doc(db, "ai-sessions", sessionId), {
    updatedAt: new Date().toISOString(),
  })

  return ref.id
}

export async function getSessionMessages(sessionId: string): Promise<AiMessage[]> {
  const q = query(
    collection(db, "ai-sessions", sessionId, "messages"),
    orderBy("timestamp", "asc"),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AiMessage)
}
