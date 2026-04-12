import { type NextRequest, NextResponse } from "next/server"
import { requireAppUser } from "@/lib/firebase-admin/request-auth"
import { invokeAiText } from "@/lib/ai/client"

interface DraftCommunicationRequest {
  type: "email" | "memo" | "rfi-response" | "status-update"
  projectData: {
    storeNumber?: string
    storeName?: string
    projectType?: string
    status?: string
    grandOpeningDate?: string
    totalBudget?: number
    currentPhase?: string
  }
  recipientRole: string
  topic: string
  additionalContext?: string
}

function buildPrompt(body: DraftCommunicationRequest): { system: string; user: string } {
  const system = "You are a professional communication drafter for Kroger Facility Engineering project managers."

  const pd = body.projectData
  const projectInfo = [
    pd.storeNumber && `Store: ${pd.storeNumber}`,
    pd.storeName && `Name: ${pd.storeName}`,
    pd.projectType && `Type: ${pd.projectType}`,
    pd.status && `Status: ${pd.status}`,
    pd.grandOpeningDate && `Grand Opening: ${pd.grandOpeningDate}`,
    pd.totalBudget && `Budget: $${pd.totalBudget.toLocaleString()}`,
    pd.currentPhase && `Current Phase: ${pd.currentPhase}`,
  ]
    .filter(Boolean)
    .join("\n  ")

  const user = [
    `Communication Type: ${body.type}`,
    `Recipient Role: ${body.recipientRole}`,
    `Topic: ${body.topic}`,
    "",
    "Project Data:",
    `  ${projectInfo}`,
    "",
    body.additionalContext ? `Additional Context: ${body.additionalContext}` : "",
    "",
    "Rules:",
    "- Draft a complete, professional communication ready to send.",
    "- Fill ALL fields from the project data provided. Do NOT use placeholders like [INSERT NAME] or [TBD].",
    "- If a required field is missing from the data, note it at the end as 'MISSING INFO: [field name]' so the PM can fill it.",
    "- Match Kroger Facility Engineering professional tone.",
    "- For emails: include Subject, To (role-based), and Body.",
    "- For memos: include header, body, and action items.",
    "- For RFI responses: include RFI reference, response, and supporting details.",
    "- For status updates: include summary, key metrics, risks, and next steps.",
    "- Keep the communication concise and action-oriented.",
  ].join("\n")

  return { system, user }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAppUser(req)
    if (!auth.ok) return auth.response

    const body = (await req.json()) as DraftCommunicationRequest

    if (!body.type || !body.topic || !body.recipientRole) {
      return NextResponse.json(
        { error: "Missing type, topic, or recipientRole" },
        { status: 400 },
      )
    }

    const validTypes = ["email", "memo", "rfi-response", "status-update"]
    if (!validTypes.includes(body.type)) {
      return NextResponse.json({ error: "Invalid communication type" }, { status: 400 })
    }

    const { system, user } = buildPrompt(body)

    const { text } = await invokeAiText({
      feature: "draft-communication",
      systemPrompt: system,
      userPrompt: user,
      temperature: 0.25,
      maxTokens: 800,
    })

    return NextResponse.json({ draft: text })
  } catch (error) {
    console.error("draft-communication API error:", error)
    return NextResponse.json({ error: "Failed to draft communication" }, { status: 500 })
  }
}
