import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import templates from "@/lib/schedule/templates.json"

/**
 * POST /api/seed-templates
 *
 * Seeds all 5 parsed schedule templates into Firestore kb/templates/{type}.
 * Run once after initial deploy to populate the Knowledge Base.
 * Idempotent — overwrites existing documents.
 */
export async function POST() {
  try {
    const batch = adminDb.batch()
    let count = 0

    for (const [type, template] of Object.entries(templates)) {
      const ref = adminDb.collection("kb").doc("templates").collection("types").doc(type)
      batch.set(ref, template)
      count++
    }

    await batch.commit()

    return NextResponse.json({
      success: true,
      message: `Seeded ${count} schedule templates`,
      types: Object.keys(templates),
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to seed templates"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
