"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Bot,
  Wrench,
  BookOpen,
  ShieldCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileText,
  GitBranch,
  CheckSquare,
} from "lucide-react"
import { cn, getInitials } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/firebase/auth-context"
import { canSeeNavItem } from "@/lib/access-control"
import type { UserRole } from "@/types"

export interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
  allowedRoles?: UserRole[]
  children?: { label: string; href: string; icon: React.ElementType }[]
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Team", href: "/team", icon: Users },
  { label: "FE Copilot", href: "/fe-copilot", icon: Bot },
  { label: "Smart Tools", href: "/smart-tools", icon: Wrench },
  {
    label: "Resources & KB",
    href: "/resources",
    icon: BookOpen,
    children: [
      { label: "SOP Reference", href: "/resources/sops", icon: FileText },
      { label: "Flowcharts", href: "/resources/flowcharts", icon: GitBranch },
    ],
  },
  { label: "Admin", href: "/admin", icon: ShieldCheck, allowedRoles: ["admin"] },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const visibleNavItems = NAV_ITEMS.filter((item) => canSeeNavItem(user?.role, item.allowedRoles))

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-brand-900 text-white transition-all duration-200 ease-in-out relative",
        collapsed ? "w-15" : "w-60",
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 border-b border-white/10 shrink-0", "h-14")}>
        <div className="flex items-center justify-center size-8 rounded-lg bg-white/10 shrink-0">
          <Building2 className="size-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-base tracking-tight whitespace-nowrap overflow-hidden">
            FaciliOne
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon
          const hasChildren = item.children && item.children.length > 0

          const linkContent = (
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-100",
                "hover:bg-white/10",
                isActive ? "bg-white/15 text-white" : "text-white/65 hover:text-white",
                collapsed && "justify-center px-2",
              )}
            >
              <Icon className={cn("shrink-0", collapsed ? "size-5" : "size-4")} />
              {!collapsed && (
                <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className="ml-auto text-xs bg-white/20 rounded-full px-1.5 py-0.5 font-mono">
                  {item.badge}
                </span>
              )}
            </Link>
          )

          return (
            <div key={item.href}>
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              ) : (
                linkContent
              )}

              {/* Sub-navigation (only when expanded and parent is active) */}
              {!collapsed && hasChildren && isActive && (
                <div className="ml-4 mt-0.5 space-y-0.5">
                  {item.children!.map((child) => {
                    const childActive = pathname === child.href
                    const ChildIcon = child.icon
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all",
                          "hover:bg-white/10",
                          childActive ? "bg-white/15 text-white" : "text-white/50 hover:text-white/80",
                        )}
                      >
                        <ChildIcon className="size-3.5 shrink-0" />
                        <span>{child.label}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* User profile + collapse toggle */}
      <div className="border-t border-white/10 px-2 py-3 shrink-0">
        <div
          className={cn(
            "flex items-center gap-2",
            collapsed ? "flex-col" : "flex-row",
          )}
        >
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/profile"
                  className="flex items-center justify-center rounded-lg p-1 hover:bg-white/10 transition-all"
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-white/15 text-white text-xs">
                      {user?.displayName ? getInitials(user.displayName) : "?"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{user?.displayName ?? "Profile"}</TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href="/profile"
              className="flex items-center gap-2.5 flex-1 min-w-0 rounded-lg px-2 py-1.5 hover:bg-white/10 transition-all"
            >
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="bg-white/15 text-white text-xs">
                  {user?.displayName ? getInitials(user.displayName) : "?"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-white/80 truncate">
                {user?.displayName ?? "User"}
              </span>
            </Link>
          )}

          <button
            onClick={onToggle}
            className={cn(
              "flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all size-8 shrink-0",
            )}
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}
