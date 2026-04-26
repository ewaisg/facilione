/**
 * Task Project Sidebar - List of task projects with priority badges
 */

"use client"

import { MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TaskProject, TaskPriorityLevel } from "@/types"

interface TaskProjectSidebarProps {
  projects: TaskProject[]
  activeProjectId: string | null
  onSelectProject: (projectId: string) => void
  onEditProject: (projectId: string) => void
  onDeleteProject: (projectId: string) => void
}

const PRIORITY_COLORS: Record<TaskPriorityLevel, string> = {
  highest: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  active: "bg-green-100 text-green-700",
  lower: "bg-gray-100 text-gray-600",
}

export function TaskProjectSidebar({
  projects,
  activeProjectId,
  onSelectProject,
  onEditProject,
  onDeleteProject,
}: TaskProjectSidebarProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex-shrink-0">
        <h3 className="text-sm font-bold text-white">Task Projects</h3>
        <p className="text-xs text-white/50 mt-1">Select a project to view tasks</p>
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto py-2">
        {projects.map((project) => {
          const isActive = project.id === activeProjectId

          return (
            <div
              key={project.id}
              className={cn(
                "relative group border-l-3 transition-colors",
                isActive
                  ? "bg-white/10 border-l-blue-400"
                  : "border-l-transparent hover:bg-white/5",
              )}
            >
              <button
                type="button"
                onClick={() => onSelectProject(project.id)}
                className="w-full text-left px-4 py-3 flex-1"
              >
                <div className="text-sm font-bold text-white/90">
                  {project.id}
                </div>
                <div className="text-xs text-white/50 mt-0.5 line-clamp-1">
                  {project.name}
                </div>
                <div
                  className={cn(
                    "inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-2",
                    PRIORITY_COLORS[project.priorityLevel] || PRIORITY_COLORS.lower,
                  )}
                >
                  {project.priority}
                </div>
              </button>

              {/* Gear Menu */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    const menu = e.currentTarget.nextElementSibling
                    menu?.classList.toggle("hidden")
                  }}
                  className="p-1 text-white/30 hover:text-white/70 transition-colors"
                >
                  <MoreVertical className="size-4" />
                </button>
                <div className="hidden absolute right-0 top-full mt-1 bg-white border border-border rounded shadow-lg z-10 min-w-[120px]">
                  <button
                    type="button"
                    onClick={() => {
                      onEditProject(project.id)
                    }}
                    className="block w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteProject(project.id)
                    }}
                    className="block w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
