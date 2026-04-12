"use client"

import { useState, useMemo } from "react"
import { SOP_DATA, PROJECT_KEYS, APPENDIX_KEYS, ALL_SOP_KEYS } from "@/constants/sop-data"
import { cn } from "@/lib/utils"
import { Search, ChevronDown, Filter, BookOpen } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { SOPProject, SOPPhase, SOPStep } from "@/types/sop"

// ── System badge color mapping ──
function getSysClass(sys: string) {
  const s = sys.toLowerCase()
  if (s.includes("oracle") || s.includes("cars")) return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
  if (s.includes("s|f") || s.includes("sitefolio")) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
  if (s.includes("coupa")) return "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300"
  if (s.includes("email")) return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
  return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
}

// ── Search result type ──
interface SearchResult {
  proj: string
  projKey: string
  phase: string
  step: SOPStep | { n: string; text: string; owner: string; sys: string; wk: string }
}

export default function SOPReferencePage() {
  const [currentProject, setCurrentProject] = useState<string>("ns")
  const [searchQuery, setSearchQuery] = useState("")
  const [showGatesOnly, setShowGatesOnly] = useState(false)
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set())

  const project = SOP_DATA[currentProject]

  // ── Search across all SOPs ──
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q || q.length < 2) return null

    const results: SearchResult[] = []
    ALL_SOP_KEYS.forEach((k) => {
      const p = SOP_DATA[k]
      p.phases.forEach((ph) => {
        ph.steps.forEach((s) => {
          if (s.text.toLowerCase().includes(q) || s.n.toLowerCase().includes(q)) {
            results.push({ proj: p.title, projKey: k, phase: ph.name, step: s })
          }
        })
        ph.gates.forEach((g) => {
          if (g.toLowerCase().includes(q)) {
            results.push({
              proj: p.title, projKey: k, phase: ph.name,
              step: { n: "GATE", text: g, owner: "", sys: "", wk: "" },
            })
          }
        })
      })
    })
    return results
  }, [searchQuery])

  const togglePhase = (phaseName: string) => {
    setCollapsedPhases((prev) => {
      const next = new Set(prev)
      if (next.has(phaseName)) next.delete(phaseName)
      else next.add(phaseName)
      return next
    })
  }

  const selectProject = (key: string) => {
    setCurrentProject(key)
    setSearchQuery("")
    setCollapsedPhases(new Set())
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Sidebar Navigation ── */}
      <aside className="w-64 border-r bg-background flex flex-col flex-shrink-0">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search all SOPs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* Project Types */}
          <div className="px-2 pt-2 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Project Types
            </span>
          </div>
          {PROJECT_KEYS.map((k) => {
            const p = SOP_DATA[k]
            const stepCount = p.phases.reduce((a, ph) => a + ph.steps.length, 0)
            return (
              <button
                key={k}
                onClick={() => selectProject(k)}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  currentProject === k
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span className="truncate">{p.title.split("(")[0].trim()}</span>
                <Badge
                  variant={currentProject === k ? "default" : "secondary"}
                  className="text-[10px] px-1.5 py-0 h-5 font-mono"
                >
                  {stepCount}
                </Badge>
              </button>
            )
          })}

          {/* Appendices */}
          <div className="px-2 pt-4 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Appendices
            </span>
          </div>
          {APPENDIX_KEYS.map((k) => {
            const p = SOP_DATA[k]
            const stepCount = p.phases.reduce((a, ph) => a + ph.steps.length, 0)
            const shortTitle = p.title.replace("Appendix ", "").replace(/:.*/, "")
            return (
              <button
                key={k}
                onClick={() => selectProject(k)}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  currentProject === k
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span className="truncate">{shortTitle}</span>
                <Badge
                  variant={currentProject === k ? "default" : "secondary"}
                  className="text-[10px] px-1.5 py-0 h-5 font-mono"
                >
                  {stepCount}
                </Badge>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto">
        {/* Search Results Mode */}
        {searchResults !== null ? (
          <div className="p-6 max-w-4xl mx-auto">
            <p className="text-sm text-muted-foreground mb-4">
              {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
            </p>
            {searchResults.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <BookOpen className="size-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No results found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => selectProject(r.projKey)}
                    className="w-full text-left rounded-lg border bg-card p-3 hover:border-primary/50 hover:shadow-sm transition-all"
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wide text-primary mb-0.5">
                      {r.proj}
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">
                      {r.phase} &middot; Step {r.step.n}
                    </div>
                    <div className="text-sm" dangerouslySetInnerHTML={{
                      __html: r.step.text.replace(
                        new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
                        '<mark class="bg-primary/20 text-primary rounded px-0.5">$1</mark>'
                      )
                    }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Normal Content Mode */
          <div className="p-6 max-w-4xl mx-auto">
            {/* Project Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-1">{project.title}</h1>
              <p className="text-sm text-muted-foreground mb-3">{project.objective}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="font-mono text-xs">{project.template}</Badge>
                <Badge variant="outline" className="font-mono text-xs">BA: {project.businessArea}</Badge>
                <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                  Baseline: {project.baseline}
                </Badge>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setShowGatesOnly(!showGatesOnly)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors",
                  showGatesOnly
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-background text-muted-foreground border-border hover:text-foreground"
                )}
              >
                <Filter className="size-3" />
                Gates Only
              </button>
            </div>

            {/* Schedule Summary (collapsible) */}
            {project.schedule.length > 0 && (
              <ScheduleSummary schedule={project.schedule} />
            )}

            {/* Phases */}
            {project.phases.map((phase, pi) => (
              <PhaseSection
                key={pi}
                phase={phase}
                showGatesOnly={showGatesOnly}
                collapsed={collapsedPhases.has(phase.name)}
                onToggle={() => togglePhase(phase.name)}
              />
            ))}

            {/* Source Documents */}
            <div className="rounded-lg border bg-card p-4 mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                Source Documents
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {project.sources.map((s, i) => (
                  <span key={i} className="text-[11px] px-2 py-1 bg-muted rounded border font-mono text-muted-foreground">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// ── Schedule Summary Component ──
function ScheduleSummary({ schedule }: { schedule: SOPProject["schedule"] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-lg border bg-card mb-4 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-muted/50 text-xs font-bold uppercase tracking-wide text-muted-foreground hover:bg-muted transition-colors"
      >
        Schedule Summary
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left px-4 py-2 text-xs font-semibold uppercase text-muted-foreground">Milestone</th>
              <th className="text-left px-4 py-2 text-xs font-semibold uppercase text-muted-foreground">Baseline</th>
              <th className="text-left px-4 py-2 text-xs font-semibold uppercase text-muted-foreground">Gate / Note</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((s, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-2 text-sm">{s.m}</td>
                <td className="px-4 py-2 font-mono text-xs font-semibold text-primary">{s.wk}</td>
                <td className={cn("px-4 py-2 text-xs", s.gate ? "text-red-600 dark:text-red-400 font-medium" : "text-muted-foreground")}>
                  {s.gate || "\u2014"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ── Phase Section Component ──
function PhaseSection({
  phase,
  showGatesOnly,
  collapsed,
  onToggle,
}: {
  phase: SOPPhase
  showGatesOnly: boolean
  collapsed: boolean
  onToggle: () => void
}) {
  const stepsToShow = showGatesOnly ? [] : phase.steps

  return (
    <div className="rounded-lg border bg-card mb-3 overflow-hidden shadow-sm">
      {/* Phase Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-900 dark:to-slate-800 text-white cursor-pointer"
      >
        <h3 className="text-sm font-bold flex items-center gap-2">
          <ChevronDown className={cn("size-3 transition-transform", collapsed && "-rotate-90")} />
          {phase.name}
        </h3>
        <span className="text-xs opacity-60">
          {phase.steps.length} steps &middot; {phase.gates.length} gate{phase.gates.length !== 1 ? "s" : ""}
        </span>
      </button>

      {/* Phase Body */}
      {!collapsed && (
        <div>
          {/* Steps */}
          {stepsToShow.map((step, si) => (
            <StepRow key={si} step={step} isEven={si % 2 === 0} />
          ))}

          {/* Gates */}
          {phase.gates.map((g, gi) => (
            <div
              key={`gate-${gi}`}
              className="px-4 py-2.5 bg-red-50 dark:bg-red-950/30 border-l-[3px] border-red-500 border-b text-xs font-semibold text-red-700 dark:text-red-400 flex items-center gap-2"
            >
              <span className="text-[10px] font-extrabold tracking-wide">GATE</span>
              {g}
            </div>
          ))}

          {/* Tips */}
          {phase.tips.map((t, ti) => (
            <div
              key={`tip-${ti}`}
              className="px-4 py-2.5 bg-teal-50 dark:bg-teal-950/30 border-l-[3px] border-teal-500 border-b text-xs text-teal-700 dark:text-teal-400 leading-relaxed"
            >
              <span className="font-bold text-[10px] tracking-wide">TIP: </span>
              {t}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Step Row Component ──
function StepRow({ step, isEven }: { step: SOPStep; isEven: boolean }) {
  return (
    <div
      className={cn(
        "grid grid-cols-[44px_1fr_auto] gap-0 px-4 py-2.5 border-b items-start hover:bg-primary/5 transition-colors",
        !isEven && "bg-muted/30"
      )}
    >
      <div className="font-mono text-xs font-semibold text-primary pt-0.5">{step.n}</div>
      <div className="text-sm leading-relaxed pr-3">
        {step.text}
        {step.wk && (
          <span className="ml-1.5 font-mono text-[11px] text-muted-foreground font-medium">
            ({step.wk})
          </span>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 min-w-[100px]">
        <span className="text-[11px] font-semibold text-muted-foreground">{step.owner}</span>
        <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-semibold", getSysClass(step.sys))}>
          {step.sys}
        </span>
      </div>
    </div>
  )
}
