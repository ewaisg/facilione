import { type NextRequest } from "next/server"
import { requireAppUser } from "@/lib/firebase-admin/request-auth"
import { getAzureOpenAiRuntimeConfig, type AiFeature } from "@/lib/ai/runtime-config"
import { SOP_DATA, PROJECT_KEYS } from "@/constants/sop-data"
import type { SOPProject, SOPPhase } from "@/types/sop"

interface CopilotRequest {
  sessionId: string
  message: string
  projectId?: string
  projectType?: string
  history?: Array<{ role: string; content: string }>
}

// Map project type abbreviations to SOP keys
const TYPE_TO_KEY: Record<string, string> = {
  NS: "ns",
  ER: "er",
  WIW: "wiw",
  FC: "fc",
  MC: "mc",
  "F&D": "mc",
}

function detectProjectType(message: string): string[] {
  const upper = message.toUpperCase()
  const found: string[] = []
  if (upper.includes("NEW STORE") || upper.match(/\bNS\b/)) found.push("ns")
  if (upper.includes("REMODEL") || upper.includes("EXPANSION") || upper.match(/\bER\b/)) found.push("er")
  if (upper.includes("WIW") || upper.includes("WALK-IN") || upper.includes("WITHIN")) found.push("wiw")
  if (upper.includes("FUEL") || upper.match(/\bFC\b/)) found.push("fc")
  if (upper.includes("MINOR CAPITAL") || upper.includes("MAINTENANCE") || upper.match(/\bMC\b/)) found.push("mc")
  return found
}

function detectPhaseRef(message: string): number | null {
  const match = message.match(/phase\s*(\d+)/i)
  return match ? parseInt(match[1], 10) : null
}

function formatSOPContext(sopKey: string, phaseIndex: number | null): string {
  const sop: SOPProject | undefined = SOP_DATA[sopKey]
  if (!sop) return ""

  const lines: string[] = [
    `SOP: ${sop.title}`,
    `Baseline: ${sop.baseline}`,
    `Objective: ${sop.objective}`,
    "",
  ]

  const phases: SOPPhase[] = phaseIndex !== null
    ? sop.phases.filter((_, i) => i === phaseIndex - 1)
    : sop.phases

  for (const phase of phases) {
    lines.push(`--- ${phase.name} ---`)
    for (const step of phase.steps) {
      lines.push(`  [${sop.id.toUpperCase()} SOP, ${phase.name}, Step ${step.n}] ${step.text} (Owner: ${step.owner}, System: ${step.sys})`)
    }
    if (phase.gates.length > 0) {
      lines.push(`  Gates: ${phase.gates.join("; ")}`)
    }
    if (phase.tips.length > 0) {
      lines.push(`  Tips: ${phase.tips.join("; ")}`)
    }
    lines.push("")
  }

  return lines.join("\n")
}

function buildSOPContext(message: string, projectType?: string): string {
  // Determine which SOPs to include
  let sopKeys: string[] = []

  if (projectType && TYPE_TO_KEY[projectType]) {
    sopKeys = [TYPE_TO_KEY[projectType]]
  } else {
    sopKeys = detectProjectType(message)
  }

  // If no specific type detected, include a summary of all types
  if (sopKeys.length === 0) {
    sopKeys = [...PROJECT_KEYS]
  }

  const phaseRef = detectPhaseRef(message)
  const contextParts: string[] = []

  for (const key of sopKeys.slice(0, 3)) {
    const ctx = formatSOPContext(key, phaseRef)
    if (ctx) contextParts.push(ctx)
  }

  return contextParts.join("\n\n")
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAppUser(req)
    if (!auth.ok) return auth.response

    const body = (await req.json()) as CopilotRequest

    if (!body.message || !body.sessionId) {
      return new Response(JSON.stringify({ error: "Missing message or sessionId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const feature: AiFeature = "sop-qa"
    const cfg = await getAzureOpenAiRuntimeConfig(feature)

    if (!cfg.url || !cfg.apiKey) {
      return new Response(JSON.stringify({ error: "AI is not configured" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Build SOP context
    const sopContext = buildSOPContext(body.message, body.projectType)

    const systemPrompt = [
      "You are FE Copilot, a Facility Engineering project management assistant for Kroger.",
      "You answer questions using ONLY the SOP reference data provided below.",
      "Always cite specific SOP sections in your answers using the format [TYPE SOP, Phase Name, Step N].",
      "If the SOPs do not cover the question, say: \"This is not covered in the current SOPs. Please consult your PM lead.\"",
      "Never fabricate steps, phases, or procedures not in the provided data.",
      "Be concise, professional, and action-oriented.",
    ].join("\n")

    const historyMessages = (body.history || []).slice(-8).map((h) => ({
      role: h.role as "user" | "assistant",
      content: h.content,
    }))

    const userPrompt = [
      "Context — SOP Reference Data:",
      sopContext,
      "",
      "User Question:",
      body.message,
    ].join("\n")

    // Build request body for streaming
    const isV1OpenAi = cfg.url.includes("/openai/v1/")

    const messages = [
      { role: "system", content: systemPrompt },
      ...historyMessages,
      { role: "user", content: userPrompt },
    ]

    const requestBody: Record<string, unknown> = cfg.apiStyle === "responses"
      ? {
          model: cfg.model,
          input: messages,
          temperature: 0.15,
          max_output_tokens: 800,
          stream: true,
        }
      : {
          ...(isV1OpenAi ? { model: cfg.model } : {}),
          messages,
          temperature: 0.15,
          ...(isV1OpenAi ? { max_completion_tokens: 800 } : { max_tokens: 800 }),
          stream: true,
        }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (cfg.authMode === "authorization-bearer") {
      headers.Authorization = `Bearer ${cfg.apiKey}`
    } else {
      headers["api-key"] = cfg.apiKey
    }

    const aiResponse = await fetch(cfg.url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    })

    if (!aiResponse.ok) {
      const errText = await aiResponse.text()
      console.error("Copilot AI error:", errText)
      return new Response(JSON.stringify({ error: "AI request failed" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Stream SSE to client
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const reader = aiResponse.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        const decoder = new TextDecoder()
        let fullText = ""

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split("\n")

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue
              const data = line.slice(6).trim()
              if (data === "[DONE]") continue

              try {
                const parsed = JSON.parse(data)

                // Handle chat-completions streaming format
                const delta = parsed.choices?.[0]?.delta?.content
                if (delta) {
                  fullText += delta
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: "text", content: delta })}\n\n`),
                  )
                }

                // Handle responses API streaming format
                const outputText = parsed.delta?.text || parsed.delta?.content
                if (outputText) {
                  fullText += outputText
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: "text", content: outputText })}\n\n`),
                  )
                }
              } catch {
                // skip malformed chunks
              }
            }
          }

          // Extract citations from response
          const citationPattern = /\[([A-Z]+\s+SOP,\s+Phase\s+[^,\]]+(?:,\s+Step\s+[^\]]+)?)\]/g
          const citations: string[] = []
          let match
          while ((match = citationPattern.exec(fullText)) !== null) {
            if (!citations.includes(match[1])) {
              citations.push(match[1])
            }
          }

          if (citations.length > 0) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "citations", content: citations })}\n\n`),
            )
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        } catch (err) {
          console.error("Streaming error:", err)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Copilot API error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
