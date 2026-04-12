import * as XLSX from "xlsx"

export interface ParsedComparisonSnapshot {
  templateType: "store-project-comparison-sov" | "estimate-comparison-form"
  title: string
  projectType: string
  estimatedProjectTotal: number
  estimatedProject: {
    storeNumber: string
    location: string
    status: string
    costDate: string
  }
  referenceProjects: Array<{
    label: string
    storeNumber: string
    location: string
    total: number
  }>
  scopeItems: string[]
  notes: string
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  if (typeof value !== "string") return 0
  const cleaned = value.replace(/[^0-9.-]/g, "")
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}

function cell(data: unknown[][], row1: number, col1: number): unknown {
  const row = data[row1 - 1]
  if (!row) return ""
  return row[col1 - 1] ?? ""
}

function inferProjectType(location: string): string {
  const text = String(location || "").toUpperCase()
  if (text.includes("F/D") || text.includes("FLOOR AND DECOR")) return "F&D"
  if (text.includes("MINOR CAP") || text.includes("MC")) return "MC"
  if (text.includes("NEW STORE") || text.includes("NS")) return "NS"
  if (text.includes("WIW")) return "WIW"
  if (text.includes("ER")) return "ER"
  return ""
}

export function parseComparisonSnapshotWorkbook(fileName: string, fileBuffer: ArrayBuffer): ParsedComparisonSnapshot {
  const workbook = XLSX.read(new Uint8Array(fileBuffer), { type: "array" })
  const sheetName = workbook.SheetNames.includes("Store Project Comparison SOV")
    ? "Store Project Comparison SOV"
    : workbook.SheetNames[0]
  const ws = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false }) as unknown[][]
  const titleCell = String(cell(rows, 2, 1) || "").toUpperCase()
  const headerRef = String(cell(rows, 1, 3) || "").toUpperCase()
  const templateType = titleCell.includes("PROJECT COMPARISON ESTIMATE") || headerRef.includes("REFERENCE PROJECT #1")
    ? "store-project-comparison-sov"
    : "estimate-comparison-form"

  const rp1Store = String(cell(rows, 3, 4) || "").trim()
  const rp2Store = String(cell(rows, 3, 6) || "").trim()
  const rp3Store = String(cell(rows, 3, 8) || "").trim()
  const estStore = String(cell(rows, 3, 10) || "").trim()

  const rp1Loc = String(cell(rows, 4, 4) || "").trim()
  const rp2Loc = String(cell(rows, 4, 6) || "").trim()
  const rp3Loc = String(cell(rows, 4, 8) || "").trim()
  const estLoc = String(cell(rows, 4, 10) || "").trim()

  let rp1Total = 0
  let rp2Total = 0
  let rp3Total = 0
  let estTotal = 0
  const scope = new Set<string>()

  // Scan core detailed rows + equipment rows.
  for (let r = 16; r <= 350; r += 1) {
    const desc = String(cell(rows, r, 2) || "").trim()
    if (!desc) continue

    const isSubtotal = /^subtotal\s*-?/i.test(desc)
    const isHeader = /^(TOTAL BUILDING COSTS|A\d\s|\d{2}\s-|TOTAL PROJECT COST|FIXTURING COST|TOTAL EQUIPMENT|TOTAL FIXTURING)/i.test(desc)

    const c = toNumber(cell(rows, r, 3))
    const d = toNumber(cell(rows, r, 4))
    const e = toNumber(cell(rows, r, 5))
    const f = toNumber(cell(rows, r, 6))
    const g = toNumber(cell(rows, r, 7))
    const h = toNumber(cell(rows, r, 8))
    const i = toNumber(cell(rows, r, 9))
    const j = toNumber(cell(rows, r, 10))

    rp1Total += c + d
    rp2Total += e + f
    rp3Total += g + h
    estTotal += i + j

    if (!isSubtotal && !isHeader && (i > 0 || j > 0 || c > 0 || d > 0 || e > 0 || f > 0 || g > 0 || h > 0)) {
      scope.add(desc)
    }
  }

  const projectType = inferProjectType(estLoc)

  return {
    templateType,
    title: `${fileName.replace(/\.[^.]+$/, "")} - ${estStore || "Estimated Project"}`,
    projectType,
    estimatedProjectTotal: Number(estTotal.toFixed(2)),
    estimatedProject: {
      storeNumber: estStore,
      location: estLoc,
      status: String(cell(rows, 10, 10) || "").trim(),
      costDate: String(cell(rows, 5, 10) || "").trim(),
    },
    referenceProjects: [
      { label: "Reference Project #1", storeNumber: rp1Store, location: rp1Loc, total: Number(rp1Total.toFixed(2)) },
      { label: "Reference Project #2", storeNumber: rp2Store, location: rp2Loc, total: Number(rp2Total.toFixed(2)) },
      { label: "Reference Project #3", storeNumber: rp3Store, location: rp3Loc, total: Number(rp3Total.toFixed(2)) },
    ],
    scopeItems: [...scope].slice(0, 200),
    notes: "Parsed from Store Project Comparison SOV workbook",
  }
}
