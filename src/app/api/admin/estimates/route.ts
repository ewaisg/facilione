import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { requireRoles } from "@/lib/firebase-admin/request-auth"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRoles(req, ["admin"])
    if (!auth.ok) return auth.response

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")

    let query: FirebaseFirestore.Query = adminDb.collection("estimates")

    if (projectId) {
      query = query.where("projectId", "==", projectId)
    } else {
      query = query.orderBy("updatedAt", "desc").limit(50)
    }

    const snap = await query.get()
    const estimates = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    return NextResponse.json({ estimates })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to list estimates"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
