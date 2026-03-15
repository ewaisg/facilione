"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  ChevronRight, ChevronLeft, Check, Building2, MapPin,
  CalendarDays, Users, DollarSign, Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PROJECT_TYPE_LABELS, PROJECT_TYPE_DURATIONS, ORACLE_PARENT_PROJECTS, type ProjectType } from "@/types"
import { toast } from "sonner"

const PROJECT_TYPES: ProjectType[] = ["NS", "ER", "WIW", "FC", "MC"]

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY"
]

const STEPS = [
  { num: 1, label: "Project Type",  icon: Building2 },
  { num: 2, label: "Store Details", icon: MapPin },
  { num: 3, label: "Schedule",      icon: CalendarDays },
  { num: 4, label: "Team & Budget", icon: Users },
  { num: 5, label: "Review",        icon: Check },
]

const TYPE_COLORS: Record<ProjectType, string> = {
  NS:  "border-blue-200 bg-blue-50 hover:border-blue-400",
  ER:  "border-purple-200 bg-purple-50 hover:border-purple-400",
  WIW: "border-teal-200 bg-teal-50 hover:border-teal-400",
  FC:  "border-amber-200 bg-amber-50 hover:border-amber-400",
  MC:  "border-slate-200 bg-slate-50 hover:border-slate-400",
}
const TYPE_SELECTED: Record<ProjectType, string> = {
  NS:  "border-blue-500 bg-blue-100 ring-2 ring-blue-300",
  ER:  "border-purple-500 bg-purple-100 ring-2 ring-purple-300",
  WIW: "border-teal-500 bg-teal-100 ring-2 ring-teal-300",
  FC:  "border-amber-500 bg-amber-100 ring-2 ring-amber-300",
  MC:  "border-slate-500 bg-slate-100 ring-2 ring-slate-300",
}

interface FormData {
  projectType: ProjectType | ""
  storeNumber: string
  storeName: string
  storeAddress: string
  storeCity: string
  storeState: string
  grandOpeningDate: string
  pmUserId: string
  cmUserId: string
  oracleParentProject: string
  oracleProjectNumber: string
  totalBudget: string
  notes: string
}

const initialForm: FormData = {
  projectType: "", storeNumber: "", storeName: "", storeAddress: "",
  storeCity: "", storeState: "CO", grandOpeningDate: "", pmUserId: "",
  cmUserId: "", oracleParentProject: "", oracleProjectNumber: "",
  totalBudget: "", notes: "",
}

export default function NewProjectPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(initialForm)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const set = (field: keyof FormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  // Auto-fill oracle parent when type changes
  const selectType = (type: ProjectType) => {
    set("projectType", type)
    set("oracleParentProject", ORACLE_PARENT_PROJECTS[type].code)
  }

  const canNext = () => {
    if (step === 1) return !!form.projectType
    if (step === 2) return !!(form.storeNumber && form.storeName && form.storeCity && form.storeState)
    if (step === 3) return !!form.grandOpeningDate
    if (step === 4) return true
    return true
  }

  const handleCreate = async () => {
    setSaving(true)
    try {
      // In Phase 2, this will write to Firestore and seed phases from schedule template
      await new Promise((r) => setTimeout(r, 1000)) // Simulated save
      toast.success(`Project ${form.storeNumber} created successfully!`)
      router.push("/projects")
    } catch {
      toast.error("Failed to create project. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold">Create New Project</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Fill in the details below. The project schedule will be auto-generated from the template.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const isDone = step > s.num
          const isActive = step === s.num
          return (
            <div key={s.num} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "flex items-center justify-center size-9 rounded-full border-2 transition-all text-sm font-bold",
                  isDone   ? "bg-[#1b3d6e] border-[#1b3d6e] text-white"  :
                  isActive ? "border-[#1b3d6e] text-[#1b3d6e] bg-blue-50" :
                             "border-border text-muted-foreground bg-background"
                )}>
                  {isDone ? <Check className="size-4" /> : <Icon className="size-4" />}
                </div>
                <span className={cn(
                  "text-xs mt-1 font-medium hidden sm:block",
                  isActive ? "text-[#1b3d6e]" : isDone ? "text-foreground" : "text-muted-foreground"
                )}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-2 mb-4 transition-all",
                  step > s.num ? "bg-[#1b3d6e]" : "bg-border"
                )} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">{STEPS[step - 1].label}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Step 1: Project Type */}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PROJECT_TYPES.map((type) => {
                const isSelected = form.projectType === type
                return (
                  <button
                    key={type}
                    onClick={() => selectType(type)}
                    className={cn(
                      "p-4 rounded-xl border-2 text-left transition-all",
                      isSelected ? TYPE_SELECTED[type] : TYPE_COLORS[type]
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg">{type}</span>
                      {isSelected && <Check className="size-5 text-current opacity-70" />}
                    </div>
                    <p className="text-sm font-medium">{PROJECT_TYPE_LABELS[type]}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{PROJECT_TYPE_DURATIONS[type]}</p>
                  </button>
                )
              })}
            </div>
          )}

          {/* Step 2: Store Details */}
          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Store Number <span className="text-red-500">*</span></Label>
                  <Input placeholder="e.g. KS421" value={form.storeNumber} onChange={(e) => set("storeNumber", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Store Name <span className="text-red-500">*</span></Label>
                  <Input placeholder="e.g. Lakewood" value={form.storeName} onChange={(e) => set("storeName", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Street Address</Label>
                <Input placeholder="e.g. 1234 Main St" value={form.storeAddress} onChange={(e) => set("storeAddress", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City <span className="text-red-500">*</span></Label>
                  <Input placeholder="City" value={form.storeCity} onChange={(e) => set("storeCity", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>State <span className="text-red-500">*</span></Label>
                  <Select value={form.storeState} onValueChange={(v) => set("storeState", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Schedule */}
          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label>Target Grand Opening Date <span className="text-red-500">*</span></Label>
                <Input type="date" value={form.grandOpeningDate} onChange={(e) => set("grandOpeningDate", e.target.value)} />
                <p className="text-xs text-muted-foreground">
                  All phase milestones will be calculated backwards from this date using the {form.projectType} schedule template.
                </p>
              </div>
              {form.projectType && form.grandOpeningDate && (
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <CalendarDays className="size-4 text-[#1b3d6e]" />
                    Auto-generated schedule preview
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {getSchedulePreview(form.projectType as ProjectType, form.grandOpeningDate).map((item) => (
                      <div key={item.label} className="flex items-center justify-between bg-background rounded p-2">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium">{item.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Step 4: Team & Budget */}
          {step === 4 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Oracle Parent Project</Label>
                  <Input value={form.oracleParentProject} onChange={(e) => set("oracleParentProject", e.target.value)} placeholder="e.g. 2005018" />
                  <p className="text-xs text-muted-foreground">Auto-filled from project type</p>
                </div>
                <div className="space-y-2">
                  <Label>Oracle Project Number</Label>
                  <Input value={form.oracleProjectNumber} onChange={(e) => set("oracleProjectNumber", e.target.value)} placeholder="Assign later" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Initial Budget Estimate</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="0" type="number" value={form.totalBudget} onChange={(e) => set("totalBudget", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <textarea
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm resize-none min-h-[80px] outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                  placeholder="Any additional project notes…"
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                />
              </div>
            </>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="rounded-xl border divide-y">
                {[
                  { label: "Project Type",    value: `${form.projectType} — ${PROJECT_TYPE_LABELS[form.projectType as ProjectType]}` },
                  { label: "Store",            value: `${form.storeNumber} · ${form.storeName}, ${form.storeCity} ${form.storeState}` },
                  { label: "Grand Opening",    value: form.grandOpeningDate ? new Date(form.grandOpeningDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—" },
                  { label: "Oracle Parent",    value: form.oracleParentProject || "—" },
                  { label: "Budget Estimate",  value: form.totalBudget ? `$${Number(form.totalBudget).toLocaleString()}` : "TBD" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium text-right max-w-xs truncate">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700">
                <strong>What happens next:</strong> FaciliOne will create the project and auto-seed all phases and milestones from the {form.projectType} schedule template based on your Grand Opening date.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => step > 1 ? setStep(step - 1) : router.push("/projects")}
        >
          <ChevronLeft className="size-4" />
          {step === 1 ? "Cancel" : "Back"}
        </Button>
        {step < 5 ? (
          <Button
            className="bg-[#1b3d6e] hover:bg-[#162f55]"
            onClick={() => setStep(step + 1)}
            disabled={!canNext()}
          >
            Continue <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button
            className="bg-[#1b3d6e] hover:bg-[#162f55] min-w-32"
            onClick={handleCreate}
            disabled={saving}
          >
            {saving ? <><Loader2 className="size-4 animate-spin" /> Creating…</> : <><Check className="size-4" /> Create Project</>}
          </Button>
        )}
      </div>
    </div>
  )
}

// Calculate phase preview dates from GO date
function getSchedulePreview(type: ProjectType, goDateStr: string) {
  const go = new Date(goDateStr)
  const addWeeks = (weeks: number) => {
    const d = new Date(go)
    d.setDate(go.getDate() + weeks * 7)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })
  }

  const offsets: Record<ProjectType, Array<{ label: string; offset: number }>> = {
    NS:  [{ label: "Site Plan Received", offset: -109 }, { label: "Pre-Con CA", offset: -111 }, { label: "CDs Submitted", offset: -56 }, { label: "Construction Start", offset: -43 }, { label: "TCO", offset: -13 }, { label: "Grand Opening", offset: 0 }],
    ER:  [{ label: "Pre-Con CA", offset: -111 }, { label: "Arch. Authorized", offset: -69 }, { label: "Bids Solicited", offset: -49 }, { label: "Construction Start", offset: -43 }, { label: "Expansion Opens", offset: -19 }, { label: "Grand Opening", offset: 0 }],
    WIW: [{ label: "Pre-Con CA", offset: -70 }, { label: "Arch. Authorized", offset: -37 }, { label: "CDs Submitted", offset: -28 }, { label: "Construction Start", offset: -20 }, { label: "Grand Opening", offset: 0 }],
    FC:  [{ label: "SPG Concept", offset: -57 }, { label: "SPG Prelim", offset: -46 }, { label: "SPG Final", offset: -34 }, { label: "Construction Start", offset: -14 }, { label: "Tanks Buried", offset: -13 }, { label: "Grand Opening", offset: 0 }],
    MC:  [{ label: "CA Submitted", offset: -12 }, { label: "Bids Solicited", offset: -8 }, { label: "Construction Start", offset: -6 }, { label: "Construction End", offset: -2 }, { label: "Project Closed", offset: 0 }],
  }

  return (offsets[type] || []).map((o) => ({
    label: o.label,
    date: addWeeks(o.offset),
  }))
}
