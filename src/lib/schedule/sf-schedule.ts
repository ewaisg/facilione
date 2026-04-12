/**
 * SiteFolio Schedule Auto-Calculation Engine
 *
 * Ported from FaciliTools tracker.html recalcSchedule() function.
 * Implements the same formulas used by SiteFolio schedule templates.
 *
 * Two models:
 *   1. weeks-to-open (NS, ER, WIW, FC):
 *      - baseline = GO date - (wk * 7 days)
 *      - projected = actual > projectedAlt > MAX(baseline, today)
 *
 *   2. day-offset (MC, F&D):
 *      - Forward cascade from Project Identified using day offsets
 *      - projected = actual > projectedAlt > MAX(ref + offset, today)
 */

import type {
  SfMilestoneWeeks,
  SfMilestoneDayOffset,
  SfScheduleTemplate,
} from "@/constants/sf-schedule-data"

/** Runtime state for a single milestone in a project's schedule */
export interface SfMilestoneState {
  key: string
  label: string
  /** Category grouping (weeks-to-open) or reference label (day-offset) */
  cat: string
  /** Weeks to open (weeks-to-open model only) */
  wk: number | null
  /** Reference label for day-offset model */
  refLabel: string | null
  /** Whether projectedAlt input is disabled (day-offset model, first row) */
  noAlt: boolean
  /** Calculated baseline date (weeks-to-open only) */
  baseline: string
  /** Auto-calculated projected date */
  projected: string
  /** User-entered override */
  projectedAlt: string
  /** User-entered actual completion date */
  actual: string
}

/**
 * Initialize schedule state from a template for a new project.
 */
export function initScheduleState(template: SfScheduleTemplate): SfMilestoneState[] {
  if (template.model === "weeks-to-open") {
    return (template.milestones as SfMilestoneWeeks[]).map((m) => ({
      key: m.key,
      label: m.label,
      cat: m.cat,
      wk: m.wk,
      refLabel: null,
      noAlt: false,
      baseline: "",
      projected: "",
      projectedAlt: "",
      actual: "",
    }))
  } else {
    return (template.milestones as SfMilestoneDayOffset[]).map((m) => ({
      key: m.key,
      label: m.label,
      cat: m.refLabel,
      wk: null,
      refLabel: m.refLabel,
      noAlt: m.noAlt || false,
      baseline: "",
      projected: "",
      projectedAlt: "",
      actual: "",
    }))
  }
}

/**
 * Recalculate all projected dates for a weeks-to-open schedule.
 *
 * @param milestones - Current milestone state array (mutated in place for performance)
 * @param grandOpeningDate - ISO date string (YYYY-MM-DD)
 * @returns The same array with updated baseline and projected fields
 */
export function recalcWeeksToOpen(
  milestones: SfMilestoneState[],
  grandOpeningDate: string | null,
): SfMilestoneState[] {
  const today = todayISO()

  if (!grandOpeningDate) {
    return milestones.map((m) => ({ ...m, baseline: "", projected: "" }))
  }

  const goDate = new Date(grandOpeningDate + "T00:00:00")

  return milestones.map((m) => {
    // Baseline = GO date - (weeks * 7 days)
    const baseDate = new Date(goDate.getTime() - (m.wk ?? 0) * 7 * 86400000)
    const baseline = toISO(baseDate)

    // Projected priority: actual > projectedAlt > MAX(baseline, today)
    let projected: string
    if (m.actual) {
      projected = m.actual
    } else if (m.projectedAlt) {
      projected = m.projectedAlt
    } else {
      const todayDate = new Date(today + "T00:00:00")
      projected = baseDate > todayDate ? baseline : today
    }

    return { ...m, baseline, projected }
  })
}

/**
 * Recalculate all projected dates for a day-offset schedule.
 * Forward cascade: each milestone references another milestone's projected date.
 *
 * @param milestones - Current milestone state array
 * @param template - The schedule template with ref/offset definitions
 * @returns Updated milestone array with recalculated projected dates
 */
export function recalcDayOffset(
  milestones: SfMilestoneState[],
  template: SfScheduleTemplate,
): SfMilestoneState[] {
  const today = todayISO()
  const defs = template.milestones as SfMilestoneDayOffset[]

  // Build a lookup of resolved projected dates by key
  const resolved: Record<string, string> = {}

  return milestones.map((m, i) => {
    const def = defs[i]
    if (!def) return m

    let projected = ""

    if (m.actual) {
      // Actual date locks this milestone
      projected = m.actual
    } else if (!m.noAlt && m.projectedAlt) {
      // User override
      projected = m.projectedAlt
    } else if (def.ref === null) {
      // Root milestone (Project Identified) — projected = actual or empty
      projected = m.actual || ""
    } else {
      // Calculate from reference
      const refProjected = resolved[def.ref] || ""
      if (refProjected) {
        const refDate = new Date(refProjected + "T00:00:00")
        const calcDate = new Date(refDate.getTime() + def.offset * 86400000)
        const todayDate = new Date(today + "T00:00:00")
        const finalDate = calcDate > todayDate ? calcDate : todayDate
        projected = toISO(finalDate)
      }
    }

    resolved[m.key] = projected
    return { ...m, projected }
  })
}

/**
 * Check if a date string is in the past relative to today.
 */
export function isDatePast(dateStr: string): boolean {
  if (!dateStr) return false
  return dateStr < todayISO()
}

/**
 * Format a date string for display.
 */
export function formatScheduleDate(dateStr: string): string {
  if (!dateStr) return "\u2014"
  const d = new Date(dateStr + "T00:00:00")
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

// ── Helpers ──

function todayISO(): string {
  return new Date().toISOString().split("T")[0]
}

function toISO(d: Date): string {
  return d.toISOString().split("T")[0]
}
