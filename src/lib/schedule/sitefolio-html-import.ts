import type { SfMilestoneState } from "@/lib/schedule/sf-schedule"

export interface ParsedSiteFolioRow {
  category: string
  label: string
  baseline: string
  projected: string
  projectedAlt: string
  actual: string
}

export interface SiteFolioImportResult {
  rows: ParsedSiteFolioRow[]
  projectLabel?: string
}

export interface SiteFolioMappingResult {
  milestones: SfMilestoneState[]
  matched: number
  unmatchedMilestones: string[]
  unmatchedRows: string[]
  suggestedGrandOpening: string | null
}

function cleanCellValue(value: string): string {
  const v = (value || "").replace(/\u2014/g, "").replace(/\s+/g, " ").trim()
  return v
}

function usDateToIso(value: string): string {
  const raw = cleanCellValue(value)
  if (!raw) return ""

  const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return ""

  const mm = m[1].padStart(2, "0")
  const dd = m[2].padStart(2, "0")
  const yyyy = m[3]
  return `${yyyy}-${mm}-${dd}`
}

function normalizeLabel(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function getDateCell(tr: Element, dataNum: string): string {
  const td = tr.querySelector(`td.SD[data-num='${dataNum}']`)
  if (!td) return ""
  return usDateToIso(td.textContent || "")
}

export function parseSiteFolioScheduleHtml(html: string): SiteFolioImportResult {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")

  const tbody = doc.querySelector("#tbScheduleDates")
  if (!tbody) {
    throw new Error("Could not find SiteFolio schedule table (tbScheduleDates).")
  }

  const projectLabel = cleanCellValue(
    doc.querySelector("#U_ctl19_spnProjectIdentifierAndName")?.textContent || "",
  )

  const rows: ParsedSiteFolioRow[] = []
  let currentCategory = ""

  tbody.querySelectorAll("tr").forEach((tr) => {
    const className = tr.className || ""

    if (className.includes("CAT")) {
      currentCategory = cleanCellValue(tr.querySelector("td.SC")?.textContent || "")
      return
    }

    if (!className.includes("MSC")) return

    const label = cleanCellValue(tr.querySelector("td.ST")?.textContent || "")
    if (!label) return

    rows.push({
      category: currentCategory,
      label,
      baseline: getDateCell(tr, "1"),
      projected: getDateCell(tr, "2"),
      projectedAlt: getDateCell(tr, "3"),
      actual: getDateCell(tr, "4"),
    })
  })

  return { rows, projectLabel }
}

export function mapSiteFolioRowsToMilestones(
  milestones: SfMilestoneState[],
  rows: ParsedSiteFolioRow[],
): SiteFolioMappingResult {
  const rowByExact = new Map<string, ParsedSiteFolioRow>()
  const rowByLoose = new Map<string, ParsedSiteFolioRow>()

  for (const row of rows) {
    const normalized = normalizeLabel(row.label)
    rowByExact.set(normalized, row)

    // Loose key for labels where punctuation or qualifiers differ.
    const loose = normalized.replace(/\b(the|and|for|to|of|received|completed|started)\b/g, "").replace(/\s+/g, " ").trim()
    rowByLoose.set(loose, row)
  }

  const usedRows = new Set<string>()
  const unmatchedMilestones: string[] = []
  let matched = 0
  let suggestedGrandOpening: string | null = null

  const mapped = milestones.map((milestone) => {
    const normalized = normalizeLabel(milestone.label)
    const loose = normalized.replace(/\b(the|and|for|to|of|received|completed|started)\b/g, "").replace(/\s+/g, " ").trim()

    const matchedRow = rowByExact.get(normalized) || rowByLoose.get(loose)
    if (!matchedRow) {
      unmatchedMilestones.push(milestone.label)
      return milestone
    }

    usedRows.add(normalizeLabel(matchedRow.label))
    matched += 1

    // Import strategy:
    // - actual maps directly
    // - projectedAlt is preferred; fall back to projected for user-facing schedule parity
    const projectedAlt = matchedRow.projectedAlt || matchedRow.projected || ""
    const actual = matchedRow.actual || ""

    if (/grand\s+open|opened\s+for\s+business/.test(normalized)) {
      suggestedGrandOpening = actual || projectedAlt || matchedRow.projected || null
    }

    return {
      ...milestone,
      projectedAlt,
      actual,
    }
  })

  const unmatchedRows = rows
    .map((r) => r.label)
    .filter((label) => !usedRows.has(normalizeLabel(label)))

  return {
    milestones: mapped,
    matched,
    unmatchedMilestones,
    unmatchedRows,
    suggestedGrandOpening,
  }
}
