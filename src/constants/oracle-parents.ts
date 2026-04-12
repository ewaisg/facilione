/**
 * Oracle Parent Project Reference
 *
 * Source: Oracle_Retail_Division_Guidance.docx
 * Status: Pending confirmation (Open Item O-02)
 *
 * The primary mapping lives in constants/project-types.ts → ORACLE_PARENT_PROJECTS.
 * This file holds the extended catalog for the KB Oracle Reference section.
 */

export interface OracleParentProject {
  code: string
  label: string
  projectTypes: string[]
  notes: string
}

// Placeholder — to be confirmed with O-02
export const ORACLE_PARENT_PROJECT_CATALOG: OracleParentProject[] = [
  {
    code: "2002883",
    label: "Major Storing (NS, ER, Land)",
    projectTypes: ["NS", "ER"],
    notes: "Covers new stores, expansion remodels, and land acquisition",
  },
  {
    code: "2005018",
    label: "Remodel (WIW)",
    projectTypes: ["WIW"],
    notes: "Within-the-walls remodel projects",
  },
  {
    code: "FC1",
    label: "Fuel Center",
    projectTypes: ["FC"],
    notes: "Fuel center new build and renovation",
  },
  {
    code: "KS11",
    label: "SM Other / Minor Capital",
    projectTypes: ["MC"],
    notes: "Minor capital projects under simplified approval",
  },
]
