"use client"

import { cn } from "@/lib/utils"
import type { TaskStatus } from "@/types"

const STATUS_COLORS: Record<TaskStatus, string> = {
  "DO NOW": "bg-red-50 text-red-700 border-red-200",
  "IN PROGRESS": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "WAITING": "bg-purple-50 text-purple-700 border-purple-200",
  "PENDING": "bg-gray-100 text-gray-600 border-gray-300",
  "BLOCKED": "bg-orange-50 text-orange-700 border-orange-200",
  "DONE": "bg-green-50 text-green-700 border-green-200",
  "ONGOING": "bg-blue-50 text-blue-700 border-blue-200",
}

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  "DO NOW": "IN PROGRESS",
  "IN PROGRESS": "WAITING",
  "WAITING": "PENDING",
  "PENDING": "BLOCKED",
  "BLOCKED": "DONE",
  "DONE": "DO NOW",
  "ONGOING": "ONGOING",
}

export function getNextStatus(current: TaskStatus): TaskStatus {
  return STATUS_CYCLE[current] || "PENDING"
}

interface TaskStatusBadgeProps {
  status: TaskStatus
  onClick?: () => void
  disabled?: boolean
}

export function TaskStatusBadge({ status, onClick, disabled }: TaskStatusBadgeProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap",
        "transition-colors select-none",
        STATUS_COLORS[status] || STATUS_COLORS["PENDING"],
        onClick && !disabled ? "cursor-pointer hover:opacity-80" : "cursor-default",
      )}
    >
      {status}
    </button>
  )
}
