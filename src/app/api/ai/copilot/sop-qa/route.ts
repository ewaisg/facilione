import { type NextRequest, NextResponse } from "next/server"
import { requireAppUser } from "@/lib/firebase-admin/request-auth"
import { invokeAiText } from "@/lib/ai/client"
import { SOP_DATA, PROJECT_KEYS } from "@/constants/sop-data"
import type { SOPProject } from "@/types/sop"

interface SopQaRequest {
  question: string
  projectType?: string
}

const TYPE_TO_KEY: Record<string, string> = {
  NS: "ns",
  ER: "er",
  WIW: "wiw",
  FC: "fc",
  MC: "mc",
  "F&D": "mc",
}

function detectProjectTypes(question: string): string[] {
  const upper = question.toUpperCase()
  const found: string[] = []
  if (upper.includes("NEW STORE") || upper.match(/\bNS\b/)) found.push("ns")
  if (upper.includes("REMODEL") || upper.includes("EXPANSION") || upper.match(/\bER\b/)) found.push("er")
  if (upper.includes("WIW") || upper.includes("WALK-IN") || upper.includes("WITHIN")) found.push("wiw")
  if (upper.includes("FUEL") || upper.match(/\bFC\b/)) found.push("fc")
  if (upper.includes("MINOR CAPITAL") || upper.includes("MAINTENANCE") || upper.match(/\bMC\b/)) found.push("mc")
  if (upper.includes("ORACLE") || upper.includes("SETUP")) found.push("appA")
  if (upper.includes("COUPA") || upper.includes("PO ")) found.push("appB")
  if (upper.includes("MEETING") || upper.includes("TEMPLATE")) found.push("appC")
  if (upper.includes("FILING") || upper.includes("DOCUMENT")) found.push("appD")
  return found
}

function formatSOPForContext(sopKey: string): string {
  const sop: SOPProject | undefined = SOP_DATA[sopKey]
  if (!sop) return ""

  const lines: string[] = [
    `=== ${sop.title} ===`,
    `Baseline: ${sop.baseline}`,
    `Objective: ${sop.objective}`,
    `Scope: ${sop.scope}`,
    "",
  ]

  for (const phase of sop.phases) {
    lines.push(`--- ${phase.name} ---`)
    for (const step of phase.steps) {
      lines.push(
        `  [${sop.id.toUpperCase()} SOP, ${phase.name}, Step ${step.n}] ${step.text} (Owner: ${step.owner}, System: ${step.sys}${step.wk ? `, ${step.wk}` : ""})`,
      )
    }
    if (phase.gates.length > 0) {
      lines.push(`  GATES: ${phase.gates.join("; ")}`)
    }
    if (phase.tips.length > 0) {
      lines.push(`  TIPS: ${phase.tips.join("; ")}`)
    }
    lines.push("")
  }

  return lines.join("\n")
}

function buildPrompt(question: string, sopContext: string): { system: string; user: string } {
  const system = "You are a Kroger Facility Engineering SOP expert. Answer ONLY from the provided SOP data."

  const user = [
    "Context — SOP Reference Data:",
    sopContext,
    "",
    "Rules:",
    "- Answer using ONLY the SOP data above. Do not use general construction knowledge.",
    "- Cite every claim with [TYPE SOP, Phase Name, Step N] format.",
    "- If the question spans multiple project types, include relevant sections from each.",
    '- If the SOPs do not cover the question, respond: "This is not covered in the current SOPs. Please consult your PM lead."',
    "- Be concise and actionable.",
    "",
    "Question:",
    question,
  ].join("\n")

  return { system, user }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAppUser(req)
    if (!auth.ok) return auth.response

    const body = (await req.json()) as SopQaRequest

    if (!body.question) {
      return NextResponse.json({ error: "Missing question" }, { status: 400 })
    }

    // Determine which SOPs to fetch
    let sopKeys: string[] = []

    if (body.projectType && TYPE_TO_KEY[body.projectType]) {
      sopKeys = [TYPE_TO_KEY[body.projectType]]
    } else {
      sopKeys = detectProjectTypes(body.question)
    }

    // Default: include all project SOPs (truncated for context window)
    if (sopKeys.length === 0) {
      sopKeys = [...PROJECT_KEYS]
    }

    // Build SOP context (limit to 3 SOPs to manage token usage)
    const sopContext = sopKeys
      .slice(0, 3)
      .map(formatSOPForContext)
      .filter(Boolean)
      .join("\n\n")

    if (!sopContext) {
      return NextResponse.json({
        answer: "This is not covered in the current SOPs. Please consult your PM lead.",
        citations: [],
      })
    }

    const { system, user } = buildPrompt(body.question, sopContext)

    const { text } = await invokeAiText({
      feature: "sop-qa",
      systemPrompt: system,
      userPrompt: user,
      temperature: 0.1,
      maxTokens: 700,
    })

    // Extract citations
    const citationPattern = /\[([A-Z]+\s+SOP[^\]]*)\]/g
    const citations: string[] = []
    let match
    while ((match = citationPattern.exec(text)) !== null) {
      if (!citations.includes(match[1])) {
        citations.push(match[1])
      }
    }

    return NextResponse.json({ answer: text, citations })
  } catch (error) {
    console.error("sop-qa API error:", error)
    return NextResponse.json({ error: "Failed to process SOP question" }, { status: 500 })
  }
}
