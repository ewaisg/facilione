/**
 * Flowchart Data — Complete Mermaid Definitions
 *
 * Extracted from FaciliTools flowcharts.html charts object.
 * Contains Mermaid diagram code for all 5 project types.
 *
 * Used by:
 *   - /resources/flowcharts page
 *   - Firestore /kb/flowcharts/{type} seeding
 */

export interface FlowchartDef {
  key: string
  title: string
  baseline: string
  phases: number
  code: string
}

export const FLOWCHARTS: Record<string, FlowchartDef> = {
  ns: {
    key: "ns",
    title: "New Store",
    baseline: "113 Weeks",
    phases: 8,
    code: `flowchart TD
    classDef action fill:#1e4e8c,color:#fff,stroke:#1a3a6b
    classDef decision fill:#c87010,color:#fff,stroke:#a05a0c
    classDef gate fill:#8b1a1a,color:#fff,stroke:#6b1010
    classDef stop fill:#555,color:#eee,stroke:#444
    classDef endpoint fill:#1a2533,color:#fff,stroke:#0d1520
    classDef sitefolio fill:#155a30,color:#fff,stroke:#0e3d20
    classDef oracle fill:#7a3b0a,color:#fff,stroke:#5a2a06
    NS_START(["START  |  NEW STORE\\nBaseline: 113 Weeks to Grand Opening"]):::endpoint
    subgraph PH1 ["PHASE 1  ·  EVALUATION"]
        E1["Preliminary Site Plan Received\\nWk ~109"]:::action
        E2{"VP GO Real Estate\\nViability Email Received?"}:::decision
        E_HOLD(["HOLD — Do Not Proceed\\nAwait VP Email OR\\nCapital Committee Approval"]):::stop
    end
    subgraph PRECA ["PRE-CON CA ROUTING"]
        CA1{"Pre-Con CA Amount\\nLess than or Equal to $250,000?"}:::decision
        CA2["Division President\\nApproves Locally"]:::action
        CA3["Enter CARS\\nSame flow as any CA above $250K"]:::oracle
        CA_OK["Pre-Con CA APPROVED\\nCreate Oracle Project\\nStatus: Plan Unapproved"]:::oracle
        CA4{"Additional Pre-Con\\nFunding Needed?"}:::decision
        CA5["Create SUPPLEMENTAL Pre-Con CA\\nMUST Enter CARS — Any Amount\\nCannot create second Initial Pre-Con CA"]:::oracle
    end
    subgraph PH2 ["PHASE 2  ·  DUE DILIGENCE  &  ENTITLEMENTS"]
        D1["Due Diligence Started\\nWk ~105"]:::action
        D2{"Site Disturbs 1 Acre\\nor More OR Requires\\nOfficial Permit?"}:::decision
        D3["NOI Required\\nCivil Firm Prepares, Regional Dir. Signs\\nPost to SiteFolio under\\nText Docs / GC / SWPPP"]:::sitefolio
        D4["No NOI Required\\nErosion Control Plans Still\\nRequired in Bid Documents"]:::action
        D5["Due Diligence Completed\\nWk ~83"]:::action
        D6["Revised Final Fixture Plan\\nReceived  Wk ~84"]:::action
        D7["Final Fixture Plan\\nReviewed by FM  Wk ~86"]:::action
        D8["Permitting Completed\\nWk ~50"]:::action
    end
    subgraph PH3 ["PHASE 3  ·  FIXTURE PLAN DEVELOPMENT"]
        FP1["Preliminary Fixture Plan\\nRequested  Wk ~93"]:::action
        FP2["Final Fixture Plan\\nReceived  Wk ~71"]:::action
        FP3["Final Fixture Plan\\nAPPROVED  Wk ~86"]:::gate
    end
    subgraph PH4 ["PHASE 4  ·  DESIGN DEVELOPMENT"]
        DD1["Final Fixture Plan\\nSent to Architect  Wk ~83"]:::action
        DD2["Architect Authorized\\nWk ~74"]:::gate
        DD3["Construction Documents\\nReceived  Wk ~63"]:::action
        DD4["CDs Submitted\\nfor Permits  Wk ~56"]:::action
    end
    subgraph PH5 ["PHASE 5  ·  INTERNAL APPROVAL  &  BIDDING"]
        IA1["Capital Appropriation\\nSubmitted  Wk ~57"]:::action
        IA2{"CA Total Amount\\nGreater Than $2,000,000?"}:::decision
        IA3["Capital Committee Approval\\nRequired — Submit Comparison\\nand SEF Reports via SiteFolio"]:::sitefolio
        IA4["Division-Level\\nCA Approval"]:::action
        IA5["CA APPROVED\\nOracle Status: Active\\nBuild Date and Finish Date must be\\nentered for POC accrual"]:::oracle
        IA6["Property Closed\\nLease Signed  Wk ~54"]:::action
        IA7["Bids Solicited\\nWk ~56"]:::action
        IA8["Bids Received\\nWk ~45"]:::action
        IA9{"Bids Within\\nBudget?"}:::decision
        IA10["Award Contract\\nExecute GC Agreement via SiteFolio\\nCreate GC Contract PO in Coupa"]:::sitefolio
        IA11["Review Scope\\nRe-Bid or Escalate to CM"]:::stop
    end
    subgraph PH6 ["PHASE 6  ·  CONSTRUCTION  (Wk 43 to 13)"]
        C1["Direct Buy Items Ordered\\nIncl. Refrigeration  Wk ~43"]:::action
        C2["Sitework and Demolition\\nStarted  Wk ~43"]:::action
        C3["Building Construction\\nFooters Started  Wk ~36"]:::action
        C4["Fixtures Ordered\\nWk ~30"]:::action
        C5["Roof Completed\\nWk ~26"]:::action
        C6["Colored Slab Poured\\nWk ~22"]:::action
        C7["Building Shell Completed\\nIn the Dry  Wk ~21"]:::action
        C8["Permanent Utilities\\nCompleted  Wk ~17"]:::action
        C9["Sitework and Offsite\\nWork Completed  Wk ~14"]:::action
        C10["TCO — Temporary Certificate\\nof Occupancy Received  Wk ~13"]:::gate
        C11["Construction Completed\\nWk ~13"]:::action
    end
    subgraph PH7 ["PHASE 7  ·  FIXTURING  (Wk 10 to 2)"]
        FX1["Fixturing Started\\nWk ~10"]:::action
        FX2["Final Certificate of\\nOccupancy Received  Wk ~5"]:::gate
        FX3["Merchandising Started\\nWk ~4"]:::action
        FX4["Safety Assured\\nand Approved  Wk ~2"]:::gate
        FX5["Project Completed\\nWk ~2"]:::action
    end
    subgraph PH8 ["PHASE 8  ·  PROJECT CLOSE-OUT"]
        CL1(["GRAND OPENING  Wk 0"]):::endpoint
        CL2["Close-Out Request Form\\nCompleted Within 3 to 4\\nPeriods of Completion"]:::action
        CL3["PM Reviews with CM"]:::action
        CL4["Submit to Cost\\nControl Lead"]:::action
        CL5["Scan and Post to SiteFolio\\nCopy to SiteFolio project archive"]:::sitefolio
        CL6["Oracle Project\\nCancelled or Closed"]:::oracle
        CL7(["PROJECT OFFICIALLY CLOSED"]):::endpoint
    end
    NS_START --> E1
    E1 --> E2
    E2 -->|YES — VP Viability Email| CA1
    E2 -->|NO| E_HOLD
    CA1 -->|YES  Max $250K| CA2
    CA1 -->|NO  Over $250K| CA3
    CA2 --> CA_OK
    CA3 --> CA_OK
    CA_OK --> CA4
    CA4 -->|YES| CA5
    CA5 --> D1
    CA4 -->|NO| D1
    CA_OK --> FP1
    D1 --> D2
    D2 -->|YES  1 Acre or More| D3
    D3 --> D5
    D2 -->|NO  Under 1 Acre| D4
    D4 --> D5
    D5 --> D6
    D6 --> D7
    D7 --> D8
    FP1 --> FP2
    FP2 --> FP3
    FP3 --> DD1
    DD1 --> DD2
    DD2 --> DD3
    DD3 --> DD4
    D8 --> IA1
    DD4 --> IA1
    IA1 --> IA2
    IA2 -->|YES  Over $2M| IA3
    IA3 --> IA5
    IA2 -->|NO  $2M or Less| IA4
    IA4 --> IA5
    IA5 --> IA6
    IA5 --> IA7
    IA7 --> IA8
    IA8 --> IA9
    IA9 -->|YES — Within Budget| IA10
    IA9 -->|NO — Over Budget| IA11
    IA11 --> IA7
    IA10 --> C1
    C1 --> C2
    C2 --> C3
    C3 --> C4
    C4 --> C5
    C5 --> C6
    C6 --> C7
    C7 --> C8
    C8 --> C9
    C9 --> C10
    C10 --> C11
    C11 --> FX1
    FX1 --> FX2
    FX2 --> FX3
    FX3 --> FX4
    FX4 --> FX5
    FX5 --> CL1
    CL1 --> CL2
    CL2 --> CL3
    CL3 --> CL4
    CL4 --> CL5
    CL5 --> CL6
    CL6 --> CL7`,
  },

  er: {
    key: "er",
    title: "Expansion Remodel",
    baseline: "122 Weeks",
    phases: 8,
    code: `flowchart TD
    classDef action fill:#1e4e8c,color:#fff,stroke:#1a3a6b
    classDef decision fill:#c87010,color:#fff,stroke:#a05a0c
    classDef gate fill:#8b1a1a,color:#fff,stroke:#6b1010
    classDef stop fill:#555,color:#eee,stroke:#444
    classDef endpoint fill:#1a2533,color:#fff,stroke:#0d1520
    classDef sitefolio fill:#155a30,color:#fff,stroke:#0e3d20
    classDef oracle fill:#7a3b0a,color:#fff,stroke:#5a2a06
    ER_START(["START  |  EXPANSION REMODEL\\nBaseline: 122 Weeks to Grand Opening"]):::endpoint
    subgraph PH1 ["PHASE 1  ·  EVALUATION"]
        E1["Preliminary Site Plan\\nReceived  Wk ~118"]:::action
        E2["Scope Recommendations\\nReceived  Wk ~112"]:::action
        E3["Preliminary Estimate\\nCompleted  Wk ~100"]:::action
        E4["Preliminary Sales Budget\\nCompleted  Wk ~98"]:::action
        E5{"VP GO Real Estate\\nViability Email Received?"}:::decision
        E_HOLD(["HOLD — Await VP Email\\nOR Capital Committee Approval"]):::stop
        E6["Project Approval\\nReceived  Wk ~93"]:::gate
    end
    subgraph PRECA ["PRE-CON CA ROUTING"]
        CA1{"Pre-Con CA Amount\\nLess than or Equal to $250,000?"}:::decision
        CA2["Division President\\nApproves Locally"]:::action
        CA3["Enter CARS\\nSame flow as any CA above $250K"]:::oracle
        CA_OK["Pre-Con CA APPROVED  Wk ~111\\nCreate Oracle Project\\nStatus: Plan Unapproved"]:::oracle
        CA4{"Additional Pre-Con\\nFunding Needed?"}:::decision
        CA5["Create SUPPLEMENTAL Pre-Con CA\\nMUST Enter CARS — Any Amount"]:::oracle
    end
    subgraph PH2 ["PHASE 2  ·  DUE DILIGENCE  &  ENTITLEMENTS"]
        D1["As-Built Fixture Plan\\nSurvey Started  Wk ~114"]:::action
        D2["As-Built Fixture Plan\\nSurvey Received  Wk ~113"]:::action
        D3["Topographic Survey\\nReceived  Wk ~101"]:::action
        D4["Final Site Plan\\nDeveloped  Wk ~97"]:::action
        D5["Due Diligence\\nCompleted  Wk ~89"]:::action
        D6["Final Site Plan\\nApproved  Wk ~85"]:::gate
        D7["Revised Final Fixture\\nPlan Received  Wk ~66"]:::action
        D8["Permits Received\\nWk ~45"]:::gate
    end
    subgraph PH3 ["PHASE 3  ·  FIXTURE PLAN DEVELOPMENT"]
        FP1["As-Built Fixture Plan\\nRequested  Wk ~112"]:::action
        FP2["As-Built Fixture Plan\\nReceived  Wk ~108"]:::action
        FP3["Preliminary Fixture Plan\\nRequested  Wk ~107"]:::action
        FP4["Pre-Final Fixture Plan\\nWalk-Through Completed  Wk ~94"]:::gate
        FP5["Final Fixture Plan\\nReceived  Wk ~75"]:::action
        FP6["Final Fixture Plan\\nAPPROVED  Wk ~74"]:::gate
    end
    subgraph PH4 ["PHASE 4  ·  REAL ESTATE"]
        RE1["Property Negotiation\\nInitiated  Wk ~103"]:::action
        RE2["RE Documents\\nCompleted  Wk ~68"]:::action
        RE3["Property Closed\\nLease Signed  Wk ~63"]:::gate
    end
    subgraph PH5 ["PHASE 5  ·  DESIGN DEVELOPMENT"]
        DD1["Final Fixture Plan\\nto Architect  Wk ~73"]:::action
        DD2["Refrigeration Plans\\nRequested  Wk ~73"]:::action
        DD3["Refrigeration Plans\\nReceived  Wk ~69"]:::action
        DD4["Architect Authorized\\nWk ~69"]:::gate
        DD5["Construction Documents\\nReceived  Wk ~58"]:::action
        DD6["CDs Submitted\\nfor Permits  Wk ~49"]:::action
    end
    subgraph PH6 ["PHASE 6  ·  INTERNAL APPROVAL  &  BIDDING"]
        IA1["Scope of Work\\nFinalized  Wk ~71"]:::action
        IA2["Final Estimate\\nCompleted  Wk ~70"]:::action
        IA3["Sales Budget\\nCompleted  Wk ~69"]:::action
        IA4["Capital Appropriation\\nSubmitted  Wk ~68"]:::action
        IA5{"CA Total Amount\\nGreater Than $2,000,000?"}:::decision
        IA6["Capital Committee Approval\\nRequired — Submit via SiteFolio"]:::sitefolio
        IA7["Division-Level\\nCA Approval"]:::action
        IA8["CA APPROVED  Wk ~64\\nOracle Status: Active"]:::oracle
        IA9["Bids Solicited\\nWk ~49"]:::action
        IA10["Bids Received\\nWk ~45"]:::action
        IA11{"Bids Within\\nBudget?"}:::decision
        IA12["Award Contract\\nGC Agreement via SiteFolio\\nGC Contract PO in Coupa"]:::sitefolio
        IA13["Review Scope\\nRe-Bid or Escalate to CM"]:::stop
    end
    subgraph PH7 ["PHASE 7  ·  CONSTRUCTION  &  FIXTURING  (Phased)"]
        C1["Direct Buy Items Ordered\\nIncl. Refrigeration  Wk ~61"]:::action
        C2["Sitework and Demolition\\nStarted  Wk ~43"]:::action
        C3["Fixtures Ordered\\nWk ~43"]:::action
        C4["Building Construction\\nFooters Started  Wk ~39"]:::action
        C5["Roof Completed\\nWk ~29"]:::action
        C6["Building Shell Completed\\nIn the Dry  Wk ~27"]:::action
        C7["Exterior Completed\\nWk ~23"]:::action
        C8["TCO Received  Wk ~22"]:::gate
        C9["EXPANSION OPENS\\nWk ~19"]:::endpoint
        C10["Product Resets\\nCompleted  Wk ~9"]:::action
        C11["Sitework Completed\\nWk ~7"]:::action
        C12["Construction and Fixturing\\nCompleted  Wk ~5"]:::action
        C13["Safety Assured\\nand Approved  Wk ~3"]:::gate
        C14["Final COO Received\\nWk ~2"]:::gate
        C15["Project Completed\\nWk ~1"]:::action
    end
    subgraph PH8 ["PHASE 8  ·  PROJECT CLOSE-OUT"]
        CL1(["GRAND OPENING  Wk 0"]):::endpoint
        CL2["Close-Out Request Form\\nWithin 3 to 4 Periods"]:::action
        CL3["PM Reviews with CM\\nSubmit to Cost Control Lead"]:::action
        CL4["Scan and Post\\nto SiteFolio"]:::sitefolio
        CL5["Oracle Project\\nCancelled or Closed"]:::oracle
        CL6(["PROJECT OFFICIALLY CLOSED"]):::endpoint
    end
    ER_START --> E1
    E1 --> E2
    E2 --> E3
    E3 --> E4
    E4 --> E5
    E5 -->|YES — Viable| CA1
    E5 -->|NO| E_HOLD
    CA1 -->|YES  Max $250K| CA2
    CA1 -->|NO  Over $250K| CA3
    CA2 --> CA_OK
    CA3 --> CA_OK
    CA_OK --> E6
    CA_OK --> CA4
    CA4 -->|YES| CA5
    CA5 --> D1
    CA4 -->|NO| D1
    CA_OK --> FP1
    CA_OK --> RE1
    D1 --> D2
    D2 --> D3
    D3 --> D4
    D4 --> D5
    D5 --> D6
    D6 --> D7
    D7 --> D8
    FP1 --> FP2
    FP2 --> FP3
    FP3 --> FP4
    FP4 --> FP5
    FP5 --> FP6
    RE1 --> RE2
    RE2 --> RE3
    FP6 --> DD1
    DD1 --> DD2
    DD2 --> DD3
    DD3 --> DD4
    DD4 --> DD5
    DD5 --> DD6
    FP6 --> IA1
    IA1 --> IA2
    IA2 --> IA3
    IA3 --> IA4
    IA4 --> IA5
    IA5 -->|YES  Over $2M| IA6
    IA6 --> IA8
    IA5 -->|NO  $2M or Less| IA7
    IA7 --> IA8
    IA8 --> IA9
    D8 --> IA9
    DD6 --> IA9
    IA9 --> IA10
    IA10 --> IA11
    IA11 -->|YES — Within Budget| IA12
    IA11 -->|NO — Over Budget| IA13
    IA13 --> IA9
    IA12 --> C1
    C1 --> C2
    C2 --> C3
    C3 --> C4
    C4 --> C5
    C5 --> C6
    C6 --> C7
    C7 --> C8
    C8 --> C9
    C9 --> C10
    C10 --> C11
    C11 --> C12
    C12 --> C13
    C13 --> C14
    C14 --> C15
    C15 --> CL1
    CL1 --> CL2
    CL2 --> CL3
    CL3 --> CL4
    CL4 --> CL5
    CL5 --> CL6`,
  },

  wiw: {
    key: "wiw",
    title: "Within-the-Walls",
    baseline: "86 Weeks",
    phases: 7,
    code: `flowchart TD
    classDef action fill:#1e4e8c,color:#fff,stroke:#1a3a6b
    classDef decision fill:#c87010,color:#fff,stroke:#a05a0c
    classDef gate fill:#8b1a1a,color:#fff,stroke:#6b1010
    classDef stop fill:#555,color:#eee,stroke:#444
    classDef endpoint fill:#1a2533,color:#fff,stroke:#0d1520
    classDef sitefolio fill:#155a30,color:#fff,stroke:#0e3d20
    classDef oracle fill:#7a3b0a,color:#fff,stroke:#5a2a06
    WIW_START(["START  |  WITHIN-THE-WALLS REMODEL\\nBaseline: 86 Weeks to Grand Opening"]):::endpoint
    subgraph SUBTYPE ["PROJECT SIZE DETERMINATION  — Run First"]
        ST1{"Total Project Cost?"}:::decision
        ST2["MINOR REMODEL\\nUnder $750K\\nUse Full PO Accrual\\nin Oracle — not POC"]:::action
        ST3["MINOR REMODEL\\n$750K to $2M\\nStandard CA flow\\nDivision approval"]:::action
        ST4["MAJOR REMODEL\\nOver $2M\\nCapital Committee\\napproval required"]:::action
        ST5["OFFICE WIW REMODEL\\nSpecial case — confirm\\nscope with CM"]:::action
    end
    subgraph PH1 ["PHASE 1  ·  EVALUATION"]
        E1["As-Built Fixture Plan\\nRequested  Wk ~69"]:::action
        E2["Scope Recommendations\\nReceived  Wk ~71"]:::action
        E3{"VP GO Real Estate\\nViability Email Received?"}:::decision
        E_HOLD(["HOLD — Await VP Email\\nOR Capital Committee Approval"]):::stop
        E4["Pre-Con CA Approved\\nSee CA Routing Below  Wk ~70"]:::gate
        E5["Final Estimate\\nCompleted  Wk ~42"]:::action
        E6["Sales Budget\\nCompleted  Wk ~41"]:::action
        E7["Project Approval\\nReceived  Wk ~37"]:::gate
    end
    subgraph PRECA ["PRE-CON CA ROUTING"]
        CA1{"Pre-Con CA Amount\\nLess than or Equal to $250,000?"}:::decision
        CA2["Division President\\nApproves Locally"]:::action
        CA3["Enter CARS\\nSame flow as any CA above $250K"]:::oracle
        CA_OK["Pre-Con CA APPROVED\\nCreate Oracle Project\\nOracle Parent: 2005018"]:::oracle
        CA4{"Additional Pre-Con\\nFunding Needed?"}:::decision
        CA5["Create SUPPLEMENTAL Pre-Con CA\\nMUST Enter CARS — Any Amount"]:::oracle
    end
    subgraph PH2 ["PHASE 2  ·  DUE DILIGENCE"]
        D1["As-Built Fixture Plan\\nSurvey Started  Wk ~78"]:::action
        D2["As-Built Fixture Plan\\nSurvey Received  Wk ~72"]:::action
        D3["As-Built Fixture Plan\\nReceived  Wk ~66"]:::action
        D4["Due Diligence\\nCompleted  Wk ~58"]:::action
        D5["Permits Received\\nWk ~24"]:::gate
    end
    subgraph PH3 ["PHASE 3  ·  FIXTURE PLAN DEVELOPMENT"]
        FP1["Preliminary Fixture Plan\\nRequested  Wk ~64"]:::action
        FP2["Pre-Final Fixture Plan\\nWalk-Through Completed  Wk ~50"]:::gate
        FP3["Final Fixture Plan\\nReceived  Wk ~46"]:::action
        FP4["Final Fixture Plan\\nAPPROVED  Wk ~44"]:::gate
    end
    subgraph PH4 ["PHASE 4  ·  DESIGN DEVELOPMENT"]
        DD1["Final Fixture Plan\\nto Architect  Wk ~43"]:::action
        DD2{"Refrigeration\\nIncluded in Scope?"}:::decision
        DD3["Refrigeration Plans\\nRequested  Wk ~42"]:::action
        DD4["Refrigeration Plans\\nReceived  Wk ~37"]:::action
        DD5["Architect Authorized\\nWk ~37"]:::gate
        DD6["No Refrig Plans Needed\\nArchitect Authorized  Wk ~43"]:::action
        DD7["Construction Documents\\nReceived  Wk ~31"]:::action
        DD8["CDs Submitted\\nfor Permits  Wk ~28"]:::action
    end
    subgraph PH5 ["PHASE 5  ·  INTERNAL APPROVAL  &  BIDDING"]
        IA1["Scope of Work\\nFinalized  Wk ~43"]:::action
        IA2["Budget Submitted\\nfor Approval  Wk ~40"]:::action
        IA3{"CA Total Amount\\nGreater Than $2,000,000?"}:::decision
        IA4["Capital Committee Approval\\nRequired — Submit via SiteFolio"]:::sitefolio
        IA5["Division-Level\\nCA Approval"]:::action
        IA6["CA APPROVED  Wk ~36\\nOracle Status: Active"]:::oracle
        IA7{"Landlord Approval\\nRequired Per Lease?"}:::decision
        IA8["Landlord Approval\\nReceived — LMA Signed  Wk ~31"]:::gate
        IA9["No Landlord Approval\\nNeeded — Proceed"]:::action
        IA10["Bids Solicited\\nWk ~28"]:::action
        IA11["Bids Received\\nWk ~25"]:::action
        IA12{"Bids Within\\nBudget?"}:::decision
        IA13["Award Contract\\nGC Agreement via SiteFolio\\nGC Contract PO in Coupa"]:::sitefolio
        IA14["Review Scope\\nRe-Bid or Escalate to CM"]:::stop
    end
    subgraph PH6 ["PHASE 6  ·  CONSTRUCTION  &  FIXTURING"]
        C1["Direct Buy Items Ordered\\nIncl. Refrigeration  Wk ~33"]:::action
        C2["Fixtures Ordered\\nWk ~29"]:::action
        C3["Demolition and Refrigeration\\nPrep Started  Wk ~21"]:::action
        C4["Construction Started\\nWk ~20"]:::gate
        C5["Exterior Completed\\nWk ~6"]:::action
        C6["Product Resets\\nCompleted  Wk ~4"]:::action
        C7["Construction and Fixturing\\nCompleted  Wk ~3"]:::action
        C8["Safety Assured\\nand Approved  Wk ~1"]:::gate
        C9["Project Completed\\nWk ~1"]:::action
    end
    subgraph PH7 ["PHASE 7  ·  PROJECT CLOSE-OUT"]
        CL1(["GRAND OPENING  Wk 0"]):::endpoint
        CL2["Close-Out Request Form\\nWithin 3 to 4 Periods"]:::action
        CL3["PM Reviews with CM\\nSubmit to Cost Control Lead"]:::action
        CL4["Scan and Post\\nto SiteFolio"]:::sitefolio
        CL5["Oracle Project\\nCancelled or Closed"]:::oracle
        CL6(["PROJECT OFFICIALLY CLOSED"]):::endpoint
    end
    WIW_START --> ST1
    ST1 -->|Under $750K| ST2
    ST1 -->|$750K to $2M| ST3
    ST1 -->|Over $2M| ST4
    ST1 -->|Office WIW| ST5
    ST2 & ST3 & ST4 & ST5 --> E1
    E1 --> E2
    E2 --> E3
    E3 -->|YES — Viable| CA1
    E3 -->|NO| E_HOLD
    CA1 -->|YES  Max $250K| CA2
    CA1 -->|NO  Over $250K| CA3
    CA2 --> CA_OK
    CA3 --> CA_OK
    CA_OK --> E4
    CA_OK --> CA4
    CA4 -->|YES| CA5
    CA5 --> D1
    CA4 -->|NO| D1
    CA_OK --> FP1
    D1 --> D2
    D2 --> D3
    D3 --> D4
    D4 --> D5
    E4 --> E5
    E5 --> E6
    E6 --> E7
    FP1 --> FP2
    FP2 --> FP3
    FP3 --> FP4
    FP4 --> DD1
    DD1 --> DD2
    DD2 -->|YES — Refrig in Scope| DD3
    DD3 --> DD4
    DD4 --> DD5
    DD5 --> DD7
    DD2 -->|NO — No Refrig| DD6
    DD6 --> DD7
    DD7 --> DD8
    FP4 --> IA1
    IA1 --> IA2
    IA2 --> IA3
    IA3 -->|YES  Over $2M| IA4
    IA4 --> IA6
    IA3 -->|NO  $2M or Less| IA5
    IA5 --> IA6
    IA6 --> IA7
    IA7 -->|YES — Lease Requires| IA8
    IA8 --> IA10
    IA7 -->|NO — Not Required| IA9
    IA9 --> IA10
    DD8 --> IA10
    D5 --> IA10
    IA10 --> IA11
    IA11 --> IA12
    IA12 -->|YES — Within Budget| IA13
    IA12 -->|NO — Over Budget| IA14
    IA14 --> IA10
    IA13 --> C1
    C1 --> C2
    C2 --> C3
    C3 --> C4
    C4 --> C5
    C5 --> C6
    C6 --> C7
    C7 --> C8
    C8 --> C9
    C9 --> CL1
    CL1 --> CL2
    CL2 --> CL3
    CL3 --> CL4
    CL4 --> CL5
    CL5 --> CL6`,
  },

  fc: {
    key: "fc",
    title: "Fuel Center",
    baseline: "61 Weeks",
    phases: 7,
    code: `flowchart TD
    classDef action fill:#1e4e8c,color:#fff,stroke:#1a3a6b
    classDef decision fill:#c87010,color:#fff,stroke:#a05a0c
    classDef gate fill:#8b1a1a,color:#fff,stroke:#6b1010
    classDef stop fill:#555,color:#eee,stroke:#444
    classDef endpoint fill:#1a2533,color:#fff,stroke:#0d1520
    classDef sitefolio fill:#155a30,color:#fff,stroke:#0e3d20
    classDef oracle fill:#7a3b0a,color:#fff,stroke:#5a2a06
    classDef spg fill:#4a1a6b,color:#fff,stroke:#300f50
    FC_START(["START  |  FUEL CENTER\\nBaseline: 61 Weeks to Grand Opening"]):::endpoint
    subgraph PH1 ["PHASE 1  ·  EVALUATION  &  SPG REVIEW"]
        E1["Preliminary Site Plan\\nDeveloped  Wk ~59"]:::action
        E2["Site Conceptually\\nReviewed with SPG  Wk ~57"]:::spg
        E3{"SPG Finds Site\\nConceptually Viable?"}:::decision
        E_HOLD1(["HOLD — SPG Does Not\\nApprove Concept\\nDo Not Proceed"]):::stop
        E4["Market Research\\nOrdered  Wk ~56"]:::action
        E5["Market Research\\nReceived  Wk ~52"]:::action
        E6{"Market Research\\nShows Viable Return?"}:::decision
        E_HOLD2(["HOLD — Market Not Viable\\nEscalate to CM and\\nBusiness Development"]):::stop
        E7["Project Approval\\nReceived  Wk ~32"]:::gate
    end
    subgraph PRECA ["PRE-CON CA ROUTING"]
        CA1{"Pre-Con CA Amount\\nLess than or Equal to $250,000?"}:::decision
        CA2["Division President\\nApproves Locally"]:::action
        CA3["Enter CARS\\nSame flow as any CA above $250K"]:::oracle
        CA_OK["Pre-Con CA APPROVED  Wk ~51\\nCreate Oracle Project\\nOracle Parent: FC1"]:::oracle
        CA4{"Additional Pre-Con\\nFunding Needed?"}:::decision
        CA5["Create SUPPLEMENTAL Pre-Con CA\\nMUST Enter CARS — Any Amount"]:::oracle
    end
    subgraph PH2 ["PHASE 2  ·  DUE DILIGENCE  &  ENTITLEMENTS"]
        D1["Due Diligence\\nStarted  Wk ~51"]:::action
        D2["Due Diligence\\nCompleted  Wk ~43"]:::action
        D3{"Environmental Issues Found?\\nPhase I or II ESA Results\\nUST Concerns?"}:::decision
        D4["Environmental Remediation\\nRequired — Engage Environmental\\nCompliance Team Immediately"]:::stop
        D5["Due Diligence Clear\\nContinue to Site Plan\\nDevelopment"]:::action
        D6["Permits Received\\nWk ~15"]:::gate
    end
    subgraph PH3 ["PHASE 3  ·  SITE PLAN DEVELOPMENT  (SPG Gate)"]
        SP1["Preliminary Site Plan\\nApproved by SPG  Wk ~46"]:::spg
        SP2{"SPG Approves\\nPreliminary Site Plan?"}:::decision
        SP3["Revise Site Plan\\nPer SPG Comments"]:::action
        SP4["Final Site Plan\\nDeveloped  Wk ~42"]:::action
        SP5["SPG Approval\\nReceived  Wk ~34"]:::spg
        SP6{"SPG Final\\nApproval Granted?"}:::decision
        SP7["Revise Final Site Plan\\nPer SPG Requirements"]:::action
        SP8["Final Site Plan\\nApproved  Wk ~29"]:::gate
    end
    subgraph PH4 ["PHASE 4  ·  REAL ESTATE"]
        RE1["Property Negotiation\\nInitiated  Wk ~51"]:::action
        RE2["RE Documents\\nCompleted  Wk ~25"]:::action
        RE3["Property Closed\\nLease Signed  Wk ~24"]:::gate
    end
    subgraph PH5 ["PHASE 5  ·  INTERNAL APPROVAL  &  BIDDING"]
        IA1["Final Estimate\\nCompleted  Wk ~41"]:::action
        IA2["Sales Budget\\nCompleted  Wk ~37"]:::action
        IA3["Budget Submitted\\nfor Approval  Wk ~33"]:::action
        IA4{"CA Total Amount\\nGreater Than $2,000,000?"}:::decision
        IA5["Capital Committee Approval\\nRequired — Submit via SiteFolio\\nSPG Approval required first"]:::sitefolio
        IA6["Division-Level\\nCA Approval"]:::action
        IA7["CA APPROVED  Wk ~25\\nOracle Status: Active"]:::oracle
        IA8["Bids Received\\nWk ~18"]:::action
        IA9{"Bids Within\\nBudget?"}:::decision
        IA10["Award Contract\\nGC Agreement via SiteFolio\\nGC Contract PO in Coupa\\nUse Item K-0007520 for FC"]:::sitefolio
        IA11["Review Scope\\nRe-Bid or Escalate to CM"]:::stop
    end
    subgraph PH6 ["PHASE 6  ·  DESIGN  &  CONSTRUCTION  (Wk 28 to 1)"]
        C1["Civil Engineer and Architect\\nAuthorized  Wk ~28"]:::gate
        C2["Construction Documents\\nReceived  Wk ~22"]:::action
        C3["CDs Submitted\\nfor Permits  Wk ~21"]:::action
        C4["Tanks, Canopy, and Equipment\\nOrdered  Wk ~23"]:::action
        C5["Sitework and Demolition\\nStarted  Wk ~14"]:::action
        C6["TANKS BURIED\\nWk ~13"]:::gate
        C7["Building Construction\\nFooters Started  Wk ~9"]:::action
        C8["Concrete Paving\\nCompleted  Wk ~7"]:::action
        C9["Canopy Completed\\nWk ~5"]:::action
        C10["Permanent Utilities\\nCompleted  Wk ~4"]:::action
        C11["Sitework Completed\\nWk ~3"]:::action
        C12["TCO — Temporary Certificate\\nof Occupancy  Wk ~2"]:::gate
        C13["Project Completed\\nWk ~1"]:::action
    end
    subgraph PH7 ["PHASE 7  ·  PROJECT CLOSE-OUT"]
        CL1(["OPENED FOR BUSINESS\\nWk ~1"]):::endpoint
        CL2(["GRAND OPENING  Wk 0"]):::endpoint
        CL3["Close-Out Request Form\\nWithin 3 to 4 Periods"]:::action
        CL4["PM Reviews with CM\\nSubmit to Cost Control Lead"]:::action
        CL5["Scan and Post\\nto SiteFolio"]:::sitefolio
        CL6["Oracle Project\\nCancelled or Closed"]:::oracle
        CL7(["PROJECT OFFICIALLY CLOSED"]):::endpoint
    end
    FC_START --> E1
    E1 --> E2
    E2 --> E3
    E3 -->|NO — SPG Does Not Approve| E_HOLD1
    E3 -->|YES — SPG Approves Concept| CA1
    CA1 -->|YES  Max $250K| CA2
    CA1 -->|NO  Over $250K| CA3
    CA2 --> CA_OK
    CA3 --> CA_OK
    CA_OK --> CA4
    CA4 -->|YES| CA5
    CA5 --> D1
    CA4 -->|NO| D1
    CA_OK --> E4
    E4 --> E5
    E5 --> E6
    E6 -->|YES — Market Viable| E7
    E6 -->|NO — Not Viable| E_HOLD2
    CA_OK --> RE1
    D1 --> D2
    D2 --> D3
    D3 -->|YES — Issues Found| D4
    D3 -->|NO — Clear| D5
    D4 -.->|After Remediation| D5
    D5 --> D6
    CA_OK --> SP1
    SP1 --> SP2
    SP2 -->|YES — SPG Approves Prelim| SP4
    SP2 -->|NO — Revisions Required| SP3
    SP3 --> SP1
    SP4 --> SP5
    SP5 --> SP6
    SP6 -->|YES — SPG Final Approval| SP8
    SP6 -->|NO — Revisions Required| SP7
    SP7 --> SP4
    RE1 --> RE2
    RE2 --> RE3
    E7 --> IA1
    SP8 --> IA1
    IA1 --> IA2
    IA2 --> IA3
    IA3 --> IA4
    IA4 -->|YES  Over $2M| IA5
    IA5 --> IA7
    IA4 -->|NO  $2M or Less| IA6
    IA6 --> IA7
    IA7 --> IA8
    D6 --> IA8
    IA8 --> IA9
    IA9 -->|YES — Within Budget| IA10
    IA9 -->|NO — Over Budget| IA11
    IA11 --> IA8
    IA10 --> C1
    C1 --> C2
    C2 --> C3
    C3 --> D6
    C1 --> C4
    C4 --> C5
    C5 --> C6
    C6 --> C7
    C7 --> C8
    C8 --> C9
    C9 --> C10
    C10 --> C11
    C11 --> C12
    C12 --> C13
    C13 --> CL1
    CL1 --> CL2
    CL2 --> CL3
    CL3 --> CL4
    CL4 --> CL5
    CL5 --> CL6
    CL6 --> CL7`,
  },

  mc: {
    key: "mc",
    title: "Minor Capital",
    baseline: "Simplified",
    phases: 5,
    code: `flowchart TD
    classDef action fill:#1e4e8c,color:#fff,stroke:#1a3a6b
    classDef decision fill:#c87010,color:#fff,stroke:#a05a0c
    classDef gate fill:#8b1a1a,color:#fff,stroke:#6b1010
    classDef stop fill:#555,color:#eee,stroke:#444
    classDef endpoint fill:#1a2533,color:#fff,stroke:#0d1520
    classDef sitefolio fill:#155a30,color:#fff,stroke:#0e3d20
    classDef oracle fill:#7a3b0a,color:#fff,stroke:#5a2a06
    MC_START(["START  |  MINOR CAPITAL\\nSimplified Sequence"]):::endpoint
    subgraph PH0 ["INITIAL PROJECT ASSESSMENT"]
        A1["Project Identified\\nCurrent Year Prioritized Request"]:::action
        A2{"Is This Project in Current\\nYear Prioritized Requests?"}:::decision
        A3["Confirm with CM Before\\nProceeding — May Need to\\nWait for Next Cycle"]:::stop
        A4{"Equipment Lead Time\\nGreater Than 6 Months?"}:::decision
        A5["Equipment Pre-Order CA Policy\\nApplies — Order under pre-order CA\\nCost below $750K, lead time over 6 months\\nConstruction start within 12 months"]:::action
        A6["Standard Project Flow\\nNo Equipment Pre-Order CA"]:::action
    end
    subgraph PRECA ["CA ROUTING"]
        CA1{"Pre-Con CA Amount\\nLess than or Equal to $250,000?"}:::decision
        CA2["Division President\\nApproves Locally"]:::action
        CA3["Enter CARS\\nSame flow as any CA above $250K"]:::oracle
        CA_OK["CA APPROVED\\nCreate Oracle Project\\nOracle Parent: KS11 or KS10 or KS9"]:::oracle
    end
    subgraph PH1 ["PHASE 1  ·  DESIGN  &  FIXTURE PLAN"]
        FP1{"Fixture Plan or\\nDesign Drawings Needed?"}:::decision
        FP2["Final Fixture Plan\\nReceived"]:::action
        FP3["No Fixture Plan Needed\\nProceed with Scope\\nDefinition Only"]:::action
    end
    subgraph PH2 ["PHASE 2  ·  APPROVALS"]
        AP1["Capital Appropriation\\nSubmitted"]:::action
        AP2{"CA Total Amount\\nGreater Than $2,000,000?"}:::decision
        AP3["Capital Committee Approval\\nRequired — Submit via SiteFolio"]:::sitefolio
        AP4["Division-Level\\nCA Approval"]:::action
        AP5["CA APPROVED\\nOracle Status: Active"]:::oracle
    end
    subgraph PH3 ["PHASE 3  ·  PERMITS  &  BIDDING"]
        P1{"Permits Required\\nfor This Work?"}:::decision
        P2["Submit for Permits\\nObtain Permit before\\nConstruction Start"]:::action
        P3["Permits Not Required\\nProceed to Bidding"]:::action
        B1["Bids Solicited"]:::action
        B2["Bids Received"]:::action
        B3{"Bids Within\\nBudget?"}:::decision
        B4["Award Contract\\nGC Agreement via SiteFolio\\nGC Contract PO in Coupa"]:::sitefolio
        B5["Review Scope\\nRe-Bid or Escalate to CM"]:::stop
    end
    subgraph PH4 ["PHASE 4  ·  CONSTRUCTION"]
        C1["Construction Started"]:::gate
        C2["Construction and Fixturing\\nCompleted"]:::action
        C3["Operation Went Live\\nSystem Tested and Accepted"]:::gate
    end
    subgraph PH5 ["PHASE 5  ·  PROJECT CLOSE-OUT"]
        CL1["Close-Out Request Form\\nWithin 3 to 4 Periods"]:::action
        CL2["PM Reviews with CM\\nSubmit to Cost Control Lead"]:::action
        CL3["Scan and Post\\nto SiteFolio"]:::sitefolio
        CL4["Oracle Project\\nCancelled or Closed"]:::oracle
        CL5(["PROJECT OFFICIALLY CLOSED"]):::endpoint
    end
    MC_START --> A1
    A1 --> A2
    A2 -->|YES — In Current Year Plan| A4
    A2 -->|NO — Not in Plan| A3
    A4 -->|YES — Lead Time Over 6 Months| A5
    A4 -->|NO — Standard Lead Time| A6
    A5 --> CA1
    A6 --> CA1
    CA1 -->|YES  Max $250K| CA2
    CA1 -->|NO  Over $250K| CA3
    CA2 --> CA_OK
    CA3 --> CA_OK
    CA_OK --> FP1
    FP1 -->|YES — Plan Needed| FP2
    FP1 -->|NO — Not Needed| FP3
    FP2 --> AP1
    FP3 --> AP1
    AP1 --> AP2
    AP2 -->|YES  Over $2M| AP3
    AP3 --> AP5
    AP2 -->|NO  $2M or Less| AP4
    AP4 --> AP5
    AP5 --> P1
    P1 -->|YES — Required| P2
    P2 --> B1
    P1 -->|NO — Not Required| P3
    P3 --> B1
    B1 --> B2
    B2 --> B3
    B3 -->|YES — Within Budget| B4
    B3 -->|NO — Over Budget| B5
    B5 --> B1
    B4 --> C1
    C1 --> C2
    C2 --> C3
    C3 --> CL1
    CL1 --> CL2
    CL2 --> CL3
    CL3 --> CL4
    CL4 --> CL5`,
  },
}

export const FLOWCHART_KEYS = ["ns", "er", "wiw", "fc", "mc"] as const

export const LEGEND_ITEMS = [
  { color: "#1e4e8c", label: "Action Step" },
  { color: "#c87010", label: "Decision Point" },
  { color: "#8b1a1a", label: "Gate / Milestone" },
  { color: "#155a30", label: "SiteFolio Action" },
  { color: "#7a3b0a", label: "Oracle Action" },
  { color: "#4a1a6b", label: "SPG Review (FC only)" },
  { color: "#555555", label: "Hold / Stop" },
  { color: "#1a2533", label: "Start / End" },
] as const
