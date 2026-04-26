/**
 * Tasks Hub - Main task management page
 */

"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/firebase/auth-context"
import {
  subscribeToTaskProjects,
  subscribeToTaskSections,
  subscribeToNextSteps,
  createTaskProject,
  updateTaskProject,
  deleteTaskProject,
  createTaskSection,
  updateTaskSection,
  deleteTaskSection,
  createTask,
  updateTask,
  deleteTask,
  createNextStep,
  updateNextStep,
  deleteNextStep,
  getTasks,
} from "@/lib/firebase/firestore"
import { TaskProjectSidebar } from "@/components/tasks/task-project-sidebar"
import { TaskSection } from "@/components/tasks/task-section"
import { NextStepsList } from "@/components/tasks/next-steps-list"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Settings } from "lucide-react"
import { toast } from "sonner"
import { getNextStatus } from "@/components/tasks/task-status-badge"
import type { TaskProject, TaskSection as TaskSectionType, Task, NextStep } from "@/types"

export default function TasksPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<TaskProject[]>([])
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [sections, setSections] = useState<TaskSectionType[]>([])
  const [tasksBySection, setTasksBySection] = useState<Record<string, Task[]>>({})
  const [nextSteps, setNextSteps] = useState<NextStep[]>([])
  const [loading, setLoading] = useState(true)

  // Modals
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [showEditProjectModal, setShowEditProjectModal] = useState(false)
  const [showNewSectionModal, setShowNewSectionModal] = useState(false)
  const [editingProject, setEditingProject] = useState<TaskProject | null>(null)

  // Form state
  const [projectForm, setProjectForm] = useState<{
    id: string
    name: string
    priority: string
    priorityLevel: "highest" | "high" | "active" | "lower"
    status: string
    gcInfo: string
  }>({
    id: "",
    name: "",
    priority: "ACTIVE",
    priorityLevel: "active",
    status: "",
    gcInfo: "",
  })

  const [sectionForm, setSectionForm] = useState<{
    label: string
    type: "tasks" | "notes"
  }>({
    label: "",
    type: "tasks",
  })

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

  // Subscribe to sections and next steps for active project
  useEffect(() => {
    if (!activeProjectId) return

    const unsubSections = subscribeToTaskSections(
      activeProjectId,
      (data) => setSections(data),
      (err) => {
        console.error("Error loading sections:", err)
        toast.error("Failed to load sections")
      },
    )

    const unsubSteps = subscribeToNextSteps(
      activeProjectId,
      (data) => setNextSteps(data),
      (err) => {
        console.error("Error loading next steps:", err)
        toast.error("Failed to load next steps")
      },
    )

    return () => {
      unsubSections()
      unsubSteps()
    }
  }, [activeProjectId])

  // Load tasks for each section
  useEffect(() => {
    if (sections.length === 0) return

    const loadTasks = async () => {
      const tasksData: Record<string, Task[]> = {}
      for (const section of sections) {
        if (section.type === "tasks") {
          const tasks = await getTasks(section.projectId, section.id)
          tasksData[section.id] = tasks
        }
      }
      setTasksBySection(tasksData)
    }

    loadTasks()
  }, [sections])

  const activeProject = projects.find((p) => p.id === activeProjectId)

  // Handlers
  const handleCreateProject = async () => {
    if (!user || !projectForm.id || !projectForm.name) {
      toast.error("Project ID and Name are required")
      return
    }

    try {
      await createTaskProject(
        {
          ...projectForm,
          orgId: user.orgId,
          createdBy: user.uid,
        },
        [{label: "PENDING", type: "tasks", sortOrder: 0}],
      )
      toast.success("Project created")
      setShowNewProjectModal(false)
      setProjectForm({ id: "", name: "", priority: "ACTIVE", priorityLevel: "active", status: "", gcInfo: "" })
    } catch (err) {
      console.error(err)
      toast.error("Failed to create project")
    }
  }

  const handleUpdateProject = async () => {
    if (!editingProject || !projectForm.id || !projectForm.name) {
      toast.error("Project ID and Name are required")
      return
    }

    try {
      await updateTaskProject(editingProject.id, projectForm)
      toast.success("Project updated")
      setShowEditProjectModal(false)
      setEditingProject(null)
    } catch (err) {
      console.error(err)
      toast.error("Failed to update project")
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) return

    if (!confirm(`Delete "${project.id} — ${project.name}"?\n\nThis will delete all sections, tasks, and next steps. This cannot be undone.`)) {
      return
    }

    try {
      await deleteTaskProject(projectId)
      toast.success("Project deleted")
      if (activeProjectId === projectId) {
        setActiveProjectId(projects[0]?.id || null)
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to delete project")
    }
  }

  const handleCreateSection = async () => {
    if (!activeProjectId || !sectionForm.label) {
      toast.error("Section name is required")
      return
    }

    try {
      await createTaskSection(activeProjectId, {
        ...sectionForm,
        sortOrder: sections.length,
      })
      toast.success("Section created")
      setShowNewSectionModal(false)
      setSectionForm({ label: "", type: "tasks" })
    } catch (err) {
      console.error(err)
      toast.error("Failed to create section")
    }
  }

  const handleRenameSection = async (sectionId: string, newLabel: string) => {
    if (!activeProjectId) return
    try {
      await updateTaskSection(activeProjectId, sectionId, { label: newLabel.toUpperCase() })
      toast.success("Section renamed")
    } catch (err) {
      console.error(err)
      toast.error("Failed to rename section")
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    if (!activeProjectId) return
    try {
      await deleteTaskSection(activeProjectId, sectionId)
      toast.success("Section deleted")
    } catch (err) {
      console.error(err)
      toast.error("Failed to delete section")
    }
  }

  const handleUpdateNotes = async (sectionId: string, notes: string) => {
    if (!activeProjectId) return
    try {
      await updateTaskSection(activeProjectId, sectionId, { notesContent: notes })
    } catch (err) {
      console.error(err)
      toast.error("Failed to update notes")
    }
  }

  const handleAddTask = async (sectionId: string) => {
    if (!activeProjectId) return
    try {
      const tasks = tasksBySection[sectionId] || []
      await createTask(activeProjectId, sectionId, {
        text: "New task — click to edit",
        status: "PENDING",
        notes: "",
        checked: false,
        sortOrder: tasks.length,
      })
    } catch (err) {
      console.error(err)
      toast.error("Failed to add task")
    }
  }

  const handleToggleCheck = async (taskId: string, sectionId: string) => {
    if (!activeProjectId) return
    const task = tasksBySection[sectionId]?.find((t) => t.id === taskId)
    if (!task) return

    try {
      await updateTask(activeProjectId, sectionId, taskId, {
        checked: !task.checked,
        status: !task.checked ? "DONE" : "PENDING",
      })
    } catch (err) {
      console.error(err)
      toast.error("Failed to toggle task")
    }
  }

  const handleUpdateText = async (taskId: string, sectionId: string, text: string) => {
    if (!activeProjectId) return
    try {
      await updateTask(activeProjectId, sectionId, taskId, { text })
    } catch (err) {
      console.error(err)
      toast.error("Failed to update task")
    }
  }

  const handleUpdateTaskNotes = async (taskId: string, sectionId: string, notes: string) => {
    if (!activeProjectId) return
    try {
      await updateTask(activeProjectId, sectionId, taskId, { notes })
    } catch (err) {
      console.error(err)
      toast.error("Failed to update notes")
    }
  }

  const handleCycleStatus = async (taskId: string, sectionId: string) => {
    if (!activeProjectId) return
    const task = tasksBySection[sectionId]?.find((t) => t.id === taskId)
    if (!task) return

    const newStatus = getNextStatus(task.status)

    try {
      await updateTask(activeProjectId, sectionId, taskId, {
        status: newStatus,
        checked: newStatus === "DONE",
      })
    } catch (err) {
      console.error(err)
      toast.error("Failed to update status")
    }
  }

  const handleDeleteTask = async (taskId: string, sectionId: string) => {
    if (!activeProjectId || !confirm("Delete this task?")) return
    try {
      await deleteTask(activeProjectId, sectionId, taskId)
    } catch (err) {
      console.error(err)
      toast.error("Failed to delete task")
    }
  }

  const handleAddStep = async () => {
    if (!activeProjectId) return
    try {
      await createNextStep(activeProjectId, "New step — click to edit", nextSteps.length)
    } catch (err) {
      console.error(err)
      toast.error("Failed to add step")
    }
  }

  const handleUpdateStep = async (stepId: string, text: string) => {
    if (!activeProjectId) return
    try {
      await updateNextStep(activeProjectId, stepId, text)
    } catch (err) {
      console.error(err)
      toast.error("Failed to update step")
    }
  }

  const handleDeleteStep = async (stepId: string) => {
    if (!activeProjectId) return
    try {
      await deleteNextStep(activeProjectId, stepId)
    } catch (err) {
      console.error(err)
      toast.error("Failed to delete step")
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-60 bg-navy flex-shrink-0">
        <TaskProjectSidebar
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={setActiveProjectId}
          onEditProject={(id) => {
            const proj = projects.find((p) => p.id === id)
            if (proj) {
              setEditingProject(proj)
              setProjectForm({
                id: proj.id,
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

        {/* Footer */}
        <div className="p-3 border-t border-white/10">
          <Button
            onClick={() => setShowNewProjectModal(true)}
            className="w-full"
            variant="outline"
            size="sm"
          >
            <Plus className="size-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="bg-white border-b border-border px-5 py-3 flex items-center gap-3 flex-shrink-0">
          <h2 className="text-sm font-bold text-navy flex-1">
            {activeProject ? `${activeProject.id} — ${activeProject.name}` : "Select a project"}
          </h2>
          {activeProject && (
            <>
              <span className="text-xs text-muted-foreground">{activeProject.status}</span>
              <div className="w-px h-6 bg-border" />
              <Button size="sm" variant="outline" onClick={() => setShowNewSectionModal(true)}>
                <Plus className="size-4" />
                Section
              </Button>
            </>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : !activeProject ? (
            <div className="text-center py-20 text-muted-foreground">
              <p>Select a project from the sidebar or create a new one</p>
            </div>
          ) : (
            <>
              {/* Project Header */}
              <div className="bg-navy text-white p-4 rounded-t-md">
                <div className="text-lg font-bold">{activeProject.id}</div>
                <div className="text-sm text-blue-200">{activeProject.name}</div>
              </div>

              <div className="bg-blue-100 border border-border border-t-0 px-4 py-2 text-xs flex gap-3">
                <span className="font-bold text-navy">{activeProject.priority}</span>
                <span className="text-muted-foreground">|</span>
                <span>{activeProject.status}</span>
                {activeProject.gcInfo && (
                  <>
                    <span className="text-muted-foreground">|</span>
                    <span className="italic">{activeProject.gcInfo}</span>
                  </>
                )}
              </div>

              {/* Sections */}
              {sections.map((section) => (
                <TaskSection
                  key={section.id}
                  section={section}
                  tasks={tasksBySection[section.id] || []}
                  onRenameSection={handleRenameSection}
                  onDeleteSection={handleDeleteSection}
                  onUpdateNotes={handleUpdateNotes}
                  onToggleCheck={(taskId) => handleToggleCheck(taskId, section.id)}
                  onUpdateText={(taskId, text) => handleUpdateText(taskId, section.id, text)}
                  onUpdateTaskNotes={(taskId, notes) => handleUpdateTaskNotes(taskId, section.id, notes)}
                  onCycleStatus={(taskId) => handleCycleStatus(taskId, section.id)}
                  onDeleteTask={(taskId) => handleDeleteTask(taskId, section.id)}
                  onAddTask={handleAddTask}
                />
              ))}

              {/* Next Steps */}
              <NextStepsList
                steps={nextSteps}
                onUpdateStep={handleUpdateStep}
                onDeleteStep={handleDeleteStep}
                onAddStep={handleAddStep}
              />
            </>
          )}
        </div>
      </div>

      {/* New Project Modal */}
      <Dialog open={showNewProjectModal} onOpenChange={setShowNewProjectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Task Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Project ID</Label>
              <Input
                value={projectForm.id}
                onChange={(e) => setProjectForm({ ...projectForm, id: e.target.value.toUpperCase() })}
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
                  setProjectForm({ ...projectForm, priority, priorityLevel: level as "highest" | "high" | "active" | "lower" })
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
              <Button variant="outline" onClick={() => setShowNewProjectModal(false)}>
                Cancel
              </Button>
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
              <Label>Project ID</Label>
              <Input
                value={projectForm.id}
                onChange={(e) => setProjectForm({ ...projectForm, id: e.target.value.toUpperCase() })}
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
                  setProjectForm({ ...projectForm, priority, priorityLevel: level as "highest" | "high" | "active" | "lower" })
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
              <Button variant="outline" onClick={() => setShowEditProjectModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateProject}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Section Modal */}
      <Dialog open={showNewSectionModal} onOpenChange={setShowNewSectionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Section Name</Label>
              <Input
                value={sectionForm.label}
                onChange={(e) => setSectionForm({ ...sectionForm, label: e.target.value })}
                placeholder="e.g. IN PROGRESS, NOTES, MONITORING"
              />
            </div>
            <div>
              <Label>Section Type</Label>
              <Select
                value={sectionForm.type}
                onValueChange={(val) => setSectionForm({ ...sectionForm, type: val as "tasks" | "notes" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tasks">Tasks — checklist with status and notes</SelectItem>
                  <SelectItem value="notes">Notes — freeform notepad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowNewSectionModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSection}>Add Section</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
