import { type NextRequest, NextResponse } from "next/server"
import { requireAppUser } from "@/lib/firebase-admin/request-auth"
import { invokeAiText } from "@/lib/ai/client"

interface BudgetAnalysisRequest {
  projectId: string
  budgetData: {
    totalBudget: number
    committedCost: number
    actualCost: number
    forecastCost: number
    lineItems?: Array<{
      category: string
      budget: number
      actual: number
      committed: number
    }>
  }
  costReviewData?: {
    revisedCA?: number
    projectedSpend?: number
    contingencyUsed?: number
    contingencyRemaining?: number
  }
}

function buildPrompt(body: BudgetAnalysisRequest): { system: string; user: string } {
  const system = "You are a budget analyst for Kroger Facility Engineering capital projects."

  const bd = body.budgetData
  const budgetLines = [
    `Total Budget: $${bd.totalBudget.toLocaleString()}`,
    `Committed Cost: $${bd.committedCost.toLocaleString()}`,
    `Actual Cost: $${bd.actualCost.toLocaleString()}`,
    `Forecast Cost: $${bd.forecastCost.toLocaleString()}`,
    `Variance (Budget - Forecast): $${(bd.totalBudget - bd.forecastCost).toLocaleString()}`,
    `Variance %: ${bd.totalBudget > 0 ? ((1 - bd.forecastCost / bd.totalBudget) * 100).toFixed(1) : "N/A"}%`,
  ]

  if (bd.lineItems && bd.lineItems.length > 0) {
    budgetLines.push("")
    budgetLines.push("Line Items:")
    for (const item of bd.lineItems) {
      const variance = item.budget - item.actual
      const variancePct = item.budget > 0 ? ((variance / item.budget) * 100).toFixed(1) : "N/A"
      budgetLines.push(
        `  ${item.category}: Budget $${item.budget.toLocaleString()}, Actual $${item.actual.toLocaleString()}, Committed $${item.committed.toLocaleString()}, Variance ${variancePct}%`,
      )
    }
  }

  const crLines: string[] = []
  if (body.costReviewData) {
    const cr = body.costReviewData
    crLines.push("Cost Review Data:")
    if (cr.revisedCA !== undefined) crLines.push(`  Revised CA: $${cr.revisedCA.toLocaleString()}`)
    if (cr.projectedSpend !== undefined) crLines.push(`  Projected Spend: $${cr.projectedSpend.toLocaleString()}`)
    if (cr.contingencyUsed !== undefined) crLines.push(`  Contingency Used: $${cr.contingencyUsed.toLocaleString()}`)
    if (cr.contingencyRemaining !== undefined) crLines.push(`  Contingency Remaining: $${cr.contingencyRemaining.toLocaleString()}`)
  }

  const user = [
    "Budget Data:",
    budgetLines.join("\n"),
    "",
    crLines.length > 0 ? crLines.join("\n") : "",
    "",
    "Analysis Rules:",
    "- Flag any line items with variance > 10% of budget.",
    "- Identify unusual line items or missing categories.",
    "- Assess contingency health if cost review data is provided.",
    "- Provide a plain-language narrative summary first.",
    "- Then provide structured findings.",
    "",
    "Output Format — JSON only, no markdown fences:",
    '{ "narrative": "plain language summary", "findings": [{ "category": "string", "finding": "string", "severity": "high|medium|low", "variancePercent": number }], "overallRisk": "low|medium|high" }',
  ].join("\n")

  return { system, user }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAppUser(req)
    if (!auth.ok) return auth.response

    const body = (await req.json()) as BudgetAnalysisRequest

    if (!body.budgetData) {
      return NextResponse.json({ error: "Missing budgetData" }, { status: 400 })
    }

    const { system, user } = buildPrompt(body)

    const { text } = await invokeAiText({
      feature: "budget-analysis",
      systemPrompt: system,
      userPrompt: user,
      temperature: 0.1,
      maxTokens: 700,
    })

    const cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim()

    try {
      const parsed = JSON.parse(cleaned)
      return NextResponse.json(parsed)
    } catch {
      return NextResponse.json({
        narrative: text,
        findings: [],
        overallRisk: "unknown",
      })
    }
  } catch (error) {
    console.error("budget-analysis API error:", error)
    return NextResponse.json({ error: "Failed to analyze budget" }, { status: 500 })
  }
}
