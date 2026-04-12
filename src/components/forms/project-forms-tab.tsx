"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Sparkles,
  FileText,
  Users,
  HardHat,
  CalendarCheck,
  ClipboardList,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Upload,
  ImageIcon,
  FileDown,
  Mic,
} from "lucide-react"
import { toast } from "sonner"

/* ------------------------------------------------------------------ */
/*  Template definitions                                               */
/* ------------------------------------------------------------------ */

interface FormTemplate {
  id: string
  title: string
  description: string
  icon: React.ElementType
  defaultItems: string[]
}

const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: "pre-bid",
    title: "Pre-Bid Meeting",
    description: "Scope walkthrough, bid documents review, and Q&A with prospective contractors.",
    icon: FileText,
    defaultItems: [
      "Introductions & attendance",
      "Project scope overview",
      "Bid documents review",
      "Site access & logistics",
      "Schedule expectations",
      "Q&A",
    ],
  },
  {
    id: "pre-con",
    title: "Pre-Construction Meeting",
    description: "Kick off construction phase with GC, review scope, schedule, safety, and submittals.",
    icon: HardHat,
    defaultItems: [
      "Introductions & roles",
      "Contract scope recap",
      "Schedule & milestones",
      "Safety & site rules",
      "Submittal requirements",
      "Communication plan",
    ],
  },
  {
    id: "project-kickoff",
    title: "Project Kickoff",
    description: "Internal kickoff with stakeholders to align on goals, timeline, and responsibilities.",
    icon: CalendarCheck,
    defaultItems: [
      "Project overview & objectives",
      "Team introductions & RACI",
      "Budget summary",
      "Key milestones & deadlines",
      "Risk items",
      "Next steps & action items",
    ],
  },
  {
    id: "weekly-pm",
    title: "Weekly PM Meeting",
    description: "Recurring progress check-in covering schedule, budget, issues, and upcoming work.",
    icon: ClipboardList,
    defaultItems: [
      "Previous action items review",
      "Schedule update",
      "Budget status",
      "Open issues / RFIs",
      "Upcoming work",
      "New action items",
    ],
  },
  {
    id: "jobsite",
    title: "Jobsite Meeting",
    description: "On-site coordination meeting covering safety, progress, and field conditions.",
    icon: Users,
    defaultItems: [
      "Safety moment",
      "Work completed since last meeting",
      "Upcoming work this week",
      "Material deliveries",
      "Field conditions / issues",
      "Action items",
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Agenda item type                                                   */
/* ------------------------------------------------------------------ */

interface AgendaItem {
  id: string
  text: string
}

let nextId = 1
function makeId() {
  return `item-${nextId++}`
}

/* ------------------------------------------------------------------ */
/*  Export formats                                                     */
/* ------------------------------------------------------------------ */

const EXPORT_FORMATS = [
  { label: ".docx", icon: FileDown },
  { label: ".xlsx", icon: FileDown },
  { label: ".csv", icon: FileDown },
  { label: ".pdf", icon: FileDown },
  { label: ".md", icon: FileDown },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface ProjectFormsTabProps {
  projectId: string
  projectName: string
}

export function ProjectFormsTab({ projectId: _projectId, projectName: _projectName }: ProjectFormsTabProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null)
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([])
  const [newItemText, setNewItemText] = useState("")
  const [notes, setNotes] = useState("")

  const audioInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  /* --- Template selection --- */
  function handleSelectTemplate(template: FormTemplate) {
    setSelectedTemplate(template)
    setAgendaItems(
      template.defaultItems.map((text) => ({ id: makeId(), text }))
    )
    toast.success(`Loaded "${template.title}" template`)
  }

  /* --- Agenda operations --- */
  function addItem() {
    const text = newItemText.trim()
    if (!text) return
    setAgendaItems((prev) => [...prev, { id: makeId(), text }])
    setNewItemText("")
  }

  function removeItem(id: string) {
    setAgendaItems((prev) => prev.filter((item) => item.id !== id))
  }

  function moveItem(index: number, direction: "up" | "down") {
    setAgendaItems((prev) => {
      const next = [...prev]
      const swapIndex = direction === "up" ? index - 1 : index + 1
      if (swapIndex < 0 || swapIndex >= next.length) return prev
      ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
      return next
    })
  }

  function updateItemText(id: string, text: string) {
    setAgendaItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text } : item))
    )
  }

  /* --- Placeholder handlers --- */
  function handleAiBuildAgenda() {
    toast.info("Coming in Phase 4")
  }

  function handleGenerateMinutes() {
    toast.info("Coming in Phase 4")
  }

  function handleUploadAudio() {
    audioInputRef.current?.click()
  }

  function handleUploadImage() {
    imageInputRef.current?.click()
  }

  function handleFileSelected(type: string) {
    toast.info(`${type} upload coming in Phase 4`)
  }

  function handleExport(format: string) {
    toast.info(`${format} export coming soon`)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* ── Section 1: Template Selection ── */}
      <div>
        <h3 className="text-base font-semibold">Meeting & Form Templates</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Choose a template to pre-populate the agenda, or start from scratch.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FORM_TEMPLATES.map((template) => {
            const Icon = template.icon
            const isActive = selectedTemplate?.id === template.id
            return (
              <Card
                key={template.id}
                className={isActive ? "ring-2 ring-primary" : ""}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="size-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm">{template.title}</CardTitle>
                        <Badge variant="info" className="gap-1">
                          <Sparkles className="size-3" />
                          AI
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    size="sm"
                    variant={isActive ? "secondary" : "outline"}
                    className="w-full"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    {isActive ? "Selected" : "Use Template"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <Separator />

      {/* ── Section 2: Agenda Builder ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold">Agenda Builder</h3>
            <p className="text-xs text-muted-foreground">
              Add, remove, and reorder agenda items.
              {selectedTemplate
                ? ` Pre-populated from "${selectedTemplate.title}".`
                : " Select a template above or add items manually."}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={handleAiBuildAgenda}>
            <Sparkles className="size-3.5" />
            AI Build Agenda
          </Button>
        </div>

        {/* Agenda items list */}
        <div className="space-y-2 mb-4">
          {agendaItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
              <div className="size-12 rounded-2xl bg-muted flex items-center justify-center">
                <ClipboardList className="size-6 opacity-40" />
              </div>
              <p className="text-xs">No agenda items yet. Select a template or add items below.</p>
            </div>
          )}

          {agendaItems.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-md border bg-background px-3 py-2"
            >
              <span className="text-xs font-medium text-muted-foreground w-6 shrink-0">
                {index + 1}.
              </span>
              <Input
                value={item.text}
                onChange={(e) => updateItemText(item.id, e.target.value)}
                className="flex-1 border-0 shadow-none focus-visible:ring-0 h-7 px-1"
              />
              <div className="flex items-center gap-0.5 shrink-0">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => moveItem(index, "up")}
                  disabled={index === 0}
                >
                  <ChevronUp className="size-3.5" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => moveItem(index, "down")}
                  disabled={index === agendaItems.length - 1}
                >
                  <ChevronDown className="size-3.5" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => removeItem(item.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Add new item */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="New agenda item..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addItem()
              }
            }}
          />
          <Button size="sm" onClick={addItem} disabled={!newItemText.trim()}>
            <Plus className="size-3.5" />
            Add
          </Button>
        </div>
      </div>

      <Separator />

      {/* ── Section 3: Minutes Generation ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold">Meeting Minutes</h3>
            <p className="text-xs text-muted-foreground">
              Capture notes manually or use AI to generate minutes from audio or images.
            </p>
          </div>
          <Button size="sm" onClick={handleGenerateMinutes}>
            <Sparkles className="size-3.5" />
            Generate Minutes with AI
          </Button>
        </div>

        <Textarea
          placeholder="Type meeting notes here..."
          className="min-h-[160px] mb-4"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleUploadAudio}>
            <Mic className="size-3.5" />
            Upload Audio
          </Button>
          <Button size="sm" variant="outline" onClick={handleUploadImage}>
            <ImageIcon className="size-3.5" />
            Upload Image
          </Button>

          {/* Hidden file inputs */}
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={() => handleFileSelected("Audio")}
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={() => handleFileSelected("Image")}
          />
        </div>
      </div>

      <Separator />

      {/* ── Section 4: Export ── */}
      <div>
        <h3 className="text-base font-semibold">Export</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Export your agenda and minutes in various formats.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {EXPORT_FORMATS.map((fmt) => (
            <Button
              key={fmt.label}
              size="sm"
              variant="outline"
              onClick={() => handleExport(fmt.label)}
            >
              <fmt.icon className="size-3.5" />
              {fmt.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
