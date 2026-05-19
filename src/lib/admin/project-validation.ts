import type { HealthStatus, ProjectStatus, ProjectType } from "@/types/project"

export const VALID_PROJECT_TYPES: ProjectType[] = ["NS", "ER", "WIW", "FC", "MC", "F&D"]
export const VALID_PROJECT_STATUSES: ProjectStatus[] = [
  "planning",
  "active",
  "on-hold",
  "complete",
  "cancelled",
]
export const VALID_HEALTH_STATUSES: HealthStatus[] = ["green", "yellow", "red"]

interface AdminProjectPayloadOptions {
  partial?: boolean
  defaultPmUserId?: string
  defaultOrgId?: string
}

export interface AdminProjectPayload extends Record<string, unknown> {
  storeNumber?: string
  storeName?: string
  storeAddress?: string
  storeCity?: string
  storeState?: string
  projectType?: ProjectType
  status?: ProjectStatus
  healthStatus?: HealthStatus
  grandOpeningDate?: string | null
  constructionStartDate?: string | null
  pmUserId?: string
  cmUserId?: string | null
  orgId?: string
  oracleParentProject?: string
  oracleProjectNumber?: string | null
  currentPhaseIndex?: number
  totalBudget?: number
  committedCost?: number
  actualCost?: number
  forecastCost?: number
  notes?: string
  tags?: string[]
}

export function buildAdminProjectPayload(
  body: Record<string, unknown>,
  options: AdminProjectPayloadOptions = {},
): AdminProjectPayload {
  const partial = options.partial ?? false
  const payload: AdminProjectPayload = {}

  readString(body, payload, "storeNumber", { required: !partial, max: 40 })
  readString(body, payload, "storeName", { required: !partial, max: 160 })
  readString(body, payload, "storeAddress", { max: 240 })
  readString(body, payload, "storeCity", { max: 120 })
  readString(body, payload, "storeState", { max: 24 })
  readString(body, payload, "oracleParentProject", { max: 80 })
  readNullableString(body, payload, "oracleProjectNumber", { max: 80 })
  readString(body, payload, "notes", { max: 4000 })

  if ("projectType" in body || !partial) {
    payload.projectType = readEnum(body.projectType, "projectType", VALID_PROJECT_TYPES)
  }
  if ("status" in body) {
    payload.status = readEnum(body.status, "status", VALID_PROJECT_STATUSES)
  }
  if ("healthStatus" in body) {
    payload.healthStatus = readEnum(body.healthStatus, "healthStatus", VALID_HEALTH_STATUSES)
  }
  if ("grandOpeningDate" in body) {
    payload.grandOpeningDate = readOptionalDate(body.grandOpeningDate, "grandOpeningDate")
  }
  if ("constructionStartDate" in body) {
    payload.constructionStartDate = readOptionalDate(body.constructionStartDate, "constructionStartDate")
  }
  if ("totalBudget" in body) {
    payload.totalBudget = readNonNegativeNumber(body.totalBudget, "totalBudget")
  }

  if (!partial) {
    payload.storeAddress ??= ""
    payload.storeCity ??= ""
    payload.storeState ??= "CO"
    payload.status ??= "planning"
    payload.healthStatus ??= "green"
    payload.grandOpeningDate ??= null
    payload.constructionStartDate ??= null
    payload.pmUserId = readOptionalString(body.pmUserId, { max: 128 }) || options.defaultPmUserId || ""
    payload.cmUserId = null
    payload.orgId = options.defaultOrgId || "default"
    payload.oracleParentProject ??= ""
    payload.oracleProjectNumber ??= null
    payload.currentPhaseIndex = 0
    payload.totalBudget ??= 0
    payload.committedCost = 0
    payload.actualCost = 0
    payload.forecastCost = 0
    payload.notes ??= ""
    payload.tags = []
  }

  return payload
}

function readString(
  source: Record<string, unknown>,
  target: Record<string, unknown>,
  key: string,
  options: { required?: boolean; max?: number } = {},
) {
  if (!(key in source)) {
    if (options.required) throw new Error(`${key} is required`)
    return
  }
  const value = readOptionalString(source[key], options)
  if (options.required && !value) throw new Error(`${key} is required`)
  if (value !== undefined) target[key] = value
}

function readNullableString(
  source: Record<string, unknown>,
  target: Record<string, unknown>,
  key: string,
  options: { max?: number } = {},
) {
  if (!(key in source)) return
  if (source[key] === null || source[key] === "") {
    target[key] = null
    return
  }
  const value = readOptionalString(source[key], options)
  target[key] = value ?? null
}

function readOptionalString(value: unknown, options: { max?: number } = {}) {
  if (value === undefined || value === null) return undefined
  if (typeof value !== "string") throw new Error("Expected a string value")
  const trimmed = value.trim()
  if (options.max && trimmed.length > options.max) {
    throw new Error(`Value must be ${options.max} characters or fewer`)
  }
  return trimmed
}

function readEnum<T extends string>(value: unknown, field: string, valid: readonly T[]): T {
  if (typeof value !== "string" || !valid.includes(value as T)) {
    throw new Error(`${field} must be one of: ${valid.join(", ")}`)
  }
  return value as T
}

function readOptionalDate(value: unknown, field: string): string | null {
  if (value === null || value === "") return null
  if (typeof value !== "string") throw new Error(`${field} must be a date string`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${field} must use YYYY-MM-DD format`)
  }
  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) throw new Error(`${field} is not a valid date`)
  return value
}

function readNonNegativeNumber(value: unknown, field: string): number {
  const numberValue = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(numberValue) || numberValue < 0) {
    throw new Error(`${field} must be a non-negative number`)
  }
  return numberValue
}
