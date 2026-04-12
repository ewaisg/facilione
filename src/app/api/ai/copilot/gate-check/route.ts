import { type NextRequest, NextResponse } from "next/server"
import { requireAppUser } from "@/lib/firebase-admin/request-auth"
import { invokeAiText } from "@/lib/ai/client"
import { SOP_DATA } from "@/constants/sop-data"

interface GateCheckRequest {
  projectId: string
  projectType: string
  targetPhase: number
  completedItems: string[]
  projectData: {
    storeNumber?: string
    storeName?: string
    status?: string
    grandOpeningDate?: string
    totalBudget?: number
    actualCost?: number
  }
}

const TYPE_TO_KEY: Record<string, string> = {
  NS: "ns", ER: "er", WIW: "wiw", FC: "fc", MC: "mc", "F&D": "mc",
}

function buildPrompt(body: GateCheckRequest): { system: string; user: string } {
  const sopKey = TYPE_TO_KEY[body.projectType] || "ns"
  const sop = SOP_DATA[sopKey]

  const system = "You are a Kroger Facility Engineering gate compliance checker. Evaluate gate readiness ONLY from SOP criteria."

  // Get gate requirements for the target phase
  const gateContext: string[] = []
  if (sop && body.targetPhase > 0 && body.targetPhase <= sop.phases.length) {
    const phase = sop.phases[body.targetPhase - 1]
    gateContext.push(`Target Phase: ${phase.name}`)
    gateContext.push("")
    gateContext.push("Steps in this phase:")
    for (const step of phase.steps) {
      const completed = body.completedItems.includes(step.n) ? "COMPLETED" : "NOT COMPLETED"
      gateContext.push(
        `  [${completed}] [${sop.id.toUpperCase()} SOP, ${phase.name}, Step ${step.n}] ${step.text} (Owner: ${step.owner})`,
      )
    }
    if (phase.gates.length > 0) {
      gateContext.push("")
      gateContext.push("Gate Requirements:")
      for (const gate of phase.gates) {
        gateContext.push(`  - ${gate}`)
      }
    }

    // Include prior phase gates as prerequisites
    if (body.targetPhase > 1) {
      const priorPhase = sop.phases[body.targetPhase - 2]
      if (priorPhase.gates.length > 0) {
        gateContext.push("")
        gateContext.push(`Prior Phase Gates (${priorPhase.name}):`)
        for (const gate of priorPhase.gates) {
          gateContext.push(`  - ${gate}`)
        }
      }
    }
  }

  const pd = body.projectData
  const projectInfo = [
    pd.storeNumber && `Store: ${pd.storeNumber}`,
    pd.storeName && `Name: ${pd.storeName}`,
    pd.status && `Status: ${pd.status}`,
    pd.grandOpeningDate && `Grand Opening: ${pd.grandOpeningDate}`,
    pd.totalBudget && `Budget: $${pd.totalBudget.toLocaleString()}`,
    pd.actualCost && `Actual Cost: $${pd.actualCost.toLocaleString()}`,
  ]
    .filter(Boolean)
    .join(", ")

  const user = [
    "SOP Gate Criteria:",
    gateContext.join("\n"),
    "",
    "Project Info: " + (projectInfo || "Not provided"),
    "Completed Items: " + (body.completedItems.join(", ") || "None"),
    "",
    "Rules:",
    "- Evaluate each gate requirement against the completed items.",
    "- Mark each item as pass, fail, or unknown.",
    "- Reference specific SOP gate criteria — no generic checklists.",
    '- If SOP doesn\'t define gates for this phase, note: "No specific gate criteria defined in SOP for this phase."',
    "",
    "Output Format — JSON only, no markdown fences:",
    '{ "ready": true/false, "score": "X/Y", "items": [{ "requirement": "text", "status": "pass|fail|unknown", "sopRef": "[TYPE SOP, Phase, Gate]", "note": "optional" }] }',
  ].join("\n")

  return { system, user }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAppUser(req)
    if (!auth.ok) return auth.response

    const body = (await req.json()) as GateCheckRequest

    if (!body.projectType || !body.targetPhase) {
      return NextResponse.json({ error: "Missing projectType or targetPhase" }, { status: 400 })
    }

    const { system, user } = buildPrompt(body)

    const { text } = await invokeAiText({
      feature: "gate-check",
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
      return NextResponse.json({ ready: false, score: "0/0", items: [], rawText: text })
    }
  } catch (error) {
    console.error("gate-check API error:", error)
    return NextResponse.json({ error: "Failed to check gate compliance" }, { status: 500 })
  }
}
