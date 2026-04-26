/**
 * Dashboard-specific types
 */

export interface PortfolioAiCache {
  id: string // user.uid
  summary: string
  lastGeneratedAt: string // ISO timestamp
  metricsSnapshot: {
    activeProjects: number
    totalBudget: number
    atRiskCount: number
    overdueGoCount: number
    dueSoonGoCount: number
    scheduleOverdueCount: number
    weeklyStaleCount: number
  }
}
