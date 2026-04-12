"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useAuth } from "@/lib/firebase/auth-context"
import { subscribeToProjects } from "@/lib/firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users, Search, Loader2, Mail, Phone, FolderKanban,
  ChevronDown, ChevronUp, BarChart3, TrendingUp, Activity,
  UserCheck, Briefcase, Clock,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { Project } from "@/types"

// ── Types ──
interface TeamMember {
  uid: string
  email: string
  displayName: string
  role: string
  orgId: string
  createdAt: string
  avatarUrl?: string
  phone?: string
  title?: string
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  cm: "Construction Manager",
  pm: "Project Manager",
}

const ROLE_BADGE_VARIANT: Record<string, "default" | "info" | "secondary"> = {
  admin: "default",
  cm: "info",
  pm: "secondary",
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export default function TeamPage() {
  const { user } = useAuth()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [expandedMember, setExpandedMember] = useState<string | null>(null)

  // Fetch team members
  const loadMembers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users/list")
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "Failed to load team members")
      }
      setMembers(data.users || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load team members"
      toast.error(message)
      setMembers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  // Subscribe to projects for assignment mapping
  useEffect(() => {
    if (!user) {
      setProjectsLoading(false)
      return
    }
    const unsub = subscribeToProjects(
      user,
      (data) => {
        setProjects(data)
        setProjectsLoading(false)
      },
      (err) => {
        console.error("Team projects subscription error:", err)
        setProjectsLoading(false)
      },
    )
    return () => unsub()
  }, [user])

  // Build assignment map: userId -> projects[]
  const assignmentMap = useMemo(() => {
    const map: Record<string, Project[]> = {}
    for (const project of projects) {
      // PM assignment
      if (project.pmUserId) {
        if (!map[project.pmUserId]) map[project.pmUserId] = []
        map[project.pmUserId].push(project)
      }
      // CM assignment
      if (project.cmUserId) {
        if (!map[project.cmUserId]) map[project.cmUserId] = []
        map[project.cmUserId].push(project)
      }
    }
    return map
  }, [projects])

  // Filter members
  const filteredMembers = useMemo(() => {
    let filtered = members
    if (roleFilter !== "all") {
      filtered = filtered.filter((m) => m.role === roleFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.displayName.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          (m.title && m.title.toLowerCase().includes(q)),
      )
    }
    return filtered
  }, [members, roleFilter, searchQuery])

  // Aggregate stats
  const stats = useMemo(() => {
    const totalMembers = members.length
    const pmCount = members.filter((m) => m.role === "pm").length
    const cmCount = members.filter((m) => m.role === "cm").length
    const activeProjects = projects.filter(
      (p) => p.status === "active" || p.status === "planning",
    ).length
    return { totalMembers, pmCount, cmCount, activeProjects }
  }, [members, projects])

  const toggleExpanded = (uid: string) => {
    setExpandedMember((prev) => (prev === uid ? null : uid))
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Team</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Directory, project assignments, and workload overview.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStat
          label="Team Members"
          value={loading ? "--" : String(stats.totalMembers)}
          icon={Users}
          accent="bg-primary"
        />
        <QuickStat
          label="Project Managers"
          value={loading ? "--" : String(stats.pmCount)}
          icon={UserCheck}
          accent="bg-emerald-600"
        />
        <QuickStat
          label="Construction Managers"
          value={loading ? "--" : String(stats.cmCount)}
          icon={Briefcase}
          accent="bg-violet-600"
        />
        <QuickStat
          label="Active Projects"
          value={projectsLoading ? "--" : String(stats.activeProjects)}
          icon={FolderKanban}
          accent="bg-amber-500"
        />
      </div>

      {/* Team Directory */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="size-4 text-primary" />
                Team Directory
              </CardTitle>
              <CardDescription className="mt-1">
                {filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""}
                {roleFilter !== "all" && ` (${ROLE_LABELS[roleFilter] || roleFilter})`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 w-56 text-xs"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-8 w-40 text-xs">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="cm">Construction Manager</SelectItem>
                  <SelectItem value="pm">Project Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <div className="size-16 rounded-2xl bg-muted flex items-center justify-center">
                <Users className="size-8 opacity-30" />
              </div>
              <p className="text-sm font-medium text-foreground">No team members found</p>
              <p className="text-xs">
                {searchQuery || roleFilter !== "all"
                  ? "Try adjusting your search or filter."
                  : "Team members will appear here once added."}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredMembers.map((member) => {
                const memberProjects = assignmentMap[member.uid] || []
                const activeCount = memberProjects.filter(
                  (p) => p.status === "active" || p.status === "planning",
                ).length
                const isExpanded = expandedMember === member.uid

                return (
                  <div
                    key={member.uid}
                    className="py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <Avatar className="size-10">
                        {member.avatarUrl && (
                          <AvatarImage src={member.avatarUrl} alt={member.displayName} />
                        )}
                        <AvatarFallback className="text-xs font-medium">
                          {getInitials(member.displayName)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">
                            {member.displayName}
                          </p>
                          <Badge variant={ROLE_BADGE_VARIANT[member.role] || "outline"} className="text-[10px]">
                            {ROLE_LABELS[member.role] || member.role}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-0.5">
                          <span className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                            <Mail className="size-3 shrink-0" />
                            {member.email}
                          </span>
                          {member.phone && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="size-3 shrink-0" />
                              {member.phone}
                            </span>
                          )}
                          {member.title && (
                            <span className="text-xs text-muted-foreground hidden md:inline">
                              {member.title}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Project count + expand */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-medium text-foreground">
                            {projectsLoading ? "--" : activeCount}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Active Project{activeCount !== 1 ? "s" : ""}
                          </p>
                        </div>
                        {memberProjects.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-8 p-0"
                            onClick={() => toggleExpanded(member.uid)}
                          >
                            {isExpanded ? (
                              <ChevronUp className="size-4" />
                            ) : (
                              <ChevronDown className="size-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Expanded project assignments */}
                    {isExpanded && memberProjects.length > 0 && (
                      <div className="mt-3 ml-14 space-y-1.5">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          Assigned Projects
                        </p>
                        {memberProjects.map((project) => (
                          <Link
                            key={project.id}
                            href={`/projects/${project.id}`}
                            className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 bg-muted/30 hover:bg-muted/60 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FolderKanban className="size-3.5 text-muted-foreground shrink-0" />
                              <span className="text-xs font-medium truncate">
                                {project.storeNumber} — {project.storeName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge
                                variant={
                                  project.healthStatus === "green"
                                    ? "success"
                                    : project.healthStatus === "yellow"
                                      ? "warning"
                                      : project.healthStatus === "red"
                                        ? "danger"
                                        : "outline"
                                }
                                className="text-[10px]"
                              >
                                {project.healthStatus}
                              </Badge>
                              <Badge variant="outline" className="text-[10px]">
                                {project.status}
                              </Badge>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overview Analysis and Performance — Coming Soon */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Overview Analysis &amp; Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ComingSoonCard
            icon={BarChart3}
            iconColor="text-primary"
            title="Projects per PM"
            description="Distribution of active projects across project managers"
          />
          <ComingSoonCard
            icon={TrendingUp}
            iconColor="text-emerald-600"
            title="Schedule Health by PM"
            description="Average schedule health status for each PM's portfolio"
          />
          <ComingSoonCard
            icon={Activity}
            iconColor="text-amber-500"
            title="Workload Trends"
            description="Weekly activity and project assignment trends over time"
          />
        </div>
      </div>
    </div>
  )
}

// ── Subcomponents ──

function QuickStat({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  icon: React.ElementType
  accent: string
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              {label}
            </p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
          <div className={cn("flex items-center justify-center size-10 rounded-lg", accent)}>
            <Icon className="size-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ComingSoonCard({
  icon: Icon,
  iconColor,
  title,
  description,
}: {
  icon: React.ElementType
  iconColor: string
  title: string
  description: string
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Icon className={cn("size-4", iconColor)} />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-40 rounded-md border border-dashed bg-muted/30">
          <div className="text-center">
            <Clock className="size-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
