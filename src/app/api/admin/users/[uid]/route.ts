import { NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"
import { requireRoles } from "@/lib/firebase-admin/request-auth"

const VALID_USER_ROLES = new Set(["admin", "cm", "pm"])

/**
 * PATCH /api/admin/users/[uid]
 * Update user role or displayName
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  try {
    const auth = await requireRoles(req, ["admin"])
    if (!auth.ok) return auth.response

    const { uid } = await params
    const body = await req.json()
    const { role, displayName } = body

    const updates: Record<string, unknown> = {}
    if ("role" in body) {
      if (typeof role !== "string" || !VALID_USER_ROLES.has(role)) {
        return NextResponse.json(
          { error: "role must be one of: admin, cm, pm" },
          { status: 400 },
        )
      }
      updates.role = role
    }
    if ("displayName" in body) {
      if (typeof displayName !== "string" || !displayName.trim()) {
        return NextResponse.json(
          { error: "displayName must be a non-empty string" },
          { status: 400 },
        )
      }
      if (displayName.trim().length > 120) {
        return NextResponse.json(
          { error: "displayName must be 120 characters or fewer" },
          { status: 400 },
        )
      }
      updates.displayName = displayName.trim()
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    // Update Firestore user doc
    await adminDb.collection("users").doc(uid).update(updates)

    // Update Firebase Auth display name if changed
    if (typeof updates.displayName === "string") {
      await adminAuth.updateUser(uid, { displayName: updates.displayName })
    }

    return NextResponse.json({ success: true, uid, updates })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update user"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/users/[uid]
 * Delete user from Firebase Auth and Firestore
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  try {
    const auth = await requireRoles(req, ["admin"])
    if (!auth.ok) return auth.response

    const { uid } = await params

    // Delete from Firebase Auth
    await adminAuth.deleteUser(uid)

    // Delete from Firestore
    await adminDb.collection("users").doc(uid).delete()

    return NextResponse.json({ success: true, uid })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete user"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
