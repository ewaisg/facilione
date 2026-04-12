export type UserRole = "admin" | "cm" | "pm"

export interface AppUser {
  uid: string
  email: string
  displayName: string
  role: UserRole
  assignedProjectIds: string[]
  managedUserIds: string[]
  orgId: string
  forcePasswordChange: boolean
  createdAt: string
  createdBy: string
  avatarUrl?: string
}
