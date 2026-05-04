"use client"

import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  MapPin,
  MessageSquare,
  CalendarDays,
  Users,
  FileText,
  ExternalLink,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import type {
  SiteFolioOverview,
  SiteFolioComment,
  SiteFolioTeamContact,
  SiteFolioReportLink,
  SiteFolioSyncMeta,
  SiteFolioUpcomingMilestone,
  SiteFolioMilestone,
} from "@/types/sitefolio"

const SITEFOLIO_BASE_URL = "https://www.sitefolio.net"

interface SfOverviewTabProps {
  projectId: string
}

interface TabData {
  overview: SiteFolioOverview | null
  comments: SiteFolioComment[]
  team: SiteFolioTeamContact[]
  reports: SiteFolioReportLink[]
  upcomingMilestones: SiteFolioUpcomingMilestone[]
  syncMeta: SiteFolioSyncMeta | null
}

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

export function SfOverviewTab({ projectId }: SfOverviewTabProps) {
  const [data, setData] = useState<TabData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAllComments, setShowAllComments] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [overviewSnap, commentsSnap, teamSnap, reportsSnap, metaSnap, scheduleSnap] =
          await Promise.all([
            getDoc(doc(db, "projects", projectId, "sitefolio", "overview")),
            getDoc(doc(db, "projects", projectId, "sitefolio", "comments")),
            getDoc(doc(db, "projects", projectId, "sitefolio", "team")),
            getDoc(doc(db, "projects", projectId, "sitefolio", "reports")),
            getDoc(doc(db, "projects", projectId, "sitefolio", "sync-meta")),
            getDoc(doc(db, "projects", projectId, "sitefolio", "schedule")),
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

        let upcomingMilestones: SiteFolioUpcomingMilestone[] = []
        if (scheduleSnap.exists()) {
          const scheduleData = scheduleSnap.data()
          if (scheduleData.milestones && Array.isArray(scheduleData.milestones)) {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            upcomingMilestones = (scheduleData.milestones as SiteFolioMilestone[])
              .filter((m) => m.projectedDate && !m.isComplete && new Date(m.projectedDate) >= today)
              .sort(
                (a, b) =>
                  new Date(a.projectedDate!).getTime() - new Date(b.projectedDate!).getTime(),
              )
              .slice(0, 8)
              .map((m) => ({
                date: m.projectedDate!,
                milestone: m.milestoneName,
                phase: m.phaseName,
              }))
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
        console.error("Error fetching SiteFolio overview tab data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [projectId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!data || (!data.overview && data.comments.length === 0 && data.team.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
        <Clock className="size-8 opacity-40" />
        <p className="text-sm font-medium">No SiteFolio data available</p>
        <p className="text-xs">
          Link this project to SiteFolio in the Admin panel and run a sync.
        </p>
      </div>
    )
  }

  const fullAddress = data.overview
    ? [data.overview.address, data.overview.city, data.overview.state, data.overview.zip]
        .filter(Boolean)
        .join(", ")
    : null

  const latestComment = data.comments.find((c) => c.isLatest) ?? data.comments[0] ?? null
  const olderComments = data.comments.filter((c) => !c.isLatest && c !== latestComment)
  const displayedOlder = showAllComments ? olderComments : olderComments.slice(0, 2)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Sync status bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          {data.overview?.projectStatus && (
            <Badge variant="info" className="text-xs">
              {data.overview.projectStatus}
            </Badge>
          )}
          {data.overview?.identifier && (
            <span className="text-muted-foreground">{data.overview.identifier}</span>
          )}
        </div>
        {data.syncMeta?.lastSyncAt && (
          <span>Last synced: {getRelativeTime(data.syncMeta.lastSyncAt)}</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column: location + description + reports */}
        <div className="space-y-4">
          {/* Location */}
          {(fullAddress || data.overview?.projectDescription) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-muted-foreground" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {fullAddress && (
                  <div>
                    {data.overview?.googleMapsUrl ? (
                      <a
                        href={data.overview.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {fullAddress}
                        <ExternalLink className="size-3" />
                      </a>
                    ) : (
                      <span className="text-foreground">{fullAddress}</span>
                    )}
                  </div>
                )}
                {data.overview?.projectDescription && (
                  <p className="text-muted-foreground leading-relaxed">
                    {data.overview.projectDescription}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Reports */}
          {data.reports.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <FileText className="size-3.5 text-muted-foreground" />
                  SiteFolio Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
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
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {report.name}
                        {report.format && (
                          <span className="text-muted-foreground text-xs uppercase">
                            ({report.format})
                          </span>
                        )}
                        <ExternalLink className="size-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Center column: comments */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <MessageSquare className="size-3.5 text-muted-foreground" />
                Project Comments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.comments.length === 0 ? (
                <p className="text-xs text-muted-foreground">No comments recorded.</p>
              ) : (
                <>
                  {/* Latest comment */}
                  {latestComment && (
                    <div className="bg-muted/50 rounded-md p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">Latest</Badge>
                        {latestComment.date && (
                          <span className="text-xs text-muted-foreground">
                            {formatDate(latestComment.date)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">
                        &ldquo;{latestComment.text}&rdquo;
                      </p>
                      {latestComment.authorInitials && (
                        <p className="text-xs text-muted-foreground">
                          &mdash; {latestComment.authorFullName || latestComment.authorInitials}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Older comments */}
                  {olderComments.length > 0 && (
                    <div className="space-y-2">
                      {displayedOlder.map((comment, i) => (
                        <div key={i} className="border-l-2 border-muted pl-3 space-y-0.5">
                          <div className="flex items-center justify-between">
                            {comment.date && (
                              <span className="text-xs text-muted-foreground">
                                {formatDate(comment.date)}
                              </span>
                            )}
                            {comment.authorInitials && (
                              <span className="text-xs text-muted-foreground">
                                {comment.authorFullName || comment.authorInitials}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-foreground leading-relaxed">
                            {comment.text}
                          </p>
                        </div>
                      ))}

                      {olderComments.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setShowAllComments((prev) => !prev)}
                          className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                        >
                          {showAllComments ? (
                            <>
                              <ChevronUp className="size-3" />
                              Show less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="size-3" />
                              {olderComments.length - 2} more comment
                              {olderComments.length - 2 !== 1 ? "s" : ""}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: upcoming milestones + team summary */}
        <div className="space-y-4">
          {/* Upcoming milestones */}
          {data.upcomingMilestones.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <CalendarDays className="size-3.5 text-muted-foreground" />
                  Upcoming Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.upcomingMilestones.map((m, i) => (
                    <li key={i} className="text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-foreground leading-tight">{m.milestone}</span>
                        <span className="text-muted-foreground whitespace-nowrap shrink-0">
                          {formatDate(m.date)}
                        </span>
                      </div>
                      {m.phase && (
                        <span className="text-muted-foreground text-xs">{m.phase}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Team summary */}
          {data.team.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <Users className="size-3.5 text-muted-foreground" />
                  Key Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.team.slice(0, 6).map((contact, i) => (
                    <li key={i} className="text-xs space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">{contact.role}:</span>
                        <span className="text-foreground font-medium">{contact.name}</span>
                      </div>
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-primary hover:underline pl-0 text-xs"
                        >
                          {contact.email}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
