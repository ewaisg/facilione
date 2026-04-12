export type ProjectType = "NS" | "ER" | "WIW" | "FC" | "MC" | "F&D"

export type ProjectStatus = "planning" | "active" | "on-hold" | "complete" | "cancelled"

export type HealthStatus = "green" | "yellow" | "red"

export interface Project {
  id: string
  storeNumber: string
  storeName: string
  storeAddress: string
  storeCity: string
  storeState: string
  projectType: ProjectType
  status: ProjectStatus
  healthStatus: HealthStatus
  grandOpeningDate: string | null
  constructionStartDate: string | null
  pmUserId: string
  cmUserId: string | null
  orgId: string
  oracleParentProject: string
  oracleProjectNumber: string | null
  currentPhaseIndex: number
  totalBudget: number
  committedCost: number
  actualCost: number
  forecastCost: number
  notes: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface ProjectWeeklyUpdate {
  id: string
  projectId: string
  weekStart: string
  comment: string
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}
