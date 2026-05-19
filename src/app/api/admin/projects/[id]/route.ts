import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { requireRoles } from "@/lib/firebase-admin/request-auth"
import { buildAdminProjectPayload } from "@/lib/admin/project-validation"
import { deleteProjectCascade } from "@/lib/firebase-admin/project-cleanup"

/**
 * PATCH /api/admin/projects/[id]
 * Update project fields
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireRoles(req, ["admin"])
    if (!auth.ok) return auth.response

    const { id } = await params
    const body = await req.json()

    let updates: Record<string, unknown>
    try {
      updates = buildAdminProjectPayload(body, { partial: true }) as Record<string, unknown>
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Invalid project payload" },
        { status: 400 },
      )
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    const projectRef = adminDb.collection("projects").doc(id)
    const projectSnap = await projectRef.get()
    if (!projectSnap.exists) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    updates.updatedAt = new Date().toISOString()
    await projectRef.update(updates)

    return NextResponse.json({ success: true, id, updates })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update project"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/projects/[id]
 * Delete project and all sub-collections
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireRoles(req, ["admin"])
    if (!auth.ok) return auth.response

    const { id } = await params

    const summary = await deleteProjectCascade(id)

    return NextResponse.json({ success: true, id, summary })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete project"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
