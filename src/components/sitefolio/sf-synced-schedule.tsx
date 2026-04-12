"use client"

import { useEffect, useState, useMemo } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { cn, formatDate } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MessageSquare,
} from "lucide-react"
import type {
  SiteFolioMilestone,
  SiteFolioSchedulePhase,
  SiteFolioSyncMeta,
} from "@/types/sitefolio"

interface SfSyncedScheduleProps {
  projectId: string
}

interface ScheduleData {
  phases: SiteFolioSchedulePhase[]
  milestones: SiteFolioMilestone[]
  template: string
}

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "just now"
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}hr ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  return formatDate(dateStr)
}

function getMilestoneStatus(milestone: SiteFolioMilestone): {
  label: string
  variant: "success" | "warning" | "danger" | "secondary"
  icon: React.ElementType
} {
  if (milestone.isComplete || milestone.completionPct === 100) {
    return { label: "Complete", variant: "success", icon: CheckCircle2 }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (milestone.projectedDate && !milestone.actualDate) {
    const projected = new Date(milestone.projectedDate)
    projected.setHours(0, 0, 0, 0)
    if (projected < today) {
      return { label: "Overdue", variant: "danger", icon: AlertTriangle }
    }
  }

  if (milestone.completionPct > 0) {
    return { label: "In Progress", variant: "warning", icon: Clock }
  }

  return { label: "Pending", variant: "secondary", icon: Clock }
}

function getCompletionColor(pct: number): string {
  if (pct === 100) return "text-emerald-600 font-medium"
  if (pct >= 50) return "text-amber-600 font-medium"
  return "text-muted-foreground"
}

export function SfSyncedSchedule({ projectId }: SfSyncedScheduleProps) {
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null)
  const [syncMeta, setSyncMeta] = useState<SiteFolioSyncMeta | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [scheduleSnap, metaSnap] = await Promise.all([
          getDoc(doc(db, "projects", projectId, "sitefolio", "schedule")),
          getDoc(doc(db, "projects", projectId, "sitefolio", "sync-meta")),
        ])

        if (scheduleSnap.exists()) {
          setScheduleData(scheduleSnap.data() as ScheduleData)
        }
        if (metaSnap.exists()) {
          setSyncMeta(metaSnap.data() as SiteFolioSyncMeta)
        }
      } catch (err) {
        console.error("Error fetching SiteFolio schedule:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [projectId])

  const groupedMilestones = useMemo(() => {
    if (!scheduleData?.milestones) return new Map<string, SiteFolioMilestone[]>()

    const grouped = new Map<string, SiteFolioMilestone[]>()
    for (const m of scheduleData.milestones) {
      const phase = m.phaseName || "Unassigned"
      if (!grouped.has(phase)) grouped.set(phase, [])
      grouped.get(phase)!.push(m)
    }
    return grouped
  }, [scheduleData])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (!scheduleData || scheduleData.milestones.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
          <Clock className="size-8 opacity-40" />
          <p className="text-sm font-medium">No SiteFolio schedule data</p>
          <p className="text-xs">
            Link this project to SiteFolio and sync to see milestones.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm">SiteFolio Schedule</CardTitle>
              {scheduleData.template && (
                <Badge variant="secondary" className="text-xs">
                  {scheduleData.template}
                </Badge>
              )}
            </div>
            {syncMeta?.lastSyncAt && (
              <span className="text-xs text-muted-foreground">
                Last synced: {getRelativeTime(syncMeta.lastSyncAt)}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 pr-3 text-xs font-medium text-muted-foreground">
                    Phase
                  </th>
                  <th className="pb-2 pr-3 text-xs font-medium text-muted-foreground">
                    Milestone
                  </th>
                  <th className="pb-2 pr-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
                    Baseline
                  </th>
                  <th className="pb-2 pr-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
                    Projected
                  </th>
                  <th className="pb-2 pr-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
                    Proj. Alt.
                  </th>
                  <th className="pb-2 pr-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
                    Actual
                  </th>
                  <th className="pb-2 pr-3 text-xs font-medium text-muted-foreground text-right">
                    %
                  </th>
                  <th className="pb-2 text-xs font-medium text-muted-foreground text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Array.from(groupedMilestones.entries()).map(
                  ([phaseName, milestones]) => (
                    <PhaseGroup
                      key={phaseName}
                      phaseName={phaseName}
                      milestones={milestones}
                    />
                  )
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

function PhaseGroup({
  phaseName,
  milestones,
}: {
  phaseName: string
  milestones: SiteFolioMilestone[]
}) {
  return (
    <>
      {/* Phase header row */}
      <tr className="bg-muted/40">
        <td
          colSpan={8}
          className="py-2 px-2 text-xs font-semibold text-foreground"
        >
          {phaseName}
        </td>
      </tr>

      {/* Milestone rows */}
      {milestones.map((milestone) => (
        <MilestoneRow key={milestone.milestoneId} milestone={milestone} />
      ))}
    </>
  )
}

function MilestoneRow({ milestone }: { milestone: SiteFolioMilestone }) {
  const status = getMilestoneStatus(milestone)
  const StatusIcon = status.icon
  const hasNotes = milestone.notes && milestone.notes.length > 0

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="py-2 pr-3 text-xs text-muted-foreground" />
      <td className="py-2 pr-3 text-xs">
        <span className="flex items-center gap-1.5">
          {milestone.milestoneName}
          {hasNotes && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageSquare className="size-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <div className="space-y-1.5">
                  {milestone.notes.map((note, i) => (
                    <div key={i} className="text-xs">
                      <span className="font-medium">{note.author}</span>
                      {note.date && (
                        <span className="text-muted-foreground ml-1">
                          ({formatDate(note.date)})
                        </span>
                      )}
                      <p className="mt-0.5">{note.text}</p>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </span>
      </td>
      <td className="py-2 pr-3 text-xs text-muted-foreground whitespace-nowrap">
        {formatDate(milestone.baselineDate)}
      </td>
      <td className="py-2 pr-3 text-xs whitespace-nowrap">
        {formatDate(milestone.projectedDate)}
      </td>
      <td className="py-2 pr-3 text-xs text-muted-foreground whitespace-nowrap">
        {formatDate(milestone.projectedAltDate)}
      </td>
      <td className="py-2 pr-3 text-xs whitespace-nowrap">
        {formatDate(milestone.actualDate)}
      </td>
      <td
        className={cn(
          "py-2 pr-3 text-xs text-right whitespace-nowrap",
          getCompletionColor(milestone.completionPct)
        )}
      >
        {milestone.completionPct}%
      </td>
      <td className="py-2 text-center">
        <Badge variant={status.variant} className="text-[10px] gap-1 px-1.5">
          <StatusIcon className="size-3" />
          {status.label}
        </Badge>
      </td>
    </tr>
  )
}
