"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, Copy, FileText } from "lucide-react"
import { toast } from "sonner"
import type { Project, Phase } from "@/types"

interface AiWeeklyStatusProps {
  project: Project
  phases: Phase[]
}

export function AiWeeklyStatus({ project, phases }: AiWeeklyStatusProps) {
  const [draft, setDraft] = useState("")
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/ai/weekly-update-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: {
            id: project.id,
            storeNumber: project.storeNumber,
            storeName: project.storeName,
            projectType: project.projectType,
            status: project.status,
            healthStatus: project.healthStatus,
            grandOpeningDate: project.grandOpeningDate,
            totalBudget: project.totalBudget,
            committedCost: project.committedCost,
            actualCost: project.actualCost,
            forecastCost: project.forecastCost,
          },
          phases: phases.map((p) => ({
            name: p.name,
            status: p.status,
            targetEndDate: null,
            actualEndDate: null,
          })),
          alerts: [],
          existingComment: draft || undefined,
        }),
      })

      if (!res.ok) throw new Error("Failed to generate")

      const data = await res.json()
      setDraft(data.draft)
      setGenerated(true)
      toast.success("Weekly status draft generated")
    } catch {
      toast.error("Failed to generate weekly status")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(draft)
    toast.success("Copied to clipboard")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm">Weekly Status</CardTitle>
          <Badge variant="info">AI-drafted</Badge>
        </div>
        <CardDescription>AI-drafted weekly status summary based on project data.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!generated ? (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <div className="size-12 rounded-2xl bg-muted flex items-center justify-center">
              <FileText className="size-6 opacity-40" />
            </div>
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              Generate an AI-drafted weekly status report from current project data and schedule.
            </p>
            <Button size="sm" onClick={handleGenerate} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5 mr-1.5" />
                  Generate Draft
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="min-h-[200px] text-sm"
              placeholder="Generated draft will appear here..."
            />
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
