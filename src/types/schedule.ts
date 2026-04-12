export type PhaseStatus = "pending" | "in-progress" | "complete" | "skipped"

export interface ChecklistItem {
  id: string
  step: string
  description: string
  weekOffset: number | null
  sopReference: string | null
  status: "pending" | "complete" | "na"
  completedDate: string | null
  notes: string
  isGate: boolean
}

export interface Phase {
  id: string
  projectId: string
  phaseNumber: number
  name: string
  targetStartWeekOffset: number | null
  targetEndWeekOffset: number | null
  targetStartDate: string | null
  targetEndDate: string | null
  actualStartDate: string | null
  actualEndDate: string | null
  status: PhaseStatus
  checklistItems: ChecklistItem[]
  sopReference: string | null
  notes: string
}

/** Parsed schedule template — one per project type, stored in kb/templates/{type} */
export interface ScheduleTemplate {
  projectType: string
  phases: ScheduleTemplatePhase[]
}

export interface ScheduleTemplatePhase {
  phaseNumber: number
  name: string
  milestones: ScheduleTemplateMilestone[]
}

export interface ScheduleTemplateMilestone {
  description: string
  weekOffset: number
  isGate: boolean
  owner: string | null
  system: string | null
}
