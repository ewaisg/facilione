/**
 * SOP Reference Data — Complete Library
 *
 * Extracted from FaciliTools sop.html SOP_DATA object.
 * This is the canonical source of truth for all SOP content.
 *
 * Covers:
 *   5 Project Types: NS, ER, WIW, FC, MC
 *   4 Appendices: Oracle Setup, Coupa PO, Meeting Templates, Document Filing
 *
 * Used by:
 *   - /resources/sops page (SOP Quick Reference)
 *   - AI Copilot RAG pipeline (Phase 5)
 *   - Firestore /kb/sops/{type} seeding
 */

import type { SOPDataMap } from "@/types/sop"

export const SOP_DATA: SOPDataMap = {
  ns: {
    id: "ns",
    title: "New Store (NS)",
    baseline: "113 Weeks",
    template: "DDDD — New Store",
    businessArea: "Major Storing",
    parent: "#2002883",
    objective:
      "Guide the PM through a New Store project from site identification through Grand Opening and Oracle close-out.",
    scope:
      'Use for any project using the DDDD — New Store Oracle template with Business Area: Major Storing, Parent Project #2002883, and Project Types: Net New Store or Relocation.',
    sources: [
      "New_store_project_schedule_template.xls",
      "Oracle Retail Division Guidance.docx",
      "Pre-construction_CA_Approvals_Required.docx",
      "Equipment_Pre-Order_CA_Policy.docx",
      "Capitalized_Interest.docx",
      "PO_Liability_Policy.docx",
      "BP_for_GC_Contract_Purchase_Order.docx",
      "Display_Case_Ordering_Procedure.docx",
      "generalConditions.pdf",
      "Auto-Receiving_of_Capital_Items_Purchased.docx",
      "Project_Closeout.docx",
    ],
    schedule: [
      { m: "Project Identified", wk: "Week 113", gate: "VP RE viability email OR Capital Committee Approval" },
      { m: "Preliminary Site Plan Received", wk: "Week 109", gate: "" },
      { m: "Project Approval Received", wk: "Week 86", gate: "GO Submittal — Project Comparison + Final SEF reports" },
      { m: "Due Diligence Started", wk: "Week 105", gate: "" },
      { m: "Due Diligence Completed", wk: "Week 83", gate: "" },
      { m: "Preliminary Fixture Plan Requested", wk: "Week 93", gate: "" },
      { m: "Final Fixture Plan Received", wk: "Week 71", gate: "Final Fixture Plan Approved" },
      { m: "Final Fixture Plan to Architect", wk: "Week 83", gate: "Architect Authorized" },
      { m: "Architect Authorized", wk: "Week 74", gate: "" },
      { m: "Construction Documents Received", wk: "Week 63", gate: "" },
      { m: "CDs Submitted for Permits", wk: "Week 56", gate: "" },
      { m: "CA Approval Received", wk: "Week 57", gate: "Oracle → Active; POs can issue" },
      { m: "Property Closed / Lease Signed", wk: "Week 54", gate: "" },
      { m: "Bids Solicited", wk: "Week 56", gate: "" },
      { m: "Bids Received", wk: "Week 45", gate: "" },
      { m: "Direct Buy Items Ordered", wk: "Week 43", gate: "Order same day as construction start" },
      { m: "Sitework / Demolition Started", wk: "Week 43", gate: "CA approved; SWPPP pre-con held" },
      { m: "Footers Started", wk: "Week 36", gate: "" },
      { m: "Roof Completed", wk: "Week 26", gate: "" },
      { m: "Building Shell Completed", wk: "Week 21", gate: "" },
      { m: "TCO Received", wk: "Week 13", gate: "Punch list distributed" },
      { m: "Construction Completed", wk: "Week 13", gate: "" },
      { m: "Fixturing Started", wk: "Week 10", gate: "Store Fixture Date — all mechanical operational" },
      { m: "Final CO Received", wk: "Week 5", gate: "" },
      { m: "Safety Assured / Approved", wk: "Week 2", gate: "" },
      { m: "Grand Opening", wk: "Week 0", gate: "CA auto-closing triggered" },
    ],
    phases: [
      {
        name: "Phase 1 — Evaluation",
        steps: [
          { n: "1.1", text: "Receive notification of potential new store site from Real Estate or Division leadership.", owner: "PM", sys: "Email/s|f", wk: "" },
          { n: "1.2", text: "Confirm VP of GO Real Estate has sent viability email OR formal Project Approval from Capital Committee has been received. This is required before creating a Pre-Con CA.", owner: "PM", sys: "Email", wk: "" },
          { n: "1.3", text: "Review preliminary site plan when received from Real Estate.", owner: "PM", sys: "Email/s|f", wk: "" },
          { n: "1.4", text: 'Enter "Project Identified" date in New Store schedule template.', owner: "PM", sys: "Schedule XLS", wk: "Wk 113" },
          { n: "1.5", text: 'Request project setup in Oracle using "DDDD — New Store" template; Business Area = Major Storing; Parent Project = #2002883; Project Type = Net New Store or Relocation; set status to Plan Unapproved.', owner: "PM", sys: "Oracle", wk: "" },
          { n: "1.6", text: "Request preliminary estimate to support Project Approval GO submittal.", owner: "PM", sys: "Oracle/s|f", wk: "" },
          { n: "1.7", text: 'Submit Preliminary Estimate and Preliminary Sales Budget for Project Approval. Run "Project Comparison" and "Final SEF" reports in SiteFolio for GO submittal.', owner: "PM", sys: "s|f / Oracle", wk: "Wk 86" },
          { n: "1.8", text: 'Enter "Project Approval Received" date in schedule when confirmed.', owner: "PM", sys: "Schedule XLS", wk: "Wk 86" },
        ],
        gates: ["VP RE viability email received OR formal Capital Committee Project Approval received — BEFORE proceeding to Pre-Con CA."],
        tips: ["Check Capital Committee meeting dates early in SiteFolio > Files > Capital > Spending Policies and Procedures > Cost Control Best Practices > Meeting Dates/Deadlines. Plan your GO submittal deadline accordingly."],
      },
      {
        name: "Phase 2 — Due Diligence & Entitlements",
        steps: [
          { n: "2.1", text: "Create Pre-Con CA in Oracle (up to $250K = Division President approval locally; over $250K = enter CARS). Oracle status: Plan Approved after capital plan budget entered.", owner: "PM", sys: "Oracle/CARS", wk: "" },
          { n: "2.2", text: "Coordinate Due Diligence with Environmental Compliance. Provide current Kroger EDD Scope of Work (from SiteFolio) to environmental consultant for Phase I ESA and ACM Survey quotes.", owner: "PM", sys: "s|f / Email", wk: "Wk 105" },
          { n: "2.3", text: "Phase I ESA ordered and completed. Phase II ESA ordered if Phase I findings require it.", owner: "Env Compliance", sys: "s|f", wk: "" },
          { n: "2.4", text: "ACM Survey completed. Review findings and coordinate remediation if ACM present.", owner: "Env Compliance", sys: "s|f", wk: "" },
          { n: "2.5", text: "Coordinate with Real Estate on entitlements process (zoning, variances, approvals).", owner: "PM / RE", sys: "s|f / Email", wk: "" },
          { n: "2.6", text: "Upload all EDD reports to SiteFolio per EDD policy filing requirements.", owner: "PM", sys: "s|f", wk: "" },
          { n: "2.7", text: 'Track permitting process; update "Permitting Completed" date in schedule when all permits received.', owner: "PM", sys: "Schedule XLS", wk: "Wk 50" },
        ],
        gates: ["Due Diligence Completed; all EDD reports accepted by Environmental Compliance."],
        tips: ["Engage Environmental Compliance as early as possible. Phase I/II findings can delay the project significantly if not identified early."],
      },
      {
        name: "Phase 3 — Fixture Plan Development",
        steps: [
          { n: "3.1", text: 'Submit Plan Request Form to Store Planning. Request preliminary fixture plan. Enter "Preliminary Fixture Plan Requested" date in schedule.', owner: "PM", sys: "s|f / Email", wk: "Wk 93" },
          { n: "3.2", text: "Receive and review Preliminary Fixture Plan from Store Planning. Check for completeness and alignment with scope.", owner: "PM", sys: "s|f", wk: "" },
          { n: "3.3", text: "Conduct Pre-Final Fixture Plan Walk-through with Store Planning team on site.", owner: "PM / SP", sys: "s|f", wk: "" },
          { n: "3.4", text: 'Receive Revised/Final Fixture Plan. Review for correctness (FM review). Enter "Final Fixture Plan Received" date.', owner: "PM", sys: "s|f", wk: "Wk 71" },
          { n: "3.5", text: "Coordinate with GO Remote Refrigeration Procurement Team immediately after Final Fixture Plan released to initiate display case and refrigeration equipment ordering. Eastern: Brittnie.Fitzgerald@kroger.com, Western: Jill.Vanfleet@kroger.com.", owner: "PM", sys: "Email", wk: "" },
        ],
        gates: ["Final Fixture Plan Approved — PM and Store Planning sign-off required before authorizing Architect."],
        tips: ["Lead times for refrigerated cases, I-Pacs, Protocol, Condensers, and Shelving are long. Coordinate equipment ordering the same day as construction start at the latest — ideally sooner."],
      },
      {
        name: "Phase 4 — Design Development",
        steps: [
          { n: "4.1", text: 'Transmit approved Final Fixture Plan to Architect. Authorize Architect to proceed with Construction Documents. Enter "Architect Authorized" date.', owner: "PM", sys: "s|f", wk: "Wk 74" },
          { n: "4.2", text: "Monitor Construction Document development progress. Coordinate Architect RFIs and clarifications through SiteFolio.", owner: "PM", sys: "s|f", wk: "" },
          { n: "4.3", text: "Receive Construction Documents. Review for completeness and compliance with Kroger standards.", owner: "PM", sys: "s|f", wk: "Wk 63" },
          { n: "4.4", text: "Submit Construction Documents for building permits.", owner: "PM", sys: "s|f / Local AHJ", wk: "Wk 56" },
        ],
        gates: ["CDs complete; permits received before bidding starts."],
        tips: [],
      },
      {
        name: "Phase 5 — Internal Approval & CA",
        steps: [
          { n: "5.1", text: "Complete Final Estimate. Update Oracle estimate and SiteFolio budget.", owner: "PM", sys: "Oracle / s|f", wk: "" },
          { n: "5.2", text: "Complete Sales Budget.", owner: "PM / Finance", sys: "Oracle", wk: "" },
          { n: "5.3", text: "Submit Capital Appropriation for approval. For >$2M: Capital Committee approval required via SiteFolio. For \u2264$2M: Division-level approval.", owner: "PM", sys: "Oracle / s|f", wk: "Wk 57" },
          { n: "5.4", text: "CA Approved. Oracle status changes to Active. Build Date and Finish Date must be entered for POC accrual calculation.", owner: "PM", sys: "Oracle", wk: "Wk 57" },
          { n: "5.5", text: "Property Closed / Lease Signed.", owner: "RE", sys: "s|f", wk: "Wk 54" },
        ],
        gates: ["CA Approved; Oracle status Active; POs can be issued."],
        tips: [],
      },
      {
        name: "Phase 6 — Bidding",
        steps: [
          { n: "6.1", text: "Solicit bids from qualified contractors.", owner: "PM", sys: "s|f", wk: "Wk 56" },
          { n: "6.2", text: "Receive bids. Evaluate Trade Proposals.", owner: "PM", sys: "s|f", wk: "Wk 45" },
          { n: "6.3", text: "Award contract. Execute GC Agreement via SiteFolio. Create GC Contract PO in Coupa.", owner: "PM", sys: "s|f / Coupa", wk: "" },
        ],
        gates: ["CA approved; bids received and within budget."],
        tips: ["Schedule the bid at least 2 months BEFORE desired construction start."],
      },
      {
        name: "Phase 7 — Construction",
        steps: [
          { n: "7.1", text: "Order Direct Buy Items including Refrigeration.", owner: "PM", sys: "Email / Coupa", wk: "Wk 43" },
          { n: "7.2", text: "Sitework and Demolition Started. Hold SWPPP pre-construction meeting prior to any ground disturbance.", owner: "PM / GC", sys: "s|f", wk: "Wk 43" },
          { n: "7.3", text: "Building Construction — Footers Started.", owner: "GC", sys: "s|f", wk: "Wk 36" },
          { n: "7.4", text: "Order Fixtures.", owner: "PM", sys: "Coupa", wk: "Wk 30" },
          { n: "7.5", text: "Roof Completed.", owner: "GC", sys: "s|f", wk: "Wk 26" },
          { n: "7.6", text: "Colored Slab Poured.", owner: "GC", sys: "s|f", wk: "Wk 22" },
          { n: "7.7", text: "Building Shell Completed (In the Dry).", owner: "GC", sys: "s|f", wk: "Wk 21" },
          { n: "7.8", text: "Permanent Utilities Completed.", owner: "GC", sys: "s|f", wk: "Wk 17" },
          { n: "7.9", text: "Sitework and Offsite Work Completed.", owner: "GC", sys: "s|f", wk: "Wk 14" },
          { n: "7.10", text: "Temporary Certificate of Occupancy (TCO) Received.", owner: "PM", sys: "Local AHJ / s|f", wk: "Wk 13" },
          { n: "7.11", text: "Construction Completed.", owner: "GC / PM", sys: "s|f", wk: "Wk 13" },
        ],
        gates: ["TCO received; Construction Completed; punch list distributed."],
        tips: ["Develop plan to recover schedule delays immediately — don't wait. Communicate changes to store management and GC quickly."],
      },
      {
        name: "Phase 8 — Fixturing",
        steps: [
          { n: "8.1", text: "Confirm Store Fixture Date milestone. All mechanical systems operational, sales/dock/prep areas accessible, dock well and parking accessible (per General Conditions 9.2.2).", owner: "PM / GC", sys: "s|f", wk: "" },
          { n: "8.2", text: "Fixturing team begins installation of fixtures and refrigerated equipment.", owner: "Fixturing / PM", sys: "s|f", wk: "Wk 10" },
          { n: "8.3", text: "Receive Final Certificate of Occupancy.", owner: "PM", sys: "Local AHJ / s|f", wk: "Wk 5" },
          { n: "8.4", text: "Merchandising Started.", owner: "Store / PM", sys: "s|f", wk: "Wk 4" },
          { n: "8.5", text: "Safety Assured / Approved. Coordinate with Store Operations.", owner: "PM / Store", sys: "s|f", wk: "Wk 2" },
        ],
        gates: ["Safety Assured; Final CO received; all systems operational."],
        tips: [],
      },
      {
        name: "Phase 9 — Project Close-Out",
        steps: [
          { n: "9.1", text: "Grand Opening. CA auto-closing process triggered by Construction Completion Date.", owner: "PM / Store", sys: "Oracle", wk: "Wk 0" },
          { n: "9.2", text: '10 days before CA auto-closes: run Project Summary, Active Project Detail, Project/Orders Listing, and Order Liability reports in Oracle.', owner: "PM", sys: "Oracle", wk: "" },
          { n: "9.3", text: 'Run "PO Never Invoiced" Coupa view — amend or cancel open POs with no invoices.', owner: "PM", sys: "Coupa", wk: "" },
          { n: "9.4", text: "Collect final GC package: affidavit, lien releases, warranties, as-builts, SWPPP closeout docs.", owner: "PM", sys: "s|f", wk: "" },
          { n: "9.5", text: "Complete Close-Out Request Form within 3\u20134 periods of completion. PM reviews with CM, submits to Cost Control Lead.", owner: "PM", sys: "s|f / Oracle", wk: "" },
          { n: "9.6", text: "Scan and post all closeout documents to SiteFolio project archive.", owner: "PM", sys: "s|f", wk: "" },
          { n: "9.7", text: "Oracle project cancelled or closed.", owner: "Cost Control", sys: "Oracle", wk: "" },
        ],
        gates: ["All POs closed; Oracle costs reconciled; SiteFolio documentation complete; CA closed."],
        tips: ["CA should not be reopened after closing without CM authorization. Always document the requester and reason if reopening is required."],
      },
    ],
  },

  er: {
    id: "er",
    title: "Expansion Remodel (ER)",
    baseline: "122 Weeks",
    template: "DDDD — Expansion",
    businessArea: "Major Storing",
    parent: "#2002883",
    objective:
      "Guide the PM through an Expansion Remodel — a store expansion (outside of the walls) — from project identification to Grand Opening and close-out.",
    scope: "Use this SOP when the project involves a store expansion (exterior footprint expansion).",
    sources: [
      "Expansion_Remodel_project_schedule_template.xls",
      "Oracle Retail Division Guidance.docx",
      "Remodel_phasing_presentation.docx",
      "Conducting_Remodel_Project.docx",
      "Pre-construction_CA_Approvals_Required.docx",
      "generalConditions.pdf",
    ],
    schedule: [
      { m: "Project Identified", wk: "Week 122", gate: "" },
      { m: "Preliminary Site Plan Received", wk: "Week 118", gate: "" },
      { m: "Pre-construction CA Approved", wk: "Week 111", gate: "After VP RE email or Project Approval" },
      { m: "Project Approval Received", wk: "Week 93", gate: "GO Submittal required" },
      { m: "As-built Fixture Plan Received", wk: "Week 108", gate: "" },
      { m: "Pre-Final Fixture Plan Walk-through", wk: "Week 94", gate: "" },
      { m: "Final Fixture Plan Received", wk: "Week 75", gate: "Final Fixture Plan Approved" },
      { m: "Final Site Plan Approved", wk: "Week 85", gate: "" },
      { m: "CA Approval Received", wk: "Week 64", gate: "Oracle \u2192 Active; POs can issue" },
      { m: "Sitework / Demolition Started", wk: "Week 43", gate: "CA approved; SWPPP pre-con held" },
      { m: "Expansion Opened", wk: "Week 19", gate: "Expansion area accessible" },
      { m: "Grand Opening", wk: "Week 0", gate: "CA close-out initiated" },
    ],
    phases: [
      {
        name: "Phase 1 — Evaluation & Scope",
        steps: [
          { n: "1.1", text: "Project identified; receive preliminary site plan. Obtain VP RE viability email or Capital Committee Project Approval.", owner: "PM / RE", sys: "Email / s|f", wk: "Wk 122" },
          { n: "1.2", text: "Receive Scope Recommendations. Review with CM and Store Planning.", owner: "PM", sys: "s|f", wk: "Wk 112" },
          { n: "1.3", text: "Complete Preliminary Estimate and Preliminary Sales Budget.", owner: "PM / Finance", sys: "Oracle / s|f", wk: "Wk 100" },
          { n: "1.4", text: "Submit GO Submittal for Project Approval. Run Project Comparison + Final SEF reports.", owner: "PM", sys: "s|f / Oracle", wk: "Wk 93" },
          { n: "1.5", text: 'Set up Oracle project: "DDDD — Expansion" template; Business Area: Major Storing; Parent: #2002883.', owner: "PM", sys: "Oracle", wk: "" },
        ],
        gates: ["Project Approval Received (Week 93) before Pre-Con CA creation."],
        tips: [],
      },
      {
        name: "Phase 2 — Due Diligence & Site Plan",
        steps: [
          { n: "2.1", text: "Create Pre-Con CA. Division President approval \u2264$250K; CARS >$250K. Oracle status: Plan Approved.", owner: "PM", sys: "Oracle / CARS", wk: "Wk 111" },
          { n: "2.2", text: "Order As-built Fixture Plan Survey. Receive survey results.", owner: "PM", sys: "s|f / Email", wk: "Wk 114" },
          { n: "2.3", text: "Order Topographic Survey.", owner: "PM", sys: "s|f / Email", wk: "Wk 101" },
          { n: "2.4", text: "Coordinate Environmental Due Diligence (Phase I/II ESA, ACM). Provide Kroger EDD SOW from SiteFolio.", owner: "PM / Env", sys: "s|f", wk: "" },
          { n: "2.5", text: "Develop and receive Final Site Plan. Obtain Final Site Plan Approved.", owner: "PM / RE / SP", sys: "s|f", wk: "Wk 85" },
          { n: "2.6", text: "Complete Due Diligence. Upload all EDD reports to SiteFolio.", owner: "PM", sys: "s|f", wk: "Wk 89" },
        ],
        gates: ["Due Diligence Completed; EDD reports accepted; Final Site Plan Approved."],
        tips: [],
      },
      {
        name: "Phase 3 — Fixture Plan Development",
        steps: [
          { n: "3.1", text: "Request As-built Fixture Plan from Store Planning. Receive.", owner: "PM", sys: "s|f", wk: "Wk 108" },
          { n: "3.2", text: "Request Preliminary Fixture Plan. Conduct Pre-Final Walk-through.", owner: "PM / SP", sys: "s|f", wk: "Wk 94" },
          { n: "3.3", text: "Receive Final Fixture Plan. Review for completeness.", owner: "PM", sys: "s|f", wk: "Wk 75" },
          { n: "3.4", text: "Coordinate with GO Remote Refrigeration after Final Fixture Plan released.", owner: "PM", sys: "Email", wk: "" },
        ],
        gates: ["Final Fixture Plan Approved; Scope of Work Finalized (Week 71)."],
        tips: [],
      },
      {
        name: "Phase 4 — Real Estate",
        steps: [
          { n: "4.1", text: "Initiate property negotiation with Real Estate.", owner: "RE / PM", sys: "s|f / Email", wk: "Wk 103" },
          { n: "4.2", text: "Complete RE Documents.", owner: "RE", sys: "s|f", wk: "Wk 68" },
          { n: "4.3", text: "Property Closed / Lease Signed.", owner: "RE", sys: "s|f", wk: "Wk 63" },
        ],
        gates: ["Property closed/lease signed before Final CA approval can be obtained."],
        tips: [],
      },
      {
        name: "Phase 5 — Design Development",
        steps: [
          { n: "5.1", text: "Transmit Final Fixture Plan to Architect. Request Refrigeration Plans simultaneously.", owner: "PM", sys: "s|f", wk: "Wk 73" },
          { n: "5.2", text: "Authorize Architect. Receive Refrigeration Plans.", owner: "PM", sys: "s|f", wk: "Wk 69" },
          { n: "5.3", text: "Receive Construction Documents. Review for completeness.", owner: "PM", sys: "s|f", wk: "Wk 58" },
          { n: "5.4", text: "Submit CDs for permits. Receive permits.", owner: "PM", sys: "s|f / Local AHJ", wk: "Wk 45" },
        ],
        gates: ["CDs complete; permits received before bidding starts."],
        tips: [],
      },
      {
        name: "Phase 6 — Internal Approval & Bidding",
        steps: [
          { n: "6.1", text: "Scope of Work Finalized.", owner: "PM", sys: "s|f", wk: "Wk 71" },
          { n: "6.2", text: "Final Estimate Completed. Sales Budget Completed.", owner: "PM", sys: "Oracle / s|f", wk: "Wk 69" },
          { n: "6.3", text: "Submit CA. For >$2M: Capital Committee via SiteFolio. For \u2264$2M: Division approval.", owner: "PM", sys: "Oracle / s|f", wk: "Wk 68" },
          { n: "6.4", text: "CA Approved. Oracle Status: Active.", owner: "PM", sys: "Oracle", wk: "Wk 64" },
          { n: "6.5", text: "Solicit bids. Receive bids.", owner: "PM", sys: "s|f", wk: "Wk 45" },
          { n: "6.6", text: "Award Contract. GC Agreement via SiteFolio; GC Contract PO in Coupa.", owner: "PM", sys: "s|f / Coupa", wk: "" },
        ],
        gates: ["CA Approved; bids received and within budget."],
        tips: [],
      },
      {
        name: "Phase 7 — Construction & Fixturing (Phased)",
        steps: [
          { n: "7.1", text: "Direct Buy Items Ordered (incl. Refrigeration).", owner: "PM", sys: "Coupa / Email", wk: "Wk 61" },
          { n: "7.2", text: "Sitework and Demolition Started.", owner: "GC", sys: "s|f", wk: "Wk 43" },
          { n: "7.3", text: "Fixtures Ordered.", owner: "PM", sys: "Coupa", wk: "Wk 43" },
          { n: "7.4", text: "Building Construction / Footers Started.", owner: "GC", sys: "s|f", wk: "Wk 39" },
          { n: "7.5", text: "Roof Completed. Building Shell Completed.", owner: "GC", sys: "s|f", wk: "Wk 27" },
          { n: "7.6", text: "Exterior Completed. TCO Received.", owner: "GC / PM", sys: "s|f / AHJ", wk: "Wk 22" },
          { n: "7.7", text: "EXPANSION OPENS — Expansion area accessible to customers.", owner: "PM / Store", sys: "s|f", wk: "Wk 19" },
          { n: "7.8", text: "Product Resets Completed.", owner: "Store / PM", sys: "s|f", wk: "Wk 9" },
          { n: "7.9", text: "Construction / Fixturing Completed. Safety Assured.", owner: "GC / PM", sys: "s|f", wk: "Wk 3" },
          { n: "7.10", text: "Final COO Received. Project Completed.", owner: "PM", sys: "s|f / AHJ", wk: "Wk 1" },
        ],
        gates: ["CA approved; SWPPP pre-con meeting held before ground disturbance.", "Expansion area opens before full construction complete."],
        tips: ["Create Remodel Phasing Plan — store remains open throughout. Review Remodel_phasing_presentation.docx for planning guidance."],
      },
      {
        name: "Phase 8 — Project Close-Out",
        steps: [
          { n: "8.1", text: "Grand Opening.", owner: "PM / Store", sys: "Oracle", wk: "Wk 0" },
          { n: "8.2", text: "Complete Close-Out Request Form within 3\u20134 periods. PM reviews with CM, submits to Cost Control Lead.", owner: "PM", sys: "s|f / Oracle", wk: "" },
          { n: "8.3", text: "Scan and post all closeout documents to SiteFolio.", owner: "PM", sys: "s|f", wk: "" },
          { n: "8.4", text: "Oracle project cancelled or closed.", owner: "Cost Control", sys: "Oracle", wk: "" },
        ],
        gates: ["All POs closed; Oracle reconciled; CA closed."],
        tips: [],
      },
    ],
  },
}
