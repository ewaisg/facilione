/**
 * SOP Reference Data — Appendices
 *
 * Appendix A: Oracle Project Setup
 * Appendix B: Coupa PO Reference
 * Appendix C: Meeting Templates
 * Appendix D: Document Filing Reference
 */

import type { SOPDataMap } from "@/types/sop"

export const SOP_DATA_APPENDICES: SOPDataMap = {
  appA: {
    id: "appA", title: "Appendix A: Oracle Project Setup", baseline: "Reference", template: "Oracle Cloud Projects",
    businessArea: "All", parent: "N/A",
    objective: "Quick reference for Oracle project templates, business areas, parent projects, status flow, and estimating workflow.",
    scope: "Use whenever setting up a new Oracle project, checking status flow, or running estimating reports.",
    sources: ["Oracle_Retail_Division_Guidance.docx", "Oracle_coupa_User_Guide_Presentation.docx", "New_Construction_Estimating_training.docx", "Capitalized_Interest.docx", "PO_Liability_Policy.docx"],
    schedule: [],
    phases: [
      { name: "A.1 — Oracle Templates and Business Areas", steps: [
        { n: "T1", text: 'New Store / Relocation: Template = "DDDD - New Store". Business Area = Major Storing. Parent = #2002883. Project Types: Net New Store, Relocation.', owner: "\u2014", sys: "Oracle", wk: "" },
        { n: "T2", text: 'Expansion Remodel: Template = "DDDD - Expansion". Business Area = Major Storing. Parent = #2002883.', owner: "\u2014", sys: "Oracle", wk: "" },
        { n: "T3", text: 'WIW Remodel (all sizes): Template = "DDDD - Within The Walls Remodel". Business Area = Supermarket Remodels. Parent = Division Remodel Parent (CO: 2005018).', owner: "\u2014", sys: "Oracle", wk: "" },
        { n: "T4", text: 'Fuel Center: Template = "DDDD - Fuel Center". Business Area = Fuel. Parent = #FC1. Project Types: Net New, Relocation, Expansion.', owner: "\u2014", sys: "Oracle", wk: "" },
        { n: "T5", text: 'Minor Capital (Division-funded): Template = "DDDD - Minor Capital". Business Area = Supermarket Other. Parent = Division SO Parent (CO: KS11).', owner: "\u2014", sys: "Oracle", wk: "" },
        { n: "T6", text: 'Minor Capital (GO Merchandising): Template = "DDDD - Minor Capital". Business Area = Merchandising. Parent = Per disbursement letter.', owner: "\u2014", sys: "Oracle", wk: "" },
        { n: "T7", text: 'Minor Capital (GO Retail Ops): Template = "DDDD - Minor Capital". Business Area = Retail Operations. Parent = Per disbursement letter.', owner: "\u2014", sys: "Oracle", wk: "" },
        { n: "T8", text: 'Land Purchase: Template = "DDDD - Land". Business Area = Major Storing. Parent = #2002883.', owner: "\u2014", sys: "Oracle", wk: "" },
        { n: "T9", text: 'Maintenance / Energy: Template = "DDDD - Maintenance & Energy". Business Area = SM Maint / Energy. Parent = Division Maint/Energy Parent (CO: KS10/KS9).', owner: "\u2014", sys: "Oracle", wk: "" },
      ], gates: [], tips: ['If wrong business area was selected: Navigate to project > Manage Financial Project Settings > Project Classifications > Edit. Change business area from dropdown. If wrong template was used: highlight business area, click X, then click + and find correct class category (Business Area - MINOR CAPITAL, MAINTENANCE, or WIW REMODEL).'] },
      { name: "A.2 — Oracle Project Status Flow", steps: [
        { n: "S1", text: "Plan Unapproved: Starting status at project creation. All projects (parent, child, standalone) start here. No spending allowed.", owner: "\u2014", sys: "Oracle", wk: "" },
        { n: "S2", text: "Plan Approved: Parent/standalone projects reach this after capital plan budget is submitted and approved. Child project reaches this after associated to parent AND parent is in Plan Approved status.", owner: "\u2014", sys: "Oracle", wk: "" },
        { n: "S3", text: "Pending CA Approval: Status after an estimate budget has been baselined AND project has passed Plan Approved status.", owner: "\u2014", sys: "Oracle", wk: "" },
        { n: "S4", text: "Active: Status after CA budget has been approved. Spending authorized. POs can be issued against the project.", owner: "\u2014", sys: "Oracle", wk: "" },
        { n: "S5", text: "Pending Close: Project is about to close. Invoices can still be paid but no new requisitions or POs can be issued. Timing is automated.", owner: "\u2014", sys: "Oracle", wk: "" },
        { n: "S6", text: "Closed: No invoices can be paid/charged. No new requisitions or POs. Only a division controller can re-open a closed project.", owner: "\u2014", sys: "Oracle", wk: "" },
        { n: "S7", text: "Cancelled: Set via Project > General > Project Classifications > Project Mode = Cancelled. Use for projects that never had an approved budget, or pre-con projects where all spending transferred to final CAs. This status is never automatic.", owner: "\u2014", sys: "Oracle", wk: "" },
      ], gates: [], tips: [] },
      { name: "A.3 — Oracle Estimating Workflow (New Store)", steps: [
        { n: "E1", text: "Upload Fixture Plan CSV file to Oracle to start an Estimate.", owner: "PM", sys: "Oracle", wk: "" },
        { n: "E2", text: "Upload Standard Equipment Order Guide (SEOG) Excel file to Oracle.", owner: "PM", sys: "Oracle", wk: "" },
        { n: "E3", text: 'Run "KAM PA Capital Estimation Extension" report in Oracle OTBI.', owner: "PM", sys: "Oracle", wk: "" },
        { n: "E4", text: 'Run "KAM PA Oracle Projects Estimates and Actuals to Sitefolio Report" to export partial estimate from Oracle to SiteFolio.', owner: "PM", sys: "Oracle / s|f", wk: "" },
        { n: "E5", text: "Use partial estimate to find comparable projects. Select 3 comparison projects based on budget vs. their costs using SiteFolio Budget Search filters.", owner: "PM", sys: "s|f", wk: "" },
        { n: "E6", text: 'Complete comparison estimate in SiteFolio Budget tool. Save as "Under Development" version for CM review.', owner: "PM", sys: "s|f", wk: "" },
        { n: "E7", text: 'For Project/CA Approval submittal: run "Project Comparison" report and "Final SEF" report in SiteFolio (do NOT use "s|f IPECC" report).', owner: "PM", sys: "s|f", wk: "" },
        { n: "E8", text: "After CM approval: add line items to Oracle Estimate for Building Leasehold and Fixturing Leasehold (Route Group-level items only; line item detail not needed in Oracle). Baseline the Oracle Estimate.", owner: "PM", sys: "Oracle", wk: "" },
        { n: "E9", text: 'Run "KAM PA Cost Estimate Extract" report. Download ADFdi spreadsheet from Oracle Budget. Paste cost data. Re-upload ADFdi. Submit Budget for CA approval.', owner: "PM", sys: "Oracle", wk: "" },
      ], gates: [], tips: ["ADFDI (Application Development Framework Desktop Integration) is an Excel add-in required by Oracle to upload estimate and CA budgets. Install via Oracle > Navigator > Tools > Download Desktop Integration Installer."] },
      { name: "A.4 — CO Division Parent Project Numbers", steps: [
        { n: "P1", text: "King Soopers Remodel Parent: 2005018", owner: "\u2014", sys: "Oracle", wk: "" },
        { n: "P2", text: "King Soopers Supermarket Other (SM Other) Parent: KS11", owner: "\u2014", sys: "Oracle", wk: "" },
        { n: "P3", text: "King Soopers Supermarket Maintenance Parent: KS10", owner: "\u2014", sys: "Oracle", wk: "" },
        { n: "P4", text: "King Soopers Energy Parent: KS9", owner: "\u2014", sys: "Oracle", wk: "" },
        { n: "P5", text: "Major Storing Parent (all divisions): #2002883", owner: "\u2014", sys: "Oracle", wk: "" },
        { n: "P6", text: "Fuel Center Parent (all divisions): #FC1", owner: "\u2014", sys: "Oracle", wk: "" },
      ], gates: [], tips: [] },
    ],
  },

  appB: {
    id: "appB", title: "Appendix B: Coupa PO Reference", baseline: "Reference", template: "Coupa P2P",
    businessArea: "All", parent: "N/A",
    objective: "Quick reference for Coupa requisitions, PO types, GC contract PO setup, and invoice management.",
    scope: "Use whenever creating requisitions, issuing POs, or managing invoices in Coupa.",
    sources: ["Coupa_P2P_FAQ.docx", "Coupa_additional_info.docx", "BP_for_GC_Contract_Purchase_Order.docx", "Auto-Receiving_of_Capital_Items_Purchased.docx"],
    schedule: [],
    phases: [
      { name: "B.1 — GC Contract PO Setup", steps: [
        { n: "B1", text: "GC Contract PO is created in Coupa after GC Agreement is executed in SiteFolio.", owner: "PM", sys: "Coupa", wk: "" },
        { n: "B2", text: 'Tax handling varies by state: AZ, KS, NM, TX = add separate Tax line on GC PO (sales tax paid to contractor). All other states = Tax exempt PO (Kroger pays jurisdiction directly, except WA where Kroger pays contractor).', owner: "PM", sys: "Coupa", wk: "" },
        { n: "B3", text: "Oracle billing string for capital spend: Natural Account = 1100599 (CIP-Capital Clearing). Project + Task fields must be populated. Location and Cost Center = both 0000.", owner: "PM", sys: "Oracle / Coupa", wk: "" },
      ], gates: [], tips: [] },
      { name: "B.2 — Auto-Receiving and Invoice Holds", steps: [
        { n: "B4", text: 'Supplier invoices auto-receive and auto-pay after 21 days unless a "Hold Receiving" flag is placed.', owner: "PM", sys: "Coupa", wk: "" },
        { n: "B5", text: "PM receives bi-weekly Receiving Reports. Review promptly.", owner: "PM", sys: "Coupa", wk: "" },
        { n: "B6", text: 'To hold an invoice: Add "Hold" via drop-down in "Hold Action" field. Holding one item holds the entire invoice.', owner: "PM", sys: "Coupa", wk: "" },
        { n: "B7", text: 'Before CA closes: Run "PO Never Invoiced" Coupa view. Amend or cancel open POs with no invoices.', owner: "PM", sys: "Coupa", wk: "" },
      ], gates: [], tips: ["Vendor invoices are automatically paid unless you initiate a Hold. Review receiving reports promptly to avoid unintended payments."] },
      { name: "B.3 — PO Liability (New Store / POC Method)", steps: [
        { n: "B8", text: "PO Liability formula: (PO Totals x % of days into project) minus Invoices Approved = PO Liability.", owner: "\u2014", sys: "Oracle", wk: "" },
        { n: "B9", text: "Percent Days calculation: (Build/Construction Date to current) divided by (Build Date to Finish Date minus 168 days).", owner: "\u2014", sys: "Oracle", wk: "" },
        { n: "B10", text: "Remodels under $750K use Full PO Accrual method instead of Percentage of Completion.", owner: "\u2014", sys: "Oracle", wk: "" },
        { n: "B11", text: "For POC to calculate correctly: Build Date and Finish Date in Oracle must be accurate.", owner: "PM", sys: "Oracle", wk: "" },
      ], gates: [], tips: [] },
    ],
  },

  appC: {
    id: "appC", title: "Appendix C: Meeting Templates", baseline: "Reference", template: "SiteFolio / Email",
    businessArea: "All", parent: "N/A",
    objective: "Reference for all required meeting types, attendees, and key agenda items across the project lifecycle.",
    scope: "Use when scheduling and preparing for any project meeting.",
    sources: ["Pre-bid_Meeting_Agenda_template.docx", "Pre-construction_Meeting_Agenda_Minutes_template.docx", "Store_Project_Kick_Off_Meeting_Agenda_template.docx", "weekly_Project_Meeting_Agenda_Minutes_Template.docx", "Construction_Project_Meeting_Tips.docx", "Conducting_Remodel_Project.docx", "generalConditions.pdf"],
    schedule: [],
    phases: [
      { name: "C.1 — Pre-Bid Meeting", steps: [
        { n: "M1", text: "Purpose: Walk bidders through project scope, site conditions, schedule, and Kroger-specific requirements before bid submission.", owner: "PM", sys: "s|f", wk: "" },
        { n: "M2", text: "Key agenda items: Contract/scope overview, detail/spec requirements (note Kroger spec changes since last invite), PVC conduit restrictions, MC cable, Pex tubing, Direct Buy item handling.", owner: "PM", sys: "s|f", wk: "" },
        { n: "M3", text: "Weekly/monthly requirements to discuss: Job meeting agendas/minutes, schedules, shop drawings, SWPPP, StormPro, Zero Waste, SiteFolio photo uploads, RFI/CO handling, phasing and temporary partitions (remodels).", owner: "PM", sys: "s|f", wk: "" },
        { n: "M4", text: "RFI process: Directed to Architectural PM, copied to Kroger PM. Response via ASI (Architectural Supplemental Information). An ASI is NOT the same as a Change Order.", owner: "PM / Architect", sys: "s|f", wk: "" },
        { n: "M5", text: "Any oral answers given during pre-bid are NOT binding. Written responses published via Addendum only.", owner: "PM", sys: "s|f", wk: "" },
        { n: "M6", text: "Store/site walk: Note milestone dates, relate work areas to phasing plan and temporary partition locations (remodel projects).", owner: "PM / Bidders", sys: "On-site", wk: "" },
      ], gates: [], tips: [] },
      { name: "C.2 — Pre-Construction Meeting", steps: [
        { n: "M7", text: "Purpose: Kick off construction phase with GC. Establish communication protocols, schedule, and safety requirements.", owner: "PM", sys: "s|f", wk: "" },
        { n: "M8", text: "SWPPP requirements must be reviewed. NOI required if site disturbs 1 acre or more. Civil firm prepares, Regional Director signs. Post to SiteFolio under Text Docs > GC > SWPPP.", owner: "PM / GC", sys: "s|f", wk: "" },
        { n: "M9", text: "GC shall coordinate sub-contractor work with Owner's other contractors.", owner: "GC", sys: "s|f", wk: "" },
      ], gates: [], tips: [] },
      { name: "C.3 — Store Project Kick-Off Meeting", steps: [
        { n: "M10", text: "Invite: CM, GC team, Store Manager, Co-Managers, Store Department Heads, District Manager.", owner: "PM", sys: "s|f / Email", wk: "" },
        { n: "M11", text: "Purpose: Introduce project to store team. Review scope, phasing plan, schedule, communication protocols, and impacts to store operations.", owner: "PM", sys: "s|f", wk: "" },
      ], gates: [], tips: [] },
      { name: "C.4 — Weekly Job Site Meetings", steps: [
        { n: "M12", text: "Hold weekly job site meetings throughout construction.", owner: "PM / GC", sys: "s|f", wk: "" },
        { n: "M13", text: "Provide update to Three Week Look Ahead Schedules after each job meeting.", owner: "PM / GC", sys: "s|f", wk: "" },
        { n: "M14", text: "Communicate changes to Store Management and GC team quickly. Develop plan to make up for any schedule delays as soon as they occur. Do not wait \u2014 waiting compounds delays.", owner: "PM", sys: "s|f / Email", wk: "" },
        { n: "M15", text: "Upload meeting minutes and photos to SiteFolio after each meeting.", owner: "PM", sys: "s|f", wk: "" },
      ], gates: [], tips: [] },
      { name: "C.5 — Remodel-Specific: Pre-Piping Meeting", steps: [
        { n: "M16", text: "Hold pre-piping meeting with Refrigeration Contractor before refrigeration work begins.", owner: "PM", sys: "s|f", wk: "" },
        { n: "M17", text: "Coordinate equipment delivery dates with phasing plan. Equipment lead-times for refrigerated cases, I-Pacs, Protocol, Condensers, and Shelving are long.", owner: "PM", sys: "s|f / Email", wk: "" },
      ], gates: [], tips: [] },
    ],
  },

  appD: {
    id: "appD", title: "Appendix D: Document Filing Reference", baseline: "Reference", template: "SiteFolio",
    businessArea: "All", parent: "N/A",
    objective: "Where to file every document type in SiteFolio, Oracle, and Coupa.",
    scope: "Use when uploading, filing, or locating any project document.",
    sources: ["Kroger_PM_SOP_Library_v1.docx", "PM_Project_CloseOut.docx"],
    schedule: [],
    phases: [
      { name: "D.1 — SiteFolio Filing Locations", steps: [
        { n: "D1", text: "RFIs and ASIs: SiteFolio > project RFI folder.", owner: "PM", sys: "s|f", wk: "" },
        { n: "D2", text: "Change Orders / COPs: SiteFolio > Change Order folder.", owner: "PM", sys: "s|f", wk: "" },
        { n: "D3", text: "Construction Documents / Drawings: SiteFolio > Drawings folder.", owner: "PM", sys: "s|f", wk: "" },
        { n: "D4", text: "Fixture Plans: SiteFolio > Drawings > Fixture Plans.", owner: "PM", sys: "s|f", wk: "" },
        { n: "D5", text: "Submittals: SiteFolio > Submittals folder.", owner: "PM", sys: "s|f", wk: "" },
        { n: "D6", text: "Pay Application Forms: SiteFolio > Payment Application Forms folder.", owner: "PM", sys: "s|f", wk: "" },
        { n: "D7", text: "As-built Drawings: SiteFolio > Final Closeout Package.", owner: "PM", sys: "s|f", wk: "" },
        { n: "D8", text: "SWPPP Documents: SiteFolio > SWPPP folder. NOI posted under Text Docs > GC > SWPPP.", owner: "PM", sys: "s|f", wk: "" },
        { n: "D9", text: "EDD Reports (Phase I/II, ACM): SiteFolio > Environmental folder.", owner: "PM", sys: "s|f", wk: "" },
        { n: "D10", text: "Capital Committee Meeting Dates: SiteFolio > Files > Capital > Spending Policies and Procedures > Cost Control Best Practices > Meeting Dates/Deadlines.", owner: "\u2014", sys: "s|f", wk: "" },
        { n: "D11", text: "EDD Scopes of Work for Consultants: SiteFolio > Environmental SOW folder.", owner: "PM", sys: "s|f", wk: "" },
        { n: "D12", text: "Warranties and O&M Manuals: SiteFolio > Closeout Package.", owner: "PM", sys: "s|f", wk: "" },
        { n: "D13", text: "Refrigerant Management Documents: SiteFolio > Closeout Package.", owner: "PM", sys: "s|f", wk: "" },
        { n: "D14", text: "Receiving Audit Report: Regional Lead Cost Control runs quarterly. Store electronically for 7 years. Major Capital = CM approval. Minor Capital = FEM approval.", owner: "Cost Control", sys: "s|f", wk: "" },
      ], gates: [], tips: [] },
      { name: "D.2 — Oracle and Coupa Records", steps: [
        { n: "D15", text: "Budget data: Oracle Cloud > Project Budget.", owner: "PM", sys: "Oracle", wk: "" },
        { n: "D16", text: "POs and Invoices: Coupa.", owner: "PM", sys: "Coupa", wk: "" },
        { n: "D17", text: "Receiving Reports: Coupa > bi-weekly report.", owner: "PM", sys: "Coupa", wk: "" },
      ], gates: [], tips: [] },
      { name: "D.3 — Closeout Checklist Items (from PM_Project_CloseOut.docx)", steps: [
        { n: "D18", text: "Final punchlist completed (all contracts) \u2014 confirmed by CM. Includes: site, building, fixturing, fuel, sprinkler, HVAC balance, infrastructure cabling, N/E commissioning.", owner: "PM / CM", sys: "s|f", wk: "" },
        { n: "D19", text: "Security and Safety Review completed (Risk Management). Special region/division requirements completed and posted.", owner: "PM", sys: "s|f", wk: "" },
        { n: "D20", text: "Jetted drain completion letter/certification. Under-floor plumbing smoke test. Thermal scans completed and issues addressed.", owner: "PM / GC", sys: "s|f", wk: "" },
        { n: "D21", text: "Building, Asphalt, and Roof warranties received. O&M manuals provided to Division. Vendor Warranty Sheet provided.", owner: "PM / GC", sys: "s|f", wk: "" },
        { n: "D22", text: "Asset List Transfers and Retirements completed and forwarded for processing.", owner: "PM", sys: "Oracle", wk: "" },
        { n: "D23", text: "All Change Orders processed and final contract payment made (all contracts). Cost History spreadsheet updated. MWBE participation recap posted.", owner: "PM", sys: "s|f / Oracle", wk: "" },
        { n: "D24", text: "Post Construction Meeting (Lessons Learned / Project 360) recap posted to SiteFolio. Contractor Survey and Evaluation forms completed.", owner: "PM", sys: "s|f", wk: "" },
        { n: "D25", text: "All changeover requirements completed, including transfer of utilities. As-built contract drawings, ALTA/site survey, and as-built fixture plan posted to SiteFolio.", owner: "PM", sys: "s|f", wk: "" },
        { n: "D26", text: 'Final SiteFolio review. Confirm project is "archive ready". One Year Warranty walk tentatively scheduled.', owner: "PM / CM", sys: "s|f", wk: "" },
      ], gates: [], tips: [] },
    ],
  },
}
