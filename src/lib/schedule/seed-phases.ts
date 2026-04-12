/**
 * Phase Seeding Logic
 *
 * Takes a Grand Opening date and a parsed schedule template,
 * calculates concrete target dates for every milestone,
 * and returns Phase documents ready to write to Firestore.
 *
 * Formula: targetDate = grandOpeningDate + (weekOffset × 7 days)
 * Where weekOffset is negative (weeks BEFORE grand opening).
 */

import type { Phase, ChecklistItem } from "@/types/schedule"
import type { ScheduleTemplate } from "@/types/schedule"

/**
 * Generate Phase documents with calculated target dates from a template.
 *
 * @param template - Parsed schedule template for the project type
 * @param grandOpeningDate - ISO date string for the Grand Opening target
 * @param projectId - The Firestore project document ID
 * @returns Array of Phase objects ready for Firestore write
 */
export function seedPhasesFromTemplate(
  template: ScheduleTemplate,
  grandOpeningDate: string,
  projectId: string,
): Phase[] {
  const goDate = new Date(grandOpeningDate)

  return template.phases.map((templatePhase) => {
    // Calculate phase-level start/end from the first and last milestone offsets
    const offsets = templatePhase.milestones
      .map((m) => m.weekOffset)
      .filter((o): o is number => o !== null)

    const minOffset = offsets.length > 0 ? Math.min(...offsets) : null
    const maxOffset = offsets.length > 0 ? Math.max(...offsets) : null

    const checklistItems: ChecklistItem[] = templatePhase.milestones.map(
      (milestone, idx) => ({
        id: `${templatePhase.phaseNumber}-${idx + 1}`,
        step: `${templatePhase.phaseNumber}.${idx + 1}`,
        description: milestone.description,
        weekOffset: milestone.weekOffset,
        sopReference: null,
        status: "pending" as const,
        completedDate: null,
        notes: "",
        isGate: milestone.isGate,
      }),
    )

    const phase: Phase = {
      id: `phase-${templatePhase.phaseNumber}`,
      projectId,
      phaseNumber: templatePhase.phaseNumber,
      name: templatePhase.name,
      targetStartWeekOffset: minOffset,
      targetEndWeekOffset: maxOffset,
      targetStartDate: minOffset !== null ? calculateDate(goDate, minOffset) : null,
      targetEndDate: maxOffset !== null ? calculateDate(goDate, maxOffset) : null,
      actualStartDate: null,
      actualEndDate: null,
      status: "pending",
      checklistItems,
      sopReference: null,
      notes: "",
    }

    return phase
  })
}

/**
 * Calculate a target date from a base date and a week offset.
 * Offset is negative for dates before the base (GO) date.
 * Returns ISO date string (YYYY-MM-DD).
 */
function calculateDate(baseDate: Date, weekOffset: number): string {
  const result = new Date(baseDate)
  result.setDate(baseDate.getDate() + weekOffset * 7)
  return result.toISOString().split("T")[0]
}

/**
 * Recalculate all target dates when GO date changes.
 * Preserves actual dates and completion status.
 */
export function recalculatePhaseDates(
  phases: Phase[],
  newGrandOpeningDate: string,
): Phase[] {
  const goDate = new Date(newGrandOpeningDate)

  return phases.map((phase) => ({
    ...phase,
    targetStartDate:
      phase.targetStartWeekOffset !== null
        ? calculateDate(goDate, phase.targetStartWeekOffset)
        : null,
    targetEndDate:
      phase.targetEndWeekOffset !== null
        ? calculateDate(goDate, phase.targetEndWeekOffset)
        : null,
    checklistItems: phase.checklistItems.map((item) => ({
      ...item,
      // Actual dates and status are preserved — only targets recalculate
    })),
  }))
}
