import { type NextRequest, NextResponse } from "next/server"
import { requireAppUser } from "@/lib/firebase-admin/request-auth"
import { invokeAiText } from "@/lib/ai/client"
import { SOP_DATA } from "@/constants/sop-data"

interface AutoPopulateRequest {
  templateType: "pre-bid" | "pre-con" | "kickoff" | "weekly-pm" | "jobsite"
  projectId: string
  projectData: {
    storeNumber?: string
    storeName?: string
    storeAddress?: string
    projectType?: string
    status?: string
    grandOpeningDate?: string
    totalBudget?: number
    currentPhase?: string
    pmName?: string
    cmName?: string
    gcName?: string
    notes?: string
  }
}

const TYPE_TO_KEY: Record<string, string> = {
  NS: "ns", ER: "er", WIW: "wiw", FC: "fc", MC: "mc", "F&D": "mc",
}

const TEMPLATE_LABELS: Record<string, string> = {
  "pre-bid": "Pre-Bid Meeting",
  "pre-con": "Pre-Construction Meeting",
  kickoff: "Project Kickoff",
  "weekly-pm": "Weekly PM Meeting",
  jobsite: "Jobsite Visit",
}

function buildPrompt(body: AutoPopulateRequest): { system: string; user: string } {
  const system = "You are a Kroger Facility Engineering meeting form assistant."

  const pd = body.projectData
  const projectInfo = [
    pd.storeNumber && `Store #: ${pd.storeNumber}`,
    pd.storeName && `Store Name: ${pd.storeName}`,
    pd.storeAddress && `Address: ${pd.storeAddress}`,
    pd.projectType && `Project Type: ${pd.projectType}`,
    pd.status && `Status: ${pd.status}`,
    pd.grandOpeningDate && `Grand Opening: ${pd.grandOpeningDate}`,
    pd.totalBudget && `Budget: $${pd.totalBudget.toLocaleString()}`,
    pd.currentPhase && `Current Phase: ${pd.currentPhase}`,
    pd.pmName && `PM: ${pd.pmName}`,
    pd.cmName && `CM: ${pd.cmName}`,
    pd.gcName && `GC: ${pd.gcName}`,
    pd.notes && `Notes: ${pd.notes}`,
  ]
    .filter(Boolean)
    .join("\n  ")

  // Get SOP context for agenda items
  let sopAgendaHints = ""
  if (pd.projectType) {
    const sopKey = TYPE_TO_KEY[pd.projectType]
    const sop = sopKey ? SOP_DATA[sopKey] : undefined
    if (sop) {
      sopAgendaHints = sop.phases
        .map((p) => `${p.name}: ${p.steps.slice(0, 3).map((s) => s.text).join("; ")}`)
        .slice(0, 4)
        .join("\n  ")
    }
  }

  const user = [
    `Template Type: ${TEMPLATE_LABELS[body.templateType] || body.templateType}`,
    "",
    "Project Data:",
    `  ${projectInfo}`,
    "",
    sopAgendaHints ? `SOP Phase Hints:\n  ${sopAgendaHints}` : "",
    "",
    "Rules:",
    "- Pre-fill ALL form fields from the project data above.",
    "- Generate appropriate agenda items based on the template type and current project phase.",
    "- Include date, location, attendees (by role), and all agenda items.",
    "- Do NOT use placeholders — if info is missing, omit the field or use 'TBD'.",
    "",
    "Output Format — JSON only, no markdown fences:",
    '{ "title": "Meeting Title", "date": "suggested date", "location": "store address or TBD", "attendees": ["name (role)"], "agendaItems": [{ "topic": "text", "duration": "5 min", "presenter": "role", "sopRef": "optional ref" }], "notes": "any pre-filled notes" }',
  ].join("\n")

  return { system, user }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAppUser(req)
    if (!auth.ok) return auth.response

    const body = (await req.json()) as AutoPopulateRequest

    if (!body.templateType || !body.projectData) {
      return NextResponse.json({ error: "Missing templateType or projectData" }, { status: 400 })
    }

    const { system, user } = buildPrompt(body)

    const { text } = await invokeAiText({
      feature: "forms-auto-populate",
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
      return NextResponse.json({ agendaItems: [], rawText: text })
    }
  } catch (error) {
    console.error("auto-populate API error:", error)
    return NextResponse.json({ error: "Failed to auto-populate form" }, { status: 500 })
  }
}
