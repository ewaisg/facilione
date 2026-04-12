"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/firebase/auth-context"
import { subscribeToProjects } from "@/lib/firebase/firestore"
import { saveEstimate, listEstimatesForUser, deleteEstimate, getEstimate } from "@/lib/firebase/estimates"
import { PRESET_SECTIONS, PRESET_MAP } from "@/constants/estimate-presets"
import { PROJECT_TYPE_LABELS, FUNDING_SOURCES } from "@/constants/project-types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Save, FolderOpen, Trash2, FileDown, Plus, X, ChevronDown, Upload, Loader2, Sparkles, RefreshCw,
} from "lucide-react"
import { toast } from "sonner"
import type {
  EstimateSection, EstimateRow, EstimateProjectInfo, EstimateColumnKey, Estimate,
} from "@/types/estimate"
import type { Project, ProjectType } from "@/types/project"

// ── Column header config ──
const COL_HEADERS: Record<EstimateColumnKey, { label: string; numeric: boolean }> = {
  item: { label: "Item / Description", numeric: false },
  vendor: { label: "Vendor", numeric: false },
  qty: { label: "Qty", numeric: true },
  unitCost: { label: "Unit Cost", numeric: true },
  extended: { label: "Extended", numeric: true },
  amount: { label: "Amount", numeric: true },
}

const PROJECT_TYPES_LIST: ProjectType[] = ["NS", "ER", "WIW", "FC", "MC", "F&D"]

function fmtCurrency(n: number) {
  return "$" + (n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ══════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════
export default function EstimatorPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const comparisonFileRef = useRef<HTMLInputElement>(null)
  const projectIdParam = searchParams.get("projectId") || ""
  const estimateIdParam = searchParams.get("estimateId") || ""

  const [sections, setSections] = useState<EstimateSection[]>(() => {
    return createDefaultSections()
  })
  const [sectionIdCounter, setSectionIdCounter] = useState(3)
  const [projectInfo, setProjectInfo] = useState<EstimateProjectInfo>({
    store: "", name: "", pm: user?.displayName || "", date: new Date().toISOString().split("T")[0],
    projectType: "", fundingSource: "", oracle: "", parent: "", budget: "",
  })
  const [currentEstimateId, setCurrentEstimateId] = useState<string | null>(null)

  // Dialogs
  const [customDialogOpen, setCustomDialogOpen] = useState(false)
  const [customSectionName, setCustomSectionName] = useState("")
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)
  const [savedEstimates, setSavedEstimates] = useState<Estimate[]>([])
  const [loadingEstimates, setLoadingEstimates] = useState(false)
  const [saving, setSaving] = useState(false)
  const [aiEstimating, setAiEstimating] = useState(false)
  const [loadingComparables, setLoadingComparables] = useState(false)
  const [uploadingComparison, setUploadingComparison] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [manualComparableProjectId, setManualComparableProjectId] = useState("")
  const [comparisonLocked, setComparisonLocked] = useState(false)
  const [comparisonLockedAt, setComparisonLockedAt] = useState<string | null>(null)
  const [historicalCandidates, setHistoricalCandidates] = useState<Array<{
    id: string
    source: "estimates" | "costReviews" | "comparisonSnapshots" | "estimateComparisonForms" | "manual-project"
    label: string
    projectType: string
    total: number
    similarityScore: number
    notes?: string
  }>>([])
  const [selectedComparableIds, setSelectedComparableIds] = useState<string[]>([])
  const [aiEstimate, setAiEstimate] = useState<{
    suggestedTotal: number
    lowRange: number
    highRange: number
    confidence: "low" | "medium" | "high"
    rationale: string
    assumptions: string[]
    risks: string[]
    sectionAdjustments: Array<{ sectionName: string; suggestedTotal: number; note: string }>
  } | null>(null)

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToProjects(
      user,
      (data) => setProjects(data),
      () => setProjects([]),
    )
    return () => unsub()
  }, [user])

  useEffect(() => {
    if (!projectIdParam || projects.length === 0) return
    const linked = projects.find((p) => p.id === projectIdParam)
    if (!linked) return

    setProjectInfo((prev) => ({
      ...prev,
      store: prev.store || linked.storeNumber,
      name: prev.name || linked.storeName,
      projectType: (prev.projectType || linked.projectType) as EstimateProjectInfo["projectType"],
      budget: prev.budget || String(linked.totalBudget || ""),
    }))
  }, [projectIdParam, projects])

  useEffect(() => {
    if (!estimateIdParam) return
    let cancelled = false

    async function loadFromQueryEstimate() {
      try {
        const est = await getEstimate(estimateIdParam)
        if (!est || cancelled) return
        setProjectInfo(est.projectInfo)
        setSections(est.sections)
        setCurrentEstimateId(est.id)
        setSectionIdCounter(est.sections.length + 10)
      } catch {
        if (!cancelled) toast.error("Failed to load estimate from link")
      }
    }

    loadFromQueryEstimate()
    return () => {
      cancelled = true
    }
  }, [estimateIdParam])

  // ── Section CRUD ──
  function addPresetSection(key: string) {
    const preset = PRESET_MAP[key]
    if (!preset) return
    addSection(preset.name, preset.columns, preset.defaults, preset.contingency, preset.contPct)
  }

  function addSection(
    name: string, columns: EstimateColumnKey[],
    defaultRows: Partial<EstimateRow>[], hasContingency: boolean, contPct: number,
  ) {
    const nextId = sectionIdCounter + 1
    setSectionIdCounter(nextId)
    const id = "sec-" + nextId
    const rows = (defaultRows || []).map((r, i) => ({
      _id: id + "-r" + i, item: "", vendor: "", qty: "", unitCost: "", extended: 0, amount: "", ...r,
    }))
    setSections((prev) => [...prev, {
      id, name, columns, rows, hasContingency, contPct, collapsed: false, rowCounter: rows.length,
    }])
  }

  function removeSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id))
  }

  function toggleSection(id: string) {
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, collapsed: !s.collapsed } : s))
  }

  // ── Row CRUD ──
  function addRow(secId: string) {
    setSections((prev) => prev.map((s) => {
      if (s.id !== secId) return s
      const rc = s.rowCounter + 1
      const rid = secId + "-r" + rc
      const row: EstimateRow = { _id: rid, item: "", vendor: "", qty: "", unitCost: "", extended: 0, amount: "" }
      return { ...s, rowCounter: rc, rows: [...s.rows, row] }
    }))
  }

  function removeRow(secId: string, rowId: string) {
    setSections((prev) => prev.map((s) =>
      s.id === secId ? { ...s, rows: s.rows.filter((r) => r._id !== rowId) } : s
    ))
  }

  function updateRow(secId: string, rowId: string, col: string, value: string) {
    setSections((prev) => prev.map((s) => {
      if (s.id !== secId) return s
      const rows = s.rows.map((r) => {
        if (r._id !== rowId) return r
        const updated = { ...r, [col]: value }
        if (s.columns.includes("extended") && (col === "qty" || col === "unitCost")) {
          updated.extended = (parseFloat(updated.qty) || 0) * (parseFloat(updated.unitCost) || 0)
        }
        return updated
      })
      return { ...s, rows }
    }))
  }

  function updateContPct(secId: string, val: string) {
    setSections((prev) => prev.map((s) =>
      s.id === secId ? { ...s, contPct: parseFloat(val) || 0 } : s
    ))
  }

  // ── Calculations ──
  function getSectionTotal(sec: EstimateSection) {
    return sec.rows.reduce((sum, r) => {
      if (sec.columns.includes("extended")) return sum + (r.extended || 0)
      if (sec.columns.includes("amount")) return sum + (parseFloat(r.amount) || 0)
      return sum
    }, 0)
  }

  function getSectionTotalWithCont(sec: EstimateSection) {
    const base = getSectionTotal(sec)
    return sec.hasContingency ? base + base * (sec.contPct / 100) : base
  }

  const grandTotal = sections.reduce((sum, s) => sum + getSectionTotalWithCont(s), 0)

  // ── Project Info ──
  function updateInfo(field: keyof EstimateProjectInfo, value: string) {
    setProjectInfo((prev) => ({ ...prev, [field]: value }))
  }

  // ── Save / Load / Clear ──
  async function handleSave() {
    if (!user) { toast.error("Not authenticated"); return }
    setSaving(true)
    try {
      const selectedComparables = historicalCandidates
        .filter((c) => selectedComparableIds.includes(`${c.source}:${c.id}`))
        .slice(0, 3)

      const id = await saveEstimate({
        id: currentEstimateId || undefined,
        userId: user.uid,
        projectId: projectIdParam || null,
        projectInfo,
        sections,
        comparisonContext: {
          locked: comparisonLocked,
          lockedAt: comparisonLocked ? (comparisonLockedAt || new Date().toISOString()) : null,
          selectedComparableIds,
          selectedComparables,
        },
      })
      setCurrentEstimateId(id)
      toast.success(`Saved: ${projectInfo.store || "Draft"} \u2014 ${projectInfo.name || "Untitled"}`)
    } catch (e) {
      toast.error("Failed to save: " + (e instanceof Error ? e.message : "Unknown error"))
    } finally {
      setSaving(false)
    }
  }

  async function handleLoadDialog() {
    if (!user) return
    setLoadingEstimates(true)
    setLoadDialogOpen(true)
    try {
      const list = await listEstimatesForUser(user.uid)
      setSavedEstimates(list)
    } catch {
      toast.error("Failed to load estimates")
    } finally {
      setLoadingEstimates(false)
    }
  }

  function handleLoadEstimate(est: Estimate) {
    setProjectInfo(est.projectInfo)
    setSections(est.sections)
    setCurrentEstimateId(est.id)
    setSectionIdCounter(est.sections.length + 10)
    const ctx = est.comparisonContext
    if (ctx) {
      setComparisonLocked(Boolean(ctx.locked))
      setComparisonLockedAt(ctx.lockedAt || null)
      setSelectedComparableIds(Array.isArray(ctx.selectedComparableIds) ? ctx.selectedComparableIds : [])

      if (Array.isArray(ctx.selectedComparables) && ctx.selectedComparables.length > 0) {
        setHistoricalCandidates((prev) => {
          const merged = [...prev]
          ctx.selectedComparables.forEach((c) => {
            const exists = merged.some((x) => `${x.source}:${x.id}` === `${c.source}:${c.id}`)
            if (!exists) merged.push(c)
          })
          return merged
        })
      }
    } else {
      setComparisonLocked(false)
      setComparisonLockedAt(null)
      setSelectedComparableIds([])
    }
    setLoadDialogOpen(false)
    toast.success(`Loaded: ${est.projectInfo.store || "Draft"}`)
  }

  async function handleDeleteEstimate(id: string) {
    try {
      await deleteEstimate(id)
      setSavedEstimates((prev) => prev.filter((e) => e.id !== id))
      if (currentEstimateId === id) setCurrentEstimateId(null)
      toast.success("Estimate deleted")
    } catch {
      toast.error("Failed to delete")
    }
  }

  function handleClear() {
    if (!confirm("Clear all sections and start fresh?")) return
    setSections(createDefaultSections())
    setProjectInfo({
      store: "", name: "", pm: user?.displayName || "",
      date: new Date().toISOString().split("T")[0],
      projectType: "", fundingSource: "", oracle: "", parent: "", budget: "",
    })
    setCurrentEstimateId(null)
    setSectionIdCounter(3)
    setComparisonLocked(false)
    setComparisonLockedAt(null)
    setSelectedComparableIds([])
    setAiEstimate(null)
  }

  // ── Import CSV/XLSX ──
  async function handleImport(secId: string, file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase()
    if (ext === "csv") {
      const text = await file.text()
      const rows = parseCSV(text)
      importRows(secId, rows)
    } else if (ext === "xlsx" || ext === "xls") {
      const XLSX = await import("xlsx")
      const data = new Uint8Array(await file.arrayBuffer())
      const wb = XLSX.read(data, { type: "array" })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown as unknown[][]
      const rows = parseSheetArray(json)
      importRows(secId, rows)
    } else {
      toast.error("Unsupported file type. Use .csv or .xlsx")
    }
  }

  function importRows(secId: string, importedRows: Record<string, string>[]) {
    if (!importedRows.length) { toast.error("No data found in file"); return }

    setSections((prev) => prev.map((s) => {
      if (s.id !== secId) return s
      let rc = s.rowCounter
      const newRows = importedRows.map((ir) => {
        rc++
        const rid = secId + "-r" + rc
        let item = ir["item name"] || ir["item"] || ir["description"] || ir["name"] || ""
        const legend = ir["legend"] || ir["legend #"] || ""
        if (legend && item) item = legend + " \u2014 " + item
        else if (legend) item = legend

        let vendor = ir["supplier"] || ir["vendor"] || ""
        if (vendor.includes("|")) vendor = vendor.split("|")[0].trim()

        const qtyRaw = ir["amount"] || ir["qty"] || ir["quantity"] || ""
        const row: EstimateRow = { _id: rid, item, vendor, qty: "", unitCost: "", extended: 0, amount: "" }

        if (s.columns.includes("qty")) {
          row.qty = String(parseFloat(qtyRaw) || "")
          row.unitCost = ir["unit cost"] || ir["unit price"] || ir["price"] || ""
          if (row.qty && row.unitCost) {
            row.extended = (parseFloat(row.qty) || 0) * (parseFloat(row.unitCost) || 0)
          }
        }
        return row
      })
      return { ...s, rowCounter: rc, rows: [...s.rows, ...newRows] }
    }))
    toast.success(`Imported ${importedRows.length} items`)
  }

  // ── Export XLSX ──
  async function handleExport() {
    const ExcelJS = await import("exceljs")
    const wb = new ExcelJS.Workbook()
    wb.creator = projectInfo.pm || "FaciliOne"
    wb.created = new Date()

    // Colors
    const C = {
      navy: "1E293B", white: "FFFFFF", gray100: "F8FAFC", gray300: "CBD5E1",
      gray500: "64748B", gray700: "334155", gray900: "0F172A",
      blue: "2563B3", blueLight: "DBEAFE", green: "059669", orange: "D97706", orangeLight: "FEF3C7",
    }
    const thinBorder = (c = C.gray300) => ({ style: "thin" as const, color: { argb: c } })
    const borders = { top: thinBorder(), left: thinBorder(), bottom: thinBorder(), right: thinBorder() }
    const dollarFmt = '"$"#,##0.00'

    // Summary sheet
    const ws = wb.addWorksheet("Summary", {
      properties: { tabColor: { argb: C.navy } },
      pageSetup: { orientation: "portrait", fitToPage: true, fitToWidth: 1 },
    })
    ws.columns = [{ width: 32 }, { width: 18 }, { width: 16 }, { width: 16 }, { width: 28 }]

    // Title
    ws.mergeCells("A1:E1")
    const tc = ws.getCell("A1")
    tc.value = "PROJECT ESTIMATE"
    tc.font = { name: "Calibri", size: 16, bold: true, color: { argb: C.navy } }
    ws.getRow(1).height = 32

    ws.mergeCells("A2:E2")
    ws.getCell("A2").value = `Generated by FaciliOne \u00b7 ${projectInfo.date || new Date().toISOString().split("T")[0]}`
    ws.getCell("A2").font = { name: "Calibri", size: 11, color: { argb: C.gray500 } }

    // Project info
    const infoRows = [
      ["Store #", projectInfo.store, "", "Project Name", projectInfo.name],
      ["Project Manager", projectInfo.pm, "", "Date", projectInfo.date],
      ["Project Type", projectInfo.projectType, "", "Oracle Project #", projectInfo.oracle],
      ["Oracle Parent", projectInfo.parent, "", "Estimated Budget", projectInfo.budget],
    ]
    let r = 4
    for (const row of infoRows) {
      for (const ci of [1, 2, 4, 5]) {
        const c = ws.getCell(r, ci)
        c.value = row[ci - 1]
        c.font = { name: "Calibri", size: ci % 2 !== 0 ? 10 : 11, bold: ci % 2 !== 0, color: { argb: ci % 2 !== 0 ? C.gray500 : C.gray900 } }
        c.border = borders
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ci % 2 !== 0 ? C.gray100 : C.white } }
      }
      ws.getCell(r, 3).border = borders
      r++
    }
    r += 1

    // Summary header
    ws.mergeCells(`A${r}:D${r}`)
    ws.getCell(r, 1).value = "ESTIMATE SUMMARY"
    ws.getCell(r, 1).font = { name: "Calibri", size: 13, bold: true, color: { argb: C.navy } }
    r++

    const sumHdr = ["Section", "Subtotal", "Contingency", "Total"]
    sumHdr.forEach((h, i) => {
      const c = ws.getCell(r, i + 1)
      c.value = h
      c.font = { name: "Calibri", size: 10, bold: true, color: { argb: C.white } }
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.navy } }
      c.alignment = { horizontal: i > 0 ? "right" : "left", vertical: "middle" }
      c.border = borders
    })
    r++

    let grand = 0
    sections.forEach((sec, idx) => {
      const base = getSectionTotal(sec)
      const cont = sec.hasContingency ? base * (sec.contPct / 100) : 0
      const total = base + cont
      grand += total
      const rowFill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: idx % 2 === 0 ? C.white : C.gray100 } }
      ws.getCell(r, 1).value = sec.name
      ws.getCell(r, 2).value = base; ws.getCell(r, 2).numFmt = dollarFmt
      ws.getCell(r, 3).value = cont; ws.getCell(r, 3).numFmt = dollarFmt
      ws.getCell(r, 4).value = total; ws.getCell(r, 4).numFmt = dollarFmt
      for (let c = 1; c <= 4; c++) {
        ws.getCell(r, c).border = borders
        ws.getCell(r, c).fill = rowFill
        ws.getCell(r, c).font = { name: "Calibri", size: c === 4 ? 11 : 10, bold: c === 4, color: { argb: C.gray900 } }
        if (c > 1) ws.getCell(r, c).alignment = { horizontal: "right" }
      }
      r++
    })

    // Grand total
    r++
    ws.mergeCells(`A${r}:C${r}`)
    ws.getCell(r, 1).value = "TOTAL ESTIMATED PROJECT COST"
    ws.getCell(r, 1).font = { name: "Calibri", size: 13, bold: true, color: { argb: C.white } }
    ws.getCell(r, 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.navy } }
    ws.getCell(r, 1).alignment = { horizontal: "right", vertical: "middle" }
    for (let c = 1; c <= 4; c++) {
      ws.getCell(r, c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.navy } }
      ws.getCell(r, c).border = borders
    }
    ws.getCell(r, 4).value = grand
    ws.getCell(r, 4).font = { name: "Calibri", size: 16, bold: true, color: { argb: C.white } }
    ws.getCell(r, 4).numFmt = dollarFmt
    ws.getCell(r, 4).alignment = { horizontal: "right", vertical: "middle" }
    ws.getRow(r).height = 30

    // Detail sheets per section
    for (const sec of sections) {
      const sheetName = sec.name.substring(0, 31).replace(/[\\/?*[\]:]/g, "")
      const ds = wb.addWorksheet(sheetName, {
        properties: { tabColor: { argb: C.blue } },
        pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1 },
      })
      const cols = sec.columns
      ds.columns = cols.map((c) => ({
        width: c === "item" ? 42 : c === "vendor" ? 24 : c === "qty" ? 10 : 15,
      }))

      let dr = 1
      ds.mergeCells(dr, 1, dr, cols.length)
      ds.getCell(dr, 1).value = sec.name.toUpperCase()
      ds.getCell(dr, 1).font = { name: "Calibri", size: 12, bold: true, color: { argb: C.white } }
      for (let c = 1; c <= cols.length; c++) {
        ds.getCell(dr, c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.navy } }
      }
      ds.getRow(dr).height = 26
      dr++

      cols.forEach((c, i) => {
        const cell = ds.getCell(dr, i + 1)
        cell.value = COL_HEADERS[c].label
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: C.white } }
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.gray700 } }
        cell.border = borders
      })
      dr++

      sec.rows.forEach((row, idx) => {
        const rowFill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: idx % 2 === 0 ? C.white : C.gray100 } }
        cols.forEach((c, ci) => {
          const cell = ds.getCell(dr, ci + 1)
          if (c === "extended") cell.value = (parseFloat(row.qty) || 0) * (parseFloat(row.unitCost) || 0)
          else if (c === "qty") cell.value = parseFloat(row[c]) || 0
          else if (c === "unitCost" || c === "amount") cell.value = parseFloat(row[c]) || 0
          else cell.value = row[c] || ""
          cell.border = borders
          cell.fill = rowFill
          cell.font = { name: "Calibri", size: 10, color: { argb: C.gray900 } }
          if (c === "unitCost" || c === "extended" || c === "amount") cell.numFmt = dollarFmt
        })
        dr++
      })

      dr++
      ds.mergeCells(dr, 1, dr, cols.length - 1)
      ds.getCell(dr, 1).value = "SUBTOTAL"
      ds.getCell(dr, 1).font = { name: "Calibri", size: 10, bold: true, color: { argb: C.gray700 } }
      ds.getCell(dr, 1).alignment = { horizontal: "right" }
      for (let c = 1; c <= cols.length; c++) {
        ds.getCell(dr, c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.blueLight } }
        ds.getCell(dr, c).border = borders
      }
      ds.getCell(dr, cols.length).value = getSectionTotal(sec)
      ds.getCell(dr, cols.length).numFmt = dollarFmt
      ds.getCell(dr, cols.length).font = { name: "Calibri", size: 11, bold: true, color: { argb: C.navy } }
    }

    // Download
    const filename = `Estimate_${projectInfo.store || "Draft"}_${projectInfo.date || new Date().toISOString().split("T")[0]}.xlsx`
    const buffer = await wb.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
    toast.success("Exported: " + filename)
  }

  async function handleGenerateAiEstimate() {
    if (sections.length === 0) {
      toast.error("Add at least one section before running AI estimate")
      return
    }

    setAiEstimating(true)
    try {
      const payload = {
        projectInfo: {
          store: projectInfo.store,
          name: projectInfo.name,
          projectType: projectInfo.projectType,
          fundingSource: projectInfo.fundingSource,
          budget: projectInfo.budget,
          oracle: projectInfo.oracle,
          parent: projectInfo.parent,
        },
        totals: {
          grandTotal,
        },
        sections: sections.map((sec) => {
          const topItems = sec.rows
            .map((r) => {
              const value = sec.columns.includes("extended")
                ? (r.extended || 0)
                : (parseFloat(r.amount) || 0)
              return {
                item: r.item,
                vendor: r.vendor,
                value,
              }
            })
            .filter((r) => r.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)

          return {
            name: sec.name,
            subtotal: getSectionTotal(sec),
            totalWithContingency: getSectionTotalWithCont(sec),
            contingencyPct: sec.hasContingency ? sec.contPct : 0,
            rowCount: sec.rows.length,
            topItems,
          }
        }),
        comparables: historicalCandidates
          .filter((c) => selectedComparableIds.includes(`${c.source}:${c.id}`))
          .slice(0, 3),
      }

      const res = await fetch("/api/ai/cost-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || "Failed to generate AI estimate")
      }

      setAiEstimate(data.estimate || null)
      toast.success("AI estimate generated")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate AI estimate"
      toast.error(message)
    } finally {
      setAiEstimating(false)
    }
  }

  async function handleLoadComparables() {
    setLoadingComparables(true)
    try {
      const res = await fetch("/api/ai/historical-comparisons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectType: projectInfo.projectType,
          sectionNames: sections.map((s) => s.name),
          budget: projectInfo.budget || grandTotal,
          limit: 20,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "Failed to load historical comparisons")
      }
      const list: Array<{
        id: string
        source: "estimates" | "costReviews" | "comparisonSnapshots" | "estimateComparisonForms"
        label: string
        projectType: string
        total: number
        similarityScore: number
        notes?: string
      }> = Array.isArray(data.candidates) ? data.candidates : []
      setHistoricalCandidates(list)

      // Auto-select top 3 on first load for easy 3-project method usage.
      setSelectedComparableIds((prev) => {
        if (prev.length > 0) return prev
        return list.slice(0, 3).map((c) => `${c.source}:${c.id}`)
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load historical comparisons"
      toast.error(message)
    } finally {
      setLoadingComparables(false)
    }
  }

  function toggleComparable(id: string) {
    if (comparisonLocked) {
      toast.error("Comparison set is locked. Unlock to edit.")
      return
    }
    setSelectedComparableIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 3) {
        toast.error("Select up to 3 comparison projects")
        return prev
      }
      return [...prev, id]
    })
  }

  function addManualProjectComparable() {
    if (!manualComparableProjectId) {
      toast.error("Select a project to add")
      return
    }
    if (comparisonLocked) {
      toast.error("Comparison set is locked. Unlock to edit.")
      return
    }

    const project = projects.find((p) => p.id === manualComparableProjectId)
    if (!project) {
      toast.error("Selected project not found")
      return
    }

    const manual = {
      id: project.id,
      source: "manual-project" as const,
      label: `${project.storeNumber} - ${project.storeName}`,
      projectType: project.projectType,
      total: Number(project.totalBudget || 0),
      similarityScore: project.projectType === projectInfo.projectType ? 0.8 : 0.45,
      notes: "Manually selected project",
    }

    setHistoricalCandidates((prev) => {
      const exists = prev.some((x) => `${x.source}:${x.id}` === `manual-project:${project.id}`)
      if (exists) return prev
      return [manual, ...prev]
    })

    setSelectedComparableIds((prev) => {
      const manualId = `manual-project:${project.id}`
      if (prev.includes(manualId)) return prev
      if (prev.length >= 3) {
        toast.error("Already selected 3 comparison projects")
        return prev
      }
      return [...prev, manualId]
    })
  }

  function toggleComparisonLock() {
    setComparisonLocked((prev) => {
      const next = !prev
      if (next) setComparisonLockedAt(new Date().toISOString())
      else setComparisonLockedAt(null)
      return next
    })
  }

  async function handleUploadComparisonWorkbook(file: File) {
    setUploadingComparison(true)
    try {
      const form = new FormData()
      form.append("file", file)

      const res = await fetch("/api/admin/ai/estimate-comparison-forms/import", {
        method: "POST",
        body: form,
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "Failed to upload comparison workbook")
      }

      toast.success("Estimate comparison form uploaded")
      await handleLoadComparables()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload comparison workbook"
      toast.error(message)
    } finally {
      setUploadingComparison(false)
    }
  }

  // ── Custom Section Dialog ──
  function confirmCustomSection() {
    const name = customSectionName.trim()
    if (!name) return
    addSection(name, ["item", "vendor", "qty", "unitCost", "extended"], [{ item: "", vendor: "", qty: "", unitCost: "" } as Partial<EstimateRow>], false, 0)
    setCustomSectionName("")
    setCustomDialogOpen(false)
  }

  // ══════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-background shrink-0">
        <span className="text-sm font-bold text-primary uppercase tracking-wider">Project Estimate</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleGenerateAiEstimate} disabled={aiEstimating}>
            {aiEstimating ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
            AI Estimate
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={handleLoadDialog}>
            <FolderOpen className="size-3.5" /> Load
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear}>
            <Trash2 className="size-3.5" /> Clear
          </Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleExport}>
            <FileDown className="size-3.5" /> Export XLSX
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-300 mx-auto space-y-4">

          {/* Project Info Card */}
          <Card className="p-5">
            <h2 className="text-lg font-bold mb-4">Project Estimate</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Field label="Store #" value={projectInfo.store} onChange={(v) => updateInfo("store", v)} placeholder="e.g. KS-118" />
              <Field label="Project Name" value={projectInfo.name} onChange={(v) => updateInfo("name", v)} placeholder="e.g. Front End Transformation" />
              <Field label="Project Manager" value={projectInfo.pm} onChange={(v) => updateInfo("pm", v)} />
              <Field label="Date" value={projectInfo.date} onChange={(v) => updateInfo("date", v)} type="date" />
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Project Type</label>
                <Select value={projectInfo.projectType} onValueChange={(v) => updateInfo("projectType", v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select type..." /></SelectTrigger>
                  <SelectContent>
                    {PROJECT_TYPES_LIST.map((t) => (
                      <SelectItem key={t} value={t}>{t} \u2014 {PROJECT_TYPE_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Funding Source</label>
                <Select value={projectInfo.fundingSource} onValueChange={(v) => updateInfo("fundingSource", v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select source..." /></SelectTrigger>
                  <SelectContent>
                    {FUNDING_SOURCES.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Field label="Oracle Project #" value={projectInfo.oracle} onChange={(v) => updateInfo("oracle", v)} placeholder="e.g. 620-00XXX-XX" />
              <Field label="Estimated Budget" value={projectInfo.budget} onChange={(v) => updateInfo("budget", v)} placeholder="e.g. $350,000" />
            </div>
          </Card>

          {/* Sections */}
          {sections.map((sec) => (
            <SectionCard
              key={sec.id}
              section={sec}
              onToggle={() => toggleSection(sec.id)}
              onRemoveSection={() => removeSection(sec.id)}
              onAddRow={() => addRow(sec.id)}
              onRemoveRow={(rid) => removeRow(sec.id, rid)}
              onUpdateRow={(rid, col, val) => updateRow(sec.id, rid, col, val)}
              onUpdateContPct={(val) => updateContPct(sec.id, val)}
              onImport={(file) => handleImport(sec.id, file)}
              getSectionTotal={() => getSectionTotal(sec)}
              getSectionTotalWithCont={() => getSectionTotalWithCont(sec)}
            />
          ))}

          {/* Add Section Area */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Add Section:</span>
            {PRESET_SECTIONS.map((p) => (
              <Button key={p.key} variant="outline" size="sm" className="text-xs" onClick={() => addPresetSection(p.key)}>
                {p.name}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="text-xs border-dashed" onClick={() => setCustomDialogOpen(true)}>
              <Plus className="size-3" /> Custom
            </Button>
          </div>

          {/* Historical Comparables */}
          <Card className="p-4 border-amber-200 bg-amber-50/30">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-semibold">Historical Comparison Projects</h3>
                <p className="text-xs text-muted-foreground">Use up to 3 similar projects as references for AI estimate generation.</p>
                {comparisonLocked && (
                  <p className="text-[11px] text-amber-700 mt-1">
                    Comparison set locked {comparisonLockedAt ? `at ${new Date(comparisonLockedAt).toLocaleString()}` : ""}.
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={comparisonFileRef}
                  type="file"
                  accept=".xlsx,.xlsm,.xls"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUploadComparisonWorkbook(file)
                    e.currentTarget.value = ""
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => comparisonFileRef.current?.click()}
                  disabled={uploadingComparison || comparisonLocked}
                >
                  {uploadingComparison ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                  Upload Estimate Comparison Form
                </Button>
                <Button variant="outline" size="sm" onClick={handleLoadComparables} disabled={loadingComparables}>
                  {loadingComparables ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
                  Find Similar Projects
                </Button>
                <Button variant={comparisonLocked ? "default" : "outline"} size="sm" onClick={toggleComparisonLock}>
                  {comparisonLocked ? "Unlock 3-Project Set" : "Lock 3-Project Set"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 mb-3">
              <Select value={manualComparableProjectId} onValueChange={setManualComparableProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Manually add known project from project list..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.storeNumber} - {p.storeName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={addManualProjectComparable} disabled={comparisonLocked || !manualComparableProjectId}>
                Add Selected Project
              </Button>
            </div>

            {historicalCandidates.length === 0 ? (
              <p className="text-xs text-muted-foreground border rounded-md p-3 bg-background">
                No comparison candidates loaded yet. Click &quot;Find Similar Projects&quot; to fetch estimates, cost reviews, and snapshots.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {historicalCandidates.map((c) => {
                  const selectableId = `${c.source}:${c.id}`
                  const checked = selectedComparableIds.includes(selectableId)
                  return (
                    <label key={`${c.source}:${c.id}`} className={cn(
                      "flex items-start gap-2 rounded-md border p-2 text-xs cursor-pointer",
                      checked ? "border-primary bg-primary/5" : "bg-background",
                    )}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleComparable(selectableId)}
                        className="mt-0.5"
                        disabled={comparisonLocked}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{c.label}</p>
                        <p className="text-muted-foreground mt-0.5">
                          {c.source} • {c.projectType || "n/a"} • {fmtCurrency(c.total)} • score {(c.similarityScore * 100).toFixed(0)}%
                        </p>
                        {c.notes && <p className="text-muted-foreground mt-0.5 truncate">{c.notes}</p>}
                      </div>
                    </label>
                  )
                })}
              </div>
            )}

            <p className="text-[11px] text-muted-foreground mt-2">
              Selected {selectedComparableIds.length}/3 comparison projects. Save estimate to retain this comparison set.
            </p>
          </Card>

          {/* Summary Card */}
          {aiEstimate && (
            <Card className="p-5 border-blue-200 bg-blue-50/40">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <Sparkles className="size-4 text-blue-600" /> AI Cost Estimate
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Model-generated recommendation from your current worksheet inputs.</p>
                </div>
                <span className={cn(
                  "text-[10px] uppercase font-bold px-2 py-1 rounded border",
                  aiEstimate.confidence === "high" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                  aiEstimate.confidence === "medium" ? "bg-amber-100 text-amber-700 border-amber-200" :
                  "bg-red-100 text-red-700 border-red-200",
                )}>
                  {aiEstimate.confidence} confidence
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="rounded-md border bg-background p-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Suggested Total</p>
                  <p className="font-mono text-lg font-bold text-primary">{fmtCurrency(aiEstimate.suggestedTotal)}</p>
                </div>
                <div className="rounded-md border bg-background p-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Low Range</p>
                  <p className="font-mono text-lg font-semibold">{fmtCurrency(aiEstimate.lowRange)}</p>
                </div>
                <div className="rounded-md border bg-background p-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">High Range</p>
                  <p className="font-mono text-lg font-semibold">{fmtCurrency(aiEstimate.highRange)}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Rationale</p>
                  <p>{aiEstimate.rationale || "No rationale provided."}</p>
                </div>

                {aiEstimate.assumptions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Assumptions</p>
                    <ul className="list-disc pl-5 space-y-0.5">
                      {aiEstimate.assumptions.map((a, i) => <li key={`${a}-${i}`}>{a}</li>)}
                    </ul>
                  </div>
                )}

                {aiEstimate.risks.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Risks</p>
                    <ul className="list-disc pl-5 space-y-0.5">
                      {aiEstimate.risks.map((r, i) => <li key={`${r}-${i}`}>{r}</li>)}
                    </ul>
                  </div>
                )}

                {aiEstimate.sectionAdjustments.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Section Adjustments</p>
                    <div className="space-y-1.5">
                      {aiEstimate.sectionAdjustments.map((s, i) => (
                        <div key={`${s.sectionName}-${i}`} className="rounded-md border bg-background p-2 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium">{s.sectionName}</span>
                            <span className="font-mono">{fmtCurrency(s.suggestedTotal)}</span>
                          </div>
                          {s.note && <p className="text-muted-foreground mt-1">{s.note}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          <div className="rounded-xl bg-linear-to-br from-slate-800 to-slate-700 p-6 text-white shadow-lg">
            <h2 className="text-lg font-bold mb-4 opacity-90">Estimate Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {sections.map((sec) => (
                <div key={sec.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="text-[10px] uppercase tracking-wide opacity-50 mb-1">{sec.name}</div>
                  <div className="font-mono text-lg font-semibold text-blue-300">{fmtCurrency(getSectionTotalWithCont(sec))}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-4 flex items-center justify-between">
              <span className="text-base font-semibold opacity-80">Total Estimated Project Cost</span>
              <span className="font-mono text-3xl font-bold">{fmtCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Section Dialog */}
      <Dialog open={customDialogOpen} onOpenChange={setCustomDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Custom Section</DialogTitle></DialogHeader>
          <Input
            placeholder="Section name (e.g. Flooring, HVAC, Signage...)"
            value={customSectionName}
            onChange={(e) => setCustomSectionName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && confirmCustomSection()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmCustomSection}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Dialog */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Load Saved Estimate</DialogTitle></DialogHeader>
          {loadingEstimates ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : savedEstimates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No saved estimates found.</p>
          ) : (
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {savedEstimates.map((est) => (
                <div
                  key={est.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleLoadEstimate(est)}
                >
                  <div>
                    <div className="font-semibold text-sm">
                      {est.projectInfo.store || "\u2014"} \u2014 {est.projectInfo.name || "Untitled"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {est.updatedAt ? new Date(est.updatedAt).toLocaleDateString() : "\u2014"} | {est.sections.length} sections
                    </div>
                  </div>
                  <Button
                    variant="ghost" size="icon-sm"
                    onClick={(e) => { e.stopPropagation(); handleDeleteEstimate(est.id) }}
                    className="text-muted-foreground hover:text-red-600"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ══════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════

function Field({ label, value, onChange, placeholder, type }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">{label}</label>
      <Input className="h-9 text-sm" type={type || "text"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

function SectionCard({ section: sec, onToggle, onRemoveSection, onAddRow, onRemoveRow, onUpdateRow, onUpdateContPct, onImport, getSectionTotal: getTotal, getSectionTotalWithCont: getTotalCont }: {
  section: EstimateSection
  onToggle: () => void
  onRemoveSection: () => void
  onAddRow: () => void
  onRemoveRow: (rid: string) => void
  onUpdateRow: (rid: string, col: string, val: string) => void
  onUpdateContPct: (val: string) => void
  onImport: (file: File) => void
  getSectionTotal: () => number
  getSectionTotalWithCont: () => number
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <Card className="overflow-hidden">
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-800 text-white"
      >
        <h3 className="text-xs font-bold uppercase tracking-wide flex items-center gap-2">
          <ChevronDown className={cn("size-3 transition-transform", sec.collapsed && "-rotate-90")} />
          {sec.name}
        </h3>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-semibold text-blue-300">{fmtCurrency(getTotalCont())}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onRemoveSection() }}
            className="size-6 flex items-center justify-center rounded text-white/40 hover:text-red-400 hover:bg-white/10 transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </button>

      {/* Section Body */}
      {!sec.collapsed && (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="w-9 px-2 py-2" />
                {sec.columns.map((c) => (
                  <th key={c} className={cn("px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground", COL_HEADERS[c].numeric && "text-right")}>
                    {COL_HEADERS[c].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sec.rows.map((row, ri) => (
                <tr key={row._id} className={cn("border-b hover:bg-primary/5 transition-colors", ri % 2 !== 0 && "bg-muted/20")}>
                  <td className="px-1">
                    <button onClick={() => onRemoveRow(row._id)} className="size-7 flex items-center justify-center text-muted-foreground/30 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                      <X className="size-3.5" />
                    </button>
                  </td>
                  {sec.columns.map((c) => (
                    <td key={c} className="px-1 py-0.5">
                      {c === "extended" ? (
                        <div className="text-right font-mono text-xs px-2 py-1.5 font-medium">{fmtCurrency(row.extended)}</div>
                      ) : (
                        <input
                          className={cn(
                            "w-full px-2 py-1.5 border border-transparent rounded text-sm bg-transparent hover:border-border focus:border-primary focus:outline-none transition-colors",
                            COL_HEADERS[c].numeric && "text-right font-mono text-xs",
                          )}
                          type={COL_HEADERS[c].numeric ? "number" : "text"}
                          step={COL_HEADERS[c].numeric ? "any" : undefined}
                          min={COL_HEADERS[c].numeric ? "0" : undefined}
                          value={row[c as keyof EstimateRow] ?? ""}
                          placeholder={c === "item" ? "Enter item..." : c === "vendor" ? "Vendor..." : ""}
                          onChange={(e) => onUpdateRow(row._id, c, e.target.value)}
                          onFocus={(e) => (e.target as HTMLInputElement).select()}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 bg-muted/50">
                <td />
                <td colSpan={sec.columns.length - 1} className="px-3 py-2 font-bold text-sm text-muted-foreground">
                  Section Subtotal
                </td>
                <td className="px-3 py-2 text-right font-mono text-sm font-bold text-primary">
                  {fmtCurrency(getTotal())}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Contingency */}
          {sec.hasContingency && (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/30 border-t text-sm">
              <span className="font-semibold text-muted-foreground">Change Order Contingency:</span>
              <input
                type="number" min="0" max="50" className="w-14 px-2 py-1 border rounded text-center font-mono text-xs bg-background"
                value={sec.contPct} onChange={(e) => onUpdateContPct(e.target.value)}
              />
              <span className="text-muted-foreground">%</span>
              <span className="ml-auto font-semibold text-muted-foreground">Contingency:</span>
              <span className="font-mono font-semibold text-amber-600">{fmtCurrency(getTotal() * (sec.contPct / 100))}</span>
            </div>
          )}

          {/* Add Row + Import */}
          <div className="flex gap-2 px-4 py-2.5 border-t">
            <Button variant="outline" size="sm" className="flex-1 text-xs border-dashed" onClick={onAddRow}>
              <Plus className="size-3" /> Add Row
            </Button>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onImport(f)
              e.target.value = ""
            }} />
            <Button variant="outline" size="sm" className="text-xs" onClick={() => fileRef.current?.click()}>
              <Upload className="size-3" /> Import CSV/XLSX
            </Button>
          </div>
        </>
      )}
    </Card>
  )
}

// ══════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════

function createDefaultSections(): EstimateSection[] {
  const defs = [PRESET_MAP["soft-costs"], PRESET_MAP["contractor"], PRESET_MAP["equipment-misc"]]
  return defs.filter(Boolean).map((preset, i) => {
    const id = "sec-" + (i + 1)
    const rows = (preset.defaults || []).map((r, j) => ({
      _id: id + "-r" + j, item: "", vendor: "", qty: "", unitCost: "", extended: 0, amount: "", ...r,
    }))
    return {
      id, name: preset.name, columns: preset.columns, rows,
      hasContingency: preset.contingency, contPct: preset.contPct,
      collapsed: false, rowCounter: rows.length,
    }
  })
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) return []
  const headers = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase())
  const result: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i])
    const obj: Record<string, string> = {}
    headers.forEach((h, idx) => { obj[h] = (vals[idx] || "").trim() })
    result.push(obj)
  }
  return result
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') inQuotes = !inQuotes
    else if (ch === "," && !inQuotes) { result.push(current); current = "" }
    else current += ch
  }
  result.push(current)
  return result
}

function parseSheetArray(json: unknown[][]): Record<string, string>[] {
  if (json.length < 2) return []
  const headers = (json[0] as unknown[]).map((h) => (h || "").toString().trim().toLowerCase())
  const result: Record<string, string>[] = []
  for (let i = 1; i < json.length; i++) {
    const row = json[i] as unknown[]
    if (!row || row.length === 0) continue
    const obj: Record<string, string> = {}
    headers.forEach((h, idx) => { obj[h] = row[idx] != null ? row[idx]!.toString().trim() : "" })
    result.push(obj)
  }
  return result
}
