import { NextResponse } from "next/server"
import { invokeAiText } from "@/lib/ai/client"

interface CostEstimateRequest {
  projectInfo: {
    store: string
    name: string
    projectType: string
    fundingSource: string
    budget: string
    oracle: string
    parent: string
  }
  totals: {
    grandTotal: number
  }
  sections: Array<{
    name: string
    subtotal: number
    totalWithContingency: number
    contingencyPct: number
    rowCount: number
    topItems: Array<{ item: string; vendor: string; value: number }>
  }>
  comparables?: Array<{
    id: string
    source: string
    label: string
    projectType: string
    total: number
    similarityScore?: number
    notes?: string
  }>
}

interface CostEstimateResponse {
  suggestedTotal: number
  lowRange: number
  highRange: number
  confidence: "low" | "medium" | "high"
  rationale: string
  assumptions: string[]
  risks: string[]
  sectionAdjustments: Array<{
    sectionName: string
    suggestedTotal: number
    note: string
  }>
}

function buildPrompt(payload: CostEstimateRequest): string {
  const sections = payload.sections
    .map((s) => {
      const topItems = s.topItems
        .slice(0, 3)
        .map((i) => `${i.item || "Item"} (${i.vendor || "n/a"}) = ${i.value}`)
        .join("; ")
      return `- ${s.name}: subtotal=${s.subtotal}, totalWithContingency=${s.totalWithContingency}, contingencyPct=${s.contingencyPct}, rowCount=${s.rowCount}, topItems=[${topItems}]`
    })
    .join("\n")

  const comparables = (payload.comparables || [])
    .slice(0, 3)
    .map((c, idx) => `${idx + 1}) ${c.label} [${c.source}] type=${c.projectType}, total=${c.total}, similarity=${c.similarityScore ?? "n/a"}, notes=${c.notes || ""}`)
    .join("\n")

  return [
    "You are a construction project cost estimator.",
    "Estimate realistic total project cost and section-level adjustments based on provided structured estimate data.",
    "Use historical comparisons as anchor references when available.",
    "Return JSON only (no markdown).",
    "Required JSON shape:",
    "{",
    '  "suggestedTotal": number,',
    '  "lowRange": number,',
    '  "highRange": number,',
    '  "confidence": "low" | "medium" | "high",',
    '  "rationale": string,',
    '  "assumptions": string[],',
    '  "risks": string[],',
    '  "sectionAdjustments": [{"sectionName": string, "suggestedTotal": number, "note": string}]',
    "}",
    "Rules:",
    "- Keep rationale concise and practical for PM review.",
    "- sectionAdjustments should cover major sections only (max 8).",
    "- Use realistic ranges; lowRange <= suggestedTotal <= highRange.",
    "- If data is sparse, lower confidence and state assumptions.",
    "- If 3 historical comparables are provided, explicitly align recommendation to that 3-project comparison method.",
    "",
    `Project type: ${payload.projectInfo.projectType || "Unknown"}`,
    `Project name: ${payload.projectInfo.name || "Unknown"}`,
    `Funding source: ${payload.projectInfo.fundingSource || "Unknown"}`,
    `Provided budget: ${payload.projectInfo.budget || "N/A"}`,
    `Current worksheet total: ${payload.totals.grandTotal}`,
    "Historical comparables (up to 3):",
    comparables || "- None provided",
    "Sections:",
    sections || "- No section data",
  ].join("\n")
}

function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

function parseModelJson(raw: string): CostEstimateResponse | null {
  const text = raw.trim()
  const candidate = text.startsWith("```")
    ? text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim()
    : text

  try {
    const parsed = JSON.parse(candidate) as Partial<CostEstimateResponse>
    return {
      suggestedTotal: toNumber(parsed.suggestedTotal),
      lowRange: toNumber(parsed.lowRange),
      highRange: toNumber(parsed.highRange),
      confidence: parsed.confidence === "low" || parsed.confidence === "high" ? parsed.confidence : "medium",
      rationale: String(parsed.rationale || ""),
      assumptions: Array.isArray(parsed.assumptions) ? parsed.assumptions.map((s) => String(s)) : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks.map((s) => String(s)) : [],
      sectionAdjustments: Array.isArray(parsed.sectionAdjustments)
        ? parsed.sectionAdjustments.map((x) => ({
            sectionName: String((x as { sectionName?: unknown }).sectionName || ""),
            suggestedTotal: toNumber((x as { suggestedTotal?: unknown }).suggestedTotal),
            note: String((x as { note?: unknown }).note || ""),
          }))
        : [],
    }
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CostEstimateRequest

    if (!body?.sections?.length) {
      return NextResponse.json({ error: "Missing estimate sections" }, { status: 400 })
    }

    const prompt = buildPrompt(body)
    const { text } = await invokeAiText({
      feature: "cost-estimate",
      systemPrompt: "You provide financially grounded project estimate recommendations in strict JSON.",
      userPrompt: prompt,
      temperature: 0.15,
      maxTokens: 900,
    })

    const parsed = parseModelJson(text)
    if (!parsed) {
      return NextResponse.json({
        error: "Model response was not valid JSON",
        raw: text,
      }, { status: 502 })
    }

    return NextResponse.json({ estimate: parsed })
  } catch (error) {
    console.error("cost-estimate API error:", error)
    const message = error instanceof Error ? error.message : "Failed to generate cost estimate"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
