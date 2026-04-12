import type { ProjectType } from "@/types/project"

/** Oracle parent project codes by project type — confirm list with O-02 */
export const ORACLE_PARENT_PROJECTS: Record<
  ProjectType,
  { code: string; label: string }
> = {
  NS: { code: "2002883", label: "Major Storing (NS, ER, Land)" },
  ER: { code: "2002883", label: "Major Storing (NS, ER, Land)" },
  WIW: { code: "2005018", label: "Remodel (WIW)" },
  FC: { code: "FC1", label: "Fuel Center" },
  MC: { code: "KS11", label: "SM Other / Minor Capital" },
  "F&D": { code: "KS11", label: "SM Other / Minor Capital" },
}

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  NS: "New Store",
  ER: "Expansion Remodel",
  WIW: "Within-the-Walls",
  FC: "Fuel Center",
  MC: "Minor Capital",
  "F&D": "Floor & Decor",
}

export const PROJECT_TYPE_DURATIONS: Record<ProjectType, string> = {
  NS: "~113 weeks",
  ER: "~122 weeks",
  WIW: "~86 weeks",
  FC: "~61 weeks",
  MC: "Varies",
  "F&D": "Varies",
}

/** F&D uses the MC schedule template */
export const TEMPLATE_ALIAS: Partial<Record<ProjectType, string>> = {
  "F&D": "MC",
}

/** Estimate funding source options (separate from project type) */
export const FUNDING_SOURCES = [
  { value: "division-funded", label: "Division Funded" },
  { value: "go-merchandising", label: "GO Merchandising" },
  { value: "go-retail-ops", label: "GO Retail Ops" },
  { value: "other", label: "Other" },
] as const

export type FundingSource = (typeof FUNDING_SOURCES)[number]["value"]
