import { type NextRequest, NextResponse } from "next/server"
import { requireAppUser } from "@/lib/firebase-admin/request-auth"
import { invokeAiText } from "@/lib/ai/client"
import { SOP_DATA } from "@/constants/sop-data"

interface AgendaBuilderRequest {
  templateType: string
  projectType: string
  currentPhase: number
  previousMinutes?: {
    actionItems?: string[]
    followUpItems?: string[]
  }
  customTopics: string[]
}

const TYPE_TO_KEY: Record<string, string> = {
  NS: "ns", ER: "er", WIW: "wiw", FC: "fc", MC: "mc", "F&D": "mc",
}

function buildPrompt(body: AgendaBuilderRequest): { system: string; user: string } {
  const system = "You are a Kroger Facility Engineering meeting agenda specialist."

  const sopKey = TYPE_TO_KEY[body.projectType] || "ns"
  const sop = SOP_DATA[sopKey]

  const phaseContext: string[] = []
  if (sop && body.currentPhase > 0 && body.currentPhase <= sop.phases.length) {
    const phase = sop.phases[body.currentPhase - 1]
    phaseContext.push(`Current Phase: ${phase.name}`)
    phaseContext.push("Key Steps:")
    for (const step of phase.steps.slice(0, 8)) {
      phaseContext.push(`  [${sop.id.toUpperCase()} SOP, ${phase.name}, Step ${step.n}] ${step.text}`)
    }
    if (phase.gates.length > 0) {
      phaseContext.push(`Gates: ${phase.gates.join("; ")}`)
    }
  }

  const carryover: string[] = []
  if (body.previousMinutes?.actionItems?.length) {
    carryover.push("Carryover Action Items:")
    for (const item of body.previousMinutes.actionItems) {
      carryover.push(`  - ${item}`)
    }
  }
  if (body.previousMinutes?.followUpItems?.length) {
    carryover.push("Follow-Up Items:")
    for (const item of body.previousMinutes.followUpItems) {
      carryover.push(`  - ${item}`)
    }
  }

  const customTopics = body.customTopics.length > 0
    ? "Custom Topics:\n" + body.customTopics.map((t) => `  - ${t}`).join("\n")
    : ""

  const user = [
    `Meeting Type: ${body.templateType}`,
    `Project Type: ${body.projectType}`,
    "",
    phaseContext.join("\n"),
    "",
    carryover.join("\n"),
    "",
    customTopics,
    "",
    "Rules:",
    "- Generate a suggested agenda based on the meeting type and current SOP phase.",
    "- Include carryover items from previous minutes if provided.",
    "- Add custom topics in the appropriate position.",
    "- Assign time estimates to each item.",
    "- Reference relevant SOP steps where applicable.",
    "",
    "Output Format — JSON only, no markdown fences:",
    '{ "agendaItems": [{ "order": 1, "topic": "text", "duration": "5 min", "sopRef": "optional SOP ref", "isCarryover": false }], "estimatedDuration": "45 min" }',
  ].join("\n")

  return { system, user }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAppUser(req)
    if (!auth.ok) return auth.response

    const body = (await req.json()) as AgendaBuilderRequest

    if (!body.templateType || !body.projectType) {
      return NextResponse.json({ error: "Missing templateType or projectType" }, { status: 400 })
    }

    const { system, user } = buildPrompt(body)

    const { text } = await invokeAiText({
      feature: "forms-agenda-builder",
      systemPrompt: system,
      userPrompt: user,
      temperature: 0.15,
      maxTokens: 600,
    })

    const cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim()

    try {
      const parsed = JSON.parse(cleaned)
      return NextResponse.json(parsed)
    } catch {
      return NextResponse.json({ agendaItems: [], rawText: text })
    }
  } catch (error) {
    console.error("agenda-builder API error:", error)
    return NextResponse.json({ error: "Failed to build agenda" }, { status: 500 })
  }
}
