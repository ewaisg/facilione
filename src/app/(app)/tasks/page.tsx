"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useAuth } from "@/lib/firebase/auth-context"
import {
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
import { TaskProjectSidebar } from "@/components/tasks/task-project-sidebar"
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
import { Loader2, Plus, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { toast } from "sonner"
import type {
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
  const [projects, setProjects] = useState<TaskProject[]>([])
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([])
  const [filter, setFilter] = useState<TaskFilter>("open")
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // History state
  const [viewingDate, setViewingDate] = useState<string | null>(null)
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [snapshotTasks, setSnapshotTasks] = useState<Task[]>([])
  const [snapshotNotes, setSnapshotNotes] = useState("")

  // Modals
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [showEditProjectModal, setShowEditProjectModal] = useState(false)
  const [showAddFieldDialog, setShowAddFieldDialog] = useState(false)
  const [editingProject, setEditingProject] = useState<TaskProject | null>(null)

  // Form state
  const [projectForm, setProjectForm] = useState({
    code: "",
    name: "",
    priority: "ACTIVE",
    priorityLevel: "active" as TaskPriorityLevel,
    status: "",
    gcInfo: "",
  })

  // Snapshot creation ref (prevent duplicate)
  const snapshotCreatedRef = useRef<string | null>(null)

  // Subscribe to projects
  useEffect(() => {
    if (!user) return
    const unsub = subscribeToTaskProjects(
      user,
      (data) => {
        setProjects(data)
        if (data.length > 0 && !activeProjectId) {
          setActiveProjectId(data[0].id)
        }
        setLoading(false)
      },
      (err) => {
        console.error("Error loading task projects:", err)
        toast.error("Failed to load task projects")
        setLoading(false)
      },
    )
    return () => unsub()
  }, [user, activeProjectId])

  // Subscribe to tasks and custom fields for active project
  useEffect(() => {
    if (!activeProjectId) return

    const unsubTasks = subscribeToProjectTasks(
      activeProjectId,
      (data) => setTasks(data),
      (err) => {
        console.error("Error loading tasks:", err)
        toast.error("Failed to load tasks")
      },
    )

    const unsubFields = subscribeToCustomFields(
      activeProjectId,
      (data) => setCustomFields(data),
      (err) => console.error("Error loading custom fields:", err),
    )

    return () => {
      unsubTasks()
      unsubFields()
    }
  }, [activeProjectId])

  // Load available snapshot dates
  useEffect(() => {
    if (!activeProjectId) return
    getAvailableSnapshotDates(activeProjectId).then(setAvailableDates).catch(() => setAvailableDates([]))
  }, [activeProjectId])

  // Auto-migrate old projects to flat structure
  useEffect(() => {
    const project = projects.find((p) => p.id === activeProjectId)
    if (project && !project.migrated && activeProjectId) {
      migrateProjectToFlatTasks(activeProjectId).catch((err) => {
        console.error("Migration failed:", err)
      })
    }
  }, [activeProjectId, projects])

  // Auto-create today's snapshot
  useEffect(() => {
    if (!activeProjectId || tasks.length === 0) return
    const today = new Date().toISOString().slice(0, 10)
    if (snapshotCreatedRef.current === `${activeProjectId}-${today}`) return
    snapshotCreatedRef.current = `${activeProjectId}-${today}`

    const project = projects.find((p) => p.id === activeProjectId)
    createTaskSnapshot(activeProjectId, today, tasks, project?.notes || "").then(() => {
      if (!availableDates.includes(today)) {
        setAvailableDates((prev) => [...prev, today].sort())
      }
    }).catch(() => {})
  }, [activeProjectId, tasks, projects, availableDates])

  // Load snapshot when navigating history
  useEffect(() => {
    if (!viewingDate || !activeProjectId) {
      setSnapshotTasks([])
      setSnapshotNotes("")
      return
    }
    getTaskSnapshot(activeProjectId, viewingDate).then((snap) => {
      if (snap) {
        setSnapshotTasks(snap.tasks)
        setSnapshotNotes(snap.projectNotes)
      } else {
        setSnapshotTasks([])
        setSnapshotNotes("")
        toast.info("No snapshot available for this date")
      }
    }).catch(() => {
      toast.error("Failed to load snapshot")
    })
  }, [viewingDate, activeProjectId])

  // Reset history when switching projects
  useEffect(() => {
    setViewingDate(null)
    setSnapshotTasks([])
    setSnapshotNotes("")
    snapshotCreatedRef.current = null
  }, [activeProjectId])

  const activeProject = projects.find((p) => p.id === activeProjectId)
  const isHistorical = viewingDate !== null
  const displayTasks = isHistorical ? snapshotTasks : tasks
  const displayNotes = isHistorical ? snapshotNotes : (activeProject?.notes || "")

  // ─── Handlers ───────────────────────────────────────────────

  const handleCreateProject = async () => {
    if (!user || !projectForm.code || !projectForm.name) {
      toast.error("Project Code and Name are required")
      return
    }
    try {
      await createTaskProject({
        ...projectForm,
        orgId: user.orgId,
        createdBy: user.uid,
        migrated: true,
      })
      toast.success("Project created")
      setShowNewProjectModal(false)
      setProjectForm({ code: "", name: "", priority: "ACTIVE", priorityLevel: "active", status: "", gcInfo: "" })
    } catch {
      toast.error("Failed to create project")
    }
  }

  const handleUpdateProject = async () => {
    if (!editingProject || !projectForm.code || !projectForm.name) return
    try {
      await updateTaskProject(editingProject.id, projectForm)
      toast.success("Project updated")
      setShowEditProjectModal(false)
      setEditingProject(null)
    } catch {
      toast.error("Failed to update project")
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project || !confirm(`Delete "${project.code} — ${project.name}"?\n\nThis cannot be undone.`)) return
    try {
      await deleteTaskProject(projectId)
      toast.success("Project deleted")
      if (activeProjectId === projectId) {
        setActiveProjectId(projects.find((p) => p.id !== projectId)?.id || null)
      }
    } catch {
      toast.error("Failed to delete project")
    }
  }

  const handleAddTask = async () => {
    if (!activeProjectId) return
    try {
      await createProjectTask(activeProjectId, {
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
    if (!activeProjectId) return
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    try {
      await updateProjectTask(activeProjectId, taskId, {
        checked: !task.checked,
        status: !task.checked ? "DONE" : "PENDING",
      })
    } catch {
      toast.error("Failed to update task")
    }
  }

  const handleUpdateText = async (taskId: string, text: string) => {
    if (!activeProjectId) return
    try {
      await updateProjectTask(activeProjectId, taskId, { text })
    } catch {
      toast.error("Failed to update task")
    }
  }

  const handleUpdateNotes = async (taskId: string, notes: string) => {
    if (!activeProjectId) return
    try {
      await updateProjectTask(activeProjectId, taskId, { notes })
    } catch {
      toast.error("Failed to update notes")
    }
  }

  const handleCycleStatus = async (taskId: string) => {
    if (!activeProjectId) return
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    const newStatus = getNextStatus(task.status)
    try {
      await updateProjectTask(activeProjectId, taskId, {
        status: newStatus,
        checked: newStatus === "DONE",
      })
    } catch {
      toast.error("Failed to update status")
    }
  }

  const handleCyclePriority = async (taskId: string) => {
    if (!activeProjectId) return
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    try {
      await updateProjectTask(activeProjectId, taskId, {
        priority: getNextPriority(task.priority),
      })
    } catch {
      toast.error("Failed to update priority")
    }
  }

  const handleUpdateDueDate = async (taskId: string, date: string) => {
    if (!activeProjectId) return
    try {
      await updateProjectTask(activeProjectId, taskId, { dueDate: date || undefined })
    } catch {
      toast.error("Failed to update due date")
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!activeProjectId) return
    try {
      await deleteProjectTask(activeProjectId, taskId)
    } catch {
      toast.error("Failed to delete task")
    }
  }

  const handleUpdateProjectNotes = useCallback(async (notes: string) => {
    if (!activeProjectId) return
    try {
      await updateProjectNotes(activeProjectId, notes)
    } catch {
      toast.error("Failed to save notes")
    }
  }, [activeProjectId])

  const handleUpdateProjectInfo = useCallback(async (info: Record<string, { label: string; type: ProjectInfoFieldType; value: string | number | boolean | null }>) => {
    if (!activeProjectId) return
    try {
      await updateProjectInfo(activeProjectId, info)
    } catch {
      toast.error("Failed to update project info")
    }
  }, [activeProjectId])

  const handleAddCustomField = async (field: { label: string; type: ProjectInfoFieldType; value: string | number | boolean | null; sortOrder: number; pinned: boolean }) => {
    if (!activeProjectId) return
    try {
      await createCustomField(activeProjectId, field)
      toast.success("Field added")
    } catch {
      toast.error("Failed to add field")
    }
  }

  const handleUpdateCustomField = async (fieldId: string, updates: Partial<CustomFieldDefinition>) => {
    if (!activeProjectId) return
    try {
      await updateCustomField(activeProjectId, fieldId, updates)
    } catch {
      toast.error("Failed to update field")
    }
  }

  const handleDeleteCustomField = async (fieldId: string) => {
    if (!activeProjectId) return
    try {
      await deleteCustomField(activeProjectId, fieldId)
    } catch {
      toast.error("Failed to delete field")
    }
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
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-60 bg-brand-900 flex-shrink-0 flex flex-col">
          <TaskProjectSidebar
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={setActiveProjectId}
            onEditProject={(id) => {
              const proj = projects.find((p) => p.id === id)
              if (proj) {
                setEditingProject(proj)
                setProjectForm({
                  code: proj.code,
                  name: proj.name,
                  priority: proj.priority,
                  priorityLevel: proj.priorityLevel,
                  status: proj.status,
                  gcInfo: proj.gcInfo || "",
                })
                setShowEditProjectModal(true)
              }
            }}
            onDeleteProject={handleDeleteProject}
          />
          <div className="p-3 border-t border-white/10">
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="w-full flex items-center justify-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
            >
              <Plus className="size-4" />
              New Project
            </button>
          </div>
        </div>
      )}

      {/* Main workspace */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <div className="bg-white border-b border-border px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
          <Button variant="ghost" size="sm" className="size-7 p-0" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
          </Button>

          <h2 className="text-sm font-bold text-foreground flex-1 truncate">
            {activeProject ? `${activeProject.code} — ${activeProject.name}` : "Select a project"}
          </h2>

          {activeProject && (
            <span className="text-[11px] text-muted-foreground">{activeProject.status}</span>
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
            ) : !activeProject ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                <div className="size-14 rounded-2xl bg-muted flex items-center justify-center">
                  <Plus className="size-7 opacity-40" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm">
                    {projects.length === 0 ? "No task projects yet" : "Select a project from the sidebar"}
                  </p>
                  <p className="text-xs mt-1">
                    {projects.length === 0 ? "Create your first task project" : "Or create a new one"}
                  </p>
                </div>
                {projects.length === 0 && (
                  <Button onClick={() => setShowNewProjectModal(true)} className="gap-2">
                    <Plus className="size-4" />
                    Create First Project
                  </Button>
                )}
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

          {/* Project Info Panel (right side, always visible when project is active) */}
          {activeProject && (
            <ProjectInfoPanel
              project={activeProject}
              customFields={customFields}
              onUpdateProjectInfo={handleUpdateProjectInfo}
              onAddCustomField={handleAddCustomField}
              onUpdateCustomField={handleUpdateCustomField}
              onDeleteCustomField={handleDeleteCustomField}
              onShowAddField={() => setShowAddFieldDialog(true)}
            />
          )}
        </div>
      </div>

      {/* Custom Field Dialog */}
      <CustomFieldDialog
        open={showAddFieldDialog}
        onOpenChange={setShowAddFieldDialog}
        onSave={handleAddCustomField}
        nextSortOrder={customFields.length}
      />

      {/* New Project Modal */}
      <Dialog open={showNewProjectModal} onOpenChange={setShowNewProjectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Task Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Project Code</Label>
              <Input
                value={projectForm.code}
                onChange={(e) => setProjectForm({ ...projectForm, code: e.target.value.toUpperCase() })}
                placeholder="KS-XX"
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
            <div>
              <Label>Status</Label>
              <Input
                value={projectForm.status}
                onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                placeholder="e.g. Estimate in Progress"
              />
            </div>
            <div>
              <Label>GC / Extra Info (optional)</Label>
              <Input
                value={projectForm.gcInfo}
                onChange={(e) => setProjectForm({ ...projectForm, gcInfo: e.target.value })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowNewProjectModal(false)}>Cancel</Button>
              <Button onClick={handleCreateProject}>Create Project</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Project Modal */}
      <Dialog open={showEditProjectModal} onOpenChange={setShowEditProjectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Project Code</Label>
              <Input
                value={projectForm.code}
                onChange={(e) => setProjectForm({ ...projectForm, code: e.target.value.toUpperCase() })}
              />
            </div>
            <div>
              <Label>Name</Label>
              <Input
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
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
            <div>
              <Label>Status</Label>
              <Input
                value={projectForm.status}
                onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
              />
            </div>
            <div>
              <Label>GC / Extra Info</Label>
              <Input
                value={projectForm.gcInfo}
                onChange={(e) => setProjectForm({ ...projectForm, gcInfo: e.target.value })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowEditProjectModal(false)}>Cancel</Button>
              <Button onClick={handleUpdateProject}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
