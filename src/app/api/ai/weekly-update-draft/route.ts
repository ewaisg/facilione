import { NextResponse } from "next/server"
import { invokeAiText } from "@/lib/ai/client"

interface WeeklyDraftRequest {
  project: {
    id: string
    storeNumber: string
    storeName: string
    projectType: string
    status: string
    healthStatus: string
    grandOpeningDate: string | null
    totalBudget: number
    committedCost: number
    actualCost: number
    forecastCost: number
  }
  phases: Array<{
    name: string
    status: string
    targetEndDate: string | null
    actualEndDate: string | null
  }>
  alerts: Array<{
    title: string
    detail: string
    level: "high" | "medium" | "low"
    dueDate?: string
  }>
  existingComment?: string
}

function buildPrompt(data: WeeklyDraftRequest): string {
  const variance = data.project.totalBudget - data.project.forecastCost
  const variancePct = data.project.totalBudget > 0
    ? ((variance / data.project.totalBudget) * 100).toFixed(1)
    : "0.0"

  const phaseLines = data.phases
    .slice(0, 8)
    .map((phase) => `- ${phase.name}: ${phase.status}, target end ${phase.targetEndDate ?? "N/A"}`)
    .join("\n")

  const alertLines = data.alerts.length > 0
    ? data.alerts.map((a) => `- [${a.level.toUpperCase()}] ${a.title}: ${a.detail}`).join("\n")
    : "- No critical alerts"

  const existing = data.existingComment?.trim()
    ? `Existing draft to improve:\n${data.existingComment}`
    : "No existing draft."

  return [
    "Create a concise weekly project update for a PM.",
    "Use plain professional language and actionable next steps.",
    "Output sections in this exact order:",
    "1) This week progress",
    "2) Risks/Blockers",
    "3) Next week actions",
    "4) Needs/Escalations",
    "",
    `Project: ${data.project.storeNumber} - ${data.project.storeName}`,
    `Type: ${data.project.projectType}`,
    `Status: ${data.project.status}, Health: ${data.project.healthStatus}`,
    `Grand Opening: ${data.project.grandOpeningDate ?? "N/A"}`,
    `Budget: ${data.project.totalBudget}, Forecast: ${data.project.forecastCost}, Variance: ${variance} (${variancePct}%)`,
    "",
    "Phases:",
    phaseLines || "- No phase data",
    "",
    "Alerts:",
    alertLines,
    "",
    existing,
    "",
    "Keep it under 180 words.",
  ].join("\n")
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as WeeklyDraftRequest

    if (!body?.project?.id) {
      return NextResponse.json({ error: "Missing project payload" }, { status: 400 })
    }

    const prompt = buildPrompt(body)

    const { text: draft } = await invokeAiText({
      feature: "weekly-update-draft",
      systemPrompt: "You are a project controls assistant. Prioritize clarity, accountability, and concrete next actions.",
      userPrompt: prompt,
      temperature: 0.3,
      maxTokens: 450,
    })

    if (!draft) {
      return NextResponse.json({ error: "Model returned empty draft" }, { status: 502 })
    }

    return NextResponse.json({ draft })
  } catch (error) {
    console.error("weekly-update-draft API error:", error)
    return NextResponse.json({ error: "Failed to generate weekly update draft" }, { status: 500 })
  }
}
