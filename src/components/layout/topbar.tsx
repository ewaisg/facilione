"use client"

import { usePathname, useRouter } from "next/navigation"
import { Bell, Search, LogOut, User, ChevronDown } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth-context"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getInitials } from "@/lib/utils"
import { toast } from "sonner"

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":   "Dashboard",
  "/projects":    "Projects",
  "/team":        "Team",
  "/fe-copilot":  "FE Copilot",
  "/smart-tools": "Smart Tools",
  "/resources":   "Resources & Knowledge Base",
  "/admin":       "Admin",
}

export function Topbar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const router = useRouter()

  const pageTitle = Object.entries(PAGE_TITLES).find(([path]) =>
    pathname === path || pathname.startsWith(path + "/")
  )?.[1] ?? "FaciliOne"

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/login")
    } catch {
      toast.error("Sign out failed")
    }
  }

  return (
    <header className="flex items-center justify-between h-14 px-4 border-b bg-background flex-shrink-0">
      {/* Page title */}
      <h1 className="text-base font-semibold text-foreground">{pageTitle}</h1>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
          <Search className="size-4" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground relative">
          <Bell className="size-4" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 ml-1 rounded-lg px-2 py-1.5 hover:bg-accent transition-colors">
              <Avatar className="size-7">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {user ? getInitials(user.displayName || user.email) : "?"}
                </AvatarFallback>
              </Avatar>
              {user && (
                <span className="text-sm font-medium hidden sm:block max-w-32 truncate">
                  {user.displayName || user.email}
                </span>
              )}
              <ChevronDown className="size-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <p className="font-medium truncate">{user?.displayName || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              <User className="size-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} variant="destructive">
              <LogOut className="size-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
