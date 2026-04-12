import { NextResponse } from "next/server"
import { listHistoricalCandidates } from "@/lib/ai/historical-comparisons"

interface HistoricalComparisonsRequest {
  projectType?: string
  sectionNames?: string[]
  budget?: number | string
  limit?: number
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  if (typeof value !== "string") return 0
  const cleaned = value.replace(/[^0-9.-]/g, "")
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as HistoricalComparisonsRequest

    const candidates = await listHistoricalCandidates(
      {
        projectType: String(body.projectType || ""),
        sectionNames: Array.isArray(body.sectionNames)
          ? body.sectionNames.map((s) => String(s)).filter(Boolean)
          : [],
        budget: toNumber(body.budget),
      },
      Number(body.limit || 15),
    )

    return NextResponse.json({ candidates })
  } catch (error) {
    console.error("historical-comparisons API error:", error)
    return NextResponse.json({ error: "Failed to load historical comparisons" }, { status: 500 })
  }
}
