"use client"

import { useState, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CalendarClock } from "lucide-react"
import { toast } from "sonner"
import { SF_SCHEDULE_TEMPLATES } from "@/constants/sf-schedule-data"
import {
  initScheduleState,
  recalcWeeksToOpen,
  recalcDayOffset,
  isDatePast,
  formatScheduleDate,
  type SfMilestoneState,
} from "@/lib/schedule/sf-schedule"
import {
  mapSiteFolioRowsToMilestones,
  parseSiteFolioScheduleHtml,
} from "@/lib/schedule/sitefolio-html-import"
import type { ProjectType } from "@/types/project"

interface SfScheduleProps {
  projectType: ProjectType
  grandOpeningDate: string | null
  /** Persisted milestone state from Firestore (if any) */
  savedState?: SfMilestoneState[] | null
  /** Called when milestone data changes — parent persists to Firestore */
  onUpdate?: (milestones: SfMilestoneState[], grandOpening: string) => void
}

export function SfSchedulePanel({
  projectType,
  grandOpeningDate: initialGO,
  savedState,
  onUpdate,
}: SfScheduleProps) {
  const template = SF_SCHEDULE_TEMPLATES[projectType]
  const isMC = template?.model === "day-offset"

  const [grandOpening, setGrandOpening] = useState(initialGO || "")
  const [importHtml, setImportHtml] = useState("")
  const [importSummary, setImportSummary] = useState<string>("")
  const [milestones, setMilestones] = useState<SfMilestoneState[]>(() => {
    if (savedState && savedState.length > 0) return savedState
    if (!template) return []
    return initScheduleState(template)
  })

  // Recalculate whenever GO date or milestones change
  const calculated = useMemo(() => {
    if (!template) return milestones
    if (isMC) {
      return recalcDayOffset(milestones, template)
    } else {
      return recalcWeeksToOpen(milestones, grandOpening || null)
    }
  }, [milestones, grandOpening, template, isMC])

  const scheduleSignals = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)

    const open = calculated
      .map((m) => {
        const effectiveDue = m.projectedAlt || m.projected || m.baseline || ""
        const isOverdue = Boolean(!m.actual && effectiveDue && effectiveDue < today)
        return {
          ...m,
          effectiveDue,
          isOverdue,
        }
      })
      .filter((m) => !m.actual)

    const overdue = open
      .filter((m) => m.isOverdue)
      .sort((a, b) => a.effectiveDue.localeCompare(b.effectiveDue))

    const upcoming = open
      .filter((m) => m.effectiveDue && m.effectiveDue >= today)
      .sort((a, b) => a.effectiveDue.localeCompare(b.effectiveDue))

    return {
      overdue,
      next: upcoming[0] || null,
      openCount: open.length,
    }
  }, [calculated])

  // Notify parent of changes
  useEffect(() => {
    if (onUpdate && (grandOpening || isMC)) {
      onUpdate(calculated, grandOpening)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculated, grandOpening])

  function updateMilestone(index: number, field: "projectedAlt" | "actual", value: string) {
    setMilestones((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)))
  }

  function handleGOChange(value: string) {
    setGrandOpening(value)
  }

  function handleImportHtmlApply() {
    if (!importHtml.trim()) {
      toast.error("Paste SiteFolio HTML content first.")
      return
    }

    try {
      const parsed = parseSiteFolioScheduleHtml(importHtml)
      if (parsed.rows.length === 0) {
        toast.error("No schedule milestone rows were found in the HTML.")
        return
      }

      const mapped = mapSiteFolioRowsToMilestones(milestones, parsed.rows)
      setMilestones(mapped.milestones)

      if (mapped.suggestedGrandOpening && !isMC) {
        setGrandOpening(mapped.suggestedGrandOpening)
      }

      const summary = [
        `Imported rows: ${parsed.rows.length}`,
        `Matched milestones: ${mapped.matched}/${milestones.length}`,
        mapped.unmatchedMilestones.length > 0
          ? `Unmatched milestones: ${mapped.unmatchedMilestones.length}`
          : "Unmatched milestones: 0",
        mapped.unmatchedRows.length > 0
          ? `Extra source rows: ${mapped.unmatchedRows.length}`
          : "Extra source rows: 0",
      ].join(" | ")

      setImportSummary(summary)
      toast.success("SiteFolio HTML schedule imported.")
    } catch (error) {
      console.error("Failed to import SiteFolio HTML:", error)
      toast.error(error instanceof Error ? error.message : "Failed to import SiteFolio HTML")
    }
  }

  async function handleImportHtmlFile(file: File) {
    try {
      const text = await file.text()
      setImportHtml(text)
      toast.success(`Loaded HTML file: ${file.name}`)
    } catch (error) {
      console.error("Failed to read HTML file:", error)
      toast.error("Failed to read HTML file")
    }
  }

  if (!template) {
    return (
      <Card className="p-6 text-center text-muted-foreground text-sm">
        No SiteFolio schedule template available for project type {projectType}.
      </Card>
    )
  }

  // Group by category for weeks-to-open display
  let lastCat = ""
  const columnCount = isMC ? 5 : 6

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <CalendarClock className="size-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wide">
            SiteFolio Schedule — Auto-Calculating
          </span>
        </div>
        <Badge variant="outline" className="font-mono text-[10px]">
          {isMC ? "Minor Capital" : projectType} Template
        </Badge>
      </div>

      {/* Grand Opening input (weeks-to-open model only) */}
      {!isMC && (
        <div className="flex items-center gap-3 px-4 py-3 border-b bg-muted/20">
          <label className="text-xs font-bold text-foreground whitespace-nowrap">Grand Opening Date:</label>
          <Input
            type="date"
            value={grandOpening}
            onChange={(e) => handleGOChange(e.target.value)}
            className="h-8 w-40 font-mono text-xs"
          />
          {grandOpening ? (
            <span className="text-xs text-muted-foreground">All baseline dates calculated from this date.</span>
          ) : (
            <span className="text-xs text-amber-600 font-semibold">Enter Grand Opening to auto-calculate all dates.</span>
          )}
        </div>
      )}

      {/* HTML import (for SiteFolio pages where export is unavailable) */}
      <div className="px-4 py-3 border-b bg-muted/10 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide">Import Current Schedule from SiteFolio HTML</p>
            <p className="text-[11px] text-muted-foreground">
              Paste full page HTML from SiteFolio Scheduling page or upload an .html file.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-2 text-xs border rounded-md px-2.5 py-1.5 cursor-pointer hover:bg-muted">
              Upload HTML
              <input
                type="file"
                accept=".html,.htm,text/html"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    void handleImportHtmlFile(file)
                    e.currentTarget.value = ""
                  }
                }}
              />
            </label>
            <button
              type="button"
              onClick={handleImportHtmlApply}
              className="text-xs font-medium bg-primary text-primary-foreground rounded-md px-3 py-1.5 hover:opacity-90"
            >
              Parse & Apply
            </button>
          </div>
        </div>

        <textarea
          value={importHtml}
          onChange={(e) => setImportHtml(e.target.value)}
          rows={5}
          placeholder="Paste SiteFolio schedule page HTML here..."
          className="w-full rounded-md border bg-background px-3 py-2 text-xs font-mono outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />

        {importSummary && (
          <p className="text-[11px] text-muted-foreground">{importSummary}</p>
        )}
      </div>

      {/* Schedule Table */}
      <div className="px-4 py-3 border-b bg-muted/10">
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <Badge variant="outline">Open milestones: {scheduleSignals.openCount}</Badge>
          {scheduleSignals.overdue.length > 0 ? (
            <Badge className="bg-red-100 text-red-700 border-red-200" variant="outline">
              Overdue without actual: {scheduleSignals.overdue.length}
            </Badge>
          ) : (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200" variant="outline">
              No overdue milestones
            </Badge>
          )}
          {scheduleSignals.next && (
            <Badge variant="outline">
              Next: {scheduleSignals.next.label} ({formatScheduleDate(scheduleSignals.next.effectiveDue)})
            </Badge>
          )}
        </div>
        {scheduleSignals.overdue.length > 0 && (
          <p className="text-[11px] text-muted-foreground mt-2">
            Action needed: add an Actual date or move Projected Alt. for overdue milestones to keep downstream dates accurate.
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col className="w-[36%]" />
            {!isMC && <col className="w-[14%]" />}
            <col className="w-[16%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[6%]" />
          </colgroup>
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Milestone
              </th>
              {!isMC && (
                <th className="text-center px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Baseline
                </th>
              )}
              <th className="text-center px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Projected (auto)
              </th>
              <th className="text-center px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Projected Alt.
              </th>
              <th className="text-center px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Actual
              </th>
              <th className="w-12 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {calculated.map((m, i) => {
              // Category header row for weeks-to-open model
              let catHeader = null
              if (!isMC && m.cat && m.cat !== lastCat) {
                lastCat = m.cat
                catHeader = (
                  <tr key={`cat-${m.cat}`}>
                    <td
                      colSpan={columnCount}
                      className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/50 border-b"
                    >
                      {m.cat}
                    </td>
                  </tr>
                )
              }

              const isPast = !m.actual && isDatePast(m.projected)
              const effectiveDue = m.projectedAlt || m.projected || m.baseline || ""
              const isEffectiveOverdue = !m.actual && Boolean(effectiveDue && isDatePast(effectiveDue))

              return (
                <>
                  {catHeader}
                  <tr key={m.key} className="border-b hover:bg-muted/20 transition-colors">
                    {/* Milestone label */}
                    <td className="px-4 py-2 align-top">
                      <div className="font-medium text-sm leading-5">{m.label}</div>
                      <span className="text-[10px] text-muted-foreground">
                        {isMC ? m.refLabel : `Wk ${m.wk} to open`}
                      </span>
                      {isEffectiveOverdue && (
                        <p className="text-[10px] text-red-600 mt-1">
                          Overdue target: {formatScheduleDate(effectiveDue)}
                        </p>
                      )}
                    </td>

                    {/* Baseline (weeks-to-open only) */}
                    {!isMC && (
                      <td className="text-center px-3 py-2 align-middle">
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {m.baseline ? formatScheduleDate(m.baseline) : "\u2014"}
                        </span>
                      </td>
                    )}

                    {/* Projected (auto) */}
                    <td className="text-center px-3 py-2 align-middle">
                      <span
                        className={cn(
                          "font-mono text-xs font-semibold inline-block min-w-25 px-2 py-1 rounded",
                          m.projected
                            ? m.actual
                              ? "text-foreground bg-muted"
                              : isPast
                                ? "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30"
                                : "text-primary bg-primary/10"
                            : "text-muted-foreground bg-muted/50",
                        )}
                      >
                        {m.projected ? formatScheduleDate(m.projected) : "awaiting input"}
                      </span>
                    </td>

                    {/* Projected Alt (user override) */}
                    <td className="text-center px-3 py-2 align-middle">
                      {isMC && m.noAlt ? (
                        <span className="text-[10px] text-muted-foreground italic">not configured</span>
                      ) : (
                        <Input
                          type="date"
                          value={m.projectedAlt}
                          onChange={(e) => updateMilestone(i, "projectedAlt", e.target.value)}
                          className="h-7 w-28 text-[11px] font-mono text-center mx-auto"
                        />
                      )}
                    </td>

                    {/* Actual */}
                    <td className="text-center px-3 py-2 align-middle">
                      <Input
                        type="date"
                        value={m.actual}
                        onChange={(e) => updateMilestone(i, "actual", e.target.value)}
                        className={cn(
                          "h-7 w-28 text-[11px] font-mono text-center mx-auto",
                          m.actual && "text-emerald-600 font-bold",
                        )}
                      />
                    </td>

                    {/* Status */}
                    <td className="px-2 py-2 text-center align-middle">
                      {m.actual ? (
                        <span className="text-[10px] font-bold text-emerald-600">DONE</span>
                      ) : isEffectiveOverdue ? (
                        <span className="text-[10px] font-bold text-red-600">LATE</span>
                      ) : (
                        <span className="text-[10px] font-bold text-muted-foreground">OPEN</span>
                      )}
                    </td>
                  </tr>
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <div className="px-4 py-2.5 text-[11px] text-muted-foreground bg-muted/20 border-t leading-relaxed">
        {isMC
          ? "Dates auto-calculate using the same formulas as SiteFolio. Enter an Actual date to lock a milestone. Enter a Projected Alt. to manually override. Projected = MAX(reference + offset, today)."
          : "Baseline dates are fixed from Grand Opening. Projected = MAX(baseline, today) unless overridden by Projected Alt. or Actual. Once Baseline is set, it should not be modified."}
      </div>
    </Card>
  )
}
