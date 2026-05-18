/**
 * Task Management Types (v2 — flat task structure)
 */

export type TaskStatus = "DO NOW" | "IN PROGRESS" | "WAITING" | "PENDING" | "BLOCKED" | "DONE" | "ONGOING"

export type TaskPriority = "urgent" | "high" | "medium" | "low"

export type TaskPriorityLevel = "highest" | "high" | "active" | "lower"

export type TaskFilter = "open" | "all" | "do-now" | "waiting" | "blocked" | "done"

export type ProjectInfoFieldType = "text" | "long-note" | "date" | "number" | "currency" | "boolean" | "link"

export const TASK_PRIORITY_SORT: Record<TaskPriority, number> = {
  urgent: 1,
  high: 2,
  medium: 3,
  low: 4,
}

export const DEFAULT_PROJECT_INFO_FIELDS: Array<{ key: string; label: string; type: ProjectInfoFieldType }> = [
  { key: "bidStartDate", label: "Bid Start Date", type: "date" },
  { key: "bidDueDate", label: "Bid Due Date", type: "date" },
  { key: "preBidDate", label: "Pre-Bid Date", type: "date" },
  { key: "round1BidsReview", label: "Round 1 Bids Review", type: "date" },
  { key: "round2BidsReview", label: "Round 2 Bids Review", type: "date" },
  { key: "f1PlanStatus", label: "F1 Plan Status", type: "text" },
  { key: "f1PlanDate", label: "F1 Plan Date", type: "date" },
  { key: "r1PlanStatus", label: "R1 Plan Status", type: "text" },
  { key: "r1PlanDate", label: "R1 Plan Date", type: "date" },
  { key: "cdsStatus", label: "CDs Status", type: "text" },
  { key: "cdsDate", label: "CDs Date", type: "date" },
  { key: "permitStatus", label: "Permit Status", type: "text" },
  { key: "permitDate", label: "Permit Date", type: "date" },
  { key: "caFundingStatus", label: "CA/Funding Status", type: "text" },
  { key: "directBuyStatus", label: "Direct Buy Status", type: "text" },
  { key: "constructionStartDate", label: "Construction Start", type: "date" },
  { key: "constructionEndDate", label: "Construction End", type: "date" },
]

export interface TaskProject {
  id: string
  code: string
  linkedProjectId?: string
  name: string
  priority: string
  priorityLevel: TaskPriorityLevel
  status: string
  gcInfo?: string
  orgId: string
  createdBy: string
  notes?: string
  projectInfo?: Record<string, {
    label: string
    type: ProjectInfoFieldType
    value: string | number | boolean | null
  }>
  migrated?: boolean
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  projectId: string
  text: string
  status: TaskStatus
  priority: TaskPriority
  notes: string
  checked: boolean
  sortOrder: number
  assignedTo?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface CustomFieldDefinition {
  id: string
  projectId: string
  label: string
  type: ProjectInfoFieldType
  value: string | number | boolean | null
  sortOrder: number
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export interface TaskSnapshot {
  id: string
  projectId: string
  date: string
  tasks: Task[]
  projectNotes: string
  createdAt: string
}

// Legacy types kept for backward compatibility
export type TaskSectionType = "tasks" | "notes"

export interface TaskSection {
  id: string
  projectId: string
  label: string
  type: TaskSectionType
  sortOrder: number
  notesContent?: string
  createdAt: string
  updatedAt: string
}

export interface NextStep {
  id: string
  projectId: string
  text: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}
