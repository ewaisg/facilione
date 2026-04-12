/**
 * Smart Tools type definitions.
 * Will be populated as each Smart Tool is built in Phases 3–4.
 */

/** Smart Tool identifier */
export type SmartToolId = "estimator" | "bid-comparison"

export interface SmartToolMeta {
  id: SmartToolId
  label: string
  description: string
  phase: number
  projectTypes: string[] | "all"
}
