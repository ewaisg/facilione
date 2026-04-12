"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/firebase/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { canAccessPath } from "@/lib/access-control"
import { toast } from "sonner"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const lastDeniedPathRef = useRef<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (loading || !user) return
    if (canAccessPath(user.role, pathname)) {
      lastDeniedPathRef.current = null
      return
    }

    if (lastDeniedPathRef.current !== pathname) {
      toast.error("Access denied for this page")
      lastDeniedPathRef.current = pathname
    }
    router.replace("/dashboard")
  }, [loading, pathname, router, user])

  // If still loading and no cached user, show minimal skeleton
  // (the sidebar and topbar render immediately — only the content area shows loading)
  if (loading && !user) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar skeleton */}
        <div className="w-[240px] bg-brand-900 flex-shrink-0" />
        {/* Main area skeleton */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <div className="h-14 border-b bg-background flex-shrink-0" />
          <main className="flex-1 bg-muted/50 flex items-center justify-center">
            <div className="size-6 border-2 border-border border-t-primary rounded-full animate-spin" />
          </main>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-muted/50">
          {children}
        </main>
      </div>
    </div>
  )
}
