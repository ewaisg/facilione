"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CalendarDays,
  CheckSquare,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Sparkles,

  Trash2,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Phase } from "@/types"
import { toast } from "sonner"

// ─── Types ──────────────────────────────────────────────────────

export type TaskStatus = "past-due" | "in-progress" | "done"

export interface ProjectTask {
  id: string
  title: string
  dueDate: string | null
  status: TaskStatus
  sourcePhase?: string
  createdAt: string
}

// ─── Column config ──────────────────────────────────────────────

const COLUMNS: {
  id: TaskStatus
  label: string
  icon: React.ElementType
  badgeVariant: "danger" | "warning" | "success"
  headerClass: string
}[] = [
  {
    id: "past-due",
    label: "Past Due",
    icon: AlertTriangle,
    badgeVariant: "danger",
    headerClass: "border-t-red-500",
  },
  {
    id: "in-progress",
    label: "In Progress",
    icon: Clock,
    badgeVariant: "warning",
    headerClass: "border-t-amber-500",
  },
  {
    id: "done",
    label: "Done",
    icon: CheckCircle2,
    badgeVariant: "success",
    headerClass: "border-t-emerald-500",
  },
]

// ─── Helpers ────────────────────────────────────────────────────

function generateId() {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function classifyTaskStatus(
  dueDate: string | null,
  currentStatus: TaskStatus,
): TaskStatus {
  if (currentStatus === "done") return "done"
  if (!dueDate) return "in-progress"
  const due = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return due < today ? "past-due" : "in-progress"
}

function formatDisplayDate(dateStr: string | null): string {
  if (!dateStr) return "No date"
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

// ─── Component ──────────────────────────────────────────────────

interface TaskKanbanBoardProps {
  phases: Phase[]
  projectId: string
}

export function TaskKanbanBoard({ phases, projectId: _projectId }: TaskKanbanBoardProps) {
  const [tasks, setTasks] = useState<ProjectTask[]>([])
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDueDate, setNewDueDate] = useState("")
  const [newStatus, setNewStatus] = useState<TaskStatus>("in-progress")

  // Group tasks by column
  const grouped = useMemo(() => {
    const map: Record<TaskStatus, ProjectTask[]> = {
      "past-due": [],
      "in-progress": [],
      done: [],
    }
    for (const task of tasks) {
      const effectiveStatus = classifyTaskStatus(task.dueDate, task.status)
      map[effectiveStatus].push({ ...task, status: effectiveStatus })
    }
    // Sort past-due by oldest first, in-progress by soonest due, done by most recent
    map["past-due"].sort(
      (a, b) =>
        new Date(a.dueDate || 0).getTime() -
        new Date(b.dueDate || 0).getTime(),
    )
    map["in-progress"].sort(
      (a, b) =>
        new Date(a.dueDate || "9999").getTime() -
        new Date(b.dueDate || "9999").getTime(),
    )
    map["done"].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    return map
  }, [tasks])

  // ─── Actions ────────────────────────────────────────────────

  function handleAddTask() {
    if (!newTitle.trim()) {
      toast.error("Task title is required")
      return
    }

    const task: ProjectTask = {
      id: generateId(),
      title: newTitle.trim(),
      dueDate: newDueDate || null,
      status: newStatus,
      createdAt: new Date().toISOString(),
    }

    setTasks((prev) => [...prev, task])
    setNewTitle("")
    setNewDueDate("")
    setNewStatus("in-progress")
    setAddDialogOpen(false)
    toast.success("Task added")
  }

  function handleMoveTask(taskId: string, newStatus: TaskStatus) {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    )
  }

  function handleDeleteTask(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    toast.success("Task removed")
  }

  function handleAutoCreateFromSchedule() {
    if (phases.length === 0) {
      toast.error("No schedule phases found for this project")
      return
    }

    const newTasks: ProjectTask[] = []
    const existingTitles = new Set(tasks.map((t) => t.title.toLowerCase()))

    for (const phase of phases) {
      for (const item of phase.checklistItems) {
        const title = `${phase.name}: ${item.step}`

        // Skip if task already exists with same title
        if (existingTitles.has(title.toLowerCase())) continue

        // Skip items marked as N/A
        if (item.status === "na") continue

        const dueDate = item.completedDate || phase.targetEndDate || null
        const isDone = item.status === "complete"

        newTasks.push({
          id: generateId(),
          title,
          dueDate,
          status: isDone ? "done" : "in-progress",
          sourcePhase: phase.name,
          createdAt: new Date().toISOString(),
        })
      }
    }

    if (newTasks.length === 0) {
      toast.info("No new tasks to create from schedule")
      return
    }

    setTasks((prev) => [...prev, ...newTasks])
    toast.success(`Created ${newTasks.length} tasks from schedule`)
  }

  // ─── Render ─────────────────────────────────────────────────

  const totalTasks = tasks.length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Tasks</h3>
          <p className="text-xs text-muted-foreground">
            Track action items across your project lifecycle.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoCreateFromSchedule}
          >
            <Sparkles className="size-4" />
            Auto-create from schedule
          </Button>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Task title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddTask()
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={newStatus}
                    onValueChange={(v) => setNewStatus(v as TaskStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddTask} className="w-full">
                  Add Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Kanban Board */}
      {totalTasks === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <div className="size-14 rounded-2xl bg-muted flex items-center justify-center">
            <CheckSquare className="size-7 opacity-40" />
          </div>
          <p className="font-medium text-sm">No tasks yet</p>
          <p className="text-xs">
            Add tasks manually or auto-create them from your schedule.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => {
            const columnTasks = grouped[col.id]
            const Icon = col.icon

            return (
              <div key={col.id} className="flex flex-col gap-3">
                {/* Column header */}
                <div
                  className={cn(
                    "rounded-lg border border-t-4 bg-muted/30 px-4 py-3",
                    col.headerClass,
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{col.label}</span>
                    </div>
                    <Badge variant={col.badgeVariant} className="text-xs">
                      {columnTasks.length}
                    </Badge>
                  </div>
                </div>

                {/* Task cards */}
                <div className="space-y-2 min-h-[120px]">
                  {columnTasks.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-xs text-muted-foreground border border-dashed rounded-lg">
                      No {col.label.toLowerCase()} tasks
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onMove={handleMoveTask}
                        onDelete={handleDeleteTask}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Task Card ──────────────────────────────────────────────────

function TaskCard({
  task,
  onMove,
  onDelete,
}: {
  task: ProjectTask
  onMove: (taskId: string, newStatus: TaskStatus) => void
  onDelete: (taskId: string) => void
}) {
  const isPastDue = task.status === "past-due"
  const isDone = task.status === "done"

  // Determine which status transitions are available
  const moveOptions: { status: TaskStatus; label: string }[] = []
  if (task.status !== "in-progress")
    moveOptions.push({ status: "in-progress", label: "In Progress" })
  if (task.status !== "done")
    moveOptions.push({ status: "done", label: "Done" })

  return (
    <Card
      className={cn(
        "transition-colors",
        isPastDue && "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20",
        isDone && "opacity-70",
      )}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm font-medium leading-snug",
              isDone && "line-through text-muted-foreground",
            )}
          >
            {task.title}
          </p>
          <button
            onClick={() => onDelete(task.id)}
            className="shrink-0 text-muted-foreground hover:text-destructive transition-colors p-0.5"
            aria-label="Delete task"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          {task.dueDate ? (
            <span
              className={cn(
                "flex items-center gap-1 text-xs",
                isPastDue
                  ? "text-red-600 dark:text-red-400 font-medium"
                  : "text-muted-foreground",
              )}
            >
              <CalendarDays className="size-3" />
              {formatDisplayDate(task.dueDate)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">No due date</span>
          )}

          {moveOptions.length > 0 && (
            <div className="flex items-center gap-1">
              {moveOptions.map((opt) => (
                <button
                  key={opt.status}
                  onClick={() => onMove(task.id, opt.status)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5 px-1.5 py-0.5 rounded hover:bg-muted"
                  title={`Move to ${opt.label}`}
                >
                  {opt.status === "done" ? (
                    <CheckCircle2 className="size-3" />
                  ) : (
                    <ArrowRight className="size-3" />
                  )}
                  <span className="hidden sm:inline">{opt.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {task.sourcePhase && (
          <p className="text-[10px] text-muted-foreground truncate">
            From: {task.sourcePhase}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
