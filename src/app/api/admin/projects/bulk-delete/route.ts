import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/firebase-admin/request-auth"
import { deleteProjectCascade } from "@/lib/firebase-admin/project-cleanup"

export async function POST(req: NextRequest) {
  const auth = await requireRoles(req, ["admin"])
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const ids: string[] = Array.isArray(body.ids)
      ? Array.from(new Set(body.ids.map((id: unknown) => String(id || "").trim()).filter(Boolean)))
      : []

    if (ids.length === 0) {
      return NextResponse.json({ error: "ids array is required" }, { status: 400 })
    }

    if (ids.length > 500) {
      return NextResponse.json({ error: "Cannot delete more than 500 projects at once" }, { status: 400 })
    }

    let deleted = 0
    const errors: { id: string; error: string }[] = []

    for (const id of ids) {
      try {
        await deleteProjectCascade(id)
        deleted++
      } catch (err) {
        errors.push({
          id,
          error: err instanceof Error ? err.message : "Failed to delete",
        })
      }
    }

    return NextResponse.json({ deleted, errors })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bulk delete failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
