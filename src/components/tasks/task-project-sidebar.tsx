"use client"

import { MoreVertical, FolderKanban, ListTodo } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TaskProject, TaskPriorityLevel, Project } from "@/types"

export interface SidebarProject {
  id: string
  code: string
  name: string
  priority: string
  priorityLevel: TaskPriorityLevel
  source: "real" | "standalone"
}

function mapRealProject(p: Project): SidebarProject {
  return {
    id: p.id,
    code: p.storeNumber,
    name: p.storeName,
    priority: p.status === "active" ? "ACTIVE" : p.status.toUpperCase(),
    priorityLevel: p.status === "active" ? "active" : "lower",
    source: "real",
  }
}

function mapTaskProject(p: TaskProject): SidebarProject {
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    priority: p.priority,
    priorityLevel: p.priorityLevel,
    source: p.linkedProjectId ? "real" : "standalone",
  }
}

export function buildSidebarList(
  realProjects: Project[],
  taskProjects: TaskProject[],
): SidebarProject[] {
  const linkedIds = new Set(taskProjects.filter((tp) => tp.linkedProjectId).map((tp) => tp.linkedProjectId!))
  const standaloneTaskProjects = taskProjects.filter((tp) => !tp.linkedProjectId)

  const realItems = realProjects.map(mapRealProject)
  const standaloneItems = standaloneTaskProjects.map(mapTaskProject)

  return [...realItems, ...standaloneItems]
}

export function getTaskProjectIdForRealProject(
  realProjectId: string,
  taskProjects: TaskProject[],
): string | null {
  const tp = taskProjects.find((p) => p.linkedProjectId === realProjectId)
  return tp?.id || null
}

interface TaskProjectSidebarProps {
  projects: SidebarProject[]
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
  const realProjects = projects.filter((p) => p.source === "real")
  const standaloneProjects = projects.filter((p) => p.source === "standalone")

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/10 flex-shrink-0">
        <h3 className="text-sm font-bold text-white">Task Projects</h3>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {/* Real projects section */}
        {realProjects.length > 0 && (
          <>
            <div className="px-4 py-1.5">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                <FolderKanban className="size-3" /> Projects
              </span>
            </div>
            {realProjects.map((project) => (
              <SidebarItem
                key={project.id}
                project={project}
                isActive={project.id === activeProjectId}
                onSelect={onSelectProject}
                onEdit={onEditProject}
                onDelete={onDeleteProject}
              />
            ))}
          </>
        )}

        {/* Standalone task lists section */}
        {standaloneProjects.length > 0 && (
          <>
            <div className="px-4 py-1.5 mt-2">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                <ListTodo className="size-3" /> Task Lists
              </span>
            </div>
            {standaloneProjects.map((project) => (
              <SidebarItem
                key={project.id}
                project={project}
                isActive={project.id === activeProjectId}
                onSelect={onSelectProject}
                onEdit={onEditProject}
                onDelete={onDeleteProject}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

function SidebarItem({
  project,
  isActive,
  onSelect,
  onEdit,
  onDelete,
}: {
  project: SidebarProject
  isActive: boolean
  onSelect: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div
      className={cn(
        "relative group border-l-3 transition-colors",
        isActive ? "bg-white/10 border-l-blue-400" : "border-l-transparent hover:bg-white/5",
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(project.id)}
        className="w-full text-left px-4 py-2.5"
      >
        <div className="text-sm font-bold text-white/90">{project.code}</div>
        <div className="text-xs text-white/50 mt-0.5 line-clamp-1">{project.name}</div>
        <div
          className={cn(
            "inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5",
            PRIORITY_COLORS[project.priorityLevel] || PRIORITY_COLORS.lower,
          )}
        >
          {project.priority}
        </div>
      </button>

      {project.source === "standalone" && (
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
              onClick={() => onEdit(project.id)}
              className="block w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(project.id)}
              className="block w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
