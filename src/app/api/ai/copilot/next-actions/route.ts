import { type NextRequest, NextResponse } from "next/server"
import { requireAppUser } from "@/lib/firebase-admin/request-auth"
import { invokeAiText } from "@/lib/ai/client"
import { SOP_DATA } from "@/constants/sop-data"

interface NextActionsRequest {
  projectId: string
  projectType: string
  currentPhase: number
  completedSteps: string[]
  gateStatus: Array<{ gate: string; passed: boolean }>
}

const TYPE_TO_KEY: Record<string, string> = {
  NS: "ns", ER: "er", WIW: "wiw", FC: "fc", MC: "mc", "F&D": "mc",
}

function buildPrompt(body: NextActionsRequest): { system: string; user: string } {
  const sopKey = TYPE_TO_KEY[body.projectType] || "ns"
  const sop = SOP_DATA[sopKey]

  const system = "You are a Kroger Facility Engineering project advisor. Recommend next actions based ONLY on SOP data."

  const phaseContext: string[] = []
  if (sop) {
    const phases = sop.phases.slice(Math.max(0, body.currentPhase - 1), body.currentPhase + 2)
    for (const phase of phases) {
      phaseContext.push(`--- ${phase.name} ---`)
      for (const step of phase.steps) {
        const completed = body.completedSteps.includes(step.n) ? "[DONE]" : "[PENDING]"
        phaseContext.push(
          `  ${completed} [${sop.id.toUpperCase()} SOP, ${phase.name}, Step ${step.n}] ${step.text} (Owner: ${step.owner})`,
        )
      }
      if (phase.gates.length > 0) {
        phaseContext.push(`  GATES: ${phase.gates.join("; ")}`)
      }
    }
  }

  const gateInfo = body.gateStatus
    .map((g) => `  ${g.passed ? "PASSED" : "BLOCKED"}: ${g.gate}`)
    .join("\n")

  const user = [
    "Context — SOP Phases for this project:",
    phaseContext.join("\n"),
    "",
    "Gate Status:",
    gateInfo || "  No gate status provided",
    "",
    "Completed Steps: " + (body.completedSteps.join(", ") || "None"),
    `Current Phase Index: ${body.currentPhase}`,
    "",
    "Rules:",
    "- Identify the next actions the PM should take based on SOP sequence.",
    "- Prioritize from 1 (most urgent) to 5 (least urgent).",
    "- Flag any gates that are blocking progress.",
    "- Cite SOP references for each action.",
    '- If all steps are complete, indicate readiness for next phase or say "This is not covered in the current SOPs."',
    "",
    "Output Format — JSON only, no markdown fences:",
    '{ "actions": [{ "priority": 1, "action": "description", "sopRef": "[TYPE SOP, Phase, Step N]", "dueContext": "timing note" }] }',
  ].join("\n")

  return { system, user }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAppUser(req)
    if (!auth.ok) return auth.response

    const body = (await req.json()) as NextActionsRequest

    if (!body.projectType || body.currentPhase === undefined) {
      return NextResponse.json({ error: "Missing projectType or currentPhase" }, { status: 400 })
    }

    const { system, user } = buildPrompt(body)

    const { text } = await invokeAiText({
      feature: "next-actions",
      systemPrompt: system,
      userPrompt: user,
      temperature: 0.1,
      maxTokens: 600,
    })

    // Strip markdown fences and parse JSON
    const cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim()

    try {
      const parsed = JSON.parse(cleaned)
      return NextResponse.json(parsed)
    } catch {
      return NextResponse.json({ actions: [], rawText: text })
    }
  } catch (error) {
    console.error("next-actions API error:", error)
    return NextResponse.json({ error: "Failed to generate next actions" }, { status: 500 })
  }
}
