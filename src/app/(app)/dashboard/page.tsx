"use client"

import { useAuth } from "@/lib/firebase/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FolderKanban, DollarSign, AlertTriangle, TrendingUp,
  CalendarClock, CheckSquare, ArrowRight, Zap
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

// Stat card
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

// Mock project data for Phase 1 UI
const MOCK_PROJECTS = [
  { id: "1", storeNumber: "KS421", storeName: "Lakewood CO", type: "WIW", status: "active", health: "green", phase: "Bidding", nextGate: "Award Contract", goDate: "Dec 15, 2025" },
  { id: "2", storeNumber: "KS207", storeName: "Aurora CO",   type: "FC",  status: "active", health: "yellow", phase: "SPG Review", nextGate: "SPG Final — Wk 34", goDate: "Oct 1, 2025" },
  { id: "3", storeNumber: "KS388", storeName: "Denver CO",   type: "ER",  status: "active", health: "green", phase: "Design Dev.", nextGate: "CDs Received", goDate: "Mar 20, 2026" },
  { id: "4", storeNumber: "KS115", storeName: "Boulder CO",  type: "MC",  status: "active", health: "green", phase: "Construction", nextGate: "TCO", goDate: "Apr 5, 2025" },
]

const HEALTH_STYLES: Record<string, string> = {
  green:  "bg-emerald-100 text-emerald-700 border-emerald-200",
  yellow: "bg-amber-100 text-amber-700 border-amber-200",
  red:    "bg-red-100 text-red-700 border-red-200",
}
const HEALTH_LABELS: Record<string, string> = {
  green: "On Track", yellow: "At Risk", red: "Delayed"
}

const TYPE_STYLES: Record<string, string> = {
  NS:  "bg-blue-100 text-blue-800",
  ER:  "bg-purple-100 text-purple-800",
  WIW: "bg-teal-100 text-teal-800",
  FC:  "bg-amber-100 text-amber-800",
  MC:  "bg-slate-100 text-slate-700",
}

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Good {getGreeting()}, {user?.displayName?.split(" ")[0] || "there"} 👋
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Here&apos;s your portfolio overview for today.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Projects"       value="12"     sub="Across all types"     icon={FolderKanban}   accent="bg-[#1b3d6e]" />
        <StatCard label="Committed Budget"      value="$4.2M"  sub="Across active CAs"    icon={DollarSign}     accent="bg-emerald-600" />
        <StatCard label="Gates This Week"       value="3"      sub="Require your action"  icon={CalendarClock}  accent="bg-amber-500" />
        <StatCard label="Open Action Items"     value="18"     sub="From all meetings"    icon={CheckSquare}    accent="bg-violet-600" />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active projects table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold">Active Projects</CardTitle>
            <Link
              href="/projects"
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {MOCK_PROJECTS.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="flex items-center justify-between px-6 py-3 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-md", TYPE_STYLES[p.type])}>
                      {p.type}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {p.storeNumber} — {p.storeName}
                      </p>
                      <p className="text-xs text-muted-foreground">{p.phase}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", HEALTH_STYLES[p.health])}>
                      {HEALTH_LABELS[p.health]}
                    </span>
                    <span className="text-xs text-muted-foreground hidden sm:block">{p.goDate}</span>
                    <ArrowRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming gates + Alerts */}
        <div className="space-y-4">
          {/* Upcoming gates */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CalendarClock className="size-4 text-amber-500" />
                Upcoming Gates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {[
                { label: "SPG Final Approval",   project: "KS207 FC",  date: "Mar 18",  urgent: true },
                { label: "Award GC Contract",     project: "KS421 WIW", date: "Mar 22",  urgent: false },
                { label: "CDs to Permits",        project: "KS388 ER",  date: "Apr 2",   urgent: false },
                { label: "SWPPP Inspection Due",  project: "KS115 MC",  date: "Apr 5",   urgent: false },
              ].map((g, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div>
                    <p className={cn("font-medium", g.urgent ? "text-amber-600" : "text-foreground")}>{g.label}</p>
                    <p className="text-muted-foreground">{g.project}</p>
                  </div>
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded font-mono",
                    g.urgent ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"
                  )}>
                    {g.date}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Smart alerts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Zap className="size-4 text-violet-500" />
                Smart Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 pt-0">
              {[
                { msg: "KS207: SPG Final gate in 3 days",      level: "warning" },
                { msg: "KS421: SWPPP inspection overdue",       level: "danger" },
                { msg: "KS388: CDs received — advance phase?",  level: "info" },
              ].map((a, i) => (
                <div key={i} className={cn(
                  "flex items-start gap-2 text-xs p-2 rounded-md",
                  a.level === "danger"  ? "bg-red-50 text-red-700"    : "",
                  a.level === "warning" ? "bg-amber-50 text-amber-700" : "",
                  a.level === "info"    ? "bg-blue-50 text-blue-700"   : "",
                )}>
                  <AlertTriangle className="size-3 flex-shrink-0 mt-0.5" />
                  {a.msg}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
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
