import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function GET() {
  try {
    // Avoid orderBy on optional legacy fields to prevent partial/empty reads.
    const snap = await adminDb.collection("users").get()
    const users: Array<Record<string, unknown> & { uid: string }> = snap.docs.map((doc) =>
      ({
        uid: doc.id,
        ...(doc.data() as Record<string, unknown>),
      }) as Record<string, unknown> & { uid: string }
    )

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
    const message = err instanceof Error ? err.message : "Failed to list users"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
