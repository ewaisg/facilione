import { type NextRequest, NextResponse } from "next/server"
import { requireAppUser } from "@/lib/firebase-admin/request-auth"
import { invokeAiText } from "@/lib/ai/client"
import { SOP_DATA } from "@/constants/sop-data"

interface ScheduleDeviationsRequest {
  projectId: string
  projectType: string
  actualMilestones: Array<{
    name: string
    plannedDate?: string
    actualDate?: string
    status: string
  }>
  templateMilestones: Array<{
    name: string
    weekOffset: number
  }>
}

const TYPE_TO_KEY: Record<string, string> = {
  NS: "ns", ER: "er", WIW: "wiw", FC: "fc", MC: "mc", "F&D": "mc",
}

function buildPrompt(body: ScheduleDeviationsRequest): { system: string; user: string } {
  const system = "You are a schedule analyst for Kroger Facility Engineering capital projects."

  const sopKey = TYPE_TO_KEY[body.projectType] || "ns"
  const sop = SOP_DATA[sopKey]

  const scheduleContext: string[] = []
  if (sop && sop.schedule.length > 0) {
    scheduleContext.push("SOP Schedule Milestones:")
    for (const item of sop.schedule) {
      scheduleContext.push(`  ${item.m} — ${item.wk}${item.gate ? ` (${item.gate})` : ""}`)
    }
  }

  const actualsContext = body.actualMilestones
    .map(
      (m) =>
        `  ${m.name}: Planned=${m.plannedDate || "TBD"}, Actual=${m.actualDate || "Not complete"}, Status=${m.status}`,
    )
    .join("\n")

  const templateContext = body.templateMilestones
    .map((m) => `  ${m.name}: Week ${m.weekOffset}`)
    .join("\n")

  const user = [
    scheduleContext.join("\n"),
    "",
    "Actual Milestones:",
    actualsContext || "  None provided",
    "",
    "Template Milestones:",
    templateContext || "  None provided",
    "",
    "Analysis Rules:",
    "- Compare actual dates vs planned/template dates.",
    "- Flag milestones that are behind schedule.",
    "- Identify float consumed and critical path items at risk.",
    "- Reference SOP schedule milestones where applicable.",
    "- Suggest corrective actions for significant deviations.",
    "",
    "Output Format — JSON only, no markdown fences:",
    '{ "deviations": [{ "milestone": "name", "expected": "date or week", "actual": "date or status", "daysOff": number, "severity": "critical|warning|on-track", "suggestion": "text" }], "summary": "1-2 sentence overview" }',
  ].join("\n")

  return { system, user }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAppUser(req)
    if (!auth.ok) return auth.response

    const body = (await req.json()) as ScheduleDeviationsRequest

    if (!body.projectType) {
      return NextResponse.json({ error: "Missing projectType" }, { status: 400 })
    }

    const { system, user } = buildPrompt(body)

    const { text } = await invokeAiText({
      feature: "schedule-deviations",
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
      return NextResponse.json({ deviations: [], summary: text })
    }
  } catch (error) {
    console.error("schedule-deviations API error:", error)
    return NextResponse.json({ error: "Failed to analyze schedule deviations" }, { status: 500 })
  }
}
