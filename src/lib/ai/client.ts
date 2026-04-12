import {
  type AiFeature,
  type AiApiStyle,
  type AiAuthMode,
  getAzureOpenAiRuntimeConfig,
  getAzureOpenAiRuntimeConfigByModelKey,
} from "@/lib/ai/runtime-config"

interface InvokeAiTextInput {
  feature: AiFeature
  systemPrompt: string
  userPrompt: string
  temperature?: number
  maxTokens?: number
}

interface InvokeAiTextOutput {
  text: string
}

interface InvokeAiByModelInput {
  modelKey: string
  systemPrompt: string
  userPrompt: string
  temperature?: number
  maxTokens?: number
}

function buildHeaders(apiKey: string, authMode: AiAuthMode): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (authMode === "authorization-bearer") {
    headers.Authorization = `Bearer ${apiKey}`
  } else {
    headers["api-key"] = apiKey
  }

  return headers
}

function buildChatCompletionsBody(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  maxTokens: number,
  includeModel: boolean,
  isV1OpenAi: boolean,
): Record<string, unknown> {
  return {
    ...(includeModel ? { model } : {}),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature,
    ...(isV1OpenAi ? { max_completion_tokens: maxTokens } : { max_tokens: maxTokens }),
  }
}

function buildResponsesBody(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  maxTokens: number,
): Record<string, unknown> {
  return {
    model,
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature,
    max_output_tokens: maxTokens,
  }
}

function extractText(apiStyle: AiApiStyle, result: unknown): string {
  if (!result || typeof result !== "object") return ""
  const data = result as Record<string, unknown>

  if (apiStyle === "chat-completions") {
    const choices = data.choices as Array<Record<string, unknown>> | undefined
    const first = choices?.[0]
    const message = (first?.message || {}) as Record<string, unknown>
    return String(message.content || "").trim()
  }

  const outputText = String(data.output_text || "").trim()
  if (outputText) return outputText

  const output = data.output as Array<Record<string, unknown>> | undefined
  const firstItem = output?.[0]
  const content = firstItem?.content as Array<Record<string, unknown>> | undefined
  const textBlock = content?.find((c) => c.type === "output_text")
  const text = textBlock?.text
  return String(text || "").trim()
}

export async function invokeAiText(input: InvokeAiTextInput): Promise<InvokeAiTextOutput> {
  const cfg = await getAzureOpenAiRuntimeConfig(input.feature)
  const temperature = input.temperature ?? 0.25
  const maxTokens = input.maxTokens ?? 500

  if (!cfg.url || !cfg.apiKey) {
    throw new Error("Azure AI is not configured. Save Target URI and API key in Admin > System > AI Setup.")
  }

  const isV1OpenAi = cfg.url.includes("/openai/v1/")
  const apiStyle = cfg.apiStyle

  const body = apiStyle === "responses"
    ? buildResponsesBody(cfg.model, input.systemPrompt, input.userPrompt, temperature, maxTokens)
    : buildChatCompletionsBody(cfg.model, input.systemPrompt, input.userPrompt, temperature, maxTokens, isV1OpenAi, isV1OpenAi)

  const response = await fetch(cfg.url, {
    method: "POST",
    headers: buildHeaders(cfg.apiKey, cfg.authMode),
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Azure AI request failed: ${errorText}`)
  }

  const result = (await response.json()) as unknown
  const text = extractText(apiStyle, result)

  if (!text) {
    throw new Error("Model returned empty response")
  }

  return { text }
}

export async function invokeAiModelText(input: InvokeAiByModelInput): Promise<InvokeAiTextOutput> {
  const cfg = await getAzureOpenAiRuntimeConfigByModelKey(input.modelKey)
  const temperature = input.temperature ?? 0.2
  const maxTokens = input.maxTokens ?? 200

  if (!cfg.url || !cfg.apiKey) {
    throw new Error("Model is not fully configured. Ensure Target URI and key are saved.")
  }

  const isV1OpenAi = cfg.url.includes("/openai/v1/")
  const apiStyle = cfg.apiStyle

  const body = apiStyle === "responses"
    ? buildResponsesBody(cfg.model, input.systemPrompt, input.userPrompt, temperature, maxTokens)
    : buildChatCompletionsBody(cfg.model, input.systemPrompt, input.userPrompt, temperature, maxTokens, isV1OpenAi, isV1OpenAi)

  const response = await fetch(cfg.url, {
    method: "POST",
    headers: buildHeaders(cfg.apiKey, cfg.authMode),
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Azure AI request failed: ${errorText}`)
  }

  const result = (await response.json()) as unknown
  const text = extractText(apiStyle, result)

  if (!text) {
    throw new Error("Model returned empty response")
  }

  return { text }
}
