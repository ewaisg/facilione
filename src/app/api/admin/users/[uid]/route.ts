import { NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

/**
 * PATCH /api/admin/users/[uid]
 * Update user role or displayName
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  try {
    const { uid } = await params
    const body = await req.json()
    const { role, displayName } = body

    const updates: Record<string, unknown> = {}
    if (role) updates.role = role
    if (displayName) updates.displayName = displayName

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    // Update Firestore user doc
    await adminDb.collection("users").doc(uid).update(updates)

    // Update Firebase Auth display name if changed
    if (displayName) {
      await adminAuth.updateUser(uid, { displayName })
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
  _req: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  try {
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
