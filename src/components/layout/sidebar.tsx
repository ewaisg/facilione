"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  Users,
  Calendar,
  Bot,
  Wrench,
  BookOpen,
  ShieldCheck,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",         href: "/dashboard",    icon: LayoutDashboard },
  { label: "Projects",          href: "/projects",     icon: FolderKanban },
  { label: "Analytics",         href: "/analytics",    icon: BarChart3 },
  { label: "Team",              href: "/team",         icon: Users },
  { label: "Calendar",          href: "/calendar",     icon: Calendar },
  { label: "Copilot",           href: "/copilot",      icon: Bot },
  { label: "Smart Tools",       href: "/smart-tools",  icon: Wrench },
  { label: "Resources & KB",    href: "/resources",    icon: BookOpen },
  { label: "Admin",             href: "/admin",        icon: ShieldCheck },
  { label: "Settings",          href: "/settings",     icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-[#0f2240] text-white transition-all duration-200 ease-in-out relative",
        collapsed ? "w-[60px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 border-b border-white/10 flex-shrink-0",
        "h-14"
      )}>
        <div className="flex items-center justify-center size-8 rounded-lg bg-white/10 flex-shrink-0">
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
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon

          const linkContent = (
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-100",
                "hover:bg-white/10",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/65 hover:text-white",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className={cn("flex-shrink-0", collapsed ? "size-5" : "size-4")} />
              {!collapsed && (
                <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.label}
                </span>
              )}
              {!collapsed && item.badge && (
                <span className="ml-auto text-xs bg-white/20 rounded-full px-1.5 py-0.5 font-mono">
                  {item.badge}
                </span>
              )}
            </Link>
          )

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            )
          }

          return <div key={item.href}>{linkContent}</div>
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="px-2 pb-4 flex-shrink-0">
        <button
          onClick={onToggle}
          className={cn(
            "flex items-center justify-center w-full py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all text-xs gap-2",
          )}
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <><ChevronLeft className="size-4" /><span>Collapse</span></>
          )}
        </button>
      </div>
    </aside>
  )
}
