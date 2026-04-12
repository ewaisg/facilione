"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft, CalendarDays, DollarSign,
  GanttChartSquare, Wallet, ClipboardList,
  CheckSquare, BarChart3, Loader2, Sparkles,
  Bot
} from "lucide-react"
import { getHealthColor, getHealthLabel, getProjectTypeColor, formatCurrency, formatDate } from "@/lib/utils"
import { getProject, subscribeToPhases, updateMilestoneDate, updateProject } from "@/lib/firebase/firestore"
import { SF_SCHEDULE_TEMPLATES } from "@/constants/sf-schedule-data"
import { type SfMilestoneState } from "@/lib/schedule/sf-schedule"
import { IpeccBuilder } from "@/components/reports/ipecc-builder"
import { ProjectFormsTab } from "@/components/forms/project-forms-tab"
import { TaskKanbanBoard } from "@/components/tasks/task-kanban-board"
import type { HealthStatus, ProjectType, Project, Phase } from "@/types"
import { GanttChart } from "@/components/schedule/gantt-chart"
import { SfSchedulePanel } from "@/components/schedule/sf-schedule-panel"
import { toast } from "sonner"
import { CopilotInlinePanel } from "@/components/copilot/inline-panel"
import { AiWeeklyStatus } from "@/components/reports/ai-weekly-status"
import { AiScheduleStatus } from "@/components/reports/ai-schedule-status"

function PlaceholderTab({ label, icon: Icon, note }: { label: string; icon: React.ElementType; note?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
      <div className="size-14 rounded-2xl bg-muted flex items-center justify-center">
        <Icon className="size-7 opacity-40" />
      </div>
      <p className="font-medium text-sm">{label}</p>
      <p className="text-xs">{note || "Coming in Phase 2"}</p>
    </div>
  )
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const [project, setProject] = useState<Project | null>(null)
  const [phases, setPhases] = useState<Phase[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState("schedule")
  const [copilotOpen, setCopilotOpen] = useState(false)

  // Subscribe to project (one-time fetch) and phases (real-time)
  useEffect(() => {
    if (!id) return

    let unsubscribePhases: (() => void) | null = null

    async function load() {
      try {
        const p = await getProject(id)
        if (!p) {
          setNotFound(true)
          setLoading(false)
          return
        }
        setProject(p)
        setLoading(false)

        // Subscribe to real-time phase updates
        unsubscribePhases = subscribeToPhases(
          id,
          (updatedPhases) => {
            setPhases(updatedPhases)
          },
          (err) => {
            console.error("Error subscribing to phases:", err)
            toast.error("Failed to load schedule updates")
          }
        )
      } catch (err) {
        console.error("Error loading project:", err)
        setNotFound(true)
        setLoading(false)
      }
    }

    load()

    return () => {
      if (unsubscribePhases) {
        unsubscribePhases()
      }
    }
  }, [id])

  useEffect(() => {
    const requestedTab = searchParams.get("tab")
    if (!requestedTab) return

    const allowedTabs = [
      "schedule",
      "budget",
      "forms",
      "tasks",
      "reports",
    ]

    if (allowedTabs.includes(requestedTab)) {
      setActiveTab(requestedTab)
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (notFound || !project) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Project not found.</p>
        <Link href="/projects">
          <Button variant="link">Back to Projects</Button>
        </Link>
      </div>
    )
  }

  const handleUpdateMilestone = async (
    phaseId: string,
    itemId: string,
    newDate: string,
  ) => {
    try {
      await updateMilestoneDate(id, phaseId, itemId, newDate)
      toast.success("Milestone date updated")
      // No need to manually update phases - real-time subscription handles it
    } catch (err) {
      console.error("Failed to update milestone:", err)
      toast.error("Failed to update milestone date")
      throw err
    }
  }

  // SiteFolio schedule state — load from project.sfSchedule or initialize from template
  const sfTemplate = SF_SCHEDULE_TEMPLATES[project.projectType]
  const savedSfState: SfMilestoneState[] | null =
    (project as unknown as Record<string, unknown>).sfSchedule as SfMilestoneState[] | null

  const handleSfScheduleUpdate = async (milestones: SfMilestoneState[], grandOpening: string) => {
    try {
      await updateProject(id, {
        sfSchedule: milestones,
        grandOpeningDate: grandOpening || project.grandOpeningDate,
      } as Partial<Project>)
    } catch (err) {
      console.error("Failed to save schedule:", err)
    }
  }

  return (
    <div className="flex h-full">
      <div className="flex flex-col flex-1 min-w-0 h-full">
      {/* Sub-header */}
      <div className="bg-background border-b px-6 py-4">
        <div className="flex items-start justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/projects" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${getProjectTypeColor(project.projectType as ProjectType)}`}>
                  {project.projectType}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getHealthColor(project.healthStatus as HealthStatus)}`}>
                  {getHealthLabel(project.healthStatus as HealthStatus)}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                {project.storeNumber} — {project.storeName}, {project.storeState}
              </h2>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
            {project.grandOpeningDate && (
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5" /> GO: {formatDate(project.grandOpeningDate)}
              </span>
            )}
            {project.totalBudget > 0 && (
              <span className="flex items-center gap-1.5">
                <DollarSign className="size-3.5" /> {formatCurrency(project.totalBudget)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <div className="border-b bg-background px-6">
            <TabsList className="h-10 bg-transparent gap-0 rounded-none p-0 max-w-7xl mx-auto w-full justify-start">
              {[
                { value: "schedule", label: "Schedule", icon: GanttChartSquare },
                { value: "budget", label: "Budget", icon: Wallet },
                { value: "forms", label: "Forms", icon: ClipboardList },
                { value: "tasks", label: "Tasks", icon: CheckSquare },
                { value: "reports", label: "Reports", icon: BarChart3 },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none h-10 px-4 text-sm gap-1.5"
                >
                  <tab.icon className="size-3.5" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Schedule Tab — now includes both Gantt and SiteFolio Schedule */}
            <TabsContent value="schedule" className="p-6 max-w-7xl mx-auto mt-0 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Grand Opening", value: project.grandOpeningDate ? formatDate(project.grandOpeningDate) : "TBD" },
                  { label: "Total Budget", value: project.totalBudget > 0 ? formatCurrency(project.totalBudget) : "TBD" },
                  { label: "Status", value: project.status.charAt(0).toUpperCase() + project.status.slice(1) },
                  { label: "Phases", value: `${phases.length} phases seeded` },
                ].map((card) => (
                  <Card key={card.label}>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{card.label}</p>
                      <p className="font-semibold text-sm">{card.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* SiteFolio Schedule Panel */}
              {sfTemplate && (
                <SfSchedulePanel
                  projectType={project.projectType as ProjectType}
                  grandOpeningDate={project.grandOpeningDate}
                  savedState={savedSfState}
                  onUpdate={handleSfScheduleUpdate}
                />
              )}

              {/* Existing Gantt Chart */}
              <GanttChart
                phases={phases}
                grandOpeningDate={project.grandOpeningDate}
                onUpdateMilestone={handleUpdateMilestone}
              />
            </TabsContent>

            <TabsContent value="budget" className="p-6 max-w-7xl mx-auto mt-0 space-y-6">
              <div>
                <h3 className="text-base font-semibold">Budget & Cost Tools</h3>
                <p className="text-xs text-muted-foreground">Access estimating and cost review tools for this project.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Sparkles className="size-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">Estimator</CardTitle>
                        <CardDescription className="text-xs">Create and compare cost estimates</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-4">
                      Build detailed cost estimates using comparable projects, presets, and AI-assisted analysis.
                    </p>
                    <Link href={`/smart-tools/estimator?projectId=${project.id}`}>
                      <Button size="sm" className="w-full">Open Estimator</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <DollarSign className="size-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">Cost Review</CardTitle>
                        <CardDescription className="text-xs">PM cost review and reconciliation</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-4">
                      Review actuals, commitments, and forecasts against budget. Reconcile with Oracle reports.
                    </p>
                    <Button size="sm" variant="outline" className="w-full" disabled>
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="forms" className="mt-0">
              <ProjectFormsTab
                projectId={id}
                projectName={`${project.storeNumber} — ${project.storeName}`}
              />
            </TabsContent>
            <TabsContent value="tasks" className="p-6 max-w-7xl mx-auto mt-0">
              <TaskKanbanBoard phases={phases} projectId={id} />
            </TabsContent>
            <TabsContent value="reports" className="p-6 max-w-7xl mx-auto mt-0 space-y-6">
              <div>
                <h3 className="text-base font-semibold">Reports</h3>
                <p className="text-xs text-muted-foreground">Project reports, status summaries, and IPECC packet generation.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {/* IPECC Builder */}
                <Card className="md:col-span-3">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm">IPECC Builder</CardTitle>
                      <Badge variant="warning">TBD</Badge>
                    </div>
                    <CardDescription>Generate IPECC packet inputs for this project.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <IpeccBuilder projectId={project.id} projectLabel={`${project.storeNumber} - ${project.storeName}`} />
                  </CardContent>
                </Card>

                {/* Weekly Status Report — AI-drafted */}
                <AiWeeklyStatus project={project} phases={phases} />

                {/* Schedule Status Report — AI-generated */}
                <AiScheduleStatus project={project} phases={phases} />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Copilot floating button */}
      {!copilotOpen && (
        <button
          onClick={() => setCopilotOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-brand-600 text-white shadow-lg hover:bg-brand-700 transition-colors"
        >
          <Bot className="size-4" />
          <span className="text-sm font-medium">Copilot</span>
        </button>
      )}
      </div>

      {/* Copilot Inline Panel */}
      {copilotOpen && (
        <CopilotInlinePanel
          projectId={id}
          projectName={`${project.storeNumber} — ${project.storeName}`}
          projectType={project.projectType as ProjectType}
          currentPhase={phases[project.currentPhaseIndex]?.name}
          onClose={() => setCopilotOpen(false)}
        />
      )}
    </div>
  )
}
