"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, Copy, CalendarClock } from "lucide-react"
import { toast } from "sonner"
import type { Project, Phase } from "@/types"

interface AiScheduleStatusProps {
  project: Project
  phases: Phase[]
}

export function AiScheduleStatus({ project, phases }: AiScheduleStatusProps) {
  const [report, setReport] = useState("")
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/ai/reports/schedule-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          projectType: project.projectType,
          milestones: phases.flatMap((p) =>
            p.checklistItems?.map((item) => ({
              name: `${p.name} — ${item.description}`,
              plannedDate: undefined,
              actualDate: item.completedDate || undefined,
              status: item.status,
            })) || [],
          ),
          phases: phases.map((p) => ({
            name: p.name,
            phaseNumber: p.phaseNumber,
            status: p.status,
          })),
          recentChanges: [],
        }),
      })

      if (!res.ok) throw new Error("Failed to generate")

      const data = await res.json()
      setReport(data.report)
      toast.success("Schedule status report generated")
    } catch {
      toast.error("Failed to generate schedule status")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(report)
    toast.success("Copied to clipboard")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm">Schedule Status</CardTitle>
          <Badge variant="info">AI-generated</Badge>
        </div>
        <CardDescription>AI-generated schedule health report from milestone data.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!report ? (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <div className="size-12 rounded-2xl bg-muted flex items-center justify-center">
              <CalendarClock className="size-6 opacity-40" />
            </div>
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              Generate a schedule health report from milestone dates and SOP baseline comparison.
            </p>
            <Button size="sm" onClick={handleGenerate} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5 mr-1.5" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="prose prose-sm max-w-none text-sm whitespace-pre-wrap bg-muted/30 rounded-lg p-4">
              {report}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleCopy}>
                <Copy className="size-3.5 mr-1.5" />
                Copy
              </Button>
              <Button size="sm" onClick={handleGenerate} disabled={loading}>
                {loading ? (
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                ) : (
                  <Sparkles className="size-3.5 mr-1.5" />
                )}
                Regenerate
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
