/**
 * Oracle KAM PA Report Catalog
 * Source: Oracle-Coupa_Reports_.docx, blueprint Section 7
 *
 * These are the priority Oracle reports that FaciliOne will import.
 * Column mapping requires sample exports (Open Item O-03).
 */

export interface OracleReportDef {
  id: string
  name: string
  facilionUse: string
  mapsTo: string
  sampleAvailable: boolean
}

export const ORACLE_REPORTS: OracleReportDef[] = [
  {
    id: "capital-estimation-extension",
    name: "KAM PA Capital Estimation Extension",
    facilionUse: "Estimator: estimate data",
    mapsTo: "Smart Tools → Estimator",
    sampleAvailable: false,
  },
  {
    id: "ca-approved",
    name: "KAM PA CA Approved",
    facilionUse: "CA Log: approved CA reference",
    mapsTo: "CA Log → approved reference",
    sampleAvailable: false,
  },
  {
    id: "capital-commitments",
    name: "KAM PA Capital Commitments",
    facilionUse: "Budget: committed amounts",
    mapsTo: "Budget → committed column",
    sampleAvailable: false,
  },
  {
    id: "project-cost-details",
    name: "KAM PA Project Cost Details Report",
    facilionUse: "Budget: actuals",
    mapsTo: "Budget → actuals",
    sampleAvailable: false,
  },
  {
    id: "estimates-actuals-sitefolio",
    name: "KAM PA Oracle Projects Estimates and Actuals to Sitefolio Report",
    facilionUse: "Budget: combined estimate/actual",
    mapsTo: "Budget → combined view",
    sampleAvailable: false,
  },
  {
    id: "commitment-actual-details",
    name: "KAM PA Commitment/Actual Details - Actuals",
    facilionUse: "Budget: actuals detail",
    mapsTo: "Budget → actuals detail",
    sampleAvailable: false,
  },
  {
    id: "ca-budget-changes-lob",
    name: "KAM PA CA Budget Changes Report by Line of Business",
    facilionUse: "Analytics: budget changes",
    mapsTo: "Analytics → budget changes",
    sampleAvailable: false,
  },
  {
    id: "ca-budget-changes-pm",
    name: "KAM PA CA Budget Changes Report for Project Manager",
    facilionUse: "Budget: PM-level changes",
    mapsTo: "Budget → PM changes",
    sampleAvailable: false,
  },
  {
    id: "project-variance",
    name: "KAM PA Project Variance",
    facilionUse: "Analytics: variance",
    mapsTo: "Analytics → variance view",
    sampleAvailable: false,
  },
  {
    id: "update-supplier-name",
    name: "KAM PA Update Supplier Name on Items",
    facilionUse: "Reference only",
    mapsTo: "Reference",
    sampleAvailable: false,
  },
]
