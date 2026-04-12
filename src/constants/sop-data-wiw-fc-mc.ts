/**
 * SOP Reference Data — Complete Library (Continued)
 *
 * WIW, FC, MC project types + all 4 appendices.
 * This file is merged with sop-data-ns-er.ts into the final sop-data.ts.
 */

import type { SOPDataMap } from "@/types/sop"

export const SOP_DATA_REMAINING: SOPDataMap = {
  wiw: {
    id: "wiw",
    title: "Within-the-Walls Remodel (WIW)",
    baseline: "86 Weeks",
    template: "DDDD — Within The Walls Remodel",
    businessArea: "Supermarket Remodels",
    parent: "Division Remodel Parent (CO: 2005018)",
    objective: "Guide the PM through a Within-the-Walls remodel — an interior-only project — from identification through Grand Opening and Oracle close-out.",
    scope: "Use for ALL WIW remodels regardless of cost ($0\u2013$750K minor, $750K\u2013$2M minor, >$2M major, or office WIW).",
    sources: ["Withinthewalls_project_schedule_template.xls", "Oracle Retail Division Guidance.docx", "Remodel_phasing_presentation.docx", "Conducting_Remodel_Project.docx", "generalConditions.pdf"],
    schedule: [
      { m: "Project Identified", wk: "Week 86", gate: "VP RE email or Project Approval required" },
      { m: "Pre-construction CA Approved", wk: "Week 70", gate: "VP RE email received" },
      { m: "Preliminary Fixture Plan Requested", wk: "Week 64", gate: "After as-built received" },
      { m: "Pre-Final Fixture Plan Walk-through", wk: "Week 50", gate: "" },
      { m: "Final Fixture Plan Received", wk: "Week 46", gate: "Final Fixture Plan Approved" },
      { m: "CA Approval Received", wk: "Week 36", gate: "Oracle \u2192 Active; POs can issue" },
      { m: "Bids Received", wk: "Week 25", gate: "Bids received; CA approved" },
      { m: "Construction Started", wk: "Week 20", gate: "All permits in hand; SWPPP meeting held" },
      { m: "Grand Opening", wk: "Week 0", gate: "CA close-out initiated" },
    ],
    phases: [
      { name: "Phase 1 — Evaluation & Scope", steps: [
        { n: "1.1", text: "Project identified. Confirm VP RE viability email or Project Approval received before creating Pre-Con CA.", owner: "PM / RE", sys: "Email", wk: "Wk 86" },
        { n: "1.2", text: 'Set up Oracle project: "DDDD — WIW Remodel" template; Business Area: Supermarket Remodels; attach as child to Division Remodel parent project.', owner: "PM", sys: "Oracle", wk: "" },
        { n: "1.3", text: "Receive Scope Recommendations. Review with CM and Store Planning.", owner: "PM", sys: "s|f", wk: "Wk 71" },
        { n: "1.4", text: "Request Pre-Con CA. Division President approval \u2264$250K.", owner: "PM", sys: "Oracle / CARS", wk: "Wk 70" },
      ], gates: ["Pre-Con CA approved; Oracle Plan Approved status set."], tips: [] },
      { name: "Phase 2 — Due Diligence", steps: [
        { n: "2.1", text: "Order As-built Fixture Plan Survey. Track: Survey Started \u2192 Received \u2192 As-built Plan Received.", owner: "PM", sys: "s|f / Email", wk: "Wk 78" },
        { n: "2.2", text: "Coordinate Environmental Due Diligence as needed. For WIW, ACM survey is typically required. Phase I less common but may be required.", owner: "PM / Env", sys: "s|f", wk: "" },
        { n: "2.3", text: "Complete Due Diligence. Upload all EDD documents to SiteFolio.", owner: "PM", sys: "s|f", wk: "Wk 58" },
      ], gates: ["Due Diligence Completed; As-built Fixture Plan received."], tips: [] },
      { name: "Phase 3 — Fixture Plan Development", steps: [
        { n: "3.1", text: "Request Preliminary Fixture Plan from Store Planning.", owner: "PM", sys: "s|f / Email", wk: "Wk 64" },
        { n: "3.2", text: "Hold Pre-Final Fixture Plan Walk-through on site with Store Planning.", owner: "PM / SP", sys: "s|f", wk: "Wk 50" },
        { n: "3.3", text: "Receive Final Fixture Plan. Review for completeness.", owner: "PM", sys: "s|f", wk: "Wk 46" },
        { n: "3.4", text: "Initiate direct buy and refrigeration equipment ordering with GO Remote Refrigeration team after final fixture plan received.", owner: "PM", sys: "Email", wk: "" },
      ], gates: ["Final Fixture Plan Approved (Week 44); Scope of Work Finalized (Week 43)."], tips: [] },
      { name: "Phase 4 — Design Development", steps: [
        { n: "4.1", text: "Transmit Final Fixture Plan to Architect. Request Refrigeration Plans. Receive Refrig Plans. Authorize Architect.", owner: "PM", sys: "s|f", wk: "Wk 37" },
        { n: "4.2", text: "Receive Construction Documents. Review for completeness.", owner: "PM", sys: "s|f", wk: "Wk 31" },
        { n: "4.3", text: "Submit CDs for Permits. Receive Permits.", owner: "PM", sys: "s|f / Local AHJ", wk: "Wk 24" },
      ], gates: ["CDs complete; permits received."], tips: [] },
      { name: "Phase 5 — Internal Approval & Bidding", steps: [
        { n: "5.1", text: "Scope of Work Finalized.", owner: "PM", sys: "s|f", wk: "Wk 43" },
        { n: "5.2", text: "Budget Submitted for Approval.", owner: "PM", sys: "Oracle / s|f", wk: "Wk 40" },
        { n: "5.3", text: "CA Approved. Oracle Status: Active. For >$2M: Capital Committee. For \u2264$2M: Division approval.", owner: "PM", sys: "Oracle", wk: "Wk 36" },
        { n: "5.4", text: "Landlord Approval Received / LMA Signed (if required per lease).", owner: "PM / RE", sys: "s|f", wk: "Wk 31" },
        { n: "5.5", text: "Bids Solicited.", owner: "PM", sys: "s|f", wk: "Wk 28" },
        { n: "5.6", text: "Bids Received. Award Contract. GC Agreement via SiteFolio; GC Contract PO in Coupa.", owner: "PM", sys: "s|f / Coupa", wk: "Wk 25" },
      ], gates: ["CA Approved; bids received; Landlord Approval if required."], tips: [] },
      { name: "Phase 6 — Construction & Fixturing", steps: [
        { n: "6.1", text: "Direct Buy Items Ordered (incl. Refrigeration).", owner: "PM", sys: "Coupa / Email", wk: "Wk 33" },
        { n: "6.2", text: "Fixtures Ordered.", owner: "PM", sys: "Coupa", wk: "Wk 29" },
        { n: "6.3", text: "Demolition / Refrigeration Prep Started.", owner: "GC", sys: "s|f", wk: "Wk 21" },
        { n: "6.4", text: "Construction Started.", owner: "GC", sys: "s|f", wk: "Wk 20" },
        { n: "6.5", text: "Exterior Completed.", owner: "GC", sys: "s|f", wk: "Wk 6" },
        { n: "6.6", text: "Product Resets Completed.", owner: "Store / PM", sys: "s|f", wk: "Wk 4" },
        { n: "6.7", text: "Construction / Fixturing Completed.", owner: "GC / PM", sys: "s|f", wk: "Wk 3" },
        { n: "6.8", text: "Safety Assured / Approved.", owner: "PM / Store", sys: "s|f", wk: "Wk 1" },
        { n: "6.9", text: "Project Completed.", owner: "PM", sys: "s|f", wk: "Wk 1" },
      ], gates: ["All permits in hand; SWPPP meeting held before construction start."], tips: ["Remodel phasing plan is critical — store remains open throughout. Review Remodel_phasing_presentation.docx."] },
      { name: "Phase 7 — Project Close-Out", steps: [
        { n: "7.1", text: "Grand Opening.", owner: "PM / Store", sys: "Oracle", wk: "Wk 0" },
        { n: "7.2", text: "Close-Out Request Form within 3\u20134 Periods. PM reviews with CM, submits to Cost Control Lead.", owner: "PM", sys: "s|f / Oracle", wk: "" },
        { n: "7.3", text: "Scan and post to SiteFolio. Oracle project cancelled or closed.", owner: "PM / Cost Control", sys: "s|f / Oracle", wk: "" },
      ], gates: ["All POs closed; Oracle reconciled; CA closed."], tips: [] },
    ],
  },

  fc: {
    id: "fc",
    title: "Fuel Center (FC)",
    baseline: "61 Weeks",
    template: "DDDD — Fuel Center",
    businessArea: "Fuel",
    parent: "#FC1",
    objective: "Guide the PM through a Fuel Center project from identification through opening and close-out.",
    scope: "Use for Net New Fuel Centers, Expanded Fuel Centers, and Fuel Center Relocations. Minor capital FC purchases (merchandiser boxes, sign repairs) use the Minor Capital template instead.",
    sources: ["Fuel_Center_project_schedule_template.xls", "Oracle Retail Division Guidance.docx", "Pre-construction_CA_Approvals_Required.docx", "generalConditions.pdf"],
    schedule: [
      { m: "Preliminary Site Plan Developed", wk: "Week 59", gate: "" },
      { m: "Site Reviewed with SPG", wk: "Week 57", gate: "SPG conceptual approval required" },
      { m: "Market Research Received", wk: "Week 52", gate: "" },
      { m: "Pre-Con CA Approved", wk: "Week 51", gate: "" },
      { m: "SPG Final Approval", wk: "Week 29", gate: "SPG gate" },
      { m: "CA Approved", wk: "Week 25", gate: "Oracle \u2192 Active" },
      { m: "Tanks/Canopy/Equipment Ordered", wk: "Week 23", gate: "Order BEFORE permits — long lead" },
      { m: "Sitework Started", wk: "Week 14", gate: "SWPPP pre-con; permits in hand" },
      { m: "Tanks Buried", wk: "Week 13", gate: "" },
      { m: "Grand Opening", wk: "Week 0", gate: "" },
    ],
    phases: [
      { name: "Phase 1 — Evaluation & SPG Review", steps: [
        { n: "1.1", text: "Project identified. Develop preliminary site plan.", owner: "PM / RE / SP", sys: "s|f", wk: "Wk 59" },
        { n: "1.2", text: "Conduct conceptual site review with SPG (Store Planning Group).", owner: "PM / SP", sys: "s|f", wk: "Wk 57" },
        { n: "1.3", text: "Order Market Research. Receive Market Research.", owner: "PM / RE", sys: "Email / s|f", wk: "Wk 52" },
        { n: "1.4", text: "Confirm VP RE viability email or Capital Committee Project Approval before Pre-Con CA.", owner: "PM", sys: "Email", wk: "" },
        { n: "1.5", text: 'Set up Oracle project: "DDDD — Fuel Center" template; Business Area: Fuel; Parent: #FC1.', owner: "PM", sys: "Oracle", wk: "" },
      ], gates: ["Market Research received; site reviewed with SPG."], tips: ["Environmental compliance is ESPECIALLY critical for fuel centers — UST contamination issues can halt a project entirely. Engage Environmental Compliance immediately."] },
      { name: "Phase 2 — Due Diligence & Pre-Con CA", steps: [
        { n: "2.1", text: "Create Pre-Con CA. Division President approval \u2264$250K; CARS >$250K. Oracle Plan Approved.", owner: "PM", sys: "Oracle / CARS", wk: "Wk 51" },
        { n: "2.2", text: "Start Due Diligence. Coordinate with Environmental Compliance early. For fuel sites: Phase I ESA is critical; Phase II likely required for existing fuel operations or known contamination.", owner: "PM / Env", sys: "s|f", wk: "Wk 51" },
        { n: "2.3", text: "Initiate property negotiation with Real Estate.", owner: "RE / PM", sys: "s|f / Email", wk: "Wk 51" },
        { n: "2.4", text: "Submit GO Submittal for Project Approval. Run Project Comparison + Final SEF reports.", owner: "PM", sys: "s|f / Oracle", wk: "Wk 32" },
        { n: "2.5", text: "Complete Due Diligence. Upload all EDD reports to SiteFolio.", owner: "PM", sys: "s|f", wk: "Wk 43" },
      ], gates: ["Due Diligence Completed; Environmental clear; Project Approval received."], tips: [] },
      { name: "Phase 3 — Site Plan Development (SPG Gate)", steps: [
        { n: "3.1", text: "Preliminary Site Plan submitted to SPG for approval.", owner: "PM / SP", sys: "s|f", wk: "Wk 46" },
        { n: "3.2", text: "SPG reviews and approves (or requests revisions). Revise per SPG comments if needed.", owner: "PM / SP", sys: "s|f", wk: "" },
        { n: "3.3", text: "Final Site Plan developed.", owner: "PM / SP", sys: "s|f", wk: "Wk 42" },
        { n: "3.4", text: "SPG Final Approval received.", owner: "SP", sys: "s|f", wk: "Wk 29" },
      ], gates: ["SPG Final Approval required before CA approval and bidding."], tips: [] },
      { name: "Phase 4 — Real Estate", steps: [
        { n: "4.1", text: "RE Documents Completed.", owner: "RE", sys: "s|f", wk: "Wk 25" },
        { n: "4.2", text: "Property Closed / Lease Signed.", owner: "RE", sys: "s|f", wk: "Wk 24" },
      ], gates: ["Property closed/lease signed."], tips: [] },
      { name: "Phase 5 — Internal Approval & Bidding", steps: [
        { n: "5.1", text: "Final Estimate Completed. Sales Budget Completed.", owner: "PM", sys: "Oracle / s|f", wk: "Wk 37" },
        { n: "5.2", text: "Budget Submitted for Approval.", owner: "PM", sys: "Oracle", wk: "Wk 33" },
        { n: "5.3", text: "CA Approved. Oracle Status: Active. For >$2M: Capital Committee (SPG Approval required first).", owner: "PM", sys: "Oracle", wk: "Wk 25" },
        { n: "5.4", text: "Bids Received.", owner: "PM", sys: "s|f", wk: "Wk 18" },
        { n: "5.5", text: "Award Contract. GC Agreement via SiteFolio; GC Contract PO in Coupa. Use Item K-0007520 for FC.", owner: "PM", sys: "s|f / Coupa", wk: "" },
      ], gates: ["CA approved; bids within budget."], tips: [] },
      { name: "Phase 6 — Design & Construction", steps: [
        { n: "6.1", text: "Civil Engineer and Architect Authorized.", owner: "PM", sys: "s|f", wk: "Wk 28" },
        { n: "6.2", text: "Construction Documents Received. CDs Submitted for Permits.", owner: "PM", sys: "s|f / AHJ", wk: "Wk 21" },
        { n: "6.3", text: "Tanks, Canopy, and Equipment Ordered (BEFORE permits — long lead items).", owner: "PM", sys: "Coupa", wk: "Wk 23" },
        { n: "6.4", text: "Sitework and Demolition Started.", owner: "GC", sys: "s|f", wk: "Wk 14" },
        { n: "6.5", text: "TANKS BURIED.", owner: "GC", sys: "s|f", wk: "Wk 13" },
        { n: "6.6", text: "Building Construction / Footers Started. Concrete Paving Completed. Canopy Completed.", owner: "GC", sys: "s|f", wk: "Wk 5\u20139" },
        { n: "6.7", text: "Permanent Utilities Completed. Sitework Completed.", owner: "GC", sys: "s|f", wk: "Wk 3" },
        { n: "6.8", text: "TCO Received. Project Completed.", owner: "PM / GC", sys: "s|f / AHJ", wk: "Wk 1" },
      ], gates: ["SWPPP pre-con meeting held; permits in hand before ground disturbance."], tips: [] },
      { name: "Phase 7 — Project Close-Out", steps: [
        { n: "7.1", text: "Opened for Business / Grand Opening.", owner: "PM / Store", sys: "Oracle", wk: "Wk 0" },
        { n: "7.2", text: "Close-Out Request Form within 3\u20134 Periods. PM reviews with CM.", owner: "PM", sys: "s|f / Oracle", wk: "" },
        { n: "7.3", text: "Scan and post to SiteFolio. Oracle project cancelled or closed.", owner: "PM / Cost Control", sys: "s|f / Oracle", wk: "" },
      ], gates: ["All POs closed; Oracle reconciled; CA closed."], tips: [] },
    ],
  },

  mc: {
    id: "mc",
    title: "Minor Capital (MC)",
    baseline: "Simplified",
    template: "DDDD — Minor Capital",
    businessArea: "Depends on funding (SM Other / Merchandising / Retail Ops)",
    parent: "Depends on BA (CO: KS11 for SM Other)",
    objective: "Guide the PM through a Minor Capital project — a non-WIW division-driven initiative, or a G.O. Retail Operations / Merchandising project received via disbursement letter.",
    scope: "Division-directed minor capital initiatives (front-end transformation, asset protection, merchandising, etc.), G.O. Retail Operations initiatives (via disbursement letter), G.O. Merchandising initiatives (via disbursement letter), Minor capital Fuel Center purchases (merchandiser boxes, sign repairs).",
    sources: ["Minor_Capital_project_schedule_template.xlsx", "Oracle Retail Division Guidance.docx", "Equipment_Pre-Order_CA_Policy.docx"],
    schedule: [
      { m: "Project Identified", wk: "\u2014", gate: "Current year prioritized request" },
      { m: "CA Approved", wk: "\u2014", gate: "Oracle \u2192 Active" },
      { m: "Construction Started", wk: "\u2014", gate: "Permits if required" },
      { m: "Project Completed", wk: "\u2014", gate: "" },
      { m: "Close-Out", wk: "\u2014", gate: "Within 3\u20134 periods" },
    ],
    phases: [
      { name: "Phase 1 — Project Assessment", steps: [
        { n: "1.1", text: "Project identified from current year prioritized requests.", owner: "PM", sys: "Email / s|f", wk: "" },
        { n: "1.2", text: "Confirm project is in current year prioritized requests. If not, confirm with CM before proceeding — may need to wait for next cycle.", owner: "PM", sys: "Email", wk: "" },
        { n: "1.3", text: "Determine equipment lead time. If >6 months: Equipment Pre-Order CA Policy applies (cost below $750K, lead time over 6 months, construction start within 12 months).", owner: "PM", sys: "Oracle", wk: "" },
        { n: "1.4", text: 'Create CA. Division President approval \u2264$250K; CARS >$250K. Oracle Project setup: "DDDD — Minor Capital" template; Business Area per funding source.', owner: "PM", sys: "Oracle / CARS", wk: "" },
      ], gates: ["CA approved; Oracle status set."], tips: ["Minor Capital does not use POC accrual method — if <$750K, Full PO Accrual method applies."] },
      { name: "Phase 2 — Design & Fixture Plan", steps: [
        { n: "2.1", text: "Determine if Fixture Plan or Design Drawings are needed.", owner: "PM", sys: "s|f", wk: "" },
        { n: "2.2", text: "If needed: Request and receive Final Fixture Plan from Store Planning.", owner: "PM / SP", sys: "s|f / Email", wk: "" },
        { n: "2.3", text: "If not needed: Proceed with scope definition only.", owner: "PM", sys: "s|f", wk: "" },
      ], gates: [], tips: [] },
      { name: "Phase 3 — Approvals", steps: [
        { n: "3.1", text: "Submit Capital Appropriation for approval.", owner: "PM", sys: "Oracle / s|f", wk: "" },
        { n: "3.2", text: "CA Approved. Oracle Status: Active. For >$2M: Capital Committee required.", owner: "PM", sys: "Oracle", wk: "" },
      ], gates: ["CA Approved; Oracle Active."], tips: ["For >$2M minor capital projects (unusual but possible), Capital Committee approval is still required within 6 months."] },
      { name: "Phase 4 — Permits, Bidding & Construction", steps: [
        { n: "4.1", text: "Determine if permits are required. If yes: submit for permits before construction start.", owner: "PM", sys: "Local AHJ", wk: "" },
        { n: "4.2", text: "Solicit bids. Receive bids.", owner: "PM", sys: "s|f", wk: "" },
        { n: "4.3", text: "Award Contract. GC Agreement via SiteFolio; GC Contract PO in Coupa.", owner: "PM", sys: "s|f / Coupa", wk: "" },
        { n: "4.4", text: "Construction Started.", owner: "GC", sys: "s|f", wk: "" },
        { n: "4.5", text: "Construction / Fixturing Completed.", owner: "GC / PM", sys: "s|f", wk: "" },
        { n: "4.6", text: "Operation Went Live / System Tested and Accepted.", owner: "PM / Store", sys: "s|f", wk: "" },
      ], gates: ["Permits in hand before construction (if required)."], tips: [] },
      { name: "Phase 5 — Project Close-Out", steps: [
        { n: "5.1", text: "Close-Out Request Form within 3-4 Periods. PM reviews with CM, submits to Cost Control Lead.", owner: "PM", sys: "s|f / Oracle", wk: "" },
        { n: "5.2", text: "Scan and post to SiteFolio. Oracle project cancelled or closed.", owner: "PM / Cost Control", sys: "s|f / Oracle", wk: "" },
      ], gates: ["All POs closed; Oracle reconciled; CA closed."], tips: [] },
    ],
  },
}
