import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

async function verifyToken(rawToken: string): Promise<string | null> {
  // Support both true Firebase session cookies and plain Firebase ID tokens.
  try {
    const decodedSession = await adminAuth.instance.verifySessionCookie(rawToken, true)
    return decodedSession.uid
  } catch {
    // Not a session cookie, try ID token.
  }

  try {
    const decodedIdToken = await adminAuth.instance.verifyIdToken(rawToken, true)
    return decodedIdToken.uid
  } catch {
    return null
  }
}

function readBearerToken(req: NextRequest): string {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization") || ""
  if (!authHeader.toLowerCase().startsWith("bearer ")) return ""
  return authHeader.slice(7).trim()
}

export async function requireAppUser(
  req: NextRequest,
): Promise<{ ok: true; uid: string; role: string } | { ok: false; response: NextResponse }> {
  const cookieToken = req.cookies.get("__session")?.value?.trim() || ""
  const bearerToken = readBearerToken(req)
  const token = cookieToken || bearerToken

  if (!token) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  const uid = await verifyToken(token)
  if (!uid) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  const userSnap = await adminDb.collection("users").doc(uid).get()
  const role = String(userSnap.data()?.role || "")
  if (!role) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  return { ok: true, uid, role }
}

export async function requireRoles(
  req: NextRequest,
  allowedRoles: string[],
): Promise<{ ok: true; uid: string; role: string } | { ok: false; response: NextResponse }> {
  const auth = await requireAppUser(req)
  if (!auth.ok) return auth

  if (!allowedRoles.includes(auth.role)) {
    return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }

  return auth
}
