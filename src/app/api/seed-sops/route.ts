import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { SOP_DATA, ALL_SOP_KEYS } from "@/constants/sop-data"

/**
 * POST /api/seed-sops
 *
 * Seeds all SOP data (5 project types + 4 appendices) into Firestore.
 * Collection: kb/sops/{type}
 *
 * Idempotent — overwrites existing documents.
 * Run once after deploy to populate the Knowledge Base.
 */
export async function POST() {
  try {
    const batch = adminDb.batch()
    let count = 0

    for (const key of ALL_SOP_KEYS) {
      const sopData = SOP_DATA[key]
      if (!sopData) continue

      const ref = adminDb.collection("kb").doc("sops").collection("types").doc(key)
      batch.set(ref, sopData)
      count++
    }

    await batch.commit()

    return NextResponse.json({
      success: true,
      message: `Seeded ${count} SOP documents`,
      types: [...ALL_SOP_KEYS],
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to seed SOPs"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
