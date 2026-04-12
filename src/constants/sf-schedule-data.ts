/**
 * SiteFolio Schedule Milestone Definitions
 *
 * Extracted from FaciliTools tracker.html TEMPLATES[type].sfSchedule arrays.
 * These define the SiteFolio schedule milestones for each project type,
 * with auto-calculation formulas matching the SiteFolio schedule templates.
 *
 * Two models:
 *   1. weeks-to-open (NS, ER, WIW, FC): Baseline = GO date - (wk * 7 days)
 *   2. day-offset (MC, F&D): Forward cascade from Project Identified using day offsets
 */

export type ScheduleModel = "weeks-to-open" | "day-offset"

export interface SfMilestoneWeeks {
  key: string
  label: string
  cat: string
  wk: number
}

export interface SfMilestoneDayOffset {
  key: string
  label: string
  ref: string | null
  offset: number
  refLabel: string
  noAlt?: boolean
}

export type SfMilestone = SfMilestoneWeeks | SfMilestoneDayOffset

export interface SfScheduleTemplate {
  model: ScheduleModel
  milestones: SfMilestone[]
}

// ── NS: New Store (113 weeks, weeks-to-open) ──
const NS_SCHEDULE: SfMilestoneWeeks[] = [
  { key: "proj_id", label: "Project Identified", cat: "Evaluation", wk: 113 },
  { key: "prelim_site", label: "Preliminary Site Plan Received", cat: "Evaluation", wk: 109 },
  { key: "proj_approval", label: "Project Approval Received", cat: "Evaluation", wk: 86 },
  { key: "dd_start", label: "Due Diligence Started", cat: "Due Diligence", wk: 105 },
  { key: "dd_done", label: "Due Diligence Completed", cat: "Due Diligence", wk: 83 },
  { key: "rev_ffp", label: "Revised Final Fixture Plan Received", cat: "Due Diligence", wk: 84 },
  { key: "ffp_fm_review", label: "Final Fixture Plan Reviewed (FM)", cat: "Due Diligence", wk: 86 },
  { key: "permits", label: "Permitting Completed", cat: "Due Diligence", wk: 50 },
  { key: "prelim_fp_req", label: "Preliminary Fixture Plan Requested", cat: "Fixture Plan", wk: 93 },
  { key: "ffp_recv", label: "Final Fixture Plan Received", cat: "Fixture Plan", wk: 71 },
  { key: "ffp_to_arch", label: "Final Fixture Plan to Architect", cat: "Design", wk: 83 },
  { key: "arch_auth", label: "Architect Authorized", cat: "Design", wk: 74 },
  { key: "cds_recv", label: "Construction Documents Received", cat: "Design", wk: 63 },
  { key: "cds_permits", label: "CDs Submitted for Permits", cat: "Design", wk: 56 },
  { key: "ffp_approved", label: "Final Fixture Plan Approved", cat: "Internal Approval", wk: 86 },
  { key: "ca_approved", label: "Capital Appropriation Approval Received", cat: "Internal Approval", wk: 57 },
  { key: "prop_closed", label: "Property Closed/Lease Signed", cat: "Internal Approval", wk: 54 },
  { key: "bids_sol", label: "Bids Solicited", cat: "Internal Approval", wk: 56 },
  { key: "bids_recv", label: "Bids Received", cat: "Internal Approval", wk: 45 },
  { key: "site_start", label: "Sitework/Demolition Started", cat: "Construction", wk: 43 },
  { key: "db_ordered", label: "Direct Buy Items (incl. Refrigeration) Ordered", cat: "Construction", wk: 43 },
  { key: "footers", label: "Building Construction/Footers Started", cat: "Construction", wk: 36 },
  { key: "fix_ordered", label: "Fixtures Ordered", cat: "Construction", wk: 30 },
  { key: "roof", label: "Roof Completed", cat: "Construction", wk: 26 },
  { key: "slab", label: "Colored Slab Poured", cat: "Construction", wk: 22 },
  { key: "shell", label: "Building Shell Completed (In the dry)", cat: "Construction", wk: 21 },
  { key: "utils", label: "Permanent Utilities Completed", cat: "Construction", wk: 17 },
  { key: "site_done", label: "Sitework Completed", cat: "Construction", wk: 14 },
  { key: "offsite_done", label: "Offsite Work Completed", cat: "Construction", wk: 14 },
  { key: "tco", label: "Temporary Certificate of Occupancy Received", cat: "Construction", wk: 13 },
  { key: "const_done", label: "Construction Completed", cat: "Construction", wk: 13 },
  { key: "fix_start", label: "Fixturing Started", cat: "Fixturing", wk: 10 },
  { key: "final_co", label: "Final Certificate of Occupancy Received", cat: "Fixturing", wk: 5 },
  { key: "merch_start", label: "Merchandising Started", cat: "Fixturing", wk: 4 },
  { key: "safety", label: "Safety Assured/Approved", cat: "Fixturing", wk: 2 },
  { key: "proj_done", label: "Project Completed", cat: "Fixturing", wk: 2 },
  { key: "grand_open", label: "Grand Opened", cat: "Close-Out", wk: 0 },
]

// ── ER: Expansion Remodel (122 weeks, weeks-to-open) ──
const ER_SCHEDULE: SfMilestoneWeeks[] = [
  { key: "proj_id", label: "Project Identified", cat: "Evaluation", wk: 122 },
  { key: "prelim_site", label: "Preliminary Site Plan Received", cat: "Evaluation", wk: 118 },
  { key: "scope_recv", label: "Scope Recommendations Received", cat: "Evaluation", wk: 112 },
  { key: "prelim_est", label: "Preliminary Estimate Completed", cat: "Evaluation", wk: 100 },
  { key: "prelim_sales", label: "Preliminary Sales Budget Completed", cat: "Evaluation", wk: 98 },
  { key: "proj_approval", label: "Project Approval Received", cat: "Evaluation", wk: 93 },
  { key: "ab_survey_start", label: "As-built Fixture Plan Survey Started", cat: "Due Diligence", wk: 114 },
  { key: "ab_survey_recv", label: "As-built Fixture Plan Survey Received", cat: "Due Diligence", wk: 113 },
  { key: "topo_recv", label: "Topographic Survey Received", cat: "Due Diligence", wk: 101 },
  { key: "site_plan_dev", label: "Final Site Plan Developed / Received", cat: "Due Diligence", wk: 97 },
  { key: "dd_done", label: "Due Diligence Completed", cat: "Due Diligence", wk: 89 },
  { key: "site_plan_appr", label: "Final Site Plan Approved", cat: "Due Diligence", wk: 85 },
  { key: "rev_ffp", label: "Revised Final Fixture Plan Received", cat: "Due Diligence", wk: 66 },
  { key: "permits", label: "Permits Received", cat: "Due Diligence", wk: 45 },
  { key: "ab_fp_req", label: "As-built Fixture Plan Requested", cat: "Fixture Plan", wk: 112 },
  { key: "ab_fp_recv", label: "As-built Fixture Plan Received", cat: "Fixture Plan", wk: 108 },
  { key: "prelim_fp_req", label: "Preliminary Fixture Plan Requested", cat: "Fixture Plan", wk: 107 },
  { key: "prefinal_walk", label: "Pre-final Fixture Plan Walk-through Completed", cat: "Fixture Plan", wk: 94 },
  { key: "ffp_recv", label: "Final Fixture Plan Received", cat: "Fixture Plan", wk: 75 },
  { key: "prop_neg", label: "Property Negotiation Initiated", cat: "Real Estate", wk: 103 },
  { key: "re_docs", label: "RE Documents Completed", cat: "Real Estate", wk: 68 },
  { key: "prop_closed", label: "Property Closed/Lease Signed", cat: "Real Estate", wk: 63 },
  { key: "ffp_to_arch", label: "Final Fixture Plan to Architect", cat: "Design", wk: 73 },
  { key: "refrig_req", label: "Refrigeration Plans Requested", cat: "Design", wk: 73 },
  { key: "refrig_recv", label: "Refrigeration Plans Received", cat: "Design", wk: 69 },
  { key: "arch_auth", label: "Architect Authorized", cat: "Design", wk: 69 },
  { key: "cds_recv", label: "Construction Documents Received", cat: "Design", wk: 58 },
  { key: "cds_permits", label: "CDs Submitted for Permits", cat: "Design", wk: 49 },
  { key: "precon_ca", label: "Pre-construction CA Approved", cat: "Internal Approval", wk: 111 },
  { key: "ffp_approved", label: "Final Fixture Plan Approved", cat: "Internal Approval", wk: 74 },
  { key: "sow_final", label: "Scope of Work Finalized", cat: "Internal Approval", wk: 71 },
  { key: "final_est", label: "Final Estimate Completed", cat: "Internal Approval", wk: 70 },
  { key: "sales_budget", label: "Sales Budget Completed", cat: "Internal Approval", wk: 69 },
  { key: "ca_sub", label: "CA Submitted for Approval", cat: "Internal Approval", wk: 68 },
  { key: "ca_approved", label: "Capital Appropriation Approval Received", cat: "Internal Approval", wk: 64 },
  { key: "bids_sol", label: "Bids Solicited", cat: "Internal Approval", wk: 49 },
  { key: "bids_recv", label: "Bids Received", cat: "Internal Approval", wk: 45 },
  { key: "db_ordered", label: "Direct Buy Items (incl. Refrigeration) Ordered", cat: "Construction", wk: 61 },
  { key: "site_start", label: "Sitework/Demolition Started", cat: "Construction", wk: 43 },
  { key: "fix_ordered", label: "Fixtures Ordered", cat: "Construction", wk: 43 },
  { key: "footers", label: "Building Construction/Footers Started", cat: "Construction", wk: 39 },
  { key: "roof", label: "Roof Completed", cat: "Construction", wk: 29 },
  { key: "shell", label: "Building Shell Completed (In the dry)", cat: "Construction", wk: 27 },
  { key: "ext_done", label: "Exterior Completed", cat: "Construction", wk: 23 },
  { key: "tco", label: "Temporary Certificate of Occupancy Received", cat: "Construction", wk: 22 },
  { key: "expansion_open", label: "Expansion Opened", cat: "Construction", wk: 19 },
  { key: "resets", label: "Product Resets Completed", cat: "Construction", wk: 9 },
  { key: "site_done", label: "Sitework Completed", cat: "Construction", wk: 7 },
  { key: "const_done", label: "Construction/Fixturing Completed", cat: "Construction", wk: 5 },
  { key: "safety", label: "Safety Assured/Approved", cat: "Construction", wk: 3 },
  { key: "final_co", label: "Final Certificate of Occupancy Received", cat: "Construction", wk: 2 },
  { key: "proj_done", label: "Project Completed", cat: "Construction", wk: 1 },
  { key: "grand_open", label: "Grand Opening", cat: "Close-Out", wk: 0 },
]

// ── WIW: Within-the-Walls (86 weeks, weeks-to-open) ──
const WIW_SCHEDULE: SfMilestoneWeeks[] = [
  { key: "proj_id", label: "Project Identified", cat: "Evaluation", wk: 86 },
  { key: "ab_fp_req", label: "As-built Fixture Plan Requested", cat: "Evaluation", wk: 69 },
  { key: "scope_recv", label: "Scope Recommendations Received", cat: "Evaluation", wk: 71 },
  { key: "precon_ca", label: "Pre-construction CA Approved", cat: "Evaluation", wk: 70 },
  { key: "final_est", label: "Final Estimate Completed", cat: "Evaluation", wk: 42 },
  { key: "sales_budget", label: "Sales Budget Completed", cat: "Evaluation", wk: 41 },
  { key: "proj_approval", label: "Project Approval Received", cat: "Evaluation", wk: 37 },
  { key: "ab_survey_start", label: "As-built Fixture Plan Survey Started", cat: "Due Diligence", wk: 78 },
  { key: "ab_survey_recv", label: "As-built Fixture Plan Survey Received", cat: "Due Diligence", wk: 72 },
  { key: "ab_fp_recv", label: "As-built Fixture Plan Received", cat: "Due Diligence", wk: 66 },
  { key: "dd_done", label: "Due Diligence Completed", cat: "Due Diligence", wk: 58 },
  { key: "permits", label: "Permits Received", cat: "Due Diligence", wk: 24 },
  { key: "prelim_fp_req", label: "Preliminary Fixture Plan Requested", cat: "Fixture Plan", wk: 64 },
  { key: "prefinal_walk", label: "Pre-final Fixture Plan Walk-through Completed", cat: "Fixture Plan", wk: 50 },
  { key: "ffp_recv", label: "Final Fixture Plan Received", cat: "Fixture Plan", wk: 46 },
  { key: "ffp_to_arch", label: "Final Fixture Plan to Architect", cat: "Design", wk: 43 },
  { key: "refrig_req", label: "Refrigeration Plans Requested", cat: "Design", wk: 42 },
  { key: "refrig_recv", label: "Refrigeration Plans Received", cat: "Design", wk: 37 },
  { key: "arch_auth", label: "Architect Authorized", cat: "Design", wk: 37 },
  { key: "cds_recv", label: "Construction Documents Received", cat: "Design", wk: 31 },
  { key: "cds_permits", label: "CDs Submitted for Permits", cat: "Design", wk: 28 },
  { key: "ffp_approved", label: "Final Fixture Plan Approved", cat: "Internal Approval", wk: 44 },
  { key: "sow_final", label: "Scope of Work Finalized", cat: "Internal Approval", wk: 43 },
  { key: "budget_sub", label: "Budget Submitted for Approval", cat: "Internal Approval", wk: 40 },
  { key: "ca_approved", label: "Capital Appropriation Approval Received", cat: "Internal Approval", wk: 36 },
  { key: "ll_approval", label: "Landlord Approval Received / LMA Signed", cat: "Internal Approval", wk: 31 },
  { key: "bids_sol", label: "Bids Solicited", cat: "Internal Approval", wk: 28 },
  { key: "bids_recv", label: "Bids Received", cat: "Internal Approval", wk: 25 },
  { key: "db_ordered", label: "Direct Buy Items (incl. Refrigeration) Ordered", cat: "Construction", wk: 33 },
  { key: "fix_ordered", label: "Fixtures Ordered", cat: "Construction", wk: 29 },
  { key: "demo_start", label: "Demolition/Refrigeration Prep Started", cat: "Construction", wk: 21 },
  { key: "const_start", label: "Construction Started", cat: "Construction", wk: 20 },
  { key: "ext_done", label: "Exterior Completed", cat: "Construction", wk: 6 },
  { key: "resets", label: "Product Resets Completed", cat: "Construction", wk: 4 },
  { key: "const_done", label: "Construction/Fixturing Completed", cat: "Construction", wk: 3 },
  { key: "safety", label: "Safety Assured/Approved", cat: "Construction", wk: 1 },
  { key: "proj_done", label: "Project Completed", cat: "Construction", wk: 1 },
  { key: "grand_open", label: "Grand Opening", cat: "Close-Out", wk: 0 },
]

// ── FC: Fuel Center (61 weeks, weeks-to-open) ──
const FC_SCHEDULE: SfMilestoneWeeks[] = [
  { key: "proj_id", label: "Project Identified", cat: "Evaluation", wk: 61 },
  { key: "prelim_site", label: "Preliminary Site Plan Developed", cat: "Evaluation", wk: 59 },
  { key: "spg_concept", label: "Site Conceptually Reviewed with SPG", cat: "Evaluation", wk: 57 },
  { key: "mkt_ordered", label: "Market Research Ordered", cat: "Evaluation", wk: 56 },
  { key: "mkt_recv", label: "Market Research Received", cat: "Evaluation", wk: 52 },
  { key: "proj_approval", label: "Project Approval Received", cat: "Evaluation", wk: 32 },
  { key: "dd_start", label: "Due Diligence Started", cat: "Due Diligence", wk: 51 },
  { key: "dd_done", label: "Due Diligence Completed", cat: "Due Diligence", wk: 43 },
  { key: "permits", label: "Permits Received", cat: "Due Diligence", wk: 15 },
  { key: "prelim_site_spg", label: "Preliminary Site Plan Approved by SPG", cat: "Site Plan", wk: 46 },
  { key: "site_plan_dev", label: "Final Site Plan Developed / Received", cat: "Site Plan", wk: 42 },
  { key: "site_plan_appr", label: "Final Site Plan Approved", cat: "Site Plan", wk: 29 },
  { key: "prop_neg", label: "Property Negotiation Initiated", cat: "Real Estate", wk: 51 },
  { key: "re_docs", label: "RE Documents Completed", cat: "Real Estate", wk: 25 },
  { key: "prop_closed", label: "Property Closed/Lease Signed", cat: "Real Estate", wk: 24 },
  { key: "precon_ca", label: "Pre-construction CA Approved", cat: "Internal Approval", wk: 51 },
  { key: "final_est", label: "Final Estimate Completed", cat: "Internal Approval", wk: 41 },
  { key: "sales_budget", label: "Sales Budget Completed", cat: "Internal Approval", wk: 37 },
  { key: "spg_approval", label: "SPG Approval Received", cat: "Internal Approval", wk: 34 },
  { key: "budget_sub", label: "Budget Submitted for Approval", cat: "Internal Approval", wk: 33 },
  { key: "ca_approved", label: "Capital Appropriation Approval Received", cat: "Internal Approval", wk: 25 },
  { key: "arch_auth", label: "Civil Engineer/Architect Authorized", cat: "Design & Construction", wk: 28 },
  { key: "cds_recv", label: "Construction Documents Received", cat: "Design & Construction", wk: 22 },
  { key: "cds_permits", label: "CDs Submitted for Permits", cat: "Design & Construction", wk: 21 },
  { key: "equip_ordered", label: "Tanks / Canopy / Equipment Ordered", cat: "Design & Construction", wk: 23 },
  { key: "bids_recv", label: "Bids Received", cat: "Design & Construction", wk: 18 },
  { key: "site_start", label: "Sitework/Demolition Started", cat: "Design & Construction", wk: 14 },
  { key: "tanks", label: "Tanks Buried", cat: "Design & Construction", wk: 13 },
  { key: "footers", label: "Building Construction/Footers Started", cat: "Design & Construction", wk: 9 },
  { key: "paving", label: "Concrete Paving Completed", cat: "Design & Construction", wk: 7 },
  { key: "canopy", label: "Canopy Completed", cat: "Design & Construction", wk: 5 },
  { key: "utils", label: "Permanent Utilities Completed", cat: "Design & Construction", wk: 4 },
  { key: "site_done", label: "Sitework Completed", cat: "Design & Construction", wk: 3 },
  { key: "tco", label: "Temporary Certificate of Occupancy Received", cat: "Design & Construction", wk: 2 },
  { key: "proj_done", label: "Project Completed", cat: "Design & Construction", wk: 1 },
  { key: "opened", label: "Opened for Business", cat: "Close-Out", wk: 1 },
  { key: "grand_open", label: "Grand Opened", cat: "Close-Out", wk: 0 },
]

// ── MC: Minor Capital (day-offset model) ──
const MC_SCHEDULE: SfMilestoneDayOffset[] = [
  { key: "proj_id", label: "Project Identified", ref: null, offset: 0, refLabel: "\u2014", noAlt: true },
  { key: "ffp_recv", label: "Final Fixture Plan Received", ref: "proj_id", offset: 28, refLabel: "Project Identified + 28d" },
  { key: "permits", label: "Permits Received", ref: "ffp_recv", offset: 42, refLabel: "FFP Received + 42d" },
  { key: "bids", label: "Bids Received", ref: "ffp_recv", offset: 49, refLabel: "FFP Received + 49d" },
  { key: "ca_approved", label: "Capital Appropriation Approval Received", ref: "ffp_recv", offset: 56, refLabel: "FFP Received + 56d" },
  { key: "const_start", label: "Construction Started", ref: "permits", offset: 14, refLabel: "Permits + 14d" },
  { key: "const_done", label: "Construction/Fixturing Completed", ref: "const_start", offset: 28, refLabel: "Construction Started + 28d" },
  { key: "oper_live", label: "Operation Went Live", ref: "const_done", offset: 7, refLabel: "Construction Done + 7d" },
]

// ── Lookup by project type ──
export const SF_SCHEDULE_TEMPLATES: Record<string, SfScheduleTemplate> = {
  NS: { model: "weeks-to-open", milestones: NS_SCHEDULE },
  ER: { model: "weeks-to-open", milestones: ER_SCHEDULE },
  WIW: { model: "weeks-to-open", milestones: WIW_SCHEDULE },
  FC: { model: "weeks-to-open", milestones: FC_SCHEDULE },
  MC: { model: "day-offset", milestones: MC_SCHEDULE },
  "F&D": { model: "day-offset", milestones: MC_SCHEDULE },
}
