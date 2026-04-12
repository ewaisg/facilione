export interface SiteFolioSyncMeta {
  lastSyncAt: string
  lastSyncStatus: "success" | "partial" | "error"
  lastSyncError?: string
  syncedPages: string[]
}

export interface SiteFolioProject {
  sfProjectId: number
  projectNumber: string
  year: string
  description: string
  phase: string
  projectType: string
  role: string
  storeNumber: string
  storeName: string
  storeLocation: string
  overviewUrl: string
}

export interface SiteFolioOverview {
  address: string
  city: string
  state: string
  zip: string
  googleMapsUrl: string
  identifier: string
  projectDescription: string
  projectStatus: string
  scheduleTemplate: string
}

export interface SiteFolioComment {
  commentId: number
  date: string
  authorInitials: string
  authorFullName: string
  text: string
  isLatest: boolean
}

export interface SiteFolioTeamContact {
  role: string
  name: string
  phone: string
  email: string
}

export interface SiteFolioUpcomingMilestone {
  date: string
  milestone: string
  phase: string
}

export interface SiteFolioReportLink {
  name: string
  format: string
  url: string
}

export interface SiteFolioSchedulePhase {
  phaseId: number
  phaseName: string
}

export interface SiteFolioMilestoneNote {
  date: string
  author: string
  text: string
}

export interface SiteFolioMilestone {
  milestoneId: number
  phaseName: string
  milestoneName: string
  baselineDate: string | null
  projectedDate: string | null
  projectedAltDate: string | null
  actualDate: string | null
  completionPct: number
  isComplete: boolean
  notes: SiteFolioMilestoneNote[]
}

export interface SiteFolioProjectData {
  sfProjectId: number
  projectNumber: string
  overview: SiteFolioOverview | null
  comments: SiteFolioComment[]
  teamContacts: SiteFolioTeamContact[]
  upcomingMilestones: SiteFolioUpcomingMilestone[]
  reportLinks: SiteFolioReportLink[]
  phases: SiteFolioSchedulePhase[]
  milestones: SiteFolioMilestone[]
  syncMeta: SiteFolioSyncMeta
}
