import { type NextRequest, NextResponse } from "next/server"
import { requireAppUser } from "@/lib/firebase-admin/request-auth"
import { invokeAiText } from "@/lib/ai/client"
import { SOP_DATA, PROJECT_KEYS } from "@/constants/sop-data"

interface DocumentReviewRequest {
  documentText: string
  questions: string[]
  projectType?: string
}

const TYPE_TO_KEY: Record<string, string> = {
  NS: "ns", ER: "er", WIW: "wiw", FC: "fc", MC: "mc", "F&D": "mc",
}

function buildKBContext(projectType?: string): string {
  const keys = projectType && TYPE_TO_KEY[projectType]
    ? [TYPE_TO_KEY[projectType]]
    : [...PROJECT_KEYS].slice(0, 2)

  const lines: string[] = ["Knowledge Base Context:"]
  for (const key of keys) {
    const sop = SOP_DATA[key]
    if (!sop) continue
    lines.push(`  ${sop.title}: ${sop.objective}`)
    for (const phase of sop.phases) {
      lines.push(`    ${phase.name}: ${phase.steps.length} steps`)
      if (phase.gates.length > 0) {
        lines.push(`    Gates: ${phase.gates.join("; ")}`)
      }
    }
  }
  return lines.join("\n")
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAppUser(req)
    if (!auth.ok) return auth.response

    const body = (await req.json()) as DocumentReviewRequest

    if (!body.documentText || !body.questions || body.questions.length === 0) {
      return NextResponse.json(
        { error: "Missing documentText or questions" },
        { status: 400 },
      )
    }

    // Truncate document to fit context window
    const maxDocLength = 8000
    const docText = body.documentText.length > maxDocLength
      ? body.documentText.slice(0, maxDocLength) + "\n\n[Document truncated for analysis]"
      : body.documentText

    const kbContext = buildKBContext(body.projectType)

    const system = "You are a document reviewer for Kroger Facility Engineering. Answer questions about the provided document using both the document content and SOP knowledge base."

    const questionsFormatted = body.questions
      .map((q, i) => `${i + 1}. ${q}`)
      .join("\n")

    const user = [
      "Document Content:",
      docText,
      "",
      kbContext,
      "",
      "Questions:",
      questionsFormatted,
      "",
      "Rules:",
      "- Answer each question based on the document content.",
      "- Where applicable, cross-reference with SOP knowledge base and cite [TYPE SOP, Phase, Step N].",
      "- If the document doesn't contain enough information to answer a question, say so explicitly.",
      "- Cite specific sections of the document when referencing its content.",
      "",
      "Output Format — JSON only, no markdown fences:",
      '{ "answers": [{ "question": "text", "answer": "text", "documentCitations": ["section refs"], "sopCitations": ["SOP refs"] }] }',
    ].join("\n")

    const { text } = await invokeAiText({
      feature: "document-review",
      systemPrompt: system,
      userPrompt: user,
      temperature: 0.15,
      maxTokens: 900,
    })

    const cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim()

    try {
      const parsed = JSON.parse(cleaned)
      return NextResponse.json(parsed)
    } catch {
      return NextResponse.json({ answers: [], rawText: text })
    }
  } catch (error) {
    console.error("document-review API error:", error)
    return NextResponse.json({ error: "Failed to review document" }, { status: 500 })
  }
}
