/**
 * Task Management Types
 *
 * Task projects can be standalone OR linked to real projects.
 * Supports flexible sections (task checklists or freeform notes).
 */

export type TaskStatus = "DO NOW" | "IN PROGRESS" | "PENDING" | "DONE" | "ONGOING"

export type TaskPriorityLevel = "highest" | "high" | "active" | "lower"

export type TaskSectionType = "tasks" | "notes"

/**
 * Task Project - Main container for tasks
 * Can be standalone (e.g., "Daily Responsibilities") or linked to a real project
 */
export interface TaskProject {
  id: string
  linkedProjectId?: string         // If tied to real project
  name: string                      // "KS-12 — Remodel" or "Daily Tasks"
  priority: string                  // Display text: "HIGHEST PRIORITY", "ACTIVE", etc.
  priorityLevel: TaskPriorityLevel  // For color coding
  status: string                    // Freeform status text
  gcInfo?: string                   // GC or extra context
  orgId: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

/**
 * Task Section - Groups tasks or holds freeform notes
 */
export interface TaskSection {
  id: string
  projectId: string                 // Parent taskProject
  label: string                     // "IMMEDIATE / DO NOW", "PENDING", "NOTES"
  type: TaskSectionType             // "tasks" or "notes"
  sortOrder: number
  notesContent?: string             // If type === "notes"
  createdAt: string
  updatedAt: string
}

/**
 * Individual Task
 */
export interface Task {
  id: string
  sectionId: string
  projectId: string
  text: string                      // Task description
  status: TaskStatus
  notes: string                     // Detailed notes / next step
  checked: boolean                  // Completion checkbox
  sortOrder: number
  assignedTo?: string               // userId (optional)
  dueDate?: string                  // ISO date (optional)
  sopReference?: {                  // Link to SOP step (optional)
    projectType: string
    phase: number
    stepId?: string
    gateId?: string
  }
  createdAt: string
  updatedAt: string
}

/**
 * Next Step - Ordered list of upcoming actions
 */
export interface NextStep {
  id: string
  projectId: string
  text: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}
