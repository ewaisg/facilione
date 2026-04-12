import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { FLOWCHARTS, FLOWCHART_KEYS } from "@/constants/flowchart-data"

/**
 * POST /api/seed-flowcharts
 *
 * Seeds all 5 flowchart definitions into Firestore.
 * Collection: kb/flowcharts/{type}
 *
 * Idempotent — overwrites existing documents.
 */
export async function POST() {
  try {
    const batch = adminDb.batch()
    let count = 0

    for (const key of FLOWCHART_KEYS) {
      const fc = FLOWCHARTS[key]
      if (!fc) continue

      const ref = adminDb.collection("kb").doc("flowcharts").collection("types").doc(key)
      batch.set(ref, {
        key: fc.key,
        title: fc.title,
        baseline: fc.baseline,
        phases: fc.phases,
        code: fc.code,
      })
      count++
    }

    await batch.commit()

    return NextResponse.json({
      success: true,
      message: `Seeded ${count} flowchart definitions`,
      types: [...FLOWCHART_KEYS],
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to seed flowcharts"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
