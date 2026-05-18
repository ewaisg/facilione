import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

/**
 * Public endpoint to fetch branding info (logo URL).
 * No auth required — used by login page and app shell.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const docSnap = await adminDb.doc("systemSettings/branding").get()

    if (!docSnap.exists) {
      return NextResponse.json({ logoUrl: null })
    }

    const data = docSnap.data()
    return NextResponse.json({
      logoUrl: data?.logoUrl || null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch branding"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
