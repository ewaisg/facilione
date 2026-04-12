/**
 * Schedule Template Parser
 *
 * Parses the 5 XLS/XLSX schedule template files into structured JSON
 * for seeding into Firestore kb/templates/{type} documents.
 *
 * Source files:
 *   New_store_project_schedule_template.xls
 *   Expansion_Remodel_project_schedule_template.xls
 *   Withinthewalls_project_schedule_template.xls
 *   Fuel_Center_project_schedule_template.xls
 *   Minor_Capital_project_schedule_template.xlsx
 *
 * Column structure (NS, ER, WIW, FC):
 *   A (0): Category / Phase name (populated on phase header rows)
 *   B (1): Topic / Milestone name (populated on milestone rows)
 *   C (2): Baseline date (Excel serial)
 *   D (3): Projected date
 *   E (4): Actual date (placeholder "User")
 *   F (5): empty
 *   G (6): Baseline Weeks to Open (the week offset — 0 = Grand Opening)
 *   H (7): Projected Weeks to Open
 *
 * Minor Capital has no week offsets (user-entry dates only).
 */

import type {
  ScheduleTemplate,
  ScheduleTemplatePhase,
  ScheduleTemplateMilestone,
} from "@/types/schedule"

export interface RawRow {
  category: string
  topic: string
  baselineWeeksToOpen: number | null
}

/**
 * Parse a schedule template XLS into structured data.
 * Works for NS, ER, WIW, FC templates (which have Baseline Weeks to Open).
 * MC uses a simplified structure with no week offsets.
 */
export function parseScheduleTemplate(
  rows: unknown[][],
  projectType: string,
): ScheduleTemplate {
  const phases: ScheduleTemplatePhase[] = []
  let currentPhase: ScheduleTemplatePhase | null = null
  let phaseNumber = 0

  // Skip header rows (row 0 = column headers, row 1 = sub-headers)
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.length === 0) continue

    const category = String(row[0] || "").trim()
    const topic = String(row[1] || "").trim()

    // Skip completely empty rows
    if (!category && !topic) continue

    // Phase header row: category is populated, topic is empty
    if (category && !topic) {
      phaseNumber++
      currentPhase = {
        phaseNumber,
        name: category,
        milestones: [],
      }
      phases.push(currentPhase)
      continue
    }

    // Milestone row: topic is populated
    if (topic && currentPhase) {
      // Column G (index 6) = Baseline Weeks to Open
      const weekOffsetRaw = row.length > 6 ? row[6] : null
      const weekOffset =
        weekOffsetRaw !== null &&
        weekOffsetRaw !== undefined &&
        weekOffsetRaw !== "" &&
        !isNaN(Number(weekOffsetRaw))
          ? -Math.abs(Number(weekOffsetRaw)) // Negate: "113 weeks to open" = -113 offset
          : null

      // Grand Opening row is offset 0
      const isGrandOpening =
        topic.toLowerCase().includes("grand open") ||
        topic.toLowerCase().includes("opened for business") ||
        topic.toLowerCase().includes("operation went live")

      const milestone: ScheduleTemplateMilestone = {
        description: topic,
        weekOffset: isGrandOpening ? 0 : weekOffset ?? 0,
        isGate: isGateMilestone(topic),
        owner: null,
        system: null,
      }

      currentPhase.milestones.push(milestone)
    }
  }

  return { projectType, phases }
}

/**
 * Parse Minor Capital template — simplified structure with no week offsets.
 */
export function parseMinorCapitalTemplate(
  rows: unknown[][],
): ScheduleTemplate {
  const milestones: ScheduleTemplateMilestone[] = []

  for (let i = 2; i < rows.length; i++) {
    const row = rows[i]
    if (!row) continue
    const category = String(row[0] || "").trim()
    const topic = String(row[1] || "").trim()

    if (!topic || category) continue // Skip headers and empty rows

    milestones.push({
      description: topic,
      weekOffset: 0, // MC milestones have no fixed offsets — user-entered
      isGate: isGateMilestone(topic),
      owner: null,
      system: null,
    })
  }

  // MC is a single-phase project
  return {
    projectType: "MC",
    phases: [
      {
        phaseNumber: 1,
        name: "Minor Capital - Base",
        milestones,
      },
    ],
  }
}

/**
 * Determine if a milestone represents a gate checkpoint.
 * Based on SOP gate definitions from Kroger_PM_SOP_Library_v1.docx.
 */
function isGateMilestone(description: string): boolean {
  const lower = description.toLowerCase()
  const gateKeywords = [
    "approval received",
    "approved",
    "bids received",
    "bids solicited",
    "certificate of occupancy",
    "completed",
    "construction started",
    "grand open",
    "opened for business",
    "operation went live",
    "permits",
    "project completed",
    "safety assured",
    "fixturing started",
  ]
  return gateKeywords.some((kw) => lower.includes(kw))
}
