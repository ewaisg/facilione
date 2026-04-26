/**
 * Task Status Badge - Clickable badge that cycles through statuses
 */

import { cn } from "@/lib/utils"
import type { TaskStatus } from "@/types"

interface TaskStatusBadgeProps {
  status: TaskStatus
  onClick?: () => void
  disabled?: boolean
}

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  "DO NOW": "IN PROGRESS",
  "IN PROGRESS": "PENDING",
  "PENDING": "DONE",
  "DONE": "DO NOW",
  "ONGOING": "ONGOING", // Stays ongoing
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  "DO NOW": "bg-red-50 text-red-700 border-red-200",
  "IN PROGRESS": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "PENDING": "bg-gray-100 text-gray-600 border-gray-300",
  "DONE": "bg-green-50 text-green-700 border-green-200",
  "ONGOING": "bg-blue-50 text-blue-700 border-blue-200",
}

export function TaskStatusBadge({ status, onClick, disabled }: TaskStatusBadgeProps) {
  const colorClass = STATUS_COLORS[status]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors",
        colorClass,
        onClick && !disabled && "cursor-pointer hover:opacity-75",
        disabled && "cursor-not-allowed opacity-50",
      )}
      title={onClick ? "Click to change status" : undefined}
    >
      {status}
    </button>
  )
}

export function getNextStatus(current: TaskStatus): TaskStatus {
  return STATUS_CYCLE[current]
}
