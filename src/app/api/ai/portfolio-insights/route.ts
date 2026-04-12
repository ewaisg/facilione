import { NextResponse } from "next/server"
import { invokeAiText } from "@/lib/ai/client"

interface PortfolioInsightsRequest {
  metrics: {
    activeProjects: number
    totalBudget: number
    atRiskCount: number
    overdueGoCount: number
    dueSoonGoCount: number
    scheduleOverdueCount: number
    weeklyStaleCount: number
  }
  alerts: Array<{
    title: string
    detail: string
    level: string
  }>
  updates: Array<{
    label: string
    type: string
    comment: string
  }>
}

function buildPrompt(data: PortfolioInsightsRequest): string {
  const alerts = data.alerts
    .map((a) => `- [${a.level.toUpperCase()}] ${a.title}: ${a.detail}`)
    .join("\n")

  const updates = data.updates
    .slice(0, 6)
    .map((u) => `- ${u.label} (${u.type}): ${u.comment || "No note"}`)
    .join("\n")

  return [
    "Provide concise portfolio analysis for PM leadership.",
    "Output exactly these sections:",
    "1) Current Portfolio Pulse",
    "2) Top Risks",
    "3) Recommended Actions This Week",
    "4) Escalations Needed",
    "",
    `Active projects: ${data.metrics.activeProjects}`,
    `Total budget: ${data.metrics.totalBudget}`,
    `At-risk projects: ${data.metrics.atRiskCount}`,
    `Overdue GO: ${data.metrics.overdueGoCount}`,
    `GO due in 14 days: ${data.metrics.dueSoonGoCount}`,
    `Overdue schedule milestones: ${data.metrics.scheduleOverdueCount}`,
    `Stale weekly updates (>7d): ${data.metrics.weeklyStaleCount}`,
    "",
    "Alerts:",
    alerts || "- None",
    "",
    "Recent updates:",
    updates || "- None",
    "",
    "Keep answer under 220 words and action-oriented.",
  ].join("\n")
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PortfolioInsightsRequest

    const prompt = buildPrompt(body)

    const { text: summary } = await invokeAiText({
      feature: "portfolio-insights",
      systemPrompt: "You are a portfolio controls analyst helping leadership make weekly decisions.",
      userPrompt: prompt,
      temperature: 0.25,
      maxTokens: 500,
    })

    if (!summary) {
      return NextResponse.json({ error: "Model returned empty response" }, { status: 502 })
    }

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("portfolio-insights API error:", error)
    return NextResponse.json({ error: "Failed to generate portfolio insights" }, { status: 500 })
  }
}
