import type { UserRole } from "@/types"

const ROUTE_ACCESS_RULES: Array<{ prefix: string; allowedRoles: UserRole[] }> = [
  { prefix: "/admin", allowedRoles: ["admin"] },
]

export function canAccessPath(role: UserRole | null | undefined, pathname: string): boolean {
  for (const rule of ROUTE_ACCESS_RULES) {
    if (pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)) {
      return Boolean(role && rule.allowedRoles.includes(role))
    }
  }

  return true
}

export function canSeeNavItem(role: UserRole | null | undefined, allowedRoles?: UserRole[]): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true
  return Boolean(role && allowedRoles.includes(role))
}
