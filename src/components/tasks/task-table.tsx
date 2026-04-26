/**
 * Task Table - Editable table with inline editing
 */

"use client"

import { useState } from "react"
import { TaskStatusBadge, getNextStatus } from "./task-status-badge"
import { X } from "lucide-react"
import type { Task } from "@/types"

interface TaskTableProps {
  tasks: Task[]
  onToggleCheck: (taskId: string) => void
  onUpdateText: (taskId: string, text: string) => void
  onUpdateNotes: (taskId: string, notes: string) => void
  onCycleStatus: (taskId: string) => void
  onDelete: (taskId: string) => void
}

export function TaskTable({
  tasks,
  onToggleCheck,
  onUpdateText,
  onUpdateNotes,
  onCycleStatus,
  onDelete,
}: TaskTableProps) {
  const [editingText, setEditingText] = useState<Record<string, string>>({})
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({})

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-navy">
          <th className="w-10 text-center py-2 px-3 border border-border text-white text-xs font-bold"></th>
          <th className="text-left py-2 px-3 border border-border text-white text-xs font-bold">TASK</th>
          <th className="w-32 text-center py-2 px-3 border border-border text-white text-xs font-bold">STATUS</th>
          <th className="text-left py-2 px-3 border border-border text-white text-xs font-bold">NOTES / NEXT STEP</th>
          <th className="w-8 border border-border"></th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task, idx) => {
          const isDone = task.checked
          const isAlt = idx % 2 === 1

          return (
            <tr
              key={task.id}
              className={`${isDone ? "bg-green-50" : isAlt ? "bg-slate-50" : "bg-white"} hover:bg-blue-50 transition-colors`}
            >
              {/* Checkbox */}
              <td className="text-center py-2 px-3 border border-border">
                <button
                  type="button"
                  onClick={() => onToggleCheck(task.id)}
                  className="text-lg hover:opacity-70 transition-opacity"
                >
                  {task.checked ? "☑" : "☐"}
                </button>
              </td>

              {/* Task Text */}
              <td className="py-2 px-3 border border-border">
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className={`min-h-[20px] outline-none rounded px-1 focus:ring-2 focus:ring-blue-400 ${
                    isDone ? "line-through text-gray-500" : ""
                  }`}
                  onFocus={(e) => setEditingText({ ...editingText, [task.id]: e.currentTarget.textContent || "" })}
                  onBlur={(e) => {
                    const newText = e.currentTarget.textContent?.trim() || ""
                    if (newText !== task.text) {
                      onUpdateText(task.id, newText)
                    }
                  }}
                  dangerouslySetInnerHTML={{ __html: task.text }}
                />
              </td>

              {/* Status Badge */}
              <td className="text-center py-2 px-3 border border-border">
                <TaskStatusBadge
                  status={task.status}
                  onClick={() => onCycleStatus(task.id)}
                />
              </td>

              {/* Notes */}
              <td className="py-2 px-3 border border-border">
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="min-h-[20px] text-xs text-gray-600 outline-none rounded px-1 focus:ring-2 focus:ring-blue-400"
                  onFocus={(e) => setEditingNotes({ ...editingNotes, [task.id]: e.currentTarget.textContent || "" })}
                  onBlur={(e) => {
                    const newNotes = e.currentTarget.textContent?.trim() || ""
                    if (newNotes !== task.notes) {
                      onUpdateNotes(task.id, newNotes)
                    }
                  }}
                  dangerouslySetInnerHTML={{ __html: task.notes }}
                />
              </td>

              {/* Delete Button */}
              <td className="text-center py-2 px-3 border border-border">
                <button
                  type="button"
                  onClick={() => onDelete(task.id)}
                  className="text-gray-300 hover:text-red-600 transition-colors"
                  title="Delete task"
                >
                  <X className="size-4" />
                </button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
