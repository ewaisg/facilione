import { type NextRequest, NextResponse } from "next/server"
import { requireAppUser } from "@/lib/firebase-admin/request-auth"
import { invokeAiText } from "@/lib/ai/client"
import { SOP_DATA } from "@/constants/sop-data"

interface ScheduleStatusRequest {
  projectId: string
  projectType: string
  milestones: Array<{
    name: string
    plannedDate?: string
    actualDate?: string
    status: string
  }>
  phases: Array<{
    name: string
    phaseNumber: number
    status: string
  }>
  recentChanges: Array<{
    item: string
    change: string
    date: string
  }>
}

const TYPE_TO_KEY: Record<string, string> = {
  NS: "ns", ER: "er", WIW: "wiw", FC: "fc", MC: "mc", "F&D": "mc",
}

function buildPrompt(body: ScheduleStatusRequest): { system: string; user: string } {
  const system = "You are a schedule analyst for Kroger Facility Engineering capital projects."

  const sopKey = TYPE_TO_KEY[body.projectType] || "ns"
  const sop = SOP_DATA[sopKey]

  const sopSchedule: string[] = []
  if (sop && sop.schedule.length > 0) {
    sopSchedule.push("SOP Baseline Schedule:")
    for (const item of sop.schedule) {
      sopSchedule.push(`  ${item.m} — ${item.wk}${item.gate ? ` (${item.gate})` : ""}`)
    }
  }

  const milestonesContext = body.milestones
    .map(
      (m) => `  ${m.name}: Planned=${m.plannedDate || "TBD"}, Actual=${m.actualDate || "Pending"}, Status=${m.status}`,
    )
    .join("\n")

  const phasesContext = body.phases
    .map((p) => `  Phase ${p.phaseNumber}: ${p.name} — ${p.status}`)
    .join("\n")

  const changesContext = body.recentChanges.length > 0
    ? body.recentChanges.map((c) => `  ${c.date}: ${c.item} — ${c.change}`).join("\n")
    : "  No recent changes recorded"

  const user = [
    sopSchedule.join("\n"),
    "",
    `Project Type: ${body.projectType}`,
    "",
    "Current Milestones:",
    milestonesContext || "  None provided",
    "",
    "Phase Status:",
    phasesContext || "  None provided",
    "",
    "Recent Changes:",
    changesContext,
    "",
    "Generate a narrative schedule status report with these sections:",
    "1) Executive Summary (2-3 sentences)",
    "2) On-Track Items",
    "3) Behind Schedule Items (with days behind and impact)",
    "4) Upcoming Milestones (next 30 days)",
    "5) Critical Items Requiring Attention",
    "6) Recommendations",
    "",
    "Reference SOP phase/gate milestones where applicable using [TYPE SOP, Phase, Milestone] format.",
    "Keep the report under 350 words.",
  ].join("\n")

  return { system, user }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAppUser(req)
    if (!auth.ok) return auth.response

    const body = (await req.json()) as ScheduleStatusRequest

    if (!body.projectType) {
      return NextResponse.json({ error: "Missing projectType" }, { status: 400 })
    }

    const { system, user } = buildPrompt(body)

    const { text } = await invokeAiText({
      feature: "reports-schedule-status",
      systemPrompt: system,
      userPrompt: user,
      temperature: 0.25,
      maxTokens: 900,
    })

    return NextResponse.json({ report: text })
  } catch (error) {
    console.error("schedule-status API error:", error)
    return NextResponse.json({ error: "Failed to generate schedule status report" }, { status: 500 })
  }
}
