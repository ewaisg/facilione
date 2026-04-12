"use client"

import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  MapPin,
  MessageSquare,
  CalendarDays,
  Users,
  FileText,
  ExternalLink,
  Clock,
} from "lucide-react"
import type {
  SiteFolioOverview,
  SiteFolioComment,
  SiteFolioTeamContact,
  SiteFolioReportLink,
  SiteFolioSyncMeta,
  SiteFolioUpcomingMilestone,
} from "@/types/sitefolio"

interface SfOverviewPanelProps {
  projectId: string
}

const SITEFOLIO_BASE_URL = "https://www.sitefolio.net"

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "just now"
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}hr ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  return formatDate(dateStr)
}

interface PanelData {
  overview: SiteFolioOverview | null
  comments: SiteFolioComment[]
  team: SiteFolioTeamContact[]
  reports: SiteFolioReportLink[]
  upcomingMilestones: SiteFolioUpcomingMilestone[]
  syncMeta: SiteFolioSyncMeta | null
}

export function SfOverviewPanel({ projectId }: SfOverviewPanelProps) {
  const [data, setData] = useState<PanelData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [overviewSnap, commentsSnap, teamSnap, reportsSnap, metaSnap] =
          await Promise.all([
            getDoc(doc(db, "projects", projectId, "sitefolio", "overview")),
            getDoc(doc(db, "projects", projectId, "sitefolio", "comments")),
            getDoc(doc(db, "projects", projectId, "sitefolio", "team")),
            getDoc(doc(db, "projects", projectId, "sitefolio", "reports")),
            getDoc(doc(db, "projects", projectId, "sitefolio", "sync-meta")),
          ])

        const overview = overviewSnap.exists()
          ? (overviewSnap.data() as SiteFolioOverview)
          : null
        const commentsData = commentsSnap.exists() ? commentsSnap.data() : null
        const teamData = teamSnap.exists() ? teamSnap.data() : null
        const reportsData = reportsSnap.exists() ? reportsSnap.data() : null
        const syncMeta = metaSnap.exists()
          ? (metaSnap.data() as SiteFolioSyncMeta)
          : null

        // Extract upcoming milestones from schedule doc
        const scheduleSnap = await getDoc(
          doc(db, "projects", projectId, "sitefolio", "schedule")
        )
        let upcomingMilestones: SiteFolioUpcomingMilestone[] = []
        if (scheduleSnap.exists()) {
          const scheduleData = scheduleSnap.data()
          // Derive upcoming milestones from the milestones array
          if (scheduleData.milestones && Array.isArray(scheduleData.milestones)) {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            upcomingMilestones = scheduleData.milestones
              .filter(
                (m: { projectedDate: string | null; isComplete: boolean }) =>
                  m.projectedDate &&
                  !m.isComplete &&
                  new Date(m.projectedDate) >= today
              )
              .sort(
                (
                  a: { projectedDate: string },
                  b: { projectedDate: string }
                ) =>
                  new Date(a.projectedDate).getTime() -
                  new Date(b.projectedDate).getTime()
              )
              .slice(0, 5)
              .map(
                (m: {
                  projectedDate: string
                  milestoneName: string
                  phaseName: string
                }) => ({
                  date: m.projectedDate,
                  milestone: m.milestoneName,
                  phase: m.phaseName,
                })
              )
          }
        }

        setData({
          overview,
          comments: (commentsData?.items as SiteFolioComment[]) ?? [],
          team: (teamData?.items as SiteFolioTeamContact[]) ?? [],
          reports: (reportsData?.items as SiteFolioReportLink[]) ?? [],
          upcomingMilestones,
          syncMeta,
        })
      } catch (err) {
        console.error("Error fetching SiteFolio overview:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [projectId])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (!data || (!data.overview && data.comments.length === 0 && data.team.length === 0)) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
          <Clock className="size-8 opacity-40" />
          <p className="text-sm font-medium">No SiteFolio data available</p>
          <p className="text-xs">
            Link this project to SiteFolio in the Admin panel.
          </p>
        </CardContent>
      </Card>
    )
  }

  const latestComment =
    data.comments.find((c) => c.isLatest) ?? data.comments[0] ?? null
  const teamSlice = data.team.slice(0, 5)

  const fullAddress = data.overview
    ? [data.overview.address, data.overview.city, data.overview.state, data.overview.zip]
        .filter(Boolean)
        .join(", ")
    : null

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm">SiteFolio Overview</CardTitle>
            {data.overview?.projectStatus && (
              <Badge variant="info" className="text-xs">
                {data.overview.projectStatus}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            {data.syncMeta?.lastSyncAt && (
              <span className="text-xs text-muted-foreground">
                Last synced: {getRelativeTime(data.syncMeta.lastSyncAt)}
              </span>
            )}
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-4">
          {/* Address Section */}
          {fullAddress && (
            <div className="flex items-start gap-2">
              <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="text-xs">
                {data.overview?.googleMapsUrl ? (
                  <a
                    href={data.overview.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {fullAddress}
                  </a>
                ) : (
                  <span className="text-foreground">{fullAddress}</span>
                )}
                {data.overview?.projectDescription && (
                  <p className="text-muted-foreground mt-0.5">
                    {data.overview.projectDescription}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Latest Comment */}
          {latestComment && (
            <div className="flex items-start gap-2">
              <MessageSquare className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="text-xs">
                <span className="font-medium text-muted-foreground">
                  Latest Comment
                  {latestComment.date
                    ? ` (${formatDate(latestComment.date)})`
                    : ""}
                  :
                </span>
                <p className="text-foreground mt-0.5">
                  &ldquo;{latestComment.text}&rdquo;
                  {latestComment.authorInitials && (
                    <span className="text-muted-foreground">
                      {" "}
                      &mdash; {latestComment.authorInitials}
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Upcoming Milestones */}
          {data.upcomingMilestones.length > 0 && (
            <div className="flex items-start gap-2">
              <CalendarDays className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="text-xs space-y-1">
                <span className="font-medium text-muted-foreground">
                  Upcoming Milestones
                </span>
                <ul className="space-y-0.5">
                  {data.upcomingMilestones.map((m, i) => (
                    <li key={i} className="text-foreground">
                      <span className="text-muted-foreground">
                        {formatDate(m.date)}
                      </span>{" "}
                      &mdash; {m.milestone}
                      {m.phase && (
                        <span className="text-muted-foreground">
                          {" "}
                          ({m.phase})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Team Contacts */}
          {teamSlice.length > 0 && (
            <div className="flex items-start gap-2">
              <Users className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="text-xs space-y-1">
                <span className="font-medium text-muted-foreground">Team</span>
                <ul className="space-y-0.5">
                  {teamSlice.map((contact, i) => (
                    <li key={i} className="text-foreground">
                      <span className="text-muted-foreground">
                        {contact.role}:
                      </span>{" "}
                      {contact.name}
                      {contact.email && (
                        <span className="text-muted-foreground">
                          {" "}
                          ({contact.email})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Report Links */}
          {data.reports.length > 0 && (
            <div className="flex items-start gap-2">
              <FileText className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="text-xs space-y-1">
                <span className="font-medium text-muted-foreground">
                  Reports
                </span>
                <ul className="space-y-0.5">
                  {data.reports.map((report, i) => (
                    <li key={i}>
                      <a
                        href={
                          report.url.startsWith("http")
                            ? report.url
                            : `${SITEFOLIO_BASE_URL}${report.url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {report.name}
                        {report.format && (
                          <span className="text-muted-foreground">
                            ({report.format})
                          </span>
                        )}
                        <ExternalLink className="size-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
