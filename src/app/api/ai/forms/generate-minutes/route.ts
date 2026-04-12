import { type NextRequest, NextResponse } from "next/server"
import { requireAppUser } from "@/lib/firebase-admin/request-auth"
import { invokeAiText } from "@/lib/ai/client"

interface GenerateMinutesRequest {
  rawNotes: string
  templateType: string
  projectData: {
    storeNumber?: string
    storeName?: string
    projectType?: string
    currentPhase?: string
  }
  agendaItems: string[]
}

function buildPrompt(body: GenerateMinutesRequest): { system: string; user: string } {
  const system = "You are a Kroger Facility Engineering meeting minutes formatter."

  const pd = body.projectData
  const projectInfo = [
    pd.storeNumber && `Store: ${pd.storeNumber}`,
    pd.storeName && `Name: ${pd.storeName}`,
    pd.projectType && `Type: ${pd.projectType}`,
    pd.currentPhase && `Phase: ${pd.currentPhase}`,
  ]
    .filter(Boolean)
    .join(", ")

  const agenda = body.agendaItems.length > 0
    ? body.agendaItems.map((item, i) => `${i + 1}. ${item}`).join("\n")
    : "No agenda provided"

  const user = [
    `Meeting Type: ${body.templateType}`,
    `Project: ${projectInfo || "Not specified"}`,
    "",
    "Agenda Items:",
    agenda,
    "",
    "Raw Notes:",
    body.rawNotes,
    "",
    "Rules:",
    "- Structure the raw notes into formal meeting minutes.",
    "- Map notes to the agenda items where possible.",
    "- Extract action items with assignee and due date if mentioned.",
    "- Extract key decisions made during the meeting.",
    "- List follow-up items separately.",
    "- Use professional but concise language.",
    "- Preserve all factual information from the notes — do not add information not in the notes.",
    "",
    "Output Format — JSON only, no markdown fences:",
    '{ "meetingTitle": "text", "date": "extracted or TBD", "attendees": ["names mentioned"], "agendaDiscussed": [{ "topic": "text", "discussion": "summary", "sopRef": "optional" }], "decisions": ["text"], "actionItems": [{ "action": "text", "assignee": "name or role", "dueDate": "date or TBD" }], "followUpItems": ["text"], "nextMeetingDate": "if mentioned" }',
  ].join("\n")

  return { system, user }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAppUser(req)
    if (!auth.ok) return auth.response

    const body = (await req.json()) as GenerateMinutesRequest

    if (!body.rawNotes) {
      return NextResponse.json({ error: "Missing rawNotes" }, { status: 400 })
    }

    const { system, user } = buildPrompt(body)

    const { text } = await invokeAiText({
      feature: "forms-generate-minutes",
      systemPrompt: system,
      userPrompt: user,
      temperature: 0.2,
      maxTokens: 900,
    })

    const cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim()

    try {
      const parsed = JSON.parse(cleaned)
      return NextResponse.json(parsed)
    } catch {
      return NextResponse.json({
        agendaDiscussed: [],
        decisions: [],
        actionItems: [],
        followUpItems: [],
        rawText: text,
      })
    }
  } catch (error) {
    console.error("generate-minutes API error:", error)
    return NextResponse.json({ error: "Failed to generate minutes" }, { status: 500 })
  }
}
