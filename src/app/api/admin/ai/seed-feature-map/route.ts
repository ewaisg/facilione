import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { requireRoles } from "@/lib/firebase-admin/request-auth"
import type { AiFeature } from "@/lib/ai/runtime-config"

/**
 * Seeds the default feature-model mapping into systemSettings/ai.
 * Only adds mappings for features that don't already have one.
 * Models must already exist in the models[] array.
 *
 * POST /api/admin/ai/seed-feature-map
 */

const DEFAULT_FEATURE_MAP: Record<AiFeature, string> = {
  "sop-qa": "gpt-4o",
  "next-actions": "gpt-4o-mini",
  "draft-communication": "gpt-4o",
  "gate-check": "gpt-4o-mini",
  "historical-search": "gpt-4o-mini",
  "budget-analysis": "gpt-4o",
  "schedule-deviations": "gpt-4o-mini",
  "document-review": "gpt-4o",
  "forms-auto-populate": "gpt-4o-mini",
  "forms-agenda-builder": "gpt-4o-mini",
  "forms-generate-minutes": "gpt-4o",
  "reports-schedule-status": "gpt-4o",
  "portfolio-insights": "gpt-4o",
  "cost-estimate": "gpt-4o",
  "weekly-update-draft": "gpt-4o",
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRoles(req, ["admin"])
    if (!auth.ok) return auth.response

    const ref = adminDb.collection("systemSettings").doc("ai")
    const snap = await ref.get()
    const current = snap.exists ? (snap.data() as Record<string, unknown>) : {}

    const existingMap = (current.featureModelMap || {}) as Record<string, string>
    const models = (current.models || []) as Array<{ key: string; enabled?: boolean }>
    const modelKeys = new Set(models.filter((m) => m.enabled !== false).map((m) => m.key))

    const merged: Record<string, string> = { ...existingMap }
    const added: string[] = []
    const skipped: string[] = []

    for (const [feature, defaultModel] of Object.entries(DEFAULT_FEATURE_MAP)) {
      if (merged[feature]) {
        skipped.push(`${feature} (already mapped to ${merged[feature]})`)
        continue
      }

      // Try to find the default model in available models
      if (modelKeys.has(defaultModel)) {
        merged[feature] = defaultModel
        added.push(`${feature} → ${defaultModel}`)
      } else {
        // Fallback: use first available model
        const fallback = models.find((m) => m.enabled !== false)
        if (fallback) {
          merged[feature] = fallback.key
          added.push(`${feature} → ${fallback.key} (fallback)`)
        } else {
          skipped.push(`${feature} (no models available)`)
        }
      }
    }

    await ref.set({ featureModelMap: merged }, { merge: true })

    return NextResponse.json({
      success: true,
      added,
      skipped,
      totalMapped: Object.keys(merged).length,
    })
  } catch (error) {
    console.error("seed-feature-map error:", error)
    return NextResponse.json({ error: "Failed to seed feature-model map" }, { status: 500 })
  }
}
