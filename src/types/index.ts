// User & Auth types
export type UserRole = "admin" | "cm" | "pm" | "director";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  assignedProjectIds: string[];
  managedUserIds: string[];
  orgId: string;
  forcePasswordChange: boolean;
  createdAt: string;
  createdBy: string;
  avatarUrl?: string;
}

// Project types
export type ProjectType = "NS" | "ER" | "WIW" | "FC" | "MC";
export type ProjectStatus =
  | "planning"
  | "active"
  | "on-hold"
  | "complete"
  | "cancelled";
export type HealthStatus = "green" | "yellow" | "red";

export interface Project {
  id: string;
  storeNumber: string;
  storeName: string;
  storeAddress: string;
  storeCity: string;
  storeState: string;
  projectType: ProjectType;
  status: ProjectStatus;
  healthStatus: HealthStatus;
  grandOpeningDate: string | null;
  constructionStartDate: string | null;
  pmUserId: string;
  cmUserId: string | null;
  orgId: string;
  oracleParentProject: string;
  oracleProjectNumber: string | null;
  currentPhaseIndex: number;
  totalBudget: number;
  committedCost: number;
  actualCost: number;
  forecastCost: number;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Phase / Sequence types
export type PhaseStatus = "pending" | "in-progress" | "complete" | "skipped";

export interface ChecklistItem {
  id: string;
  step: string;
  description: string;
  weekOffset: number | null;
  sopReference: string | null;
  status: "pending" | "complete" | "na";
  completedDate: string | null;
  notes: string;
  isGate: boolean;
}

export interface Phase {
  id: string;
  projectId: string;
  phaseNumber: number;
  name: string;
  targetStartWeekOffset: number | null;
  targetEndWeekOffset: number | null;
  targetStartDate: string | null;
  targetEndDate: string | null;
  actualStartDate: string | null;
  actualEndDate: string | null;
  status: PhaseStatus;
  checklistItems: ChecklistItem[];
  sopReference: string | null;
  notes: string;
}

// Budget types
export type AccrualType = "poc" | "full-po";

export interface BudgetLineItem {
  id: string;
  projectId: string;
  category: string;
  description: string;
  coupaItemNumber: string | null;
  oracleCostCode: string | null;
  budgetAmount: number;
  committedAmount: number;
  actualAmount: number;
  forecastAmount: number;
  notes: string;
  lastImportedAt: string | null;
}

// Oracle Parent Projects reference
export const ORACLE_PARENT_PROJECTS: Record<ProjectType, { code: string; label: string }> = {
  NS: { code: "2002883", label: "Major Storing (NS, ER, Land)" },
  ER: { code: "2002883", label: "Major Storing (NS, ER, Land)" },
  WIW: { code: "2005018", label: "Remodel (WIW)" },
  FC: { code: "FC1", label: "Fuel Center" },
  MC: { code: "KS11", label: "SM Other / Minor Capital" },
};

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  NS: "New Store",
  ER: "Expansion Remodel",
  WIW: "Within-the-Walls",
  FC: "Fuel Center",
  MC: "Minor Capital",
};

export const PROJECT_TYPE_DURATIONS: Record<ProjectType, string> = {
  NS: "~113 weeks",
  ER: "~122 weeks",
  WIW: "~86 weeks",
  FC: "~61 weeks",
  MC: "Varies",
};
