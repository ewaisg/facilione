"use client"

import { useEffect, useMemo, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { ExternalLink, FileText, Loader2, RefreshCw } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth-context"
import { db } from "@/lib/firebase"
import { subscribeToProjects } from "@/lib/firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Project } from "@/types"
import type { SiteFolioReportLink } from "@/types/sitefolio"

const SITEFOLIO_BASE_URL = "https://www.sitefolio.net"

function toReportUrl(url: string) {
  return url.startsWith("http") ? url : `${SITEFOLIO_BASE_URL}${url}`
}

export default function ReportsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [selectedProjectId, setSelectedProjectId] = useState("")
  const [reports, setReports] = useState<SiteFolioReportLink[]>([])
  const [reportsLoading, setReportsLoading] = useState(false)

  useEffect(() => {
    if (!user) return

    const unsub = subscribeToProjects(
      user,
      (data) => {
        setProjects(data)
        setProjectsLoading(false)
        setSelectedProjectId((current) => current || data.find((p) => p.sfProjectId)?.id || data[0]?.id || "")
      },
      (err) => {
        console.error("Reports project subscription error:", err)
        setProjectsLoading(false)
      },
    )

    return () => unsub()
  }, [user])

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  )

  const loadReports = async (projectId: string) => {
    if (!projectId) {
      setReports([])
      return
    }

    setReportsLoading(true)
    try {
      const snap = await getDoc(doc(db, "projects", projectId, "sitefolio", "reports"))
      const items = snap.exists() ? ((snap.data().items ?? []) as SiteFolioReportLink[]) : []
      setReports(items)
    } catch (err) {
      console.error("Failed to load SiteFolio report links:", err)
      setReports([])
    } finally {
      setReportsLoading(false)
    }
  }

  useEffect(() => {
    loadReports(selectedProjectId)
  }, [selectedProjectId])

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Reports</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Direct SiteFolio report downloads for synced projects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={selectedProjectId}
            onValueChange={setSelectedProjectId}
            disabled={projectsLoading || projects.length === 0}
          >
            <SelectTrigger className="w-72">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.storeNumber} - {project.storeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => loadReports(selectedProjectId)}
            disabled={!selectedProjectId || reportsLoading}
          >
            {reportsLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="size-4" />
            {selectedProject
              ? `${selectedProject.storeNumber} - ${selectedProject.storeName}`
              : "SiteFolio Reports"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projectsLoading || reportsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : !selectedProjectId ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No projects are available yet.
            </div>
          ) : reports.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No SiteFolio report links are synced for this project yet.
            </div>
          ) : (
            <div className="divide-y rounded-lg border">
              {reports.map((report, index) => (
                <a
                  key={`${report.name}-${index}`}
                  href={toReportUrl(report.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{report.name}</p>
                    {report.format && (
                      <p className="text-xs text-muted-foreground uppercase">{report.format}</p>
                    )}
                  </div>
                  <ExternalLink className="size-4 text-muted-foreground shrink-0" />
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
