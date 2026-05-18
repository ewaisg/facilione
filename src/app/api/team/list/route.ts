import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { requireAppUser } from "@/lib/firebase-admin/request-auth"

/** Fields safe to expose to all authenticated users */
const ALLOWED_FIELDS = [
  "email",
  "displayName",
  "role",
  "orgId",
  "createdAt",
  "avatarUrl",
  "phone",
  "title",
] as const

function pickAllowedFields(data: Record<string, unknown>) {
  const result: Record<string, unknown> = {}
  for (const key of ALLOWED_FIELDS) {
    if (data[key] !== undefined) {
      result[key] = data[key]
    }
  }
  return result
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireAppUser(req)
    if (!auth.ok) return auth.response

    const snap = await adminDb.collection("users").get()
    const users: Array<Record<string, unknown> & { uid: string }> = snap.docs.map((doc) => ({
      uid: doc.id,
      ...pickAllowedFields(doc.data() as Record<string, unknown>),
    }))

    users.sort((a, b) => {
      const aCreated = typeof a["createdAt"] === "string" ? a["createdAt"] : ""
      const bCreated = typeof b["createdAt"] === "string" ? b["createdAt"] : ""
      if (aCreated && bCreated) return bCreated.localeCompare(aCreated)
      if (aCreated) return -1
      if (bCreated) return 1
      return String(a.uid).localeCompare(String(b.uid))
    })

    return NextResponse.json({ users })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to list team members"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
