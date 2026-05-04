import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { requireRoles } from "@/lib/firebase-admin/request-auth"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRoles(req, ["admin"])
    if (!auth.ok) return auth.response

    const snap = await adminDb.collection("projects").orderBy("updatedAt", "desc").get()
    const projects = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json({ projects })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to list projects"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
