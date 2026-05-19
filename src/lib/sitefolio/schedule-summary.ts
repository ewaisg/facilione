import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Project } from "@/types"
import type { SiteFolioMilestone, SiteFolioSyncMeta } from "@/types/sitefolio"

interface LegacyScheduleMilestone {
  label: string
  baseline?: string
  projected?: string
  projectedAlt?: string
  actual?: string
}

interface SiteFolioScheduleDocument {
  milestones?: SiteFolioMilestone[]
}

export interface ProjectScheduleSummary {
  total: number
  done: number
  open: number
  overdue: number
  pct: number
  nextLabel: string | null
  nextDate: string | null
  source: "sitefolio" | "manual" | "none"
  lastSyncAt?: string
  lastSyncStatus?: SiteFolioSyncMeta["lastSyncStatus"]
}

export const EMPTY_SCHEDULE_SUMMARY: ProjectScheduleSummary = {
  total: 0,
  done: 0,
  open: 0,
  overdue: 0,
  pct: 0,
  nextLabel: null,
  nextDate: null,
  source: "none",
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function summarizeRows(rows: Array<{ label: string; due: string; done: boolean }>, source: ProjectScheduleSummary["source"], syncMeta?: SiteFolioSyncMeta): ProjectScheduleSummary {
  if (rows.length === 0) return { ...EMPTY_SCHEDULE_SUMMARY, source, lastSyncAt: syncMeta?.lastSyncAt, lastSyncStatus: syncMeta?.lastSyncStatus }

  const today = todayKey()
  const done = rows.filter((row) => row.done).length
  const openRows = rows.filter((row) => !row.done)
  const overdue = openRows.filter((row) => row.due && row.due < today).length
  const next = openRows
    .filter((row) => Boolean(row.due))
    .sort((a, b) => a.due.localeCompare(b.due))[0]

  return {
    total: rows.length,
    done,
    open: openRows.length,
    overdue,
    pct: Math.round((done / rows.length) * 100),
    nextLabel: next?.label ?? null,
    nextDate: next?.due ?? null,
    source,
    lastSyncAt: syncMeta?.lastSyncAt,
    lastSyncStatus: syncMeta?.lastSyncStatus,
  }
}

export function summarizeProjectRootSchedule(project: Project): ProjectScheduleSummary {
  const schedule = ((project as unknown as Record<string, unknown>).sfSchedule || []) as LegacyScheduleMilestone[]
  if (!Array.isArray(schedule) || schedule.length === 0) return EMPTY_SCHEDULE_SUMMARY

  return summarizeRows(
    schedule.map((milestone) => ({
      label: milestone.label,
      due: milestone.projectedAlt || milestone.projected || milestone.baseline || "",
      done: Boolean(milestone.actual),
    })),
    "manual",
  )
}

export function summarizeSiteFolioSchedule(
  scheduleData: SiteFolioScheduleDocument | null,
  syncMeta?: SiteFolioSyncMeta,
): ProjectScheduleSummary | null {
  const milestones = scheduleData?.milestones
  if (!Array.isArray(milestones) || milestones.length === 0) return null

  return summarizeRows(
    milestones.map((milestone) => ({
      label: milestone.milestoneName,
      due: milestone.projectedAltDate || milestone.projectedDate || milestone.baselineDate || "",
      done: Boolean(milestone.actualDate || milestone.isComplete || milestone.completionPct === 100),
    })),
    "sitefolio",
    syncMeta,
  )
}

export async function loadProjectScheduleSummaries(
  projects: Project[],
): Promise<Record<string, ProjectScheduleSummary>> {
  const entries = await Promise.all(
    projects.map(async (project) => {
      const fallback = summarizeProjectRootSchedule(project)

      try {
        const [scheduleSnap, metaSnap] = await Promise.all([
          getDoc(doc(db, "projects", project.id, "sitefolio", "schedule")),
          getDoc(doc(db, "projects", project.id, "sitefolio", "sync-meta")),
        ])

        const syncMeta = metaSnap.exists() ? (metaSnap.data() as SiteFolioSyncMeta) : undefined
        const sitefolioSummary = summarizeSiteFolioSchedule(
          scheduleSnap.exists() ? (scheduleSnap.data() as SiteFolioScheduleDocument) : null,
          syncMeta,
        )

        return [project.id, sitefolioSummary ?? { ...fallback, lastSyncAt: syncMeta?.lastSyncAt, lastSyncStatus: syncMeta?.lastSyncStatus }] as const
      } catch (err) {
        console.error(`Failed to load synced SiteFolio schedule for ${project.id}:`, err)
        return [project.id, fallback] as const
      }
    }),
  )

  return Object.fromEntries(entries)
}
