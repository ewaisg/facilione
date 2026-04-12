/**
 * SOP Data Types
 *
 * Defines the structure for all SOP reference data.
 * Source: sop.html SOP_DATA object from FaciliTools.
 */

export interface SOPStep {
  /** Step number (e.g. "1.1", "2.3") */
  n: string
  /** Step description text */
  text: string
  /** Owner/responsible party (e.g. "PM", "PM / RE", "GC") */
  owner: string
  /** System used (e.g. "Oracle", "s|f", "Coupa", "Email") */
  sys: string
  /** Baseline week reference (e.g. "Wk 113", "") */
  wk: string
}

export interface SOPPhase {
  /** Phase name (e.g. "Phase 1 — Evaluation") */
  name: string
  /** Ordered list of steps within this phase */
  steps: SOPStep[]
  /** Gate conditions that must be met before proceeding */
  gates: string[]
  /** Tips and best practices for this phase */
  tips: string[]
}

export interface SOPScheduleItem {
  /** Milestone name */
  m: string
  /** Baseline week (e.g. "Week 113") */
  wk: string
  /** Gate or note associated with this milestone */
  gate: string
}

export interface SOPProject {
  /** Unique identifier key (e.g. "ns", "er", "appA") */
  id: string
  /** Display title (e.g. "New Store (NS)") */
  title: string
  /** Baseline duration (e.g. "113 Weeks", "Reference") */
  baseline: string
  /** Oracle template name */
  template: string
  /** Business area classification */
  businessArea: string
  /** Oracle parent project reference */
  parent: string
  /** SOP objective description */
  objective: string
  /** Scope / applicability statement */
  scope: string
  /** Source document filenames */
  sources: string[]
  /** Schedule summary milestones */
  schedule: SOPScheduleItem[]
  /** Phase definitions with steps, gates, tips */
  phases: SOPPhase[]
}

export type SOPDataMap = Record<string, SOPProject>
