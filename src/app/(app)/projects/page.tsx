"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/firebase/auth-context"
import { subscribeToProjects } from "@/lib/firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Plus, Search, Building2, CalendarDays,
  DollarSign, ChevronRight
} from "lucide-react"
import { cn, getHealthColor, getHealthLabel, getProjectTypeColor } from "@/lib/utils"
import { PROJECT_TYPE_LABELS } from "@/constants/project-types"
import type { HealthStatus, ProjectType, Project } from "@/types"

const ALL_TYPES = ["All", "NS", "ER", "WIW", "FC", "MC"] as const
type FilterType = (typeof ALL_TYPES)[number]
type TimingFilter = "all" | "overdue" | "dueSoon"

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

interface ScheduleMilestonePreview {
  label: string
  baseline?: string
  projected?: string
  projectedAlt?: string
  actual?: string
}

interface ScheduleProgressPreview {
  total: number
  done: number
  open: number
  overdue: number
  pct: number
  nextLabel: string | null
  nextDate: string | null
}

function getScheduleProgress(project: Project): ScheduleProgressPreview {
  const schedule = ((project as unknown as Record<string, unknown>).sfSchedule || []) as ScheduleMilestonePreview[]
  if (!Array.isArray(schedule) || schedule.length === 0) {
    return {
      total: 0,
      done: 0,
      open: 0,
      overdue: 0,
      pct: 0,
      nextLabel: null,
      nextDate: null,
    }
  }

  const today = new Date().toISOString().slice(0, 10)
  const normalized = schedule.map((m) => {
    const effectiveDue = m.projectedAlt || m.projected || m.baseline || ""
    const done = Boolean(m.actual)
    const overdue = Boolean(!done && effectiveDue && effectiveDue < today)
    return {
      label: m.label,
      effectiveDue,
      done,
      overdue,
    }
  })

  const done = normalized.filter((m) => m.done).length
  const openRows = normalized.filter((m) => !m.done)
  const overdue = openRows.filter((m) => m.overdue).length
  const next = openRows
    .filter((m) => Boolean(m.effectiveDue))
    .sort((a, b) => a.effectiveDue.localeCompare(b.effectiveDue))[0]

  return {
    total: normalized.length,
    done,
    open: openRows.length,
    overdue,
    pct: normalized.length > 0 ? Math.round((done / normalized.length) * 100) : 0,
    nextLabel: next?.label || null,
    nextDate: next?.effectiveDue || null,
  }
}

export default function ProjectsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<FilterType>("All")
  const [timingFilter, setTimingFilter] = useState<TimingFilter>("all")

  useEffect(() => {
    if (!user) {
      setDataLoading(false)
      return
    }
    const unsub = subscribeToProjects(
      user,
      (data) => { setProjects(data); setDataLoading(false) },
      (err) => { console.error("Projects subscription error:", err); setDataLoading(false) },
    )
    return () => unsub()
  }, [user])

  useEffect(() => {
    const timing = searchParams.get("timing")
    if (timing === "overdue" || timing === "dueSoon") {
      setTimingFilter(timing)
    } else {
      setTimingFilter("all")
    }
  }, [searchParams])

  const today = Date.now()

  const filtered = projects.filter((p) => {
    const matchType = typeFilter === "All" || p.projectType === typeFilter
    const matchTiming = (() => {
      if (timingFilter === "all") return true
      if (!p.grandOpeningDate) return false
      const days = Math.floor((new Date(p.grandOpeningDate).getTime() - today) / (24 * 60 * 60 * 1000))
      if (timingFilter === "overdue") return days < 0
      if (timingFilter === "dueSoon") return days >= 0 && days <= 14
      return true
    })()
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      p.storeNumber.toLowerCase().includes(q) ||
      p.storeName.toLowerCase().includes(q) ||
      p.projectType.toLowerCase().includes(q)
    return matchType && matchTiming && matchSearch
  })

  // Show loading skeleton if still loading
  const isLoading = authLoading || (user && dataLoading)

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Projects</h2>
          {isLoading ? (
            <div className="h-4 w-24 bg-muted rounded animate-pulse mt-1" />
          ) : (
            <p className="text-sm text-muted-foreground">
              {projects.length} {projects.length === 1 ? "project" : "projects"}
            </p>
          )}
        </div>
        <Link href="/admin?tab=projects">
          <Button className="gap-2">
            <Plus className="size-4" />
            Create in Admin
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search store number or name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {ALL_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-all border",
                typeFilter === t
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary",
              )}
            >
              {t === "All" ? "All Types" : t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {[
          { value: "all", label: "All Timing" },
          { value: "overdue", label: "Overdue GO" },
          { value: "dueSoon", label: "GO Due ≤14d" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTimingFilter(opt.value as TimingFilter)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-all border",
              timingFilter === opt.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Project grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-12 bg-muted rounded animate-pulse" />
                    <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="h-5 w-full bg-muted rounded animate-pulse mb-1" />
                <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                <div className="mt-4 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="size-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">
            {projects.length === 0 ? "No projects yet" : "No projects match your filters"}
          </p>
          <p className="text-sm mt-1">
            {projects.length === 0 ? (
              <Link href="/admin?tab=projects" className="text-primary hover:underline">
                Create your first project in Admin
              </Link>
            ) : (
              "Try adjusting your filters"
            )}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            (() => {
              const schedule = getScheduleProgress(p)
              return (
            <Card
              key={p.id}
              className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group h-full"
              onClick={() => router.push(`/projects/${p.id}`)}
            >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-xs font-bold px-2 py-0.5 rounded-md border",
                          getProjectTypeColor(p.projectType as ProjectType),
                        )}
                      >
                        {p.projectType}
                      </span>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          getHealthColor(p.healthStatus as HealthStatus),
                        )}
                      >
                        {getHealthLabel(p.healthStatus as HealthStatus)}
                      </span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <h3 className="font-semibold text-foreground">
                    {p.storeNumber} — {p.storeName}, {p.storeState}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {PROJECT_TYPE_LABELS[p.projectType as keyof typeof PROJECT_TYPE_LABELS]}
                  </p>

                  <div className="mt-4 pt-3 border-t space-y-2">
                    <div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${schedule.pct}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5">
                        <span>{schedule.pct}% complete</span>
                        <span className="text-foreground font-medium">{schedule.done}/{schedule.total || "-"} done</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium capitalize">Status: {p.status}</span>
                      <span>Updated: {new Date(p.updatedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      {p.grandOpeningDate ? (
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="size-3" />
                          GO:{" "}
                          {new Date(p.grandOpeningDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 italic">
                          <CalendarDays className="size-3" />
                          GO: TBD
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <DollarSign className="size-3" />
                        {p.totalBudget > 0 ? formatCurrency(p.totalBudget) : "TBD"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Open milestones: <span className="font-medium text-foreground">{schedule.open}</span></span>
                      <span>
                        Overdue: <span className={cn("font-medium", schedule.overdue > 0 ? "text-red-600" : "text-foreground")}>{schedule.overdue}</span>
                      </span>
                    </div>

                    <div className="rounded-md border bg-muted/20 px-2.5 py-2 text-[11px] text-muted-foreground">
                      {schedule.nextLabel && schedule.nextDate ? (
                        <>
                          <span className="uppercase tracking-wide">Next</span>: <span className="font-medium text-foreground">{schedule.nextLabel}</span>
                          <span> ({new Date(schedule.nextDate).toLocaleDateString()})</span>
                        </>
                      ) : (
                        <span>Template schedule is active. Import SiteFolio dates in Admin only when available.</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
            })()
          ))}
        </div>
      )}
    </div>
  )
}
