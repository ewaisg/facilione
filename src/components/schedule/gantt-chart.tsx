"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Calendar,
  CalendarCheck,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Phase, ChecklistItem } from "@/types/schedule"

type ZoomLevel = "week" | "month" | "quarter"
type ViewMode = "baseline" | "actual"

interface GanttChartProps {
  phases: Phase[]
  grandOpeningDate: string | null
  onUpdateMilestone?: (
    phaseId: string,
    itemId: string,
    newDate: string,
  ) => Promise<void>
}

interface TimelineRange {
  start: Date
  end: Date
  intervals: Date[]
}

interface DragState {
  phaseId: string
  itemId: string
  originalDate: string
  newDate: string
  milestoneName: string
}

export function GanttChart({
  phases,
  grandOpeningDate,
  onUpdateMilestone,
}: GanttChartProps) {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("month")
  const [viewMode, setViewMode] = useState<ViewMode>("baseline")
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [saving, setSaving] = useState(false)

  // Calculate timeline range based on phases
  const timelineRange = useMemo((): TimelineRange => {
    const allDates: Date[] = []
    const goDate = grandOpeningDate ? new Date(grandOpeningDate) : new Date()

    phases.forEach((phase) => {
      phase.checklistItems.forEach((item) => {
        // Use baseline dates if viewing baseline, actual if available
        if (viewMode === "baseline") {
          if (phase.targetStartDate)
            allDates.push(new Date(phase.targetStartDate))
          if (phase.targetEndDate) allDates.push(new Date(phase.targetEndDate))
        } else {
          if (item.completedDate) allDates.push(new Date(item.completedDate))
        }
      })
    })

    // Fallback to GO date +/- 6 months if no dates
    if (allDates.length === 0) {
      const start = new Date(goDate)
      start.setMonth(start.getMonth() - 6)
      const end = new Date(goDate)
      end.setMonth(end.getMonth() + 3)
      return { start, end, intervals: generateIntervals(start, end, zoomLevel) }
    }

    // Add padding
    const start = new Date(Math.min(...allDates.map((d) => d.getTime())))
    start.setMonth(start.getMonth() - 1)
    const end = new Date(Math.max(...allDates.map((d) => d.getTime())))
    end.setMonth(end.getMonth() + 1)

    return { start, end, intervals: generateIntervals(start, end, zoomLevel) }
  }, [phases, grandOpeningDate, zoomLevel, viewMode])

  const handleDragStart = (
    phaseId: string,
    itemId: string,
    currentDate: string | null,
    milestoneName: string,
  ) => {
    if (!currentDate) return
    setDragState({
      phaseId,
      itemId,
      originalDate: currentDate,
      newDate: currentDate,
      milestoneName,
    })
  }

  const handleConfirmUpdate = async () => {
    if (!dragState || !onUpdateMilestone) return
    setSaving(true)
    try {
      await onUpdateMilestone(dragState.phaseId, dragState.itemId, dragState.newDate)
      setDragState(null)
    } catch (err) {
      console.error("Failed to update milestone:", err)
    } finally {
      setSaving(false)
    }
  }

  if (phases.length === 0) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center text-center gap-3">
          <AlertCircle className="size-12 text-muted-foreground/50" />
          <div>
            <p className="font-semibold text-sm">No schedule data available</p>
            <p className="text-xs text-muted-foreground mt-1">
              Phases and milestones will appear here once seeded from the template.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className="flex flex-col h-full">
        {/* Header Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Schedule
            </span>
            {grandOpeningDate && (
              <span className="text-xs text-muted-foreground">
                GO: {new Date(grandOpeningDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Legend - only show in actual view */}
            {viewMode === "actual" && (
              <div className="flex items-center gap-3 mr-2">
                <div className="flex items-center gap-1">
                  <div className="size-2 rounded-full bg-green-500" />
                  <span className="text-[10px] text-muted-foreground">On track</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="size-2 rounded-full bg-yellow-500" />
                  <span className="text-[10px] text-muted-foreground">1-3 wks</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="size-2 rounded-full bg-red-500" />
                  <span className="text-[10px] text-muted-foreground">3+ wks</span>
                </div>
              </div>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-background rounded-md border p-0.5">
              <Button
                size="sm"
                variant={viewMode === "baseline" ? "default" : "ghost"}
                className="h-7 px-2 text-xs"
                onClick={() => setViewMode("baseline")}
              >
                <Calendar className="size-3 mr-1" />
                Baseline
              </Button>
              <Button
                size="sm"
                variant={viewMode === "actual" ? "default" : "ghost"}
                className="h-7 px-2 text-xs"
                onClick={() => setViewMode("actual")}
              >
                <CalendarCheck className="size-3 mr-1" />
                Actual
              </Button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-background rounded-md border p-0.5">
              <Button
                size="sm"
                variant={zoomLevel === "week" ? "default" : "ghost"}
                className="h-7 px-2 text-xs"
                onClick={() => setZoomLevel("week")}
              >
                Week
              </Button>
              <Button
                size="sm"
                variant={zoomLevel === "month" ? "default" : "ghost"}
                className="h-7 px-2 text-xs"
                onClick={() => setZoomLevel("month")}
              >
                Month
              </Button>
              <Button
                size="sm"
                variant={zoomLevel === "quarter" ? "default" : "ghost"}
                className="h-7 px-2 text-xs"
                onClick={() => setZoomLevel("quarter")}
              >
                Quarter
              </Button>
            </div>
          </div>
        </div>

        {/* Gantt Chart Area */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-max">
            {/* Timeline Header */}
            <div className="sticky top-0 z-10 bg-background border-b">
              <div className="flex">
                {/* Left columns header */}
                <div className="shrink-0 border-r bg-muted/50">
                  <div className="flex">
                    <div className="w-64 px-3 py-2 text-xs font-semibold border-r">
                      Phase / Milestone
                    </div>
                    <div className="w-20 px-3 py-2 text-xs font-semibold text-center">
                      Week Offset
                    </div>
                  </div>
                </div>

                {/* Timeline intervals */}
                <div className="flex-1 flex">
                  {timelineRange.intervals.map((date, i) => (
                    <div
                      key={i}
                      className="flex-1 min-w-20 px-2 py-2 text-xs text-center border-r last:border-r-0"
                    >
                      {formatInterval(date, zoomLevel)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Gantt Rows */}
            <div>
              {phases.map((phase) => (
                <div key={phase.id}>
                  {/* Phase Header Row */}
                  <div className="flex bg-muted/30 border-b hover:bg-muted/50 transition-colors">
                    <div className="shrink-0 border-r">
                      <div className="flex">
                        <div className="w-64 px-3 py-2 font-semibold text-sm border-r">
                          Phase {phase.phaseNumber}: {phase.name}
                        </div>
                        <div className="w-20 px-3 py-2 text-xs text-center text-muted-foreground">
                          —
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 relative h-9">
                      {renderPhaseBar(phase, timelineRange, viewMode)}
                    </div>
                  </div>

                  {/* Milestone Rows */}
                  {phase.checklistItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex border-b hover:bg-muted/20 transition-colors"
                    >
                      <div className="shrink-0 border-r">
                        <div className="flex">
                          <div className="w-64 px-3 py-2 text-sm pl-8 flex items-center gap-2">
                            {item.isGate && (
                              <span className="size-2 rotate-45 bg-amber-500 shrink-0" />
                            )}
                            <span className={cn(
                              "truncate",
                              item.status === "complete" && "text-muted-foreground line-through",
                            )}>
                              {item.description}
                            </span>
                          </div>
                          <div className="w-20 px-3 py-2 text-xs text-center text-muted-foreground">
                            {item.weekOffset !== null
                              ? item.weekOffset === 0
                                ? "GO"
                                : item.weekOffset > 0
                                  ? `+${item.weekOffset}`
                                  : item.weekOffset
                              : "—"}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 relative h-9">
                        {renderMilestoneBar(
                          item,
                          phase,
                          timelineRange,
                          viewMode,
                          grandOpeningDate,
                          handleDragStart,
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Drag Confirmation Dialog */}
      <Dialog open={!!dragState} onOpenChange={() => setDragState(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Milestone Date</DialogTitle>
            <DialogDescription>
              Adjust the date for <strong>{dragState?.milestoneName}</strong>
            </DialogDescription>
          </DialogHeader>

          {dragState && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>New Date</Label>
                <Input
                  type="date"
                  value={dragState.newDate}
                  onChange={(e) =>
                    setDragState({ ...dragState, newDate: e.target.value })
                  }
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Original: {new Date(dragState.originalDate).toLocaleDateString()}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDragState(null)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmUpdate} disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin mr-2" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ─── Helper Functions ─────────────────────────────────────────

function generateIntervals(
  start: Date,
  end: Date,
  zoom: ZoomLevel,
): Date[] {
  const intervals: Date[] = []
  const current = new Date(start)

  while (current <= end) {
    intervals.push(new Date(current))
    if (zoom === "week") {
      current.setDate(current.getDate() + 7)
    } else if (zoom === "month") {
      current.setMonth(current.getMonth() + 1)
    } else {
      current.setMonth(current.getMonth() + 3)
    }
  }

  return intervals
}

function formatInterval(date: Date, zoom: ZoomLevel): string {
  if (zoom === "week") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  } else if (zoom === "month") {
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
  } else {
    const q = Math.floor(date.getMonth() / 3) + 1
    return `Q${q} ${date.getFullYear()}`
  }
}

function renderPhaseBar(
  phase: Phase,
  timelineRange: TimelineRange,
  viewMode: ViewMode,
) {
  const startDate =
    viewMode === "baseline" ? phase.targetStartDate : phase.actualStartDate
  const endDate =
    viewMode === "baseline" ? phase.targetEndDate : phase.actualEndDate

  if (!startDate || !endDate) return null

  const { left, width } = calculateBarPosition(
    new Date(startDate),
    new Date(endDate),
    timelineRange,
  )

  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 h-6 bg-primary/20 border border-primary/40 rounded"
      style={{ left: `${left}%`, width: `${width}%` }}
    />
  )
}

function renderMilestoneBar(
  item: ChecklistItem,
  phase: Phase,
  timelineRange: TimelineRange,
  viewMode: ViewMode,
  grandOpeningDate: string | null,
  onDragStart: (
    phaseId: string,
    itemId: string,
    date: string | null,
    name: string,
  ) => void,
) {
  // Determine date to display
  let date: Date | null = null
  let baselineDate: Date | null = null

  if (viewMode === "baseline") {
    // Calculate from weekOffset and GO date
    if (item.weekOffset !== null && grandOpeningDate) {
      const go = new Date(grandOpeningDate)
      date = new Date(go)
      date.setDate(go.getDate() + item.weekOffset * 7)
    }
  } else {
    // Show actual completed date
    if (item.completedDate) {
      date = new Date(item.completedDate)
    }
    // Also calculate baseline for variance comparison
    if (item.weekOffset !== null && grandOpeningDate) {
      const go = new Date(grandOpeningDate)
      baselineDate = new Date(go)
      baselineDate.setDate(go.getDate() + item.weekOffset * 7)
    }
  }

  if (!date) return null

  const { left } = calculateBarPosition(date, date, timelineRange)

  // Milestone is rendered as a diamond (gate) or circle
  const isGate = item.isGate
  const isComplete = item.status === "complete"

  // Calculate schedule variance for color coding in actual view
  let scheduleStatus: "neutral" | "red" | "yellow" | "green" = "neutral"
  if (viewMode === "actual" && baselineDate && date && !isComplete) {
    const diffDays = (date.getTime() - baselineDate.getTime()) / (1000 * 60 * 60 * 24)
    const diffWeeks = diffDays / 7

    if (diffWeeks > 3) scheduleStatus = "red"      // 3+ weeks behind
    else if (diffWeeks > 1) scheduleStatus = "yellow"   // 1-3 weeks behind
    else scheduleStatus = "green"                       // On track
  }

  // Get color classes based on schedule status
  const getColorClasses = () => {
    if (isComplete) {
      return "bg-green-500 border-green-600"
    }

    if (viewMode === "baseline") {
      return isGate
        ? "bg-amber-400 border-amber-500"
        : "bg-blue-500 border-blue-600"
    }

    // Actual view with variance colors
    switch (scheduleStatus) {
      case "red":
        return "bg-red-500 border-red-600"
      case "yellow":
        return "bg-yellow-500 border-yellow-600"
      case "green":
        return "bg-green-500 border-green-600"
      default:
        return isGate
          ? "bg-amber-400 border-amber-500"
          : "bg-blue-500 border-blue-600"
    }
  }

  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 cursor-pointer group"
      style={{ left: `${left}%` }}
      onClick={() =>
        onDragStart(
          phase.id,
          item.id,
          viewMode === "baseline"
            ? date?.toISOString().split("T")[0] || null
            : item.completedDate,
          item.description,
        )
      }
      title={scheduleStatus !== "neutral" ? `Schedule variance: ${scheduleStatus}` : item.description}
    >
      {isGate ? (
        <div
          className={cn(
            "size-4 rotate-45 border-2 transition-all",
            getColorClasses(),
            "group-hover:scale-125",
          )}
        />
      ) : (
        <div
          className={cn(
            "size-3 rounded-full border-2 transition-all",
            getColorClasses(),
            "group-hover:scale-125",
          )}
        />
      )}
    </div>
  )
}

function calculateBarPosition(
  startDate: Date,
  endDate: Date,
  timelineRange: TimelineRange,
): { left: number; width: number } {
  const totalDuration =
    timelineRange.end.getTime() - timelineRange.start.getTime()
  const startOffset = startDate.getTime() - timelineRange.start.getTime()
  const duration = endDate.getTime() - startDate.getTime()

  const left = (startOffset / totalDuration) * 100
  const width = Math.max((duration / totalDuration) * 100, 0.5) // Min 0.5% width

  return { left: Math.max(0, left), width }
}
