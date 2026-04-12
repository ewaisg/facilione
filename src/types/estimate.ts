/**
 * Estimate Types
 *
 * Defines the Firestore data model for saved project estimates.
 * Collection: /estimates/{estimateId}
 */

import type { ProjectType } from "./project"
import type { FundingSource } from "@/constants/project-types"

export interface EstimateRow {
  _id: string
  item: string
  vendor: string
  qty: string
  unitCost: string
  extended: number
  amount: string
}

export type EstimateColumnKey = "item" | "vendor" | "qty" | "unitCost" | "extended" | "amount"

export interface EstimateSection {
  id: string
  name: string
  columns: EstimateColumnKey[]
  rows: EstimateRow[]
  hasContingency: boolean
  contPct: number
  collapsed: boolean
  rowCounter: number
}

export interface EstimateProjectInfo {
  store: string
  name: string
  pm: string
  date: string
  projectType: ProjectType | ""
  fundingSource: FundingSource | ""
  oracle: string
  parent: string
  budget: string
}

export interface EstimateComparable {
  id: string
  source: "estimates" | "costReviews" | "comparisonSnapshots" | "estimateComparisonForms" | "manual-project"
  label: string
  projectType: string
  total: number
  similarityScore: number
  notes?: string
}

export interface EstimateComparisonContext {
  locked: boolean
  lockedAt: string | null
  selectedComparableIds: string[]
  selectedComparables: EstimateComparable[]
}

export interface Estimate {
  id: string
  userId: string
  projectId: string | null
  projectInfo: EstimateProjectInfo
  sections: EstimateSection[]
  comparisonContext?: EstimateComparisonContext
  createdAt: string
  updatedAt: string
}

/** Preset section definitions for the "Add Section" buttons */
export interface PresetSectionDef {
  key: string
  name: string
  columns: EstimateColumnKey[]
  contingency: boolean
  contPct: number
  defaults: Partial<EstimateRow>[]
}
