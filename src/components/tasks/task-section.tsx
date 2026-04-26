/**
 * Task Section - Container for task table or notes pad
 */

"use client"

import { useState } from "react"
import { TaskTable } from "./task-table"
import type { TaskSection as TaskSectionType, Task } from "@/types"

interface TaskSectionProps {
  section: TaskSectionType
  tasks?: Task[]
  onRenameSection: (sectionId: string, newLabel: string) => void
  onDeleteSection: (sectionId: string) => void
  onUpdateNotes?: (sectionId: string, notes: string) => void
  onToggleCheck?: (taskId: string) => void
  onUpdateText?: (taskId: string, text: string) => void
  onUpdateTaskNotes?: (taskId: string, notes: string) => void
  onCycleStatus?: (taskId: string) => void
  onDeleteTask?: (taskId: string) => void
  onAddTask?: (sectionId: string) => void
}

export function TaskSection({
  section,
  tasks = [],
  onRenameSection,
  onDeleteSection,
  onUpdateNotes,
  onToggleCheck,
  onUpdateText,
  onUpdateTaskNotes,
  onCycleStatus,
  onDeleteTask,
  onAddTask,
}: TaskSectionProps) {
  const isNotes = section.type === "notes"

  return (
    <div className="mb-1">
      {/* Section Header */}
      <div className="bg-slate-100 border border-border border-t-0 px-4 py-2 flex items-center justify-between">
        <span className="text-xs font-bold text-navy uppercase tracking-wide">
          {isNotes && "📝 "}
          {section.label}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              const newLabel = prompt("New section name:", section.label)
              if (newLabel) onRenameSection(section.id, newLabel)
            }}
            className="text-xs text-navy opacity-50 hover:opacity-100 transition-opacity"
          >
            rename
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Delete section "${section.label}"?`)) {
                onDeleteSection(section.id)
              }
            }}
            className="text-xs text-navy opacity-50 hover:opacity-100 transition-opacity"
          >
            remove
          </button>
        </div>
      </div>

      {/* Content */}
      {isNotes ? (
        <textarea
          className="w-full min-h-[120px] border border-border border-t-0 p-4 text-sm resize-vertical bg-yellow-50 outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type notes here..."
          defaultValue={section.notesContent || ""}
          onBlur={(e) => {
            if (onUpdateNotes) {
              onUpdateNotes(section.id, e.target.value)
            }
          }}
        />
      ) : (
        <>
          <TaskTable
            tasks={tasks}
            onToggleCheck={onToggleCheck || (() => {})}
            onUpdateText={onUpdateText || (() => {})}
            onUpdateNotes={onUpdateTaskNotes || (() => {})}
            onCycleStatus={onCycleStatus || (() => {})}
            onDelete={onDeleteTask || (() => {})}
          />
          {/* Add Task Row */}
          <div className="border border-dashed border-gray-300 bg-gray-50">
            <button
              type="button"
              onClick={() => onAddTask && onAddTask(section.id)}
              className="w-full text-left text-xs text-gray-400 hover:text-navy py-2 px-4 transition-colors"
            >
              + Add task
            </button>
          </div>
        </>
      )}
    </div>
  )
}
