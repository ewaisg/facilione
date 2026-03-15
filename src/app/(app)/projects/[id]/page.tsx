"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft, CalendarDays, DollarSign, User, Building2,
  ListChecks, GanttChartSquare, Wallet, Files, MessageSquare,
  CheckSquare, ShieldAlert, BarChart3, Construction
} from "lucide-react"

// Mock data — will be Firestore in Phase 2
const MOCK = {
  "1": { storeNumber: "KS421", storeName: "Lakewood",   storeState: "CO", type: "WIW", health: "green",  phase: "Phase 5 — Bidding",       goDate: "Dec 15, 2025", budget: 1850000, pm: "G. Ewais", status: "active" },
  "2": { storeNumber: "KS207", storeName: "Aurora",     storeState: "CO", type: "FC",  health: "yellow", phase: "Phase 3 — SPG Review",    goDate: "Oct 1, 2025",  budget: 2400000, pm: "G. Ewais", status: "active" },
  "3": { storeNumber: "KS388", storeName: "Denver",     storeState: "CO", type: "ER",  health: "green",  phase: "Phase 4 — Design Dev.",   goDate: "Mar 20, 2026", budget: 8900000, pm: "S. Marsh", status: "active" },
  "4": { storeNumber: "KS115", storeName: "Boulder",    storeState: "CO", type: "MC",  health: "green",  phase: "Phase 4 — Construction",  goDate: "Apr 5, 2025",  budget: 420000,  pm: "G. Ewais", status: "active" },
  "5": { storeNumber: "KS552", storeName: "Fort Collins",storeState: "CO", type: "NS",  health: "green",  phase: "Phase 2 — Due Diligence", goDate: "Jan 10, 2027", budget: 14500000,pm: "M. Torres",status: "active" },
  "6": { storeNumber: "KS300", storeName: "Thornton",   storeState: "CO", type: "WIW", health: "red",    phase: "Phase 6 — Construction",  goDate: "Jun 1, 2025",  budget: 2100000, pm: "S. Marsh", status: "active" },
} as Record<string, { storeNumber: string; storeName: string; storeState: string; type: string; health: string; phase: string; goDate: string; budget: number; pm: string; status: string }>

const HEALTH_PILL: Record<string, string> = {
  green:  "bg-emerald-100 text-emerald-700",
  yellow: "bg-amber-100 text-amber-700",
  red:    "bg-red-100 text-red-700",
}
const HEALTH_LABEL: Record<string, string> = { green: "On Track", yellow: "At Risk", red: "Delayed" }

const TYPE_PILL: Record<string, string> = {
  NS: "bg-blue-100 text-blue-800", ER: "bg-purple-100 text-purple-800",
  WIW: "bg-teal-100 text-teal-800", FC: "bg-amber-100 text-amber-800", MC: "bg-slate-100 text-slate-700",
}

function PlaceholderTab({ label, icon: Icon }: { label: string; icon: React.ElementType }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
      <div className="size-14 rounded-2xl bg-muted flex items-center justify-center">
        <Icon className="size-7 opacity-40" />
      </div>
      <p className="font-medium text-sm">{label}</p>
      <p className="text-xs">Coming in Phase 2</p>
    </div>
  )
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const project = MOCK[id]

  if (!project) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Project not found.</p>
        <Link href="/projects"><Button variant="link">Back to Projects</Button></Link>
      </div>
    )
  }

  const showCompliance = ["NS", "ER", "FC"].includes(project.type)

  return (
    <div className="flex flex-col h-full">
      {/* Sub-header */}
      <div className="bg-background border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-start justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/projects" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${TYPE_PILL[project.type]}`}>{project.type}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${HEALTH_PILL[project.health]}`}>
                  {HEALTH_LABEL[project.health]}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                {project.storeNumber} — {project.storeName}, {project.storeState}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">{project.phase}</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" /> GO: {project.goDate}</span>
            <span className="flex items-center gap-1.5"><DollarSign className="size-3.5" /> ${(project.budget / 1_000_000).toFixed(1)}M</span>
            <span className="flex items-center gap-1.5"><User className="size-3.5" /> {project.pm}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs defaultValue="overview" className="flex flex-col h-full">
          <div className="border-b bg-background px-6 flex-shrink-0">
            <TabsList className="h-10 bg-transparent gap-0 rounded-none p-0 max-w-7xl mx-auto w-full justify-start">
              {[
                { value: "overview",    label: "Overview",       icon: Building2 },
                { value: "sequence",    label: "Sequence",       icon: ListChecks },
                { value: "schedule",    label: "Schedule",       icon: GanttChartSquare },
                { value: "budget",      label: "Budget",         icon: Wallet },
                { value: "documents",   label: "Documents",      icon: Files },
                { value: "meetings",    label: "Meetings",       icon: MessageSquare },
                { value: "tasks",       label: "Tasks",          icon: CheckSquare },
                ...(showCompliance ? [{ value: "compliance", label: "Compliance", icon: ShieldAlert }] : []),
                { value: "risks",       label: "Risks",          icon: Construction },
                { value: "reports",     label: "Reports",        icon: BarChart3 },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1b3d6e] data-[state=active]:bg-transparent data-[state=active]:text-[#1b3d6e] data-[state=active]:shadow-none h-10 px-4 text-sm gap-1.5"
                >
                  <tab.icon className="size-3.5" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="overview" className="p-6 max-w-7xl mx-auto mt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Grand Opening",   value: project.goDate },
                  { label: "Total Budget",    value: `$${(project.budget / 1_000_000).toFixed(2)}M` },
                  { label: "Project Manager", value: project.pm },
                  { label: "Current Phase",   value: project.phase },
                ].map((card) => (
                  <Card key={card.label}>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{card.label}</p>
                      <p className="font-semibold text-sm">{card.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card>
                <CardContent className="p-5 text-sm text-muted-foreground">
                  <p>Project detail view is being built in Phase 2. The full phase sequence, budget tracker, documents, meetings, and tasks will be available here once connected to Firestore.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sequence"   className="mt-0"><PlaceholderTab label="Sequence & Gates"  icon={ListChecks} /></TabsContent>
            <TabsContent value="schedule"   className="mt-0"><PlaceholderTab label="Schedule / Gantt"  icon={GanttChartSquare} /></TabsContent>
            <TabsContent value="budget"     className="mt-0"><PlaceholderTab label="Budget & Financials" icon={Wallet} /></TabsContent>
            <TabsContent value="documents"  className="mt-0"><PlaceholderTab label="Documents"         icon={Files} /></TabsContent>
            <TabsContent value="meetings"   className="mt-0"><PlaceholderTab label="Meetings"          icon={MessageSquare} /></TabsContent>
            <TabsContent value="tasks"      className="mt-0"><PlaceholderTab label="Tasks"             icon={CheckSquare} /></TabsContent>
            <TabsContent value="compliance" className="mt-0"><PlaceholderTab label="SWPPP / Compliance" icon={ShieldAlert} /></TabsContent>
            <TabsContent value="risks"      className="mt-0"><PlaceholderTab label="Risk Register"     icon={Construction} /></TabsContent>
            <TabsContent value="reports"    className="mt-0"><PlaceholderTab label="Reports"           icon={BarChart3} /></TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
