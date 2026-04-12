import { type NextRequest, NextResponse } from "next/server"
import { requireAppUser } from "@/lib/firebase-admin/request-auth"
import { listHistoricalCandidates } from "@/lib/ai/historical-comparisons"
import { invokeAiText } from "@/lib/ai/client"

interface HistoricalSearchRequest {
  projectType: string
  scopeDescription?: string
  budgetRange?: { min: number; max: number }
  additionalFilters?: string
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAppUser(req)
    if (!auth.ok) return auth.response

    const body = (await req.json()) as HistoricalSearchRequest

    if (!body.projectType) {
      return NextResponse.json({ error: "Missing projectType" }, { status: 400 })
    }

    const sectionNames = body.scopeDescription
      ? body.scopeDescription.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean)
      : []

    const budget = body.budgetRange
      ? (body.budgetRange.min + body.budgetRange.max) / 2
      : 0

    const candidates = await listHistoricalCandidates(
      { projectType: body.projectType, sectionNames, budget },
      20,
    )

    // Use AI to generate a relevance explanation
    if (candidates.length > 0) {
      const candidateSummary = candidates
        .slice(0, 10)
        .map(
          (c, i) =>
            `${i + 1}. ${c.label} (${c.source}, ${c.projectType}, $${c.total.toLocaleString()}, score: ${(c.similarityScore * 100).toFixed(0)}%)`,
        )
        .join("\n")

      const { text: explanation } = await invokeAiText({
        feature: "historical-search",
        systemPrompt: "You are a project comparison analyst for Kroger Facility Engineering.",
        userPrompt: [
          `Searching for comparables to a ${body.projectType} project.`,
          body.scopeDescription ? `Scope: ${body.scopeDescription}` : "",
          body.budgetRange ? `Budget range: $${body.budgetRange.min.toLocaleString()} - $${body.budgetRange.max.toLocaleString()}` : "",
          "",
          "Top matches:",
          candidateSummary,
          "",
          "Provide a 2-3 sentence summary of the best matches and why they are relevant. Note any caveats about the comparison.",
        ].join("\n"),
        temperature: 0.2,
        maxTokens: 300,
      })

      return NextResponse.json({ candidates, explanation })
    }

    return NextResponse.json({
      candidates: [],
      explanation: "No comparable historical projects found matching these criteria.",
    })
  } catch (error) {
    console.error("historical-search API error:", error)
    return NextResponse.json({ error: "Failed to search historical data" }, { status: 500 })
  }
}
