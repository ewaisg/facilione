"use client"

import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { ExternalLink, FileText, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/firebase"
import { formatDate } from "@/lib/utils"
import type { SiteFolioReportLink, SiteFolioSyncMeta } from "@/types/sitefolio"

const SITEFOLIO_BASE_URL = "https://www.sitefolio.net"

interface SfReportsTabProps {
  projectId: string
}

export function SfReportsTab({ projectId }: SfReportsTabProps) {
  const [reports, setReports] = useState<SiteFolioReportLink[]>([])
  const [syncMeta, setSyncMeta] = useState<SiteFolioSyncMeta | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReports() {
      try {
        const [reportsSnap, metaSnap] = await Promise.all([
          getDoc(doc(db, "projects", projectId, "sitefolio", "reports")),
          getDoc(doc(db, "projects", projectId, "sitefolio", "sync-meta")),
        ])

        const reportsData = reportsSnap.exists() ? reportsSnap.data() : null
        setReports((reportsData?.items as SiteFolioReportLink[]) ?? [])
        setSyncMeta(metaSnap.exists() ? (metaSnap.data() as SiteFolioSyncMeta) : null)
      } catch (err) {
        console.error("Error fetching SiteFolio reports:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [projectId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">SiteFolio Reports</h3>
          <p className="text-sm text-muted-foreground">
            Direct report downloads from the latest SiteFolio sync.
          </p>
        </div>
        {syncMeta?.lastSyncAt && (
          <Badge variant="secondary" className="w-fit">
            Synced {formatDate(syncMeta.lastSyncAt)}
          </Badge>
        )}
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <FileText className="size-8 opacity-50" />
            <p className="text-sm font-medium">No SiteFolio reports synced yet</p>
            <p className="max-w-md text-center text-xs">
              Run a SiteFolio project sync from Admin Projects to load available report links.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((report, index) => {
            const href = report.url.startsWith("http")
              ? report.url
              : `${SITEFOLIO_BASE_URL}${report.url}`

            return (
              <a
                key={`${report.name}-${index}`}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <Card className="h-full transition-colors group-hover:border-primary/40 group-hover:bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-start justify-between gap-3 text-sm">
                      <span className="leading-snug">{report.name}</span>
                      <ExternalLink className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText className="size-3.5" />
                      <span>{report.format ? report.format.toUpperCase() : "Report"}</span>
                    </div>
                  </CardContent>
                </Card>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
