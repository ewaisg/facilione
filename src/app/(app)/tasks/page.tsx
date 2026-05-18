"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useAuth } from "@/lib/firebase/auth-context"
import {
  subscribeToProjects,
  subscribeToTaskProjects,
  createTaskProject,
  updateTaskProject,
  deleteTaskProject,
  subscribeToProjectTasks,
  createProjectTask,
  updateProjectTask,
  deleteProjectTask,
  subscribeToCustomFields,
  createCustomField,
  updateCustomField,
  deleteCustomField,
  updateProjectNotes,
  updateProjectInfo,
  createTaskSnapshot,
  getTaskSnapshot,
  getAvailableSnapshotDates,
  migrateProjectToFlatTasks,
} from "@/lib/firebase/firestore"
import {
  buildSidebarList,
  getTaskProjectIdForRealProject,
  type SidebarProject,
} from "@/components/tasks/task-project-sidebar"
import { TaskFlatTable } from "@/components/tasks/task-flat-table"
import { TaskFilterBar } from "@/components/tasks/task-filter-bar"
import { ProjectInfoPanel } from "@/components/tasks/project-info-panel"
import { ProjectNotesPanel } from "@/components/tasks/project-notes-panel"
import { HistoryNavigator } from "@/components/tasks/history-navigator"
import { CustomFieldDialog } from "@/components/tasks/custom-field-dialog"
import { getNextStatus } from "@/components/tasks/task-status-badge"
import { getNextPriority } from "@/components/tasks/task-priority-badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import type {
  Project,
  TaskProject,
  Task,
  TaskFilter,
  CustomFieldDefinition,
  ProjectInfoFieldType,
  TaskPriorityLevel,
} from "@/types"

export default function TasksPage() {
  const { user } = useAuth()

  // Core state
  const [realProjects, setRealProjects] = useState<Project[]>([])
  const [taskProjects, setTaskProjects] = useState<TaskProject[]>([])
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [activeTaskProjectId, setActiveTaskProjectId] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([])
  const [filter, setFilter] = useState<TaskFilter>("open")
  const [loading, setLoading] = useState(true)

  // History state
  const [viewingDate, setViewingDate] = useState<string | null>(null)
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [snapshotTasks, setSnapshotTasks] = useState<Task[]>([])
  const [snapshotNotes, setSnapshotNotes] = useState("")

  // Modals
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [showAddFieldDialog, setShowAddFieldDialog] = useState(false)

  // Form state for new standalone task list
  const [projectForm, setProjectForm] = useState({
    code: "",
    name: "",
    priority: "ACTIVE",
    priorityLevel: "active" as TaskPriorityLevel,
    status: "",
  })

  const snapshotCreatedRef = useRef<string | null>(null)

  // Subscribe to real projects
  useEffect(() => {
    if (!user) return
    const unsub = subscribeToProjects(
      user,
      (data) => setRealProjects(data),
      (err) => console.error("Error loading real projects:", err),
    )
    return () => unsub()
  }, [user])

  // Subscribe to task projects
  useEffect(() => {
    if (!user) return
    const unsub = subscribeToTaskProjects(
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
    return () => unsub()
  }, [user])

  // Build combined project list for dropdown
  const sidebarProjects: SidebarProject[] = buildSidebarList(realProjects, taskProjects)

  // Auto-select first project
  useEffect(() => {
    if (loading || activeProjectId) return
    if (sidebarProjects.length > 0) {
      setActiveProjectId(sidebarProjects[0].id)
    }
  }, [loading, sidebarProjects, activeProjectId])

  // Resolve the taskProject ID for the active selection
  useEffect(() => {
    if (!activeProjectId || !user) {
      setActiveTaskProjectId(null)
      return
    }

    const isRealProject = realProjects.some((p) => p.id === activeProjectId)

    if (!isRealProject) {
      setActiveTaskProjectId(activeProjectId)
      return
    }

    const linkedId = getTaskProjectIdForRealProject(activeProjectId, taskProjects)
    if (linkedId) {
      setActiveTaskProjectId(linkedId)
    } else {
      const rp = realProjects.find((p) => p.id === activeProjectId)
      if (!rp) return

      createTaskProject({
        code: rp.storeNumber,
        name: rp.storeName,
        priority: "ACTIVE",
        priorityLevel: "active",
        status: rp.status,
        linkedProjectId: rp.id,
        orgId: user.orgId,
        createdBy: user.uid,
        migrated: true,
      }).then((newId) => {
        setTimeout(() => setActiveTaskProjectId(newId), 600)
      }).catch(() => {
        toast.error("Failed to initialize task project")
      })
    }
  }, [activeProjectId, realProjects, taskProjects, user])

  // Subscribe to tasks and custom fields
  useEffect(() => {
    if (!activeTaskProjectId) return
    setTasks([])
    setCustomFields([])

    const unsubTasks = subscribeToProjectTasks(
      activeTaskProjectId,
      (data) => setTasks(data),
      (err) => console.error("Error loading tasks:", err),
    )

    const unsubFields = subscribeToCustomFields(
      activeTaskProjectId,
      (data) => setCustomFields(data),
      (err) => console.error("Error loading custom fields:", err),
    )

    return () => { unsubTasks(); unsubFields() }
  }, [activeTaskProjectId])

  // Load available snapshot dates
  useEffect(() => {
    if (!activeTaskProjectId) return
    getAvailableSnapshotDates(activeTaskProjectId).then(setAvailableDates).catch(() => setAvailableDates([]))
  }, [activeTaskProjectId])

  // Auto-migrate old projects
  useEffect(() => {
    if (!activeTaskProjectId) return
    const tp = taskProjects.find((p) => p.id === activeTaskProjectId)
    if (tp && !tp.migrated) {
      migrateProjectToFlatTasks(activeTaskProjectId).catch((err) => console.error("Migration failed:", err))
    }
  }, [activeTaskProjectId, taskProjects])

  // Auto-create today's snapshot
  useEffect(() => {
    if (!activeTaskProjectId || tasks.length === 0) return
    const today = new Date().toISOString().slice(0, 10)
    if (snapshotCreatedRef.current === `${activeTaskProjectId}-${today}`) return
    snapshotCreatedRef.current = `${activeTaskProjectId}-${today}`

    const tp = taskProjects.find((p) => p.id === activeTaskProjectId)
    createTaskSnapshot(activeTaskProjectId, today, tasks, tp?.notes || "").then(() => {
      if (!availableDates.includes(today)) {
        setAvailableDates((prev) => [...prev, today].sort())
      }
    }).catch(() => {})
  }, [activeTaskProjectId, tasks, taskProjects, availableDates])

  // Load snapshot when navigating history
  useEffect(() => {
    if (!viewingDate || !activeTaskProjectId) {
      setSnapshotTasks([])
      setSnapshotNotes("")
      return
    }
    getTaskSnapshot(activeTaskProjectId, viewingDate).then((snap) => {
      if (snap) {
        setSnapshotTasks(snap.tasks)
        setSnapshotNotes(snap.projectNotes)
      } else {
        setSnapshotTasks([])
        setSnapshotNotes("")
        toast.info("No snapshot available for this date")
      }
    }).catch(() => toast.error("Failed to load snapshot"))
  }, [viewingDate, activeTaskProjectId])

  // Reset history when switching projects
  useEffect(() => {
    setViewingDate(null)
    setSnapshotTasks([])
    setSnapshotNotes("")
    snapshotCreatedRef.current = null
  }, [activeTaskProjectId])

  const activeTaskProject = taskProjects.find((p) => p.id === activeTaskProjectId)
  const isHistorical = viewingDate !== null
  const displayTasks = isHistorical ? snapshotTasks : tasks
  const displayNotes = isHistorical ? snapshotNotes : (activeTaskProject?.notes || "")

  // ─── Handlers ───────────────────────────────────────────────

  const handleCreateProject = async () => {
    if (!user || !projectForm.code || !projectForm.name) {
      toast.error("Code and Name are required")
      return
    }
    try {
      const newId = await createTaskProject({
        ...projectForm,
        orgId: user.orgId,
        createdBy: user.uid,
        migrated: true,
      })
      toast.success("Task list created")
      setShowNewProjectModal(false)
      setProjectForm({ code: "", name: "", priority: "ACTIVE", priorityLevel: "active", status: "" })
      setActiveProjectId(newId)
    } catch {
      toast.error("Failed to create task list")
    }
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
    } catch { toast.error("Failed to add task") }
  }

  const handleToggleCheck = async (taskId: string) => {
    if (!activeTaskProjectId) return
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    try {
      await updateProjectTask(activeTaskProjectId, taskId, {
        checked: !task.checked,
        status: !task.checked ? "DONE" : "PENDING",
      })
    } catch { toast.error("Failed to update task") }
  }

  const handleUpdateText = async (taskId: string, text: string) => {
    if (!activeTaskProjectId) return
    try { await updateProjectTask(activeTaskProjectId, taskId, { text }) } catch { toast.error("Failed to update") }
  }

  const handleUpdateNotes = async (taskId: string, notes: string) => {
    if (!activeTaskProjectId) return
    try { await updateProjectTask(activeTaskProjectId, taskId, { notes }) } catch { toast.error("Failed to update") }
  }

  const handleCycleStatus = async (taskId: string) => {
    if (!activeTaskProjectId) return
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    const newStatus = getNextStatus(task.status)
    try {
      await updateProjectTask(activeTaskProjectId, taskId, { status: newStatus, checked: newStatus === "DONE" })
    } catch { toast.error("Failed to update status") }
  }

  const handleCyclePriority = async (taskId: string) => {
    if (!activeTaskProjectId) return
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    try {
      await updateProjectTask(activeTaskProjectId, taskId, { priority: getNextPriority(task.priority) })
    } catch { toast.error("Failed to update priority") }
  }

  const handleUpdateDueDate = async (taskId: string, date: string) => {
    if (!activeTaskProjectId) return
    try { await updateProjectTask(activeTaskProjectId, taskId, { dueDate: date || undefined }) } catch { toast.error("Failed to update") }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!activeTaskProjectId) return
    try { await deleteProjectTask(activeTaskProjectId, taskId) } catch { toast.error("Failed to delete") }
  }

  const handleUpdateProjectNotes = useCallback(async (notes: string) => {
    if (!activeTaskProjectId) return
    try { await updateProjectNotes(activeTaskProjectId, notes) } catch { toast.error("Failed to save notes") }
  }, [activeTaskProjectId])

  const handleUpdateProjectInfo = useCallback(async (info: Record<string, { label: string; type: ProjectInfoFieldType; value: string | number | boolean | null }>) => {
    if (!activeTaskProjectId) return
    try { await updateProjectInfo(activeTaskProjectId, info) } catch { toast.error("Failed to update") }
  }, [activeTaskProjectId])

  const handleAddCustomField = async (field: { label: string; type: ProjectInfoFieldType; value: string | number | boolean | null; sortOrder: number; pinned: boolean }) => {
    if (!activeTaskProjectId) return
    try { await createCustomField(activeTaskProjectId, field); toast.success("Field added") } catch { toast.error("Failed to add field") }
  }

  const handleUpdateCustomField = async (fieldId: string, updates: Partial<CustomFieldDefinition>) => {
    if (!activeTaskProjectId) return
    try { await updateCustomField(activeTaskProjectId, fieldId, updates) } catch { toast.error("Failed to update") }
  }

  const handleDeleteCustomField = async (fieldId: string) => {
    if (!activeTaskProjectId) return
    try { await deleteCustomField(activeTaskProjectId, fieldId) } catch { toast.error("Failed to delete") }
  }

  // ─── Render ─────────────────────────────────────────────────

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Topbar with project dropdown */}
      <div className="bg-white border-b border-border px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
        <Select
          value={activeProjectId || ""}
          onValueChange={(val) => setActiveProjectId(val)}
        >
          <SelectTrigger className="w-64 h-8 text-xs font-medium">
            <SelectValue placeholder="Select a project..." />
          </SelectTrigger>
          <SelectContent>
            {/* Real projects */}
            {realProjects.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Projects
                </div>
                {realProjects.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">
                    {p.storeNumber} — {p.storeName}
                  </SelectItem>
                ))}
              </>
            )}
            {/* Standalone task lists */}
            {taskProjects.filter((tp) => !tp.linkedProjectId).length > 0 && (
              <>
                <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
                  Task Lists
                </div>
                {taskProjects.filter((tp) => !tp.linkedProjectId).map((tp) => (
                  <SelectItem key={tp.id} value={tp.id} className="text-xs">
                    {tp.code} — {tp.name}
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>

        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowNewProjectModal(true)}>
          <Plus className="size-3.5" />
          New List
        </Button>

        <div className="flex-1" />

        {activeTaskProject?.status && (
          <span className="text-[11px] text-muted-foreground">{activeTaskProject.status}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Task area */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : !activeTaskProject ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
              <div className="size-14 rounded-2xl bg-muted flex items-center justify-center">
                <Plus className="size-7 opacity-40" />
              </div>
              <div className="text-center">
                <p className="font-medium text-sm">Select a project above to manage tasks</p>
                <p className="text-xs mt-1">Or create a standalone task list</p>
              </div>
            </div>
          ) : (
            <>
              {/* Filter bar */}
              <div className="mb-3">
                <TaskFilterBar filter={filter} tasks={tasks} onFilterChange={setFilter} />
              </div>

              {/* Historical mode banner */}
              {isHistorical && (
                <div className="mb-3 px-3 py-2 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">
                  Viewing snapshot from {viewingDate} (read-only)
                </div>
              )}

              {/* Task table */}
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

              {/* Project Notes */}
              <ProjectNotesPanel
                notes={displayNotes}
                isHistorical={isHistorical}
                onUpdateNotes={handleUpdateProjectNotes}
              />

              {/* History Navigator */}
              <HistoryNavigator
                currentDate={viewingDate}
                availableDates={availableDates}
                onNavigate={setViewingDate}
              />
            </>
          )}
        </div>

        {/* Project Info Panel */}
        {activeTaskProject && (
          <ProjectInfoPanel
            project={activeTaskProject}
            customFields={customFields}
            onUpdateProjectInfo={handleUpdateProjectInfo}
            onAddCustomField={handleAddCustomField}
            onUpdateCustomField={handleUpdateCustomField}
            onDeleteCustomField={handleDeleteCustomField}
            onShowAddField={() => setShowAddFieldDialog(true)}
          />
        )}
      </div>

      {/* Custom Field Dialog */}
      <CustomFieldDialog
        open={showAddFieldDialog}
        onOpenChange={setShowAddFieldDialog}
        onSave={handleAddCustomField}
        nextSortOrder={customFields.length}
      />

      {/* New Task List Modal */}
      <Dialog open={showNewProjectModal} onOpenChange={setShowNewProjectModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New Task List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Code</Label>
              <Input
                value={projectForm.code}
                onChange={(e) => setProjectForm({ ...projectForm, code: e.target.value.toUpperCase() })}
                placeholder="e.g. DAILY, MISC"
              />
            </div>
            <div>
              <Label>Name</Label>
              <Input
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                placeholder="Short description"
              />
            </div>
            <div>
              <Label>Priority</Label>
              <Select
                value={`${projectForm.priority}|${projectForm.priorityLevel}`}
                onValueChange={(val) => {
                  const [priority, level] = val.split("|")
                  setProjectForm({ ...projectForm, priority, priorityLevel: level as TaskPriorityLevel })
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGHEST PRIORITY|highest">Highest Priority</SelectItem>
                  <SelectItem value="HIGH PRIORITY|high">High Priority</SelectItem>
                  <SelectItem value="ACTIVE|active">Active</SelectItem>
                  <SelectItem value="LOWER PRIORITY|lower">Lower Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowNewProjectModal(false)}>Cancel</Button>
              <Button onClick={handleCreateProject}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
