"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Plus, Search, Building2, CalendarDays,
  DollarSign, ChevronRight, ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PROJECT_TYPE_LABELS } from "@/types"

const ALL_TYPES = ["All", "NS", "ER", "WIW", "FC", "MC"] as const
type FilterType = typeof ALL_TYPES[number]

const TYPE_STYLES: Record<string, string> = {
  NS:  "bg-blue-100 text-blue-800 border-blue-200",
  ER:  "bg-purple-100 text-purple-800 border-purple-200",
  WIW: "bg-teal-100 text-teal-800 border-teal-200",
  FC:  "bg-amber-100 text-amber-800 border-amber-200",
  MC:  "bg-slate-100 text-slate-700 border-slate-200",
}

const HEALTH_STYLES: Record<string, string> = {
  green:  "bg-emerald-100 text-emerald-700",
  yellow: "bg-amber-100 text-amber-700",
  red:    "bg-red-100 text-red-700",
}
const HEALTH_LABELS: Record<string, string> = {
  green: "On Track", yellow: "At Risk", red: "Delayed"
}

// Placeholder project data — will be replaced with Firestore in Phase 2
const MOCK_PROJECTS = [
  { id: "1", storeNumber: "KS421", storeName: "Lakewood",  storeState: "CO", type: "WIW", health: "green",  phase: "Phase 5 — Bidding",         goDate: "Dec 15, 2025", budget: 1850000,  pm: "G. Ewais" },
  { id: "2", storeNumber: "KS207", storeName: "Aurora",    storeState: "CO", type: "FC",  health: "yellow", phase: "Phase 3 — Site Plan",        goDate: "Oct 1, 2025",  budget: 2400000,  pm: "G. Ewais" },
  { id: "3", storeNumber: "KS388", storeName: "Denver",    storeState: "CO", type: "ER",  health: "green",  phase: "Phase 4 — Design Dev.",      goDate: "Mar 20, 2026", budget: 8900000,  pm: "S. Marsh"  },
  { id: "4", storeNumber: "KS115", storeName: "Boulder",   storeState: "CO", type: "MC",  health: "green",  phase: "Phase 4 — Construction",     goDate: "Apr 5, 2025",  budget: 420000,   pm: "G. Ewais" },
  { id: "5", storeNumber: "KS552", storeName: "Fort Collins", storeState: "CO", type: "NS",  health: "green",  phase: "Phase 2 — Due Diligence",  goDate: "Jan 10, 2027", budget: 14500000, pm: "M. Torres" },
  { id: "6", storeNumber: "KS300", storeName: "Thornton",  storeState: "CO", type: "WIW", health: "red",    phase: "Phase 6 — Construction",     goDate: "Jun 1, 2025",  budget: 2100000,  pm: "S. Marsh"  },
]

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

export default function ProjectsPage() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<FilterType>("All")

  const filtered = MOCK_PROJECTS.filter((p) => {
    const matchType = typeFilter === "All" || p.type === typeFilter
    const q = search.toLowerCase()
    const matchSearch = !q ||
      p.storeNumber.toLowerCase().includes(q) ||
      p.storeName.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q)
    return matchType && matchSearch
  })

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Projects</h2>
          <p className="text-sm text-muted-foreground">{MOCK_PROJECTS.length} active projects</p>
        </div>
        <Link href="/projects/new">
          <Button className="bg-[#1b3d6e] hover:bg-[#162f55] gap-2">
            <Plus className="size-4" />
            New Project
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
                  ? "bg-[#1b3d6e] text-white border-[#1b3d6e]"
                  : "bg-background text-muted-foreground border-border hover:border-[#1b3d6e] hover:text-[#1b3d6e]"
              )}
            >
              {t === "All" ? "All Types" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Project grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="size-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No projects found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`}>
              <Card className="hover:shadow-md hover:border-[#1b3d6e]/30 transition-all cursor-pointer group h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-md border", TYPE_STYLES[p.type])}>
                        {p.type}
                      </span>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", HEALTH_STYLES[p.health])}>
                        {HEALTH_LABELS[p.health]}
                      </span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <h3 className="font-semibold text-foreground">
                    {p.storeNumber} — {p.storeName}, {p.storeState}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {PROJECT_TYPE_LABELS[p.type as keyof typeof PROJECT_TYPE_LABELS]}
                  </p>

                  <div className="mt-4 pt-3 border-t space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ArrowRight className="size-3 flex-shrink-0" />
                      <span className="truncate">{p.phase}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="size-3" />
                        GO: {p.goDate}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <DollarSign className="size-3" />
                        {formatCurrency(p.budget)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      PM: {p.pm}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
