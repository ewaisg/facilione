"use client"

import { useRef } from "react"
import { cn } from "@/lib/utils"
import { TaskStatusBadge } from "./task-status-badge"
import { TaskPriorityBadge } from "./task-priority-badge"
import { Plus, Trash2 } from "lucide-react"
import { TASK_PRIORITY_SORT } from "@/types/task"
import type { Task, TaskFilter } from "@/types"
import { getFilteredTasks } from "./task-filter-bar"

interface TaskFlatTableProps {
  tasks: Task[]
  filter: TaskFilter
  isHistorical: boolean
  onToggleCheck: (taskId: string) => void
  onUpdateText: (taskId: string, text: string) => void
  onUpdateNotes: (taskId: string, notes: string) => void
  onCycleStatus: (taskId: string) => void
  onCyclePriority: (taskId: string) => void
  onUpdateDueDate: (taskId: string, date: string) => void
  onDelete: (taskId: string) => void
  onAddTask: () => void
}

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.checked !== b.checked) return a.checked ? 1 : -1
    const pa = TASK_PRIORITY_SORT[a.priority] || 3
    const pb = TASK_PRIORITY_SORT[b.priority] || 3
    if (pa !== pb) return pa - pb
    return a.sortOrder - b.sortOrder
  })
}

export function TaskFlatTable({
  tasks,
  filter,
  isHistorical,
  onToggleCheck,
  onUpdateText,
  onUpdateNotes,
  onCycleStatus,
  onCyclePriority,
  onUpdateDueDate,
  onDelete,
  onAddTask,
}: TaskFlatTableProps) {
  const filtered = getFilteredTasks(tasks, filter)
  const sorted = sortTasks(filtered)

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-brand-900 text-white">
            <th className="w-8 px-2 py-2 text-center font-semibold"></th>
            <th className="px-2 py-2 text-left font-semibold">Task</th>
            <th className="w-24 px-2 py-2 text-center font-semibold">Status</th>
            <th className="w-16 px-2 py-2 text-center font-semibold">Priority</th>
            <th className="w-28 px-2 py-2 text-center font-semibold">Due</th>
            <th className="px-2 py-2 text-left font-semibold">Notes</th>
            {!isHistorical && <th className="w-8 px-2 py-2"></th>}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={isHistorical ? 6 : 7} className="text-center py-8 text-muted-foreground">
                No tasks match this filter
              </td>
            </tr>
          ) : (
            sorted.map((task, idx) => (
              <TaskRow
                key={task.id}
                task={task}
                isHistorical={isHistorical}
                isOdd={idx % 2 === 1}
                onToggleCheck={onToggleCheck}
                onUpdateText={onUpdateText}
                onUpdateNotes={onUpdateNotes}
                onCycleStatus={onCycleStatus}
                onCyclePriority={onCyclePriority}
                onUpdateDueDate={onUpdateDueDate}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>

      {!isHistorical && (
        <button
          type="button"
          onClick={onAddTask}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors border-t border-border"
        >
          <Plus className="size-3.5" />
          Add task
        </button>
      )}
    </div>
  )
}

interface TaskRowProps {
  task: Task
  isHistorical: boolean
  isOdd: boolean
  onToggleCheck: (taskId: string) => void
  onUpdateText: (taskId: string, text: string) => void
  onUpdateNotes: (taskId: string, notes: string) => void
  onCycleStatus: (taskId: string) => void
  onCyclePriority: (taskId: string) => void
  onUpdateDueDate: (taskId: string, date: string) => void
  onDelete: (taskId: string) => void
}

function TaskRow({
  task,
  isHistorical,
  isOdd,
  onToggleCheck,
  onUpdateText,
  onUpdateNotes,
  onCycleStatus,
  onCyclePriority,
  onUpdateDueDate,
  onDelete,
}: TaskRowProps) {
  const textRef = useRef<HTMLDivElement>(null)
  const notesRef = useRef<HTMLDivElement>(null)
  const isDone = task.checked || task.status === "DONE"

  const handleTextBlur = () => {
    const el = textRef.current
    if (!el) return
    const newText = el.textContent?.trim() || ""
    if (newText !== task.text) {
      onUpdateText(task.id, newText)
    }
  }

  const handleNotesBlur = () => {
    const el = notesRef.current
    if (!el) return
    const newNotes = el.textContent?.trim() || ""
    if (newNotes !== task.notes) {
      onUpdateNotes(task.id, newNotes)
    }
  }

  return (
    <tr
      className={cn(
        "border-t border-border transition-colors",
        isDone ? "bg-green-50/50" : isOdd ? "bg-muted/30" : "bg-background",
        !isHistorical && "hover:bg-blue-50/50",
      )}
    >
      {/* Checkbox */}
      <td className="px-2 py-1.5 text-center">
        <button
          type="button"
          onClick={() => !isHistorical && onToggleCheck(task.id)}
          disabled={isHistorical}
          className={cn(
            "text-base leading-none select-none",
            isHistorical ? "cursor-default" : "cursor-pointer",
          )}
        >
          {isDone ? "☑" : "☐"}
        </button>
      </td>

      {/* Task text */}
      <td className="px-2 py-1.5">
        <div
          ref={textRef}
          contentEditable={!isHistorical}
          suppressContentEditableWarning
          onBlur={handleTextBlur}
          className={cn(
            "outline-none rounded px-1 py-0.5 min-w-[60px]",
            !isHistorical && "focus:ring-2 focus:ring-blue-400 focus:bg-white",
            isDone && "line-through text-muted-foreground",
          )}
        >
          {task.text}
        </div>
      </td>

      {/* Status */}
      <td className="px-2 py-1.5 text-center">
        <TaskStatusBadge
          status={task.status}
          onClick={!isHistorical ? () => onCycleStatus(task.id) : undefined}
          disabled={isHistorical}
        />
      </td>

      {/* Priority */}
      <td className="px-2 py-1.5 text-center">
        <TaskPriorityBadge
          priority={task.priority}
          onClick={!isHistorical ? () => onCyclePriority(task.id) : undefined}
          disabled={isHistorical}
        />
      </td>

      {/* Due date */}
      <td className="px-2 py-1.5 text-center">
        {isHistorical ? (
          <span className="text-[11px] text-muted-foreground">
            {task.dueDate || "—"}
          </span>
        ) : (
          <input
            type="date"
            value={task.dueDate || ""}
            onChange={(e) => onUpdateDueDate(task.id, e.target.value)}
            className="text-[11px] border border-transparent rounded px-1 py-0.5 bg-transparent hover:border-border focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none w-full"
          />
        )}
      </td>

      {/* Notes */}
      <td className="px-2 py-1.5">
        <div
          ref={notesRef}
          contentEditable={!isHistorical}
          suppressContentEditableWarning
          onBlur={handleNotesBlur}
          className={cn(
            "outline-none rounded px-1 py-0.5 text-muted-foreground min-w-[40px] max-w-[200px] truncate",
            !isHistorical && "focus:ring-2 focus:ring-blue-400 focus:bg-white focus:max-w-none focus:truncate-none",
          )}
        >
          {task.notes}
        </div>
      </td>

      {/* Delete */}
      {!isHistorical && (
        <td className="px-1 py-1.5 text-center">
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="text-muted-foreground/50 hover:text-red-600 transition-colors p-0.5"
          >
            <Trash2 className="size-3" />
          </button>
        </td>
      )}
    </tr>
  )
}
