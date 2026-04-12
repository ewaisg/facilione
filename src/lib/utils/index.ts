import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { HealthStatus, ProjectType } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return "\u2014"
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatDateShort(dateString: string | null): string {
  if (!dateString) return "\u2014"
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function getHealthColor(status: HealthStatus): string {
  switch (status) {
    case "green":
      return "bg-emerald-100 text-emerald-700 border-emerald-200"
    case "yellow":
      return "bg-amber-100 text-amber-700 border-amber-200"
    case "red":
      return "bg-red-100 text-red-700 border-red-200"
  }
}

export function getHealthLabel(status: HealthStatus): string {
  switch (status) {
    case "green":
      return "On Track"
    case "yellow":
      return "At Risk"
    case "red":
      return "Delayed"
  }
}

export function getProjectTypeColor(type: ProjectType): string {
  switch (type) {
    case "NS":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "ER":
      return "bg-purple-100 text-purple-800 border-purple-200"
    case "WIW":
      return "bg-teal-100 text-teal-800 border-teal-200"
    case "FC":
      return "bg-amber-100 text-amber-800 border-amber-200"
    case "MC":
      return "bg-slate-100 text-slate-700 border-slate-200"
    case "F&D":
      return "bg-rose-100 text-rose-800 border-rose-200"
  }
}

export function calculateVariance(budget: number, actual: number): number {
  return budget - actual
}

export function calculateVariancePercent(budget: number, actual: number): number {
  if (budget === 0) return 0
  return ((budget - actual) / budget) * 100
}

export function calculateTargetDate(goDate: string, weekOffset: number): string {
  const go = new Date(goDate)
  const targetDate = new Date(go)
  targetDate.setDate(go.getDate() + weekOffset * 7)
  return targetDate.toISOString().split("T")[0]
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}
