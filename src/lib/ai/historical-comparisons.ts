import { adminDb } from "@/lib/firebase-admin"

export interface HistoricalCandidate {
  id: string
  source: "estimates" | "costReviews" | "comparisonSnapshots" | "estimateComparisonForms"
  label: string
  projectType: string
  total: number
  updatedAt: string
  scopeItems: string[]
  notes?: string
  similarityScore: number
}

interface CurrentEstimateContext {
  projectType: string
  sectionNames: string[]
  budget: number
}

function toIso(value: unknown): string {
  if (!value) return new Date(0).toISOString()
  if (typeof value === "string") return value
  if (typeof value === "object") {
    const v = value as { toDate?: () => Date; seconds?: number }
    if (typeof v.toDate === "function") return v.toDate().toISOString()
    if (typeof v.seconds === "number") return new Date(v.seconds * 1000).toISOString()
  }
  return new Date(0).toISOString()
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  if (typeof value !== "string") return 0
  const cleaned = value.replace(/[^0-9.-]/g, "")
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

function scoreCandidate(current: CurrentEstimateContext, candidate: Omit<HistoricalCandidate, "similarityScore">): number {
  let score = 0

  if (current.projectType && candidate.projectType) {
    if (normalizeText(current.projectType) === normalizeText(candidate.projectType)) {
      score += 0.55
    }
  }

  const currentSet = new Set(current.sectionNames.map(normalizeText).filter(Boolean))
  const candidateSet = new Set(candidate.scopeItems.map(normalizeText).filter(Boolean))
  if (currentSet.size > 0 && candidateSet.size > 0) {
    let overlap = 0
    currentSet.forEach((x) => {
      if (candidateSet.has(x)) overlap += 1
    })
    const union = new Set([...currentSet, ...candidateSet]).size
    const jaccard = union > 0 ? overlap / union : 0
    score += jaccard * 0.3
  }

  if (current.budget > 0 && candidate.total > 0) {
    const ratio = Math.abs(candidate.total - current.budget) / Math.max(current.budget, candidate.total)
    score += Math.max(0, 1 - ratio) * 0.15
  }

  const ageDays = Math.max(
    0,
    Math.floor((Date.now() - new Date(candidate.updatedAt).getTime()) / (24 * 60 * 60 * 1000)),
  )
  const recencyBoost = Math.max(0, 1 - ageDays / 365)
  score += recencyBoost * 0.05

  return Math.min(1, Number(score.toFixed(4)))
}

function computeEstimateTotal(sections: unknown): number {
  if (!Array.isArray(sections)) return 0
  let total = 0
  for (const sec of sections) {
    if (!sec || typeof sec !== "object") continue
    const s = sec as Record<string, unknown>
    const rows = Array.isArray(s.rows) ? s.rows : []
    const hasCont = Boolean(s.hasContingency)
    const contPct = toNumber(s.contPct)
    let subtotal = 0
    for (const r of rows) {
      if (!r || typeof r !== "object") continue
      const row = r as Record<string, unknown>
      subtotal += toNumber(row.extended)
      if (toNumber(row.extended) === 0) subtotal += toNumber(row.amount)
    }
    total += hasCont ? subtotal * (1 + contPct / 100) : subtotal
  }
  return Number(total.toFixed(2))
}

function extractSectionNames(sections: unknown): string[] {
  if (!Array.isArray(sections)) return []
  return sections
    .map((s) => (s && typeof s === "object" ? String((s as Record<string, unknown>).name || "") : ""))
    .map((x) => x.trim())
    .filter(Boolean)
}

export async function listHistoricalCandidates(
  current: CurrentEstimateContext,
  limit: number,
): Promise<HistoricalCandidate[]> {
  const results: Array<Omit<HistoricalCandidate, "similarityScore">> = []

  try {
    const estSnap = await adminDb.collection("estimates").limit(250).get()
    estSnap.docs.forEach((doc) => {
      const data = doc.data() as Record<string, unknown>
      const projectInfo = (data.projectInfo || {}) as Record<string, unknown>
      const projectType = String(projectInfo.projectType || "")
      const total = computeEstimateTotal(data.sections)
      const scopeItems = extractSectionNames(data.sections)
      results.push({
        id: doc.id,
        source: "estimates",
        label: `${String(projectInfo.store || "") || "Store"} - ${String(projectInfo.name || "Estimate")}`,
        projectType,
        total,
        updatedAt: toIso(data.updatedAt),
        scopeItems,
      })
    })
  } catch {
    // Ignore source errors to keep endpoint resilient.
  }

  try {
    const crSnap = await adminDb.collection("costReviews").limit(250).get()
    crSnap.docs.forEach((doc) => {
      const data = doc.data() as Record<string, unknown>
      const summary = (data.summary || {}) as Record<string, unknown>
      const total = toNumber(summary.projectedSpend) || toNumber(summary.revisedCA)
      const projectType = String(data.projectType || "")
      const scopeItems = Array.isArray(data.scopeItems)
        ? data.scopeItems.map((x) => String(x)).filter(Boolean)
        : []
      results.push({
        id: doc.id,
        source: "costReviews",
        label: `${String(data.storeNumber || "Store")} - ${String(data.projectName || "Cost Review")}`,
        projectType,
        total,
        updatedAt: toIso(data.updatedAt),
        scopeItems,
        notes: String(data.projectStatusText || ""),
      })
    })
  } catch {
    // Ignore source errors to keep endpoint resilient.
  }

  try {
    const cmpSnap = await adminDb.collection("comparisonSnapshots").limit(250).get()
    cmpSnap.docs.forEach((doc) => {
      const data = doc.data() as Record<string, unknown>
      const total = toNumber(data.estimatedProjectTotal)
      const projectType = String(data.projectType || "")
      const scopeItems = Array.isArray(data.scopeItems)
        ? data.scopeItems.map((x) => String(x)).filter(Boolean)
        : []
      results.push({
        id: doc.id,
        source: "comparisonSnapshots",
        label: String(data.title || `Comparison ${doc.id}`),
        projectType,
        total,
        updatedAt: toIso(data.updatedAt),
        scopeItems,
        notes: "3-project comparison snapshot",
      })
    })
  } catch {
    // Future source - collection may not exist yet.
  }

  try {
    const formSnap = await adminDb.collection("estimateComparisonForms").limit(250).get()
    formSnap.docs.forEach((doc) => {
      const data = doc.data() as Record<string, unknown>
      const total = toNumber(data.estimatedProjectTotal)
      const projectType = String(data.projectType || "")
      const scopeItems = Array.isArray(data.scopeItems)
        ? data.scopeItems.map((x) => String(x)).filter(Boolean)
        : []
      results.push({
        id: doc.id,
        source: "estimateComparisonForms",
        label: String(data.title || `Comparison Form ${doc.id}`),
        projectType,
        total,
        updatedAt: toIso(data.updatedAt),
        scopeItems,
        notes: "Estimate comparison form",
      })
    })
  } catch {
    // Collection may not exist yet.
  }

  const deduped = new Map<string, Omit<HistoricalCandidate, "similarityScore">>()
  results.forEach((r) => {
    const key = `${r.source}:${r.id}`
    if (!deduped.has(key)) deduped.set(key, r)
  })

  return [...deduped.values()]
    .map((r) => ({ ...r, similarityScore: scoreCandidate(current, r) }))
    .filter((r) => r.total > 0)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, Math.max(1, Math.min(limit, 40)))
}
