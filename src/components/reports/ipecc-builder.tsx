"use client"

import { useMemo, useState } from "react"
import { Upload, FileCheck2, FileSpreadsheet, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface IpeccBuilderProps {
  projectId?: string
  projectLabel?: string
}

type IpeccSourceKey = "projectVariance" | "capitalCommitments" | "projectCostDetails" | "changeOrders"

const SOURCES: Array<{ key: IpeccSourceKey; title: string; help: string; required?: boolean }> = [
  {
    key: "projectVariance",
    title: "Project Variance Report (PVR)",
    help: "Oracle project variance report for approved budget and variance deltas.",
    required: true,
  },
  {
    key: "capitalCommitments",
    title: "Capital Commitments Report (CCR)",
    help: "Current committed cost details and remaining balance.",
    required: true,
  },
  {
    key: "projectCostDetails",
    title: "Project Cost Details (PCD)",
    help: "Detailed transaction-level project costs.",
    required: true,
  },
  {
    key: "changeOrders",
    title: "Change Order Summary",
    help: "SiteFolio or contractor change-order summary for CO impact.",
    required: true,
  },
]

export function IpeccBuilder({ projectId, projectLabel }: IpeccBuilderProps) {
  const [files, setFiles] = useState<Partial<Record<IpeccSourceKey, File>>>({})
  const [generating, setGenerating] = useState(false)

  const requiredComplete = useMemo(
    () => SOURCES.every((s) => (s.required ? Boolean(files[s.key]) : true)),
    [files],
  )

  function onFileChange(key: IpeccSourceKey, file: File | undefined) {
    setFiles((prev) => ({ ...prev, [key]: file }))
  }

  function clearFile(key: IpeccSourceKey) {
    setFiles((prev) => ({ ...prev, [key]: undefined }))
  }

  async function handleGenerateDraft() {
    if (!requiredComplete) {
      toast.error("Upload all four source reports first")
      return
    }

    setGenerating(true)
    try {
      // Phase 1: local draft generator state only (API persistence can be added next).
      await new Promise((resolve) => setTimeout(resolve, 700))
      toast.success("IPECC draft package created. Review and finalize in Smart Tools.")
    } catch {
      toast.error("Failed to generate IPECC draft")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileSpreadsheet className="size-4" />
          IPECC Report Builder
        </CardTitle>
        <CardDescription>
          Upload four source reports, then generate a consolidated IPECC draft package.
          {projectLabel ? ` Project: ${projectLabel}` : ""}
          {projectId ? ` (${projectId})` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {SOURCES.map((src) => {
          const file = files[src.key]
          return (
            <div key={src.key} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{src.title}</p>
                  <p className="text-xs text-muted-foreground">{src.help}</p>
                </div>
                {file ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">
                    <FileCheck2 className="size-3" /> Uploaded
                  </span>
                ) : (
                  <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">
                    Required
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor={`ipecc-${src.key}`} className="sr-only">{src.title}</Label>
                <Input
                  id={`ipecc-${src.key}`}
                  type="file"
                  accept=".xlsx,.xls,.csv,.pdf"
                  onChange={(e) => onFileChange(src.key, e.target.files?.[0])}
                />
                {file ? (
                  <Button variant="outline" size="sm" onClick={() => clearFile(src.key)}>Clear</Button>
                ) : null}
              </div>
              {file ? <p className="text-xs text-muted-foreground truncate">{file.name}</p> : null}
            </div>
          )
        })}

        <div className="flex items-center justify-between pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Next step: generate draft, review totals, then export final IPECC packet.
          </p>
          <Button onClick={handleGenerateDraft} disabled={!requiredComplete || generating}>
            {generating ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            Generate IPECC Draft
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
