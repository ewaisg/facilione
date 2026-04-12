export type AccrualType = "poc" | "full-po"

export interface BudgetLineItem {
  id: string
  projectId: string
  category: string
  description: string
  coupaItemNumber: string | null
  oracleCostCode: string | null
  budgetAmount: number
  committedAmount: number
  actualAmount: number
  forecastAmount: number
  notes: string
  lastImportedAt: string | null
}

/**
 * Accrual method per project type (from PO_Liability_Policy.docx):
 * - NS, ER: POC (Percentage of Completion)
 * - WIW > $750K: POC
 * - WIW ≤ $750K: Full PO Accrual
 * - MC: Full PO Accrual
 */
export function getAccrualType(
  projectType: string,
  totalBudget: number,
): AccrualType {
  if (projectType === "NS" || projectType === "ER") return "poc"
  if (projectType === "WIW" && totalBudget > 750000) return "poc"
  return "full-po"
}
