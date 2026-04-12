/**
 * Customization type definitions.
 * Used by Admin → Branding, Nav Builder, Module Config (Phase 6).
 */

export interface OrgBranding {
  appName: string
  primaryColor: string
  logoUrl: string | null
  faviconUrl: string | null
  divisionLabel: string | null
}

export interface NavItem {
  id: string
  label: string
  href: string
  icon: string
  order: number
  visible: boolean
  roles: string[]
}

export interface NavConfig {
  items: NavItem[]
}

export interface ModuleConfig {
  enabledModules: string[]
  customProjectTypes: string[]
  customFields: Record<string, unknown>
}
