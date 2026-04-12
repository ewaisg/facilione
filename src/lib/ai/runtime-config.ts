import { adminDb } from "@/lib/firebase-admin"

export type AiFeature =
  | "weekly-update-draft"
  | "portfolio-insights"
  | "cost-estimate"
  | "sop-qa"
  | "next-actions"
  | "draft-communication"
  | "gate-check"
  | "historical-search"
  | "budget-analysis"
  | "schedule-deviations"
  | "document-review"
  | "forms-auto-populate"
  | "forms-agenda-builder"
  | "forms-generate-minutes"
  | "reports-schedule-status"
export type AiApiStyle = "chat-completions" | "responses"
export type AiAuthMode = "api-key" | "authorization-bearer"

interface StoredAiModel {
  key: string
  name?: string
  deployment?: string
  targetUri?: string
  model?: string
  apiStyle?: AiApiStyle
  authMode?: AiAuthMode
  apiKey?: string
  enabled?: boolean
}

interface StoredAiSettings {
  endpoint?: string
  apiKey?: string
  apiVersion?: string
  models?: StoredAiModel[]
  featureModelMap?: Partial<Record<AiFeature, string>>
  agents?: Array<{
    key: string
    name?: string
    endpoint?: string
    apiKey?: string
    notes?: string
    codeSnippet?: string
  }>
}

export interface AzureOpenAiRuntimeConfig {
  url: string
  apiKey: string
  apiVersion: string
  apiStyle: AiApiStyle
  authMode: AiAuthMode
  model: string
}

async function getStoredAiSettings(): Promise<StoredAiSettings | null> {
  try {
    const snap = await adminDb.collection("systemSettings").doc("ai").get()
    if (!snap.exists) return null
    return (snap.data() || null) as StoredAiSettings | null
  } catch {
    // If Firebase Admin is not configured in this environment, routes can still use env fallback.
    return null
  }
}

function pickModelKey(feature: AiFeature, settings: StoredAiSettings | null): string {
  const models = (settings?.models || []).filter((m) => m && m.key && m.enabled !== false)
  const mappedKey = settings?.featureModelMap?.[feature]

  if (mappedKey) {
    const mapped = models.find((m) => m.key === mappedKey)
    if (mapped) return mapped.key
  }

  if (models.length > 0) return models[0].key

  return ""
}

function resolveRuntimeConfig(
  settings: StoredAiSettings | null,
  selectedModelKey: string,
): AzureOpenAiRuntimeConfig {
  const endpoint = (settings?.endpoint || process.env.AZURE_OPENAI_ENDPOINT || "").trim()
  const globalApiKey = (settings?.apiKey || process.env.AZURE_OPENAI_API_KEY || "").trim()
  const apiVersion = (settings?.apiVersion || process.env.AZURE_OPENAI_API_VERSION || "2024-10-21").trim()

  const modelKey = selectedModelKey.trim()
  const models = (settings?.models || []).filter((m) => m && m.enabled !== false)
  const selectedModel = models.find((m) => m.key === modelKey)

  const modelApiKey = (selectedModel?.apiKey || "").trim()
  const apiKey = modelApiKey || globalApiKey

  const inferredApiStyle: AiApiStyle = selectedModel?.targetUri?.includes("/responses")
    ? "responses"
    : "chat-completions"
  const apiStyle: AiApiStyle = selectedModel?.apiStyle || inferredApiStyle
  const inferredAuthMode: AiAuthMode = selectedModel?.targetUri?.includes("/openai/v1/")
    ? "authorization-bearer"
    : "api-key"
  const authMode: AiAuthMode = selectedModel?.authMode || inferredAuthMode

  const targetUri = (selectedModel?.targetUri || "").trim()
  const deployment = (selectedModel?.deployment || process.env.AZURE_OPENAI_DEPLOYMENT || "").trim()
  const model = (selectedModel?.model || deployment).trim()

  const normalizedEndpoint = endpoint.replace(/\/$/, "")
  const url = targetUri
    ? targetUri
    : normalizedEndpoint && deployment
      ? `${normalizedEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`
      : ""

  return { url, apiKey, apiVersion, apiStyle, authMode, model }
}

export async function getAzureOpenAiRuntimeConfig(feature: AiFeature): Promise<AzureOpenAiRuntimeConfig> {
  const settings = await getStoredAiSettings()
  const modelKey = pickModelKey(feature, settings)
  return resolveRuntimeConfig(settings, modelKey)
}

export async function getAzureOpenAiRuntimeConfigByModelKey(modelKey: string): Promise<AzureOpenAiRuntimeConfig> {
  const settings = await getStoredAiSettings()
  return resolveRuntimeConfig(settings, modelKey)
}
