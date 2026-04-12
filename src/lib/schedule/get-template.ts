/**
 * Client-side template accessor.
 *
 * Uses the statically-parsed templates.json for the project creation wizard
 * (schedule preview and phase seeding on create).
 */

import templates from "./templates.json"
import type { ScheduleTemplate } from "@/types/schedule"

const typedTemplates = templates as Record<string, ScheduleTemplate>

/**
 * Get the parsed schedule template for a project type.
 * Returns null if the type is not found.
 */
export function getScheduleTemplate(
  projectType: string,
): ScheduleTemplate | null {
  return typedTemplates[projectType] ?? null
}

/**
 * Get all available template types.
 */
export function getAvailableTemplateTypes(): string[] {
  return Object.keys(typedTemplates)
}
