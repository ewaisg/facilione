"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Plus, Save } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn, formatCurrency, formatDate, getHealthLabel } from "@/lib/utils"
import { useAuth } from "@/lib/firebase/auth-context"
import {
  createTaskProject,
  subscribeToTaskProjects,
  updateProjectInfo,
} from "@/lib/firebase/firestore"
import type { Project, ProjectInfoFieldType, TaskProject } from "@/types"
import { DEFAULT_PROJECT_INFO_FIELDS } from "@/types"

type ProjectInfoValue = string | number | boolean | null

type ProjectInfoRecord = Record<
  string,
  {
    label: string
    type: ProjectInfoFieldType
    value: ProjectInfoValue
  }
>

interface ProjectFactsPanelProps {
  project: Project
  taskProject?: TaskProject | null
  onUpdateProjectInfo?: (projectInfo: ProjectInfoRecord) => Promise<void>
  className?: string
  compact?: boolean
}

const FIELD_TYPES: Array<{ value: ProjectInfoFieldType; label: string }> = [
  { value: "text", label: "Text" },
  { value: "long-note", label: "Long Note" },
  { value: "date", label: "Date" },
  { value: "number", label: "Number" },
  { value: "currency", label: "Currency" },
  { value: "boolean", label: "Yes / No" },
  { value: "link", label: "Link" },
]

export function ConnectedProjectFactsPanel({
  project,
  className,
  compact,
}: {
  project: Project
  className?: string
  compact?: boolean
}) {
  const { user } = useAuth()
  const [taskProjects, setTaskProjects] = useState<TaskProject[]>([])
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(false)

  useEffect(() => {
    if (!user) return

    return subscribeToTaskProjects(
      user,
      (data) => {
        setTaskProjects(data)
        setLoading(false)
      },
      (err) => {
        console.error("Error loading project facts:", err)
        setLoading(false)
      },
    )
  }, [user])

  const taskProject = useMemo(
    () => taskProjects.find((item) => item.linkedProjectId === project.id) ?? null,
    [project.id, taskProjects],
  )

  useEffect(() => {
    if (!user || loading || initializing || taskProject) return

    setInitializing(true)
    createTaskProject({
      code: project.storeNumber || "PROJECT",
      name: project.storeName || "Project Info",
      priority: "ACTIVE",
      priorityLevel: "active",
      status: project.status || "active",
      linkedProjectId: project.id,
      orgId: user.orgId,
      createdBy: user.uid,
      migrated: true,
      notes: "",
    })
      .catch((err) => {
        console.error("Failed to initialize project facts:", err)
        toast.error("Failed to initialize project info")
      })
      .finally(() => setInitializing(false))
  }, [initializing, loading, project, taskProject, user])

  if (!user || loading || initializing || !taskProject) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <ProjectFactsPanel
      project={project}
      taskProject={taskProject}
      compact={compact}
      className={className}
      onUpdateProjectInfo={(projectInfo) => updateProjectInfo(taskProject.id, projectInfo)}
    />
  )
}

export function ProjectFactsPanel({
  project,
  taskProject,
  onUpdateProjectInfo,
  className,
  compact = false,
}: ProjectFactsPanelProps) {
  const [projectInfo, setProjectInfo] = useState<ProjectInfoRecord>(() =>
    buildProjectInfo(project, taskProject?.projectInfo),
  )
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [newLabel, setNewLabel] = useState("")
  const [newType, setNewType] = useState<ProjectInfoFieldType>("text")
  const [newValue, setNewValue] = useState("")

  useEffect(() => {
    setProjectInfo(buildProjectInfo(project, taskProject?.projectInfo))
  }, [project, taskProject?.projectInfo])

  const coreFacts = [
    { label: "Project", value: `${project.storeNumber} - ${project.storeName}` },
    { label: "Type", value: project.projectType },
    { label: "Health", value: getHealthLabel(project.healthStatus) },
    { label: "Grand Opening", value: formatDate(project.grandOpeningDate) },
    { label: "Construction Start", value: formatDate(project.constructionStartDate) },
    {
      label: "Budget",
      value: project.totalBudget > 0 ? formatCurrency(project.totalBudget) : "Not set",
    },
    { label: "Oracle Parent", value: project.oracleParentProject || "Not set" },
    { label: "Oracle Project", value: project.oracleProjectNumber || "Not set" },
    { label: "SiteFolio ID", value: project.sfProjectId ? String(project.sfProjectId) : "Not linked" },
  ]

  const infoEntries = Object.entries(projectInfo)

  const saveInfo = async (nextInfo: ProjectInfoRecord, key?: string) => {
    if (!onUpdateProjectInfo) {
      toast.error("Project info is not ready yet")
      return
    }

    setProjectInfo(nextInfo)
    setSavingKey(key ?? "__all")
    try {
      await onUpdateProjectInfo(nextInfo)
      if (!key) toast.success("Project info saved")
    } catch {
      toast.error("Failed to save project info")
    } finally {
      setSavingKey(null)
    }
  }

  const handleFieldValueChange = (key: string, value: ProjectInfoValue) => {
    setProjectInfo((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value,
      },
    }))
  }

  const handleSaveField = (key: string) => {
    saveInfo(projectInfo, key)
  }

  const handleAddField = () => {
    const label = newLabel.trim()
    if (!label) return

    const key = makeProjectInfoKey(label, projectInfo)
    const nextInfo: ProjectInfoRecord = {
      ...projectInfo,
      [key]: {
        label,
        type: newType,
        value: normalizeValueForType(newValue, newType),
      },
    }

    saveInfo(nextInfo)
    setNewLabel("")
    setNewType("text")
    setNewValue("")
    setAddOpen(false)
  }

  return (
    <>
      <Card className={cn("h-fit", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm">Project Info</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Core facts and editable project-specific fields.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
              <Plus className="size-3.5" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={cn("grid gap-2", compact ? "grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-3")}>
            {coreFacts.map((fact) => (
              <div key={fact.label} className="rounded-md border bg-muted/30 px-3 py-2">
                <p className="text-[10px] font-medium uppercase text-muted-foreground">
                  {fact.label}
                </p>
                <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                  {fact.value}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Dates, Status, And Custom Info
              </p>
              {savingKey === "__all" && (
                <span className="text-xs text-muted-foreground">Saving...</span>
              )}
            </div>
            <div className="space-y-2">
              {infoEntries.map(([key, field]) => (
                <ProjectInfoField
                  key={key}
                  label={field.label}
                  type={field.type}
                  value={field.value}
                  saving={savingKey === key}
                  onChange={(value) => handleFieldValueChange(key, value)}
                  onSave={() => handleSaveField(key)}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Project Info</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-info-label">Label</Label>
              <Input
                id="project-info-label"
                value={newLabel}
                onChange={(event) => setNewLabel(event.target.value)}
                placeholder="e.g. Refrigeration Release"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={newType} onValueChange={(value) => setNewType(value as ProjectInfoFieldType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-info-value">Value</Label>
              <Input
                id="project-info-value"
                value={newValue}
                onChange={(event) => setNewValue(event.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddField} disabled={!newLabel.trim()}>
              Add Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ProjectInfoField({
  label,
  type,
  value,
  saving,
  onChange,
  onSave,
}: {
  label: string
  type: ProjectInfoFieldType
  value: ProjectInfoValue
  saving: boolean
  onChange: (value: ProjectInfoValue) => void
  onSave: () => void
}) {
  const stringValue = value === null || value === undefined ? "" : String(value)

  return (
    <div className="rounded-md border bg-background p-2.5">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        {saving ? (
          <Loader2 className="size-3 animate-spin text-muted-foreground" />
        ) : (
          <button
            type="button"
            onClick={onSave}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label={`Save ${label}`}
          >
            <Save className="size-3" />
          </button>
        )}
      </div>
      {type === "boolean" ? (
        <Select
          value={value === true ? "yes" : value === false ? "no" : "unset"}
          onValueChange={(next) => {
            const normalized = next === "yes" ? true : next === "no" ? false : null
            onChange(normalized)
          }}
        >
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unset">Not set</SelectItem>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      ) : type === "long-note" ? (
        <Textarea
          value={stringValue}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onSave}
          className="min-h-20 resize-y text-sm"
        />
      ) : (
        <Input
          type={getInputType(type)}
          value={stringValue}
          onChange={(event) => onChange(normalizeValueForType(event.target.value, type))}
          onBlur={onSave}
          className="h-8 text-sm"
        />
      )}
    </div>
  )
}

function buildProjectInfo(
  project: Project,
  existing?: TaskProject["projectInfo"],
): ProjectInfoRecord {
  const existingInfo = existing ?? {}
  const defaultValues: Record<string, ProjectInfoValue> = {
    constructionStartDate: project.constructionStartDate,
    constructionEndDate: null,
  }

  const info = DEFAULT_PROJECT_INFO_FIELDS.reduce<ProjectInfoRecord>((acc, field) => {
    acc[field.key] = {
      label: existingInfo[field.key]?.label ?? field.label,
      type: existingInfo[field.key]?.type ?? field.type,
      value: existingInfo[field.key]?.value ?? defaultValues[field.key] ?? null,
    }
    return acc
  }, {})

  for (const [key, field] of Object.entries(existingInfo)) {
    if (!info[key]) {
      info[key] = field
    }
  }

  return info
}

function makeProjectInfoKey(label: string, existing: ProjectInfoRecord) {
  const base =
    label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "custom-info"

  let key = base
  let counter = 2
  while (existing[key]) {
    key = `${base}-${counter}`
    counter += 1
  }
  return key
}

function normalizeValueForType(value: string, type: ProjectInfoFieldType): ProjectInfoValue {
  if (value.trim() === "") return null
  if (type === "number" || type === "currency") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : value
  }
  return value
}

function getInputType(type: ProjectInfoFieldType) {
  if (type === "date") return "date"
  if (type === "number" || type === "currency") return "number"
  if (type === "link") return "url"
  return "text"
}
