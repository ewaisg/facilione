import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { requireRoles } from "@/lib/firebase-admin/request-auth"
import type { AiFeature } from "@/lib/ai/runtime-config"

interface AiModelConfig {
  key: string
  name: string
  deployment?: string
  targetUri?: string
  model?: string
  apiStyle?: "chat-completions" | "responses"
  authMode?: "api-key" | "authorization-bearer"
  apiKey?: string
  enabled: boolean
}

interface AgentConfig {
  key: string
  name: string
  version?: string
  endpoint: string
  apiKey?: string
  notes?: string
  codeSnippet?: string
}

interface AdminAiConfig {
  endpoint: string
  apiVersion: string
  apiKey?: string
  models: AiModelConfig[]
  featureModelMap: Partial<Record<AiFeature, string>>
  agents: AgentConfig[]
  updatedAt?: string
}

function removeUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => removeUndefinedDeep(item)) as T
  }

  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) continue
      out[k] = removeUndefinedDeep(v)
    }
    return out as T
  }

  return value
}

function sanitizeModels(models: unknown): AiModelConfig[] {
  if (!Array.isArray(models)) return []

  const seen = new Set<string>()
  const out: AiModelConfig[] = []

  for (const m of models) {
    if (!m || typeof m !== "object") continue
    const raw = m as Record<string, unknown>
    const key = String(raw.key || "").trim()
    const deployment = String(raw.deployment || "").trim()
    const targetUri = String(raw.targetUri || "").trim()
    if (!key || (!deployment && !targetUri) || seen.has(key)) continue

    seen.add(key)
    out.push({
      key,
      name: String(raw.name || key).trim(),
      deployment: deployment || undefined,
      targetUri: targetUri || undefined,
      model: String(raw.model || deployment || "").trim() || undefined,
      apiStyle: raw.apiStyle === "responses" ? "responses" : "chat-completions",
      authMode: raw.authMode === "authorization-bearer" ? "authorization-bearer" : "api-key",
      apiKey: String(raw.apiKey || "").trim() || undefined,
      enabled: raw.enabled !== false,
    })
  }

  return out
}

function sanitizeAgents(agents: unknown): AgentConfig[] {
  if (!Array.isArray(agents)) return []

  const seen = new Set<string>()
  const out: AgentConfig[] = []

  for (const a of agents) {
    if (!a || typeof a !== "object") continue
    const raw = a as Record<string, unknown>
    const key = String(raw.key || "").trim()
    if (!key || seen.has(key)) continue
    seen.add(key)

    out.push({
      key,
      name: String(raw.name || key).trim(),
      version: String(raw.version || "").trim() || undefined,
      endpoint: String(raw.endpoint || "").trim(),
      apiKey: String(raw.apiKey || "").trim() || undefined,
      notes: String(raw.notes || "").trim() || undefined,
      codeSnippet: String(raw.codeSnippet || "").trim() || undefined,
    })
  }

  return out
}

const ALL_FEATURES: AiFeature[] = [
  "weekly-update-draft",
  "portfolio-insights",
  "cost-estimate",
  "sop-qa",
  "next-actions",
  "draft-communication",
  "gate-check",
  "historical-search",
  "budget-analysis",
  "schedule-deviations",
  "document-review",
  "forms-auto-populate",
  "forms-agenda-builder",
  "forms-generate-minutes",
  "reports-schedule-status",
]

function normalizeFeatureMap(
  value: unknown,
  models: AiModelConfig[],
): Partial<Record<AiFeature, string>> {
  const out: Partial<Record<AiFeature, string>> = {}
  const validKeys = new Set(models.map((m) => m.key))

  if (!value || typeof value !== "object") return out
  const raw = value as Record<string, unknown>

  for (const feature of ALL_FEATURES) {
    const mapped = String(raw[feature] || "").trim()
    if (mapped && validKeys.has(mapped)) {
      out[feature] = mapped
    }
  }

  return out
}

function buildResponse(config: AdminAiConfig) {
  return {
    endpoint: config.endpoint,
    apiVersion: config.apiVersion,
    hasApiKey: Boolean(config.apiKey),
    apiKeyMasked: config.apiKey ? `${"*".repeat(6)}${config.apiKey.slice(-4)}` : "",
    featureModelMap: config.featureModelMap,
    agents: config.agents.map((a) => ({
      ...a,
      hasApiKey: Boolean(a.apiKey),
      apiKeyMasked: a.apiKey ? `${"*".repeat(6)}${a.apiKey.slice(-4)}` : "",
      apiKey: undefined,
    })),
    updatedAt: config.updatedAt || null,
    models: config.models.map((m) => ({
      ...m,
      hasApiKey: Boolean(m.apiKey),
      apiKeyMasked: m.apiKey ? `${"*".repeat(6)}${m.apiKey.slice(-4)}` : "",
      apiKey: undefined,
    })),
    envFallback: {
      endpoint: process.env.AZURE_OPENAI_ENDPOINT || "",
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-10-21",
      hasApiKey: Boolean(process.env.AZURE_OPENAI_API_KEY),
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT || "",
    },
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRoles(req, ["admin"])
    if (!auth.ok) return auth.response

    const ref = adminDb.collection("systemSettings").doc("ai")
    const snap = await ref.get()

    const current = (snap.exists ? (snap.data() as AdminAiConfig) : null) || {
      endpoint: "",
      apiVersion: "2024-10-21",
      apiKey: "",
      models: [],
      featureModelMap: {},
      agents: [],
    }

    return NextResponse.json({ config: buildResponse(current) })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load AI config"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireRoles(req, ["admin"])
    if (!auth.ok) return auth.response

    const body = (await req.json()) as Partial<AdminAiConfig>

    const ref = adminDb.collection("systemSettings").doc("ai")
    const existing = await ref.get()
    const current = (existing.exists ? (existing.data() as AdminAiConfig) : null) || {
      endpoint: "",
      apiVersion: "2024-10-21",
      apiKey: "",
      models: [],
      featureModelMap: {},
      agents: [],
    }

    const models = sanitizeModels(body.models)
    const featureModelMap = normalizeFeatureMap(body.featureModelMap, models)
    const currentModels = Array.isArray(current.models) ? current.models : []
    const currentModelsByKey = new Map(currentModels.map((m) => [m.key, m]))
    const mergedModels = models.map((m) => ({
      ...m,
      apiKey: m.apiKey || currentModelsByKey.get(m.key)?.apiKey,
    }))
    const incomingAgents = sanitizeAgents(body.agents)
    const currentAgents = Array.isArray(current.agents) ? current.agents : []
    const currentAgentsByKey = new Map(currentAgents.map((a) => [a.key, a]))
    const agents = incomingAgents.map((a) => ({
      ...a,
      apiKey: a.apiKey || currentAgentsByKey.get(a.key)?.apiKey,
    }))

    const next: AdminAiConfig = {
      endpoint: String(body.endpoint || "").trim(),
      apiVersion: String(body.apiVersion || "2024-10-21").trim() || "2024-10-21",
      apiKey: typeof body.apiKey === "string" && body.apiKey.trim()
        ? body.apiKey.trim()
        : current.apiKey,
      models: mergedModels,
      featureModelMap,
      agents,
      updatedAt: new Date().toISOString(),
    }

    const sanitizedNext = removeUndefinedDeep(next)

    await ref.set(sanitizedNext, { merge: true })

    return NextResponse.json({ success: true, config: buildResponse(sanitizedNext) })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save AI config"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
