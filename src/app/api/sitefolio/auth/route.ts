import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/firebase-admin/request-auth"
import { getSessionStatus } from "@/lib/sitefolio/session-store"

export async function GET(req: NextRequest) {
  const auth = await requireRoles(req, ["admin"])
  if (!auth.ok) return auth.response

  try {
    const status = await getSessionStatus()
    return NextResponse.json(status)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to check session"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
