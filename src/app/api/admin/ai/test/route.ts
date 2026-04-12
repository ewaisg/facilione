import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/firebase-admin/request-auth"
import { invokeAiModelText } from "@/lib/ai/client"

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRoles(req, ["admin"])
    if (!auth.ok) return auth.response

    const body = (await req.json()) as { modelKey?: string }
    const modelKey = String(body.modelKey || "").trim()

    if (!modelKey) {
      return NextResponse.json({ error: "modelKey is required" }, { status: 400 })
    }

    const { text } = await invokeAiModelText({
      modelKey,
      systemPrompt: "You are testing model connectivity. Respond in one short sentence.",
      userPrompt: "Reply with exactly: Model connectivity test successful.",
      temperature: 0,
      maxTokens: 80,
    })

    return NextResponse.json({
      success: true,
      modelKey,
      output: text,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Model test failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
