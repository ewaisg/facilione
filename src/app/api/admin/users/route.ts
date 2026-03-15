import { NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$"
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { displayName, email, role, orgId = "default" } = body

    if (!displayName || !email || !role) {
      return NextResponse.json({ error: "displayName, email, and role are required" }, { status: 400 })
    }

    const validRoles = ["admin", "cm", "pm", "director"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: `role must be one of: ${validRoles.join(", ")}` }, { status: 400 })
    }

    const tempPassword = generateTempPassword()

    // Create Firebase Auth user
    const userRecord = await adminAuth.createUser({
      email,
      password: tempPassword,
      displayName,
    })

    // Write Firestore user document
    await adminDb.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName,
      role,
      orgId,
      assignedProjectIds: [],
      managedUserIds: [],
      forcePasswordChange: true,
      createdAt: new Date().toISOString(),
      createdBy: "admin",
    })

    return NextResponse.json({
      success: true,
      uid: userRecord.uid,
      email,
      displayName,
      role,
      tempPassword, // Return once — admin must share securely
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create user"
    if (message.includes("email-already-exists")) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
