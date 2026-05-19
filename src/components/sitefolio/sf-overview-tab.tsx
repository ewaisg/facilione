"use client"

import { useEffect, useMemo, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import {
  CalendarDays,
  Clock,
  Loader2,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConnectedProjectFactsPanel } from "@/components/projects/project-facts-panel"
import { db } from "@/lib/firebase"
import { formatDate } from "@/lib/utils"
import type { Project } from "@/types"
import type {
  SiteFolioComment,
  SiteFolioMilestone,
  SiteFolioOverview,
  SiteFolioSyncMeta,
  SiteFolioTeamContact,
  SiteFolioUpcomingMilestone,
} from "@/types/sitefolio"

interface SfOverviewTabProps {
  project: Project
}

interface TabData {
  overview: SiteFolioOverview | null
  comments: SiteFolioComment[]
  team: SiteFolioTeamContact[]
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

export function SfOverviewTab({ project }: SfOverviewTabProps) {
  const [data, setData] = useState<TabData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [overviewSnap, commentsSnap, teamSnap, metaSnap, scheduleSnap] =
          await Promise.all([
            getDoc(doc(db, "projects", project.id, "sitefolio", "overview")),
            getDoc(doc(db, "projects", project.id, "sitefolio", "comments")),
            getDoc(doc(db, "projects", project.id, "sitefolio", "team")),
            getDoc(doc(db, "projects", project.id, "sitefolio", "sync-meta")),
            getDoc(doc(db, "projects", project.id, "sitefolio", "schedule")),
          ])

        const overview = overviewSnap.exists()
          ? (overviewSnap.data() as SiteFolioOverview)
          : null
        const commentsData = commentsSnap.exists() ? commentsSnap.data() : null
        const teamData = teamSnap.exists() ? teamSnap.data() : null
        const syncMeta = metaSnap.exists()
          ? (metaSnap.data() as SiteFolioSyncMeta)
          : null

        let upcomingMilestones: SiteFolioUpcomingMilestone[] = []
        if (scheduleSnap.exists()) {
          const scheduleData = scheduleSnap.data()
          if (Array.isArray(scheduleData.milestones)) {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            upcomingMilestones = (scheduleData.milestones as SiteFolioMilestone[])
              .filter((milestone) => {
                if (!milestone.projectedDate || milestone.isComplete) return false
                return new Date(milestone.projectedDate) >= today
              })
              .sort(
                (a, b) =>
                  new Date(a.projectedDate!).getTime() -
                  new Date(b.projectedDate!).getTime(),
              )
              .slice(0, 8)
              .map((milestone) => ({
                date: milestone.projectedDate!,
                milestone: milestone.milestoneName,
                phase: milestone.phaseName,
              }))
          }
        }

        setData({
          overview,
          comments: (commentsData?.items as SiteFolioComment[]) ?? [],
          team: (teamData?.items as SiteFolioTeamContact[]) ?? [],
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
  }, [project.id])

  const fullAddress = useMemo(() => {
    if (!data?.overview) return null
    return [
      data.overview.address,
      data.overview.city,
      data.overview.state,
      data.overview.zip,
    ]
      .filter(Boolean)
      .join(", ")
  }, [data?.overview])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  const latestComment = data?.comments.find((comment) => comment.isLatest) ?? data?.comments[0] ?? null
  const hasSiteFolioData =
    !!data?.overview ||
    !!latestComment ||
    (data?.team.length ?? 0) > 0 ||
    (data?.upcomingMilestones.length ?? 0) > 0

  return (
    <div className="mx-auto grid max-w-7xl gap-5 p-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <div className="flex flex-col gap-3 rounded-lg border bg-background p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold">Project Overview</h3>
              <Badge variant="secondary">SiteFolio-synced</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Real project profile, schedule context, comments, and contacts from the latest sync.
            </p>
          </div>
          {data?.syncMeta?.lastSyncAt && (
            <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              Last synced <span className="font-medium text-foreground">{getRelativeTime(data.syncMeta.lastSyncAt)}</span>
            </div>
          )}
        </div>

        {!hasSiteFolioData && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
              <Clock className="size-8 opacity-50" />
              <p className="text-sm font-medium">No synced SiteFolio overview data yet</p>
              <p className="max-w-md text-center text-xs">
                Link this project to SiteFolio and run a project sync to populate the overview.
              </p>
            </CardContent>
          </Card>
        )}

        {hasSiteFolioData && (
          <>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <SnapshotCard
                icon={ShieldCheck}
                label="SiteFolio Status"
                value={data?.overview?.projectStatus || "Not provided"}
              />
              <SnapshotCard
                icon={MapPin}
                label="Identifier"
                value={data?.overview?.identifier || project.oracleProjectNumber || "Not provided"}
              />
              <SnapshotCard
                icon={CalendarDays}
                label="Schedule Template"
                value={data?.overview?.scheduleTemplate || "Not provided"}
              />
              <SnapshotCard
                icon={MessageSquare}
                label="Comments"
                value={`${data?.comments.length ?? 0} synced`}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <MapPin className="size-4 text-muted-foreground" />
                  Location And Scope
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {fullAddress && (
                  <div className="rounded-md border bg-muted/20 p-3">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Address</p>
                    {data?.overview?.googleMapsUrl ? (
                      <a
                        href={data.overview.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block text-sm font-medium text-primary hover:underline"
                      >
                        {fullAddress}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm font-medium">{fullAddress}</p>
                    )}
                  </div>
                )}
                <div className="min-h-28 rounded-md border bg-muted/20 p-3">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Description</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {data?.overview?.projectDescription || "No SiteFolio description synced."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-5 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <MessageSquare className="size-4 text-muted-foreground" />
                    Latest SiteFolio Comment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {latestComment ? (
                    <div className="rounded-md border bg-muted/20 p-3">
                      <div className="mb-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>{latestComment.authorFullName || latestComment.authorInitials || "SiteFolio"}</span>
                        <span>{formatDate(latestComment.date)}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {latestComment.text}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No comments synced.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Users className="size-4 text-muted-foreground" />
                    Key Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data?.team.length ? (
                    <div className="space-y-2">
                      {data.team.slice(0, 6).map((contact, index) => (
                        <div key={`${contact.role}-${index}`} className="rounded-md border bg-muted/20 p-2.5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs text-muted-foreground">{contact.role}</p>
                              <p className="text-sm font-medium">{contact.name}</p>
                            </div>
                            {contact.email && (
                              <a
                                href={`mailto:${contact.email}`}
                                className="text-xs text-primary hover:underline"
                              >
                                Email
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No contacts synced.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  Upcoming Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.upcomingMilestones.length ? (
                  <div className="overflow-hidden rounded-md border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2 font-medium">Date</th>
                          <th className="px-3 py-2 font-medium">Milestone</th>
                          <th className="px-3 py-2 font-medium">Phase</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {data.upcomingMilestones.map((milestone, index) => (
                          <tr key={`${milestone.milestone}-${index}`}>
                            <td className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">
                              {formatDate(milestone.date)}
                            </td>
                            <td className="px-3 py-2">{milestone.milestone}</td>
                            <td className="px-3 py-2 text-xs text-muted-foreground">
                              {milestone.phase || "Unassigned"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No upcoming milestones found.</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConnectedProjectFactsPanel
        project={project}
        compact
        className="xl:sticky xl:top-6"
      />
    </div>
  )
}

function SnapshotCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <div className="rounded-md bg-muted p-2">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase text-muted-foreground">{label}</p>
          <p className="mt-1 truncate text-sm font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
