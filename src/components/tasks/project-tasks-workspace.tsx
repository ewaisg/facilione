"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/firebase/auth-context"
import {
  createProjectTask,
  createTaskProject,
  createTaskSnapshot,
  getAvailableSnapshotDates,
  getTaskSnapshot,
  migrateProjectToFlatTasks,
  subscribeToProjectTasks,
  subscribeToProjects,
  subscribeToTaskProjects,
  updateProjectNotes,
  updateProjectInfo,
  updateProjectTask,
  deleteProjectTask,
} from "@/lib/firebase/firestore"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TaskFilterBar } from "@/components/tasks/task-filter-bar"
import { TaskFlatTable } from "@/components/tasks/task-flat-table"
import { ProjectNotesPanel } from "@/components/tasks/project-notes-panel"
import { HistoryNavigator } from "@/components/tasks/history-navigator"
import { getNextPriority } from "@/components/tasks/task-priority-badge"
import { getNextStatus } from "@/components/tasks/task-status-badge"
import { ProjectFactsPanel } from "@/components/projects/project-facts-panel"
import type { Project, ProjectInfoFieldType, Task, TaskFilter, TaskProject } from "@/types"

interface ProjectTasksWorkspaceProps {
  project: Project
}

function getTaskProjectForProject(projectId: string, taskProjects: TaskProject[]) {
  return taskProjects.find((taskProject) => taskProject.linkedProjectId === projectId) ?? null
}

export function ProjectTasksWorkspace({ project }: ProjectTasksWorkspaceProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [taskProjects, setTaskProjects] = useState<TaskProject[]>([])
  const [activeTaskProjectId, setActiveTaskProjectId] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<TaskFilter>("all")
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(false)
  const [switchingProjectId, setSwitchingProjectId] = useState<string | null>(null)

  const [viewingDate, setViewingDate] = useState<string | null>(null)
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [snapshotTasks, setSnapshotTasks] = useState<Task[]>([])
  const [snapshotNotes, setSnapshotNotes] = useState("")
  const snapshotCreatedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!user) return

    const unsubscribeProjects = subscribeToProjects(
      user,
      setProjects,
      (err) => console.error("Error loading project task switcher:", err),
    )

    const unsubscribeTaskProjects = subscribeToTaskProjects(
      user,
      (data) => {
        setTaskProjects(data)
        setLoading(false)
      },
      (err) => {
        console.error("Error loading task projects:", err)
        setLoading(false)
      },
    )

    return () => {
      unsubscribeProjects()
      unsubscribeTaskProjects()
    }
  }, [user])

  const activeTaskProject = useMemo(
    () => taskProjects.find((taskProject) => taskProject.id === activeTaskProjectId) ?? null,
    [activeTaskProjectId, taskProjects],
  )

  useEffect(() => {
    if (!user || loading || initializing) return

    const linkedTaskProject = getTaskProjectForProject(project.id, taskProjects)
    if (linkedTaskProject) {
      setActiveTaskProjectId(linkedTaskProject.id)
      return
    }

    setInitializing(true)
    createTaskProject({
      code: project.storeNumber || "PROJECT",
      name: project.storeName || "Project Tasks",
      priority: "ACTIVE",
      priorityLevel: "active",
      status: project.status || "active",
      linkedProjectId: project.id,
      orgId: user.orgId,
      createdBy: user.uid,
      migrated: true,
      notes: "",
    })
      .then((newId) => {
        setActiveTaskProjectId(newId)
        toast.success("Project task workspace initialized")
      })
      .catch((err) => {
        console.error("Failed to initialize project task workspace:", err)
        toast.error("Failed to initialize project tasks")
      })
      .finally(() => setInitializing(false))
  }, [initializing, loading, project, taskProjects, user])

  useEffect(() => {
    if (!activeTaskProjectId) return
    setTasks([])

    const unsubscribeTasks = subscribeToProjectTasks(
      activeTaskProjectId,
      setTasks,
      (err) => console.error("Error loading project tasks:", err),
    )

    return () => unsubscribeTasks()
  }, [activeTaskProjectId])

  useEffect(() => {
    if (!activeTaskProjectId) return
    getAvailableSnapshotDates(activeTaskProjectId).then(setAvailableDates).catch(() => setAvailableDates([]))
  }, [activeTaskProjectId])

  useEffect(() => {
    if (!activeTaskProjectId || !activeTaskProject || activeTaskProject.migrated) return
    migrateProjectToFlatTasks(activeTaskProjectId).catch((err) => {
      console.error("Task migration failed:", err)
    })
  }, [activeTaskProjectId, activeTaskProject])

  useEffect(() => {
    if (!activeTaskProjectId || tasks.length === 0) return
    const today = new Date().toISOString().slice(0, 10)
    const snapshotKey = `${activeTaskProjectId}-${today}`
    if (snapshotCreatedRef.current === snapshotKey) return

    snapshotCreatedRef.current = snapshotKey
    createTaskSnapshot(activeTaskProjectId, today, tasks, activeTaskProject?.notes || "")
      .then(() => {
        if (!availableDates.includes(today)) {
          setAvailableDates((prev) => [...prev, today].sort())
        }
      })
      .catch(() => {})
  }, [activeTaskProject?.notes, activeTaskProjectId, availableDates, tasks])

  useEffect(() => {
    if (!viewingDate || !activeTaskProjectId) {
      setSnapshotTasks([])
      setSnapshotNotes("")
      return
    }

    getTaskSnapshot(activeTaskProjectId, viewingDate)
      .then((snapshot) => {
        if (!snapshot) {
          setSnapshotTasks([])
          setSnapshotNotes("")
          toast.info("No snapshot available for this date")
          return
        }

        setSnapshotTasks(snapshot.tasks)
        setSnapshotNotes(snapshot.projectNotes)
      })
      .catch(() => toast.error("Failed to load snapshot"))
  }, [activeTaskProjectId, viewingDate])

  useEffect(() => {
    setViewingDate(null)
    setSnapshotTasks([])
    setSnapshotNotes("")
    snapshotCreatedRef.current = null
  }, [activeTaskProjectId])

  const isHistorical = viewingDate !== null
  const displayTasks = isHistorical ? snapshotTasks : tasks
  const displayNotes = isHistorical ? snapshotNotes : activeTaskProject?.notes || ""
  const switchingProject = projects.find((item) => item.id === switchingProjectId)

  const handleProjectChange = (projectId: string) => {
    if (projectId === project.id) return
    const target = projects.find((item) => item.id === projectId)
    setSwitchingProjectId(projectId)
    toast.info(
      target
        ? `Switching to ${target.storeNumber} - ${target.storeName}`
        : "Switching project",
    )
    router.push(`/projects/${projectId}?tab=tasks`)
  }

  const handleAddTask = async () => {
    if (!activeTaskProjectId) return

    try {
      await createProjectTask(activeTaskProjectId, {
        text: "New task",
        status: "PENDING",
        priority: "medium",
        notes: "",
        checked: false,
        sortOrder: tasks.length,
      })
    } catch {
      toast.error("Failed to add task")
    }
  }

  const handleToggleCheck = async (taskId: string) => {
    if (!activeTaskProjectId) return
    const task = tasks.find((item) => item.id === taskId)
    if (!task) return

    try {
      await updateProjectTask(activeTaskProjectId, taskId, {
        checked: !task.checked,
        status: !task.checked ? "DONE" : "PENDING",
      })
    } catch {
      toast.error("Failed to update task")
    }
  }

  const handleUpdateText = async (taskId: string, text: string) => {
    if (!activeTaskProjectId) return
    try {
      await updateProjectTask(activeTaskProjectId, taskId, { text })
    } catch {
      toast.error("Failed to update task")
    }
  }

  const handleUpdateNotes = async (taskId: string, notes: string) => {
    if (!activeTaskProjectId) return
    try {
      await updateProjectTask(activeTaskProjectId, taskId, { notes })
    } catch {
      toast.error("Failed to update task notes")
    }
  }

  const handleCycleStatus = async (taskId: string) => {
    if (!activeTaskProjectId) return
    const task = tasks.find((item) => item.id === taskId)
    if (!task) return

    const status = getNextStatus(task.status)
    try {
      await updateProjectTask(activeTaskProjectId, taskId, {
        status,
        checked: status === "DONE",
      })
    } catch {
      toast.error("Failed to update task status")
    }
  }

  const handleCyclePriority = async (taskId: string) => {
    if (!activeTaskProjectId) return
    const task = tasks.find((item) => item.id === taskId)
    if (!task) return

    try {
      await updateProjectTask(activeTaskProjectId, taskId, {
        priority: getNextPriority(task.priority),
      })
    } catch {
      toast.error("Failed to update task priority")
    }
  }

  const handleUpdateDueDate = async (taskId: string, dueDate: string) => {
    if (!activeTaskProjectId) return
    try {
      await updateProjectTask(activeTaskProjectId, taskId, {
        dueDate: dueDate || undefined,
      })
    } catch {
      toast.error("Failed to update due date")
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!activeTaskProjectId) return
    try {
      await deleteProjectTask(activeTaskProjectId, taskId)
    } catch {
      toast.error("Failed to delete task")
    }
  }

  const handleUpdateProjectNotes = useCallback(
    async (notes: string) => {
      if (!activeTaskProjectId) return
      try {
        await updateProjectNotes(activeTaskProjectId, notes)
      } catch {
        toast.error("Failed to save project notes")
      }
    },
    [activeTaskProjectId],
  )

  const handleUpdateProjectInfo = useCallback(
    async (
      projectInfo: Record<string, { label: string; type: ProjectInfoFieldType; value: string | number | boolean | null }>,
    ) => {
      if (!activeTaskProjectId) return
      await updateProjectInfo(activeTaskProjectId, projectInfo)
    },
    [activeTaskProjectId],
  )

  if (!user || loading || initializing || !activeTaskProjectId) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Select
            value={project.id}
            onValueChange={handleProjectChange}
            disabled={!!switchingProjectId}
          >
            <SelectTrigger
              className="h-auto w-fit max-w-full border-0 bg-transparent px-0 py-0 text-left text-base font-semibold shadow-none focus:ring-0"
              aria-label="Switch project"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {projects.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.storeNumber} - {item.storeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Persistent project task workspace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleAddTask} disabled={isHistorical}>
            <Plus className="size-4" />
            Add Task
          </Button>
        </div>
      </div>

      {switchingProjectId && (
        <div className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-medium text-primary">
          <Loader2 className="size-3.5 animate-spin" />
          Switching to {switchingProject ? `${switchingProject.storeNumber} - ${switchingProject.storeName}` : "selected project"}...
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <TaskFilterBar filter={filter} tasks={tasks} onFilterChange={setFilter} />

          {isHistorical && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
              Viewing snapshot from {viewingDate}. Return to Live to edit tasks.
            </div>
          )}

          <TaskFlatTable
            tasks={displayTasks}
            filter={filter}
            isHistorical={isHistorical}
            onToggleCheck={handleToggleCheck}
            onUpdateText={handleUpdateText}
            onUpdateNotes={handleUpdateNotes}
            onCycleStatus={handleCycleStatus}
            onCyclePriority={handleCyclePriority}
            onUpdateDueDate={handleUpdateDueDate}
            onDelete={handleDeleteTask}
            onAddTask={handleAddTask}
          />

          <ProjectNotesPanel
            notes={displayNotes}
            isHistorical={isHistorical}
            onUpdateNotes={handleUpdateProjectNotes}
          />

          <HistoryNavigator
            currentDate={viewingDate}
            availableDates={availableDates}
            onNavigate={setViewingDate}
          />
        </div>

        <ProjectFactsPanel
          project={project}
          taskProject={activeTaskProject}
          compact
          className="xl:sticky xl:top-6"
          onUpdateProjectInfo={handleUpdateProjectInfo}
        />
      </div>
    </div>
  )
}
