"use client"

import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { useAuth } from "@/lib/firebase/auth-context"
import { getLatestProjectWeeklyUpdate, subscribeToProjects } from "@/lib/firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  FolderKanban, DollarSign, CalendarClock, CheckSquare,
  ArrowRight, AlertTriangle, Sparkles, Loader2,
  BarChart3, TrendingUp, Grid3X3, PieChart, HeartPulse, ShieldCheck, RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { Project, ProjectWeeklyUpdate } from "@/types"

function StatCard({
  label, value, sub, icon: Icon, accent
}: {
  label: string; value: string; sub?: string; icon: React.ElementType; accent: string
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className={cn("flex items-center justify-center size-10 rounded-lg", accent)}>
            <Icon className="size-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [weeklyMap, setWeeklyMap] = useState<Record<string, ProjectWeeklyUpdate | null>>({})
  const [aiSummary, setAiSummary] = useState("")
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      setDataLoading(false)
      return
    }
    const unsub = subscribeToProjects(
      user,
      (data) => { setProjects(data); setDataLoading(false) },
      (err) => { console.error("Dashboard subscription error:", err); setDataLoading(false) },
    )
    return () => unsub()
  }, [user])

  useEffect(() => {
    if (projects.length === 0) {
      setWeeklyMap({})
      return
    }

    let mounted = true
    ;(async () => {
      try {
        const updates = await Promise.all(projects.map((p) => getLatestProjectWeeklyUpdate(p.id)))
        if (!mounted) return
        const map: Record<string, ProjectWeeklyUpdate | null> = {}
        projects.forEach((p, idx) => {
          map[p.id] = updates[idx]
        })
        setWeeklyMap(map)
      } catch (err) {
        console.error("Dashboard weekly updates load error:", err)
      }
    })()

    return () => {
      mounted = false
    }
  }, [projects])

  const activeProjects = projects.filter((p) => p.status === "active" || p.status === "planning")
  const totalBudget = activeProjects.reduce((sum, p) => sum + (p.totalBudget || 0), 0)
  const atRiskCount = activeProjects.filter((p) => p.healthStatus === "yellow" || p.healthStatus === "red").length
  const overdueGoCount = activeProjects.filter((p) => {
    if (!p.grandOpeningDate) return false
    return new Date(p.grandOpeningDate).getTime() < Date.now()
  }).length
  const dueSoonGoCount = activeProjects.filter((p) => {
    if (!p.grandOpeningDate) return false
    const days = Math.floor((new Date(p.grandOpeningDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    return days >= 0 && days <= 14
  }).length

  const today = new Date().toISOString().slice(0, 10)
  const scheduleOverdueCount = activeProjects.reduce((acc, p) => {
    const schedule = ((p as unknown as Record<string, unknown>).sfSchedule || []) as Array<Record<string, string>>
    const overdue = schedule.filter((m) => {
      const actual = m.actual || ""
      const due = m.projectedAlt || m.projected || m.baseline || ""
      return !actual && Boolean(due) && due < today
    }).length
    return acc + overdue
  }, 0)

  const weeklyStaleCount = activeProjects.filter((p) => {
    const w = weeklyMap[p.id]
    if (!w) return true
    const age = Math.floor((Date.now() - new Date(w.updatedAt).getTime()) / (24 * 60 * 60 * 1000))
    return age > 7
  }).length

  const alerts = useMemo(() => [
    {
      key: "go-overdue",
      level: overdueGoCount > 0 ? "high" : "ok",
      title: "Grand Openings Overdue",
      detail: overdueGoCount > 0 ? `${overdueGoCount} projects past GO date` : "No overdue GO dates",
      href: "/projects?timing=overdue",
    },
    {
      key: "schedule-overdue",
      level: scheduleOverdueCount > 0 ? "high" : "ok",
      title: "Schedule Milestones Overdue",
      detail: scheduleOverdueCount > 0 ? `${scheduleOverdueCount} open milestones are late` : "No overdue open milestones",
      href: "/projects",
    },
    {
      key: "weekly-stale",
      level: weeklyStaleCount > 0 ? "medium" : "ok",
      title: "Weekly Updates Stale",
      detail: weeklyStaleCount > 0 ? `${weeklyStaleCount} projects missing fresh weekly updates` : "Weekly updates are current",
      href: "/projects",
    },
  ], [overdueGoCount, scheduleOverdueCount, weeklyStaleCount])

  const recentUpdates = activeProjects
    .map((p) => {
      const w = weeklyMap[p.id]
      const weeklyTs = w ? new Date(w.updatedAt).getTime() : 0
      const projectTs = new Date(p.updatedAt).getTime()
      const latestTs = Math.max(weeklyTs, projectTs)
      return {
        id: p.id,
        label: `${p.storeNumber} — ${p.storeName}`,
        latestTs,
        latestType: weeklyTs >= projectTs && weeklyTs > 0 ? "weekly" : "project",
        weeklyComment: w?.comment || "",
      }
    })
    .sort((a, b) => b.latestTs - a.latestTs)
    .slice(0, 8)

  const aiFetchedRef = useRef(false)

  const generatePortfolioAI = useCallback(async () => {
    if (aiLoading) return
    setAiLoading(true)
    try {
      const payload = {
        metrics: {
          activeProjects: activeProjects.length,
          totalBudget,
          atRiskCount,
          overdueGoCount,
          dueSoonGoCount,
          scheduleOverdueCount,
          weeklyStaleCount,
        },
        alerts: alerts.map((a) => ({ title: a.title, detail: a.detail, level: a.level })),
        updates: recentUpdates.map((u) => ({ label: u.label, type: u.latestType, comment: u.weeklyComment.slice(0, 240) })),
      }

      const res = await fetch("/api/ai/portfolio-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to generate portfolio insights")

      setAiSummary(data.summary || "")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate portfolio insights"
      setAiSummary(`AI insight unavailable: ${message}`)
    } finally {
      setAiLoading(false)
    }
  }, [activeProjects.length, totalBudget, atRiskCount, overdueGoCount, dueSoonGoCount, scheduleOverdueCount, weeklyStaleCount, alerts, recentUpdates, aiLoading])

  // Auto-generate AI brief once data is loaded
  useEffect(() => {
    if (!dataLoading && activeProjects.length > 0 && !aiFetchedRef.current) {
      aiFetchedRef.current = true
      generatePortfolioAI()
    }
  }, [dataLoading, activeProjects.length, generatePortfolioAI])

  // Derived schedule health metrics
  const healthyScheduleCount = activeProjects.filter((p) => p.healthStatus === "green").length
  const yellowScheduleCount = activeProjects.filter((p) => p.healthStatus === "yellow").length
  const redScheduleCount = activeProjects.filter((p) => p.healthStatus === "red").length
  const healthPct = activeProjects.length > 0
    ? Math.round((healthyScheduleCount / activeProjects.length) * 100)
    : 0

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Good {getGreeting()}, {user?.displayName?.split(" ")[0] || "there"}
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Executive snapshot of delivery health, exceptions, and actions for this week.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {dataLoading ? (
          [1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-3 w-24 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="size-10 bg-muted rounded-lg animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard label="Active Projects" value={String(activeProjects.length)} sub="In-flight initiatives" icon={FolderKanban} accent="bg-primary" />
            <StatCard label="Total Budget" value={totalBudget > 0 ? formatCurrency(totalBudget) : "$0"} sub="Current active scope" icon={DollarSign} accent="bg-emerald-600" />
            <StatCard label="GO Due In 14 Days" value={String(dueSoonGoCount)} sub="Near-term openings" icon={CalendarClock} accent="bg-amber-500" />
            <StatCard label="At-Risk Projects" value={String(atRiskCount)} sub="Yellow and red status" icon={CheckSquare} accent="bg-violet-600" />
          </>
        )}
      </div>

      {/* Portfolio Action Center + AI Brief */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-500" />
              Portfolio Action Center
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dataLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded border bg-muted/40 animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((a) => (
                  <div key={a.key} className="border rounded-lg p-3 bg-background">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{a.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.detail}</p>
                      </div>
                      <span className={cn(
                        "text-[10px] uppercase font-bold px-2 py-0.5 rounded border",
                        a.level === "high" ? "bg-red-100 text-red-700 border-red-200" :
                        a.level === "medium" ? "bg-amber-100 text-amber-700 border-amber-200" :
                        "bg-emerald-100 text-emerald-700 border-emerald-200",
                      )}>
                        {a.level === "high" ? "critical" : a.level === "medium" ? "watch" : "stable"}
                      </span>
                    </div>
                    <div className="mt-2">
                      <Link href={a.href} className="inline-flex text-xs text-primary hover:underline items-center gap-1">
                        Review now <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Portfolio Intelligence — auto-generates on load */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="size-4 text-violet-500" />
              AI Portfolio Intelligence
            </CardTitle>
            {aiSummary && !aiLoading && (
              <button
                onClick={() => { aiFetchedRef.current = false; generatePortfolioAI() }}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Refresh AI brief"
              >
                <RefreshCw className="size-3.5" />
              </button>
            )}
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {aiLoading ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Generating executive brief...</p>
              </div>
            ) : aiSummary ? (
              <div className="rounded-md border bg-muted/20 p-3 text-xs whitespace-pre-wrap leading-relaxed">
                {aiSummary}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                AI brief will generate automatically when project data loads.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Visual Charts — placeholder section */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Visual Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="size-4 text-primary" />
                Budget by Project Type
              </CardTitle>
              <CardDescription>Column chart of budget allocation across project types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40 rounded-md border border-dashed bg-muted/30">
                <div className="text-center">
                  <BarChart3 className="size-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="size-4 text-emerald-600" />
                Schedule Trend
              </CardTitle>
              <CardDescription>Line chart of milestone completion rate over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40 rounded-md border border-dashed bg-muted/30">
                <div className="text-center">
                  <TrendingUp className="size-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Grid3X3 className="size-4 text-amber-500" />
                Portfolio Health Heat Map
              </CardTitle>
              <CardDescription>Heat map of risk and status across active projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40 rounded-md border border-dashed bg-muted/30">
                <div className="text-center">
                  <Grid3X3 className="size-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Portfolio Summary + Schedule Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <PieChart className="size-4 text-primary" />
              Portfolio Summary
            </CardTitle>
            <CardDescription>Breakdown of active projects by type and status</CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-6 rounded bg-muted animate-pulse" />)}
              </div>
            ) : activeProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <FolderKanban className="size-8 text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">No active projects to summarize.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Status breakdown */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">By Status</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Active", count: projects.filter((p) => p.status === "active").length, color: "text-emerald-600" },
                      { label: "Planning", count: projects.filter((p) => p.status === "planning").length, color: "text-amber-600" },
                      { label: "Completed", count: projects.filter((p) => p.status === "complete").length, color: "text-primary" },
                    ].map((s) => (
                      <div key={s.label} className="border rounded-lg p-2.5 text-center">
                        <p className={cn("text-lg font-bold", s.color)}>{s.count}</p>
                        <p className="text-[11px] text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Type breakdown */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">By Type</p>
                  <div className="space-y-1.5">
                    {(["NS", "ER", "WIW", "FC", "MC", "F&D"] as const).map((type) => {
                      const count = activeProjects.filter((p) => p.projectType === type).length
                      if (count === 0) return null
                      return (
                        <div key={type} className="flex items-center justify-between text-xs">
                          <span className="font-medium">{type}</span>
                          <span className="text-muted-foreground">{count} project{count !== 1 ? "s" : ""}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schedule Health */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <HeartPulse className="size-4 text-rose-500" />
              Schedule Health
            </CardTitle>
            <CardDescription>Overall health status of active project schedules</CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-6 rounded bg-muted animate-pulse" />)}
              </div>
            ) : activeProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <ShieldCheck className="size-8 text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">No active projects to assess.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Overall health score */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Overall Health</span>
                    <span className={cn(
                      "font-bold",
                      healthPct >= 70 ? "text-emerald-600" : healthPct >= 40 ? "text-amber-600" : "text-red-600",
                    )}>
                      {healthPct}%
                    </span>
                  </div>
                  <Progress value={healthPct} className="h-2.5" />
                  <p className="text-[11px] text-muted-foreground">
                    {healthyScheduleCount} of {activeProjects.length} projects on track
                  </p>
                </div>

                {/* Status breakdown */}
                <div className="space-y-2">
                  {[
                    { label: "On Track", count: healthyScheduleCount, dot: "bg-emerald-500" },
                    { label: "At Risk", count: yellowScheduleCount, dot: "bg-amber-500" },
                    { label: "Critical", count: redScheduleCount, dot: "bg-red-500" },
                    { label: "Overdue Milestones", count: scheduleOverdueCount, dot: "bg-rose-600" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={cn("size-2 rounded-full", item.dot)} />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <span className="text-muted-foreground">{item.count}</span>
                    </div>
                  ))}
                </div>

                {/* Stale updates warning */}
                {weeklyStaleCount > 0 && (
                  <div className="border rounded-lg p-2.5 bg-amber-50 border-amber-200">
                    <p className="text-xs text-amber-700 font-medium">
                      {weeklyStaleCount} project{weeklyStaleCount !== 1 ? "s" : ""} with stale weekly updates
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "morning"
  if (h < 17) return "afternoon"
  return "evening"
}
