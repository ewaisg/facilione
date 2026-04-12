/**
 * SOP Reference Data — Complete Library
 *
 * Canonical source of truth for all SOP content in FaciliOne.
 * Extracted from FaciliTools sop.html SOP_DATA.
 *
 * Sections:
 *   ns  — New Store (113 Weeks, 9 phases)
 *   er  — Expansion Remodel (122 Weeks, 8 phases)
 *   wiw — Within-the-Walls Remodel (86 Weeks, 7 phases)
 *   fc  — Fuel Center (61 Weeks, 7 phases)
 *   mc  — Minor Capital (Simplified, 5 phases)
 *   appA — Appendix A: Oracle Project Setup
 *   appB — Appendix B: Coupa PO Reference
 *   appC — Appendix C: Meeting Templates
 *   appD — Appendix D: Document Filing Reference
 */

import type { SOPDataMap } from "@/types/sop"
import { SOP_DATA as SOP_NS_ER } from "./sop-data-ns-er"
import { SOP_DATA_REMAINING as SOP_WIW_FC_MC } from "./sop-data-wiw-fc-mc"
import { SOP_DATA_APPENDICES } from "./sop-data-appendices"

export const SOP_DATA: SOPDataMap = {
  ...SOP_NS_ER,
  ...SOP_WIW_FC_MC,
  ...SOP_DATA_APPENDICES,
}

/** Project type keys (not appendices) */
export const PROJECT_KEYS = ["ns", "er", "wiw", "fc", "mc"] as const

/** Appendix keys */
export const APPENDIX_KEYS = ["appA", "appB", "appC", "appD"] as const

/** All keys in display order */
export const ALL_SOP_KEYS = [...PROJECT_KEYS, ...APPENDIX_KEYS] as const

export type { SOPDataMap, SOPProject, SOPPhase, SOPStep, SOPScheduleItem } from "@/types/sop"
