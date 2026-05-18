"use client"

import { cn } from "@/lib/utils"
import type { TaskPriority } from "@/types"

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  urgent: "bg-red-100 text-red-800 border-red-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  medium: "bg-blue-50 text-blue-700 border-blue-200",
  low: "bg-gray-100 text-gray-600 border-gray-200",
}

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  urgent: "URG",
  high: "HIGH",
  medium: "MED",
  low: "LOW",
}

const PRIORITY_CYCLE: Record<TaskPriority, TaskPriority> = {
  urgent: "high",
  high: "medium",
  medium: "low",
  low: "urgent",
}

export function getNextPriority(current: TaskPriority): TaskPriority {
  return PRIORITY_CYCLE[current] || "medium"
}

interface TaskPriorityBadgeProps {
  priority: TaskPriority
  onClick?: () => void
  disabled?: boolean
}

export function TaskPriorityBadge({ priority, onClick, disabled }: TaskPriorityBadgeProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap",
        "transition-colors select-none",
        PRIORITY_COLORS[priority] || PRIORITY_COLORS["medium"],
        onClick && !disabled ? "cursor-pointer hover:opacity-80" : "cursor-default",
      )}
    >
      {PRIORITY_LABELS[priority] || "MED"}
    </button>
  )
}
