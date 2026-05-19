"use client"

import { cn } from "@/lib/utils"
import type { TaskFilter, Task } from "@/types"

const FILTERS: Array<{ key: TaskFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "do-now", label: "Do Now" },
  { key: "waiting", label: "Waiting" },
  { key: "blocked", label: "Blocked" },
  { key: "done", label: "Done" },
]

export function getFilteredTasks(tasks: Task[], filter: TaskFilter): Task[] {
  switch (filter) {
    case "open":
      return tasks.filter((t) => t.status !== "DONE")
    case "do-now":
      return tasks.filter((t) => t.status === "DO NOW")
    case "waiting":
      return tasks.filter((t) => t.status === "WAITING")
    case "blocked":
      return tasks.filter((t) => t.status === "BLOCKED")
    case "done":
      return tasks.filter((t) => t.status === "DONE")
    case "all":
    default:
      return tasks
  }
}

function getCount(tasks: Task[], filter: TaskFilter): number {
  return getFilteredTasks(tasks, filter).length
}

interface TaskFilterBarProps {
  filter: TaskFilter
  tasks: Task[]
  onFilterChange: (filter: TaskFilter) => void
}

export function TaskFilterBar({ filter, tasks, onFilterChange }: TaskFilterBarProps) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {FILTERS.map(({ key, label }) => {
        const count = getCount(tasks, key)
        const isActive = filter === key

        return (
          <button
            key={key}
            type="button"
            onClick={() => onFilterChange(key)}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
              isActive
                ? "bg-brand-900 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {label}
            <span
              className={cn(
                "text-[10px] font-bold rounded-full px-1.5 min-w-[18px] text-center",
                isActive ? "bg-white/20 text-white" : "bg-background text-muted-foreground",
              )}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
