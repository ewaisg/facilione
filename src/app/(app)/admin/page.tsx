"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import {
  ShieldCheck, UserPlus, Loader2, Copy, Check, AlertTriangle,
  Users, FolderKanban, Trash2, Pencil, RefreshCw,
  CheckCircle2, XCircle, Bot, Globe,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { PROJECT_TYPE_LABELS } from "@/constants/project-types"
import type { ProjectType } from "@/types/project"

// ── Types ──
interface UserRecord {
  uid: string
  email: string
  displayName: string
  role: string
  orgId: string
  createdAt: string
}

interface ProjectRecord {
  id: string
  storeNumber: string
  storeName: string
  storeCity: string
  storeState: string
  projectType: string
  status: string
  healthStatus: string
  totalBudget: number
  grandOpeningDate: string | null
  pmUserId: string
  updatedAt: string
}

interface EstimateRecord {
  id: string
  userId: string
  projectId: string | null
  projectInfo: {
    store?: string
    name?: string
    pm?: string
    date?: string
    projectType?: string
    fundingSource?: string
    oracle?: string
    parent?: string
    budget?: string
  }
  sections: Array<unknown>
  updatedAt: string
}

interface CreatedUser {
  uid: string
  email: string
  displayName: string
  role: string
  tempPassword: string
}

interface AdminAiModelConfig {
  key: string
  name: string
  deployment?: string
  targetUri?: string
  model?: string
  apiStyle?: "chat-completions" | "responses"
  authMode?: "api-key" | "authorization-bearer"
  apiKey?: string
  hasApiKey?: boolean
  apiKeyMasked?: string
  enabled: boolean
}

interface AdminAiAgentConfig {
  key: string
  name: string
  version?: string
  endpoint: string
  apiKey?: string
  apiKeyMasked?: string
  notes?: string
  codeSnippet?: string
}

interface AdminAiConfig {
  endpoint: string
  apiVersion: string
  apiKey?: string
  hasApiKey?: boolean
  apiKeyMasked?: string
  models: AdminAiModelConfig[]
  featureModelMap: Partial<Record<"weekly-update-draft" | "portfolio-insights" | "cost-estimate", string>>
  agents: AdminAiAgentConfig[]
  updatedAt?: string | null
  envFallback?: {
    endpoint: string
    apiVersion: string
    hasApiKey: boolean
    deployment: string
  }
}

const ADMIN_TABS = new Set(["users", "projects", "ai-setup", "sitefolio"])

function EstimateLoaderTab() {
  const [projectId, setProjectId] = useState("")
  const [loading, setLoading] = useState(false)
  const [estimates, setEstimates] = useState<EstimateRecord[]>([])

  const loadEstimates = async () => {
    if (!projectId.trim()) {
      toast.error("Enter a project id first")
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/estimates?projectId=${encodeURIComponent(projectId.trim())}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to load estimates")
      setEstimates((data.estimates || []) as EstimateRecord[])
      if ((data.estimates || []).length === 0) toast.info("No estimates found for that project")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load estimates")
      setEstimates([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FolderKanban className="size-4" /> Load Estimate
        </CardTitle>
        <CardDescription>
          Open a saved estimate by project id and continue in the estimator.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder="Project ID" value={projectId} onChange={(e) => setProjectId(e.target.value)} />
          <Button onClick={loadEstimates} disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : "Load"}
          </Button>
        </div>
        <div className="space-y-2">
          {estimates.map((estimate) => (
            <div key={estimate.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">{estimate.projectInfo.store || "—"} — {estimate.projectInfo.name || "Untitled"}</p>
                <p className="text-xs text-muted-foreground">Updated {new Date(estimate.updatedAt).toLocaleString()}</p>
              </div>
              <Link href={`/smart-tools/estimator?estimateId=${estimate.id}&projectId=${estimate.projectId || projectId}`}>
                <Button variant="outline" size="sm">Open in Estimator</Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ══════════════════════════════════════════════
// MAIN ADMIN PAGE
// ══════════════════════════════════════════════
export default function AdminPage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const initialTab = tabParam && ADMIN_TABS.has(tabParam) ? tabParam : "users"
  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    const nextTab = tabParam && ADMIN_TABS.has(tabParam) ? tabParam : "users"
    setActiveTab(nextTab)
  }, [tabParam])

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ShieldCheck className="size-5" />
          Admin Panel
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage users, projects, and system configuration.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="gap-1.5 text-xs">
            <Users className="size-3.5" /> Users
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-1.5 text-xs">
            <FolderKanban className="size-3.5" /> Projects
          </TabsTrigger>
          <TabsTrigger value="ai-setup" className="gap-1.5 text-xs">
            <Bot className="size-3.5" /> AI Setup
          </TabsTrigger>
          <TabsTrigger value="sitefolio" className="gap-1.5 text-xs">
            <Globe className="size-3.5" /> SiteFolio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="projects"><ProjectsTab /><EstimateLoaderTab /></TabsContent>
        <TabsContent value="ai-setup"><AiSetupTab /></TabsContent>
        <TabsContent value="sitefolio"><SiteFolioTab /></TabsContent>
      </Tabs>
    </div>
  )
}

// ══════════════════════════════════════════════
// USERS TAB
// ══════════════════════════════════════════════
function UsersTab() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null)
  const [copied, setCopied] = useState(false)

  // Create form
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")

  // Edit dialog
  const [editUser, setEditUser] = useState<UserRecord | null>(null)
  const [editRole, setEditRole] = useState("")
  const [editName, setEditName] = useState("")
  const [editSaving, setEditSaving] = useState(false)

  // Delete dialog
  const [deleteUser, setDeleteUser] = useState<UserRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users/list")
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "Failed to load users")
      }
      setUsers(data.users || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load users"
      toast.error(message)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  const handleCreate = async () => {
    if (!displayName.trim() || !email.trim() || !role) return
    setCreating(true)
    setCreatedUser(null)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName.trim(), email: email.trim(), role }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Failed to create user"); return }
      setCreatedUser(data)
      toast.success(`User ${data.displayName} created`)
      setDisplayName(""); setEmail(""); setRole("")
      loadUsers()
    } catch {
      toast.error("Network error")
    } finally {
      setCreating(false)
    }
  }

  const handleEditSave = async () => {
    if (!editUser) return
    setEditSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${editUser.uid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: editRole, displayName: editName }),
      })
      if (!res.ok) { toast.error("Failed to update user"); return }
      toast.success("User updated")
      setEditUser(null)
      loadUsers()
    } catch {
      toast.error("Network error")
    } finally {
      setEditSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteUser) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/users/${deleteUser.uid}`, { method: "DELETE" })
      if (!res.ok) { toast.error("Failed to delete user"); return }
      toast.success("User deleted")
      setDeleteUser(null)
      loadUsers()
    } catch {
      toast.error("Network error")
    } finally {
      setDeleting(false)
    }
  }

  const copyPassword = async () => {
    if (!createdUser) return
    try {
      await navigator.clipboard.writeText(createdUser.tempPassword)
      setCopied(true)
      toast.success("Password copied")
      setTimeout(() => setCopied(false), 3000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  const ROLES = [
    { value: "pm", label: "PM" },
    { value: "cm", label: "CM" },
    { value: "admin", label: "Admin" },
  ]

  return (
    <div className="space-y-6 mt-4">
      {/* Create User */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="size-4" /> Create New User
          </CardTitle>
          <CardDescription>New users receive a temporary password to change on first login.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Full Name <span className="text-red-500">*</span></Label>
              <Input placeholder="Jane Smith" value={displayName} onChange={(e) => setDisplayName(e.target.value)} disabled={creating} />
            </div>
            <div className="space-y-2">
              <Label>Email <span className="text-red-500">*</span></Label>
              <Input type="email" placeholder="jane@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={creating} />
            </div>
            <div className="space-y-2">
              <Label>Role <span className="text-red-500">*</span></Label>
              <Select value={role} onValueChange={setRole} disabled={creating}>
                <SelectTrigger><SelectValue placeholder="Select role..." /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleCreate} disabled={!displayName.trim() || !email.trim() || !role || creating}>
            {creating ? <><Loader2 className="size-4 animate-spin" /> Creating...</> : <><UserPlus className="size-4" /> Create User</>}
          </Button>
        </CardContent>
      </Card>

      {/* Created User Result */}
      {createdUser && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-start gap-3">
              <Check className="size-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-emerald-800">User Created: {createdUser.displayName}</p>
                <p className="text-xs text-emerald-700 mt-0.5">Share the temporary password securely. It will not be shown again.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-lg border px-4 py-2">
              <span className="text-xs text-muted-foreground">Temp Password:</span>
              <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono flex-1">{createdUser.tempPassword}</code>
              <button onClick={copyPassword} className="text-muted-foreground hover:text-foreground">
                {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
              </button>
            </div>
            <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-md p-2">
              <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
              This password is displayed once only.
            </div>
          </CardContent>
        </Card>
      )}

      {/* User List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">All Users ({users.length})</CardTitle>
          <Button variant="outline" size="sm" onClick={loadUsers} disabled={loading}>
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} /> Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No users found.</p>
          ) : (
            <div className="divide-y">
              {users.map((u) => (
                <div key={u.uid} className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {u.displayName?.charAt(0) || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{u.displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={cn(
                      "text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                      u.role === "admin" ? "bg-red-100 text-red-700" :
                      u.role === "cm" ? "bg-purple-100 text-purple-700" :
                      "bg-slate-100 text-slate-700",
                    )}>
                      {u.role}
                    </span>
                    <Button variant="ghost" size="icon-sm" onClick={() => { setEditUser(u); setEditRole(u.role); setEditName(u.displayName) }}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-red-500 hover:text-red-700" onClick={() => setDeleteUser(u)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>{editUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={editSaving}>
              {editSaving ? <Loader2 className="size-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{deleteUser?.displayName}</strong> ({deleteUser?.email}) from Firebase Auth and Firestore. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUser(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="size-4 animate-spin" /> : <><Trash2 className="size-4" /> Delete User</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ══════════════════════════════════════════════
// PROJECTS TAB
// ══════════════════════════════════════════════
function ProjectsTab() {
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteProject, setDeleteProject] = useState<ProjectRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Edit dialog
  const [editProject, setEditProject] = useState<ProjectRecord | null>(null)
  const [editFields, setEditFields] = useState<Record<string, string>>({})
  const [editSaving, setEditSaving] = useState(false)

  // Quick-create form
  const [showQuickCreate, setShowQuickCreate] = useState(false)
  const [qcCreating, setQcCreating] = useState(false)
  const [qcFields, setQcFields] = useState({
    storeNumber: "",
    storeName: "",
    storeCity: "",
    storeState: "CO",
    projectType: "MC" as string,
    totalBudget: "",
    grandOpeningDate: "",
    notes: "",
  })

  const resetQcFields = () => {
    setQcFields({
      storeNumber: "", storeName: "", storeCity: "", storeState: "CO",
      projectType: "MC", totalBudget: "", grandOpeningDate: "", notes: "",
    })
  }

  const ALL_PROJECT_TYPES: { value: string; label: string }[] = [
    { value: "NS", label: "New Store" },
    { value: "ER", label: "Expansion Remodel" },
    { value: "WIW", label: "Within-the-Walls" },
    { value: "FC", label: "Fuel Center" },
    { value: "MC", label: "Minor Capital" },
    { value: "F&D", label: "Floor & Decor" },
  ]

  const loadProjects = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/projects/list")
      const data = await res.json()
      setProjects(data.projects || [])
    } catch {
      toast.error("Failed to load projects")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadProjects() }, [loadProjects])

  const handleQuickCreate = async () => {
    if (!qcFields.storeNumber.trim() || !qcFields.storeName.trim()) {
      toast.error("Store number and name are required")
      return
    }
    setQcCreating(true)
    try {
      const body: Record<string, unknown> = { ...qcFields }
      if (body.totalBudget) body.totalBudget = Number(body.totalBudget)
      if (body.grandOpeningDate === "") body.grandOpeningDate = null

      const res = await fetch("/api/admin/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Failed to create project"); return }
      toast.success(`Created: ${data.storeNumber} — ${data.storeName}`)
      resetQcFields()
      setShowQuickCreate(false)
      loadProjects()
    } catch {
      toast.error("Network error")
    } finally {
      setQcCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteProject) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/projects/${deleteProject.id}`, { method: "DELETE" })
      if (!res.ok) { toast.error("Failed to delete project"); return }
      toast.success(`Deleted: ${deleteProject.storeNumber}`)
      setDeleteProject(null)
      loadProjects()
    } catch {
      toast.error("Network error")
    } finally {
      setDeleting(false)
    }
  }

  const openEdit = (p: ProjectRecord) => {
    setEditProject(p)
    setEditFields({
      storeNumber: p.storeNumber,
      storeName: p.storeName,
      storeCity: p.storeCity,
      storeState: p.storeState,
      status: p.status,
      healthStatus: p.healthStatus,
      totalBudget: String(p.totalBudget || ""),
      grandOpeningDate: p.grandOpeningDate || "",
    })
  }

  const handleEditSave = async () => {
    if (!editProject) return
    setEditSaving(true)
    try {
      const body: Record<string, unknown> = { ...editFields }
      if (body.totalBudget) body.totalBudget = Number(body.totalBudget)
      if (body.grandOpeningDate === "") body.grandOpeningDate = null

      const res = await fetch(`/api/admin/projects/${editProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) { toast.error("Failed to update project"); return }
      toast.success("Project updated")
      setEditProject(null)
      loadProjects()
    } catch {
      toast.error("Network error")
    } finally {
      setEditSaving(false)
    }
  }

  return (
    <div className="space-y-4 mt-4">
      {/* ── Create Project Actions ── */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => { setShowQuickCreate(!showQuickCreate); resetQcFields() }}>
          {showQuickCreate ? <><XCircle className="size-3.5" /> Cancel</> : <><FolderKanban className="size-3.5" /> Quick Create</>}
        </Button>
        <p className="text-xs text-muted-foreground">Project creation is managed here in Admin.</p>
      </div>

      {/* ── Quick-Create Form ── */}
      {showQuickCreate && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Create Project</CardTitle>
            <CardDescription>Create a project record with minimal fields.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Store Number *</Label>
                <Input placeholder="e.g. #401" value={qcFields.storeNumber} onChange={(e) => setQcFields((f) => ({ ...f, storeNumber: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Store Name *</Label>
                <Input placeholder="e.g. King Soopers" value={qcFields.storeName} onChange={(e) => setQcFields((f) => ({ ...f, storeName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">City</Label>
                <Input placeholder="e.g. Denver" value={qcFields.storeCity} onChange={(e) => setQcFields((f) => ({ ...f, storeCity: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">State</Label>
                <Input value={qcFields.storeState} onChange={(e) => setQcFields((f) => ({ ...f, storeState: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Project Type *</Label>
                <Select value={qcFields.projectType} onValueChange={(v) => setQcFields((f) => ({ ...f, projectType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ALL_PROJECT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.value} — {t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Budget ($)</Label>
                <Input type="number" placeholder="0" value={qcFields.totalBudget} onChange={(e) => setQcFields((f) => ({ ...f, totalBudget: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Grand Opening</Label>
                <Input type="date" value={qcFields.grandOpeningDate} onChange={(e) => setQcFields((f) => ({ ...f, grandOpeningDate: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Notes</Label>
                <Input placeholder="Optional" value={qcFields.notes} onChange={(e) => setQcFields((f) => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleQuickCreate} disabled={qcCreating}>
                {qcCreating ? <Loader2 className="size-4 animate-spin" /> : <><CheckCircle2 className="size-3.5" /> Create Project</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Project List ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">All Projects ({projects.length})</CardTitle>
          <Button variant="outline" size="sm" onClick={loadProjects} disabled={loading}>
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} /> Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
          ) : projects.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No projects found.</p>
          ) : (
            <div className="divide-y">
              {projects.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-muted">{p.projectType}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.storeNumber} — {p.storeName}, {p.storeState}</p>
                      <p className="text-xs text-muted-foreground">
                        {PROJECT_TYPE_LABELS[p.projectType as ProjectType] || p.projectType} | {p.status} |
                        Budget: {p.totalBudget ? `$${p.totalBudget.toLocaleString()}` : "TBD"}
                        {p.grandOpeningDate ? ` | GO: ${new Date(p.grandOpeningDate).toLocaleDateString()}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn(
                      "text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                      p.healthStatus === "green" ? "bg-emerald-100 text-emerald-700" :
                      p.healthStatus === "yellow" ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700",
                    )}>
                      {p.healthStatus}
                    </span>
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(p)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-red-500 hover:text-red-700" onClick={() => setDeleteProject(p)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editProject} onOpenChange={() => setEditProject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>{editProject?.storeNumber} — {editProject?.storeName}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Store Number</Label>
              <Input value={editFields.storeNumber || ""} onChange={(e) => setEditFields((f) => ({ ...f, storeNumber: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Store Name</Label>
              <Input value={editFields.storeName || ""} onChange={(e) => setEditFields((f) => ({ ...f, storeName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={editFields.storeCity || ""} onChange={(e) => setEditFields((f) => ({ ...f, storeCity: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input value={editFields.storeState || ""} onChange={(e) => setEditFields((f) => ({ ...f, storeState: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editFields.status || ""} onValueChange={(v) => setEditFields((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["planning", "active", "on-hold", "complete", "cancelled"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Health</Label>
              <Select value={editFields.healthStatus || ""} onValueChange={(v) => setEditFields((f) => ({ ...f, healthStatus: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["green", "yellow", "red"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Total Budget</Label>
              <Input type="number" value={editFields.totalBudget || ""} onChange={(e) => setEditFields((f) => ({ ...f, totalBudget: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Grand Opening</Label>
              <Input type="date" value={editFields.grandOpeningDate || ""} onChange={(e) => setEditFields((f) => ({ ...f, grandOpeningDate: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProject(null)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={editSaving}>
              {editSaving ? <Loader2 className="size-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteProject} onOpenChange={() => setDeleteProject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{deleteProject?.storeNumber} — {deleteProject?.storeName}</strong> and all its phases. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteProject(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="size-4 animate-spin" /> : <><Trash2 className="size-4" /> Delete Project</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ══════════════════════════════════════════════
// AI SETUP TAB
// ══════════════════════════════════════════════
function AiSetupTab() {
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSaving, setAiSaving] = useState(false)
  const [showAdvancedAi, setShowAdvancedAi] = useState(false)
  const [quickEndpointUrl, setQuickEndpointUrl] = useState("")
  const [quickModelName, setQuickModelName] = useState("")
  const [quickApiKey, setQuickApiKey] = useState("")
  const [quickTesting, setQuickTesting] = useState(false)
  const [quickTestMessage, setQuickTestMessage] = useState("")
  const [quickTestOk, setQuickTestOk] = useState<boolean | null>(null)
  const [testingModelKey, setTestingModelKey] = useState("")
  const [modelTestResults, setModelTestResults] = useState<Record<string, { ok: boolean; message: string }>>({})
  const [aiConfig, setAiConfig] = useState<AdminAiConfig>({
    endpoint: "",
    apiVersion: "2024-10-21",
    apiKey: "",
    hasApiKey: false,
    apiKeyMasked: "",
    models: [],
    featureModelMap: {},
    agents: [],
    updatedAt: null,
  })

  const loadAiConfig = useCallback(async () => {
    setAiLoading(true)
    try {
      const res = await fetch("/api/admin/ai/config")
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "Failed to load AI configuration")
      }

      const cfg = (data.config || {}) as AdminAiConfig
      setAiConfig({
        endpoint: cfg.endpoint || "",
        apiVersion: cfg.apiVersion || "2024-10-21",
        apiKey: "",
        hasApiKey: cfg.hasApiKey || false,
        apiKeyMasked: cfg.apiKeyMasked || "",
        models: Array.isArray(cfg.models) ? cfg.models : [],
        featureModelMap: cfg.featureModelMap || {},
        agents: Array.isArray(cfg.agents) ? cfg.agents : [],
        updatedAt: cfg.updatedAt || null,
        envFallback: cfg.envFallback,
      })

      const preferred = (Array.isArray(cfg.models) && cfg.models.length > 0 ? cfg.models[0] : null) as AdminAiModelConfig | null
      setQuickEndpointUrl(preferred?.targetUri || "")
      setQuickModelName(preferred?.model || preferred?.name || "")
      setQuickApiKey("")
      setQuickTestMessage("")
      setQuickTestOk(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load AI configuration"
      toast.error(message)
    } finally {
      setAiLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAiConfig()
  }, [loadAiConfig])

  const saveAiConfig = async () => {
    setAiSaving(true)
    try {
      const payload = {
        endpoint: aiConfig.endpoint.trim(),
        apiVersion: aiConfig.apiVersion.trim() || "2024-10-21",
        apiKey: aiConfig.apiKey?.trim() || "",
        models: aiConfig.models,
        featureModelMap: aiConfig.featureModelMap,
        agents: aiConfig.agents,
      }

      const res = await fetch("/api/admin/ai/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "Failed to save AI configuration")
      }
      toast.success("AI configuration saved")
      await loadAiConfig()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save AI configuration"
      toast.error(message)
    } finally {
      setAiSaving(false)
    }
  }

  const addModel = () => {
    const index = aiConfig.models.length + 1
    setAiConfig((prev) => ({
      ...prev,
      models: [...prev.models, {
        key: `model-${index}`,
        name: `Model ${index}`,
        deployment: "",
        targetUri: "",
        model: "",
        apiStyle: "chat-completions",
        authMode: "authorization-bearer",
        apiKey: "",
        enabled: true,
      }],
    }))
  }

  const updateModel = (idx: number, patch: Partial<AdminAiModelConfig>) => {
    setAiConfig((prev) => ({
      ...prev,
      models: prev.models.map((m, i) => (i === idx ? { ...m, ...patch } : m)),
    }))
  }

  const removeModel = (idx: number) => {
    setAiConfig((prev) => {
      const removed = prev.models[idx]
      const nextModels = prev.models.filter((_, i) => i !== idx)
      const nextFeatureMap = { ...prev.featureModelMap }
      if (removed) {
        if (nextFeatureMap["weekly-update-draft"] === removed.key) delete nextFeatureMap["weekly-update-draft"]
        if (nextFeatureMap["portfolio-insights"] === removed.key) delete nextFeatureMap["portfolio-insights"]
        if (nextFeatureMap["cost-estimate"] === removed.key) delete nextFeatureMap["cost-estimate"]
      }
      return { ...prev, models: nextModels, featureModelMap: nextFeatureMap }
    })
  }

  const testModel = async (modelKey: string) => {
    if (!modelKey) return
    setTestingModelKey(modelKey)
    try {
      const res = await fetch("/api/admin/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelKey }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "Model test failed")
      }

      setModelTestResults((prev) => ({
        ...prev,
        [modelKey]: { ok: true, message: String(data.output || "Connected") },
      }))
      toast.success(`Model '${modelKey}' test passed`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Model test failed"
      setModelTestResults((prev) => ({
        ...prev,
        [modelKey]: { ok: false, message },
      }))
      toast.error(`Model '${modelKey}' test failed`)
    } finally {
      setTestingModelKey("")
    }
  }

  const addAgent = () => {
    const index = aiConfig.agents.length + 1
    setAiConfig((prev) => ({
      ...prev,
      agents: [...prev.agents, {
        key: `agent-${index}`,
        name: `Agent ${index}`,
        endpoint: "",
        apiKey: "",
        notes: "",
        codeSnippet: "",
      }],
    }))
  }

  const updateAgent = (idx: number, patch: Partial<AdminAiAgentConfig>) => {
    setAiConfig((prev) => ({
      ...prev,
      agents: prev.agents.map((a, i) => (i === idx ? { ...a, ...patch } : a)),
    }))
  }

  const removeAgent = (idx: number) => {
    setAiConfig((prev) => ({
      ...prev,
      agents: prev.agents.filter((_, i) => i !== idx),
    }))
  }

  const handleQuickCompletionSetup = async () => {
    const endpoint = quickEndpointUrl.trim()
    const model = quickModelName.trim()
    const apiKey = quickApiKey.trim()

    if (!endpoint) {
      toast.error("Completion endpoint URL is required")
      return
    }
    if (!model) {
      toast.error("Model name is required")
      return
    }
    if (!apiKey && !aiConfig.hasApiKey) {
      toast.error("API key is required")
      return
    }

    setQuickTesting(true)
    setQuickTestMessage("")
    setQuickTestOk(null)

    try {
      const quickModelKey = "default-completion"
      const mergedModels = [
        {
          key: quickModelKey,
          name: model,
          model,
          targetUri: endpoint,
          deployment: "",
          apiStyle: "chat-completions" as const,
          authMode: "authorization-bearer" as const,
          enabled: true,
          apiKey: "",
        },
        ...aiConfig.models.filter((m) => m.key !== quickModelKey),
      ]

      const payload = {
        endpoint: aiConfig.endpoint.trim(),
        apiVersion: aiConfig.apiVersion.trim() || "2024-10-21",
        apiKey: apiKey || "",
        models: mergedModels,
        featureModelMap: {
          ...aiConfig.featureModelMap,
          "weekly-update-draft": quickModelKey,
          "portfolio-insights": quickModelKey,
          "cost-estimate": quickModelKey,
        },
        agents: aiConfig.agents,
      }

      const saveRes = await fetch("/api/admin/ai/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const saveData = await saveRes.json()
      if (!saveRes.ok) {
        throw new Error(saveData?.error || "Failed to save quick completion setup")
      }

      const testRes = await fetch("/api/admin/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelKey: quickModelKey }),
      })
      const testData = await testRes.json()
      if (!testRes.ok) {
        throw new Error(testData?.error || "Model connectivity test failed")
      }

      setQuickTestOk(true)
      setQuickTestMessage(String(testData.output || "Connected successfully"))
      toast.success("AI quick setup saved and tested")
      await loadAiConfig()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Quick setup failed"
      setQuickTestOk(false)
      setQuickTestMessage(message)
      toast.error(message)
    } finally {
      setQuickTesting(false)
    }
  }

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="size-4" /> AI Setup (Azure Foundry)
          </CardTitle>
          <CardDescription>
            Configure one or more Azure model profiles and map them to app features. For Foundry, paste Target URI, model name, and key auth details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
            <div>
              <h4 className="text-sm font-semibold">Quick Completion Setup</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Recommended for most users: paste completion endpoint URL, model name, and API key, then save and test.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2 space-y-1.5">
                <Label>Completion Endpoint URL</Label>
                <Input
                  value={quickEndpointUrl}
                  onChange={(e) => setQuickEndpointUrl(e.target.value)}
                  placeholder="https://projecteck-resource.openai.azure.com/openai/v1/chat/completions"
                  disabled={aiLoading || aiSaving || quickTesting}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Model Name</Label>
                <Input
                  value={quickModelName}
                  onChange={(e) => setQuickModelName(e.target.value)}
                  placeholder="gpt-5.4-mini-teck"
                  disabled={aiLoading || aiSaving || quickTesting}
                />
              </div>
              <div className="space-y-1.5">
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={quickApiKey}
                  onChange={(e) => setQuickApiKey(e.target.value)}
                  placeholder={aiConfig.hasApiKey ? "Leave blank to keep stored key" : "Enter API key"}
                  disabled={aiLoading || aiSaving || quickTesting}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleQuickCompletionSetup} disabled={quickTesting || aiLoading || aiSaving}>
                {quickTesting ? <Loader2 className="size-4 animate-spin" /> : <Bot className="size-4" />} Save & Test Completion Setup
              </Button>
              <Button variant="outline" onClick={() => setShowAdvancedAi((v) => !v)}>
                {showAdvancedAi ? "Hide Advanced" : "Show Advanced"}
              </Button>
            </div>

            {quickTestMessage && (
              <p className={cn(
                "text-xs rounded px-2 py-1 border",
                quickTestOk ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200",
              )}>
                {quickTestOk ? "Success:" : "Error:"} {quickTestMessage}
              </p>
            )}
          </div>

          {showAdvancedAi && (
            <div className="space-y-4 border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Endpoint</Label>
              <Input
                value={aiConfig.endpoint}
                onChange={(e) => setAiConfig((prev) => ({ ...prev, endpoint: e.target.value }))}
                placeholder="Optional fallback endpoint (legacy deployment format)"
                disabled={aiLoading || aiSaving}
              />
            </div>
            <div className="space-y-2">
              <Label>API Version</Label>
              <Input
                value={aiConfig.apiVersion}
                onChange={(e) => setAiConfig((prev) => ({ ...prev, apiVersion: e.target.value }))}
                placeholder="2024-10-21"
                disabled={aiLoading || aiSaving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>API Key</Label>
            <Input
              type="password"
              value={aiConfig.apiKey || ""}
              onChange={(e) => setAiConfig((prev) => ({ ...prev, apiKey: e.target.value }))}
              placeholder={aiConfig.hasApiKey ? `Stored (${aiConfig.apiKeyMasked}) - enter new value to rotate` : "Enter Azure Foundry API key"}
              disabled={aiLoading || aiSaving}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to keep the currently stored key. Models can also override key individually.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Model Deployments</Label>
              <Button size="sm" variant="outline" onClick={addModel} disabled={aiLoading || aiSaving}>
                Add Model
              </Button>
            </div>

            {aiConfig.models.length === 0 ? (
              <p className="text-xs text-muted-foreground border rounded-md p-3">
                No models configured yet. Add a model profile using Foundry Target URI or legacy deployment fields.
              </p>
            ) : (
              <div className="space-y-2">
                {aiConfig.models.map((model, idx) => (
                  <div key={`${model.key}-${idx}`} className="border rounded-md p-3 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Input
                        value={model.key}
                        onChange={(e) => updateModel(idx, { key: e.target.value })}
                        placeholder="model key (internal)"
                        disabled={aiLoading || aiSaving}
                      />
                      <Input
                        value={model.name}
                        onChange={(e) => updateModel(idx, { name: e.target.value })}
                        placeholder="display name"
                        disabled={aiLoading || aiSaving}
                      />
                      <Input
                        value={model.model || ""}
                        onChange={(e) => updateModel(idx, { model: e.target.value })}
                        placeholder="model name (example: gpt-5.4-mini-teck)"
                        disabled={aiLoading || aiSaving}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input
                        value={model.targetUri || ""}
                        onChange={(e) => updateModel(idx, { targetUri: e.target.value })}
                        placeholder="Foundry Target URI (recommended)"
                        disabled={aiLoading || aiSaving}
                      />
                      <Input
                        value={model.deployment || ""}
                        onChange={(e) => updateModel(idx, { deployment: e.target.value })}
                        placeholder="Legacy deployment name (optional fallback)"
                        disabled={aiLoading || aiSaving}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Select
                        value={model.apiStyle || "chat-completions"}
                        onValueChange={(value) => updateModel(idx, { apiStyle: value as "chat-completions" | "responses" })}
                        disabled={aiLoading || aiSaving}
                      >
                        <SelectTrigger><SelectValue placeholder="API type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chat-completions">Completion / Chat Completions</SelectItem>
                          <SelectItem value="responses">Responses</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={model.authMode || "authorization-bearer"}
                        onValueChange={(value) => updateModel(idx, { authMode: value as "api-key" | "authorization-bearer" })}
                        disabled={aiLoading || aiSaving}
                      >
                        <SelectTrigger><SelectValue placeholder="Auth mode" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="authorization-bearer">Key Auth (Bearer)</SelectItem>
                          <SelectItem value="api-key">Key Auth (api-key header)</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        type="password"
                        value={model.apiKey || ""}
                        onChange={(e) => updateModel(idx, { apiKey: e.target.value })}
                        placeholder={model.apiKeyMasked ? `Stored (${model.apiKeyMasked}) - enter to rotate` : "Optional model key override"}
                        disabled={aiLoading || aiSaving}
                      />
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => testModel(model.key)}
                        disabled={aiLoading || aiSaving || testingModelKey === model.key || !model.key}
                      >
                        {testingModelKey === model.key ? <Loader2 className="size-3.5 animate-spin" /> : "Test"}
                      </Button>
                      <Button
                        type="button"
                        variant={model.enabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateModel(idx, { enabled: !model.enabled })}
                        disabled={aiLoading || aiSaving}
                      >
                        {model.enabled ? "Enabled" : "Disabled"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => removeModel(idx)}
                        disabled={aiLoading || aiSaving}
                      >
                        Remove
                      </Button>
                    </div>
                    {modelTestResults[model.key] && (
                      <p className={cn(
                        "text-xs rounded px-2 py-1 border",
                        modelTestResults[model.key].ok
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200",
                      )}>
                        {modelTestResults[model.key].ok ? "Connected:" : "Error:"} {modelTestResults[model.key].message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Foundry recommended: API type = Completion / Chat Completions, Auth mode = Key Auth (Bearer), and paste the Target URI from your code sample.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Weekly Update Draft Model</Label>
              <Select
                value={aiConfig.featureModelMap["weekly-update-draft"] || "none"}
                onValueChange={(value) => setAiConfig((prev) => ({
                  ...prev,
                  featureModelMap: {
                    ...prev.featureModelMap,
                    "weekly-update-draft": value === "none" ? "" : value,
                  },
                }))}
                disabled={aiLoading || aiSaving}
              >
                <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Use fallback</SelectItem>
                  {aiConfig.models.map((m) => (
                    <SelectItem key={m.key} value={m.key}>{m.name || m.key}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Portfolio Insights Model</Label>
              <Select
                value={aiConfig.featureModelMap["portfolio-insights"] || "none"}
                onValueChange={(value) => setAiConfig((prev) => ({
                  ...prev,
                  featureModelMap: {
                    ...prev.featureModelMap,
                    "portfolio-insights": value === "none" ? "" : value,
                  },
                }))}
                disabled={aiLoading || aiSaving}
              >
                <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Use fallback</SelectItem>
                  {aiConfig.models.map((m) => (
                    <SelectItem key={m.key} value={m.key}>{m.name || m.key}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cost Estimate Model</Label>
              <Select
                value={aiConfig.featureModelMap["cost-estimate"] || "none"}
                onValueChange={(value) => setAiConfig((prev) => ({
                  ...prev,
                  featureModelMap: {
                    ...prev.featureModelMap,
                    "cost-estimate": value === "none" ? "" : value,
                  },
                }))}
                disabled={aiLoading || aiSaving}
              >
                <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Use fallback</SelectItem>
                  {aiConfig.models.map((m) => (
                    <SelectItem key={m.key} value={m.key}>{m.name || m.key}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Azure Agents (Optional)</Label>
              <Button size="sm" variant="outline" onClick={addAgent} disabled={aiLoading || aiSaving}>
                Add Agent
              </Button>
            </div>

            {aiConfig.agents.map((agent, idx) => (
              <div key={`${agent.key}-${idx}`} className="border rounded-md p-3 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <Input
                    value={agent.key}
                    onChange={(e) => updateAgent(idx, { key: e.target.value })}
                    placeholder="agent key"
                    disabled={aiLoading || aiSaving}
                  />
                  <Input
                    value={agent.name}
                    onChange={(e) => updateAgent(idx, { name: e.target.value })}
                    placeholder="agent name"
                    disabled={aiLoading || aiSaving}
                  />
                  <Input
                    value={agent.version || ""}
                    onChange={(e) => updateAgent(idx, { version: e.target.value })}
                    placeholder="agent version"
                    disabled={aiLoading || aiSaving}
                  />
                  <Input
                    value={agent.endpoint}
                    onChange={(e) => updateAgent(idx, { endpoint: e.target.value })}
                    placeholder="agent endpoint"
                    disabled={aiLoading || aiSaving}
                  />
                </div>
                <Input
                  type="password"
                  value={agent.apiKey || ""}
                  onChange={(e) => updateAgent(idx, { apiKey: e.target.value })}
                  placeholder={agent.apiKeyMasked ? `Stored (${agent.apiKeyMasked}) - enter new value to rotate` : "agent api key (optional)"}
                  disabled={aiLoading || aiSaving}
                />
                <Input
                  value={agent.notes || ""}
                  onChange={(e) => updateAgent(idx, { notes: e.target.value })}
                  placeholder="notes"
                  disabled={aiLoading || aiSaving}
                />
                <textarea
                  value={agent.codeSnippet || ""}
                  onChange={(e) => updateAgent(idx, { codeSnippet: e.target.value })}
                  placeholder="Paste Azure agent invocation/setup snippet (optional)"
                  rows={5}
                  className="w-full rounded-md border bg-background px-3 py-2 text-xs font-mono"
                  disabled={aiLoading || aiSaving}
                />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    onClick={() => removeAgent(idx)}
                    disabled={aiLoading || aiSaving}
                  >
                    Remove Agent
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 border rounded-md p-3 bg-muted/30">
            <div className="text-xs text-muted-foreground">
              <p>Saved: {aiConfig.updatedAt ? new Date(aiConfig.updatedAt).toLocaleString() : "Not saved yet"}</p>
              {aiConfig.envFallback?.endpoint && (
                <p className="mt-0.5">Fallback env deployment: {aiConfig.envFallback.deployment || "(none)"}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={loadAiConfig} disabled={aiLoading || aiSaving}>
                {aiLoading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Reload
              </Button>
              <Button onClick={saveAiConfig} disabled={aiSaving || aiLoading}>
                {aiSaving ? <Loader2 className="size-4 animate-spin" /> : <Bot className="size-4" />} Save AI Setup
              </Button>
            </div>
          </div>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}

// ══════════════════════════════════════════════
// SITEFOLIO TAB
// ══════════════════════════════════════════════

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}hr ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

interface SiteFolioSessionStatus {
  active: boolean
  memberId?: number
  enterpriseId?: number
  obtainedAt?: string
  expiresAt?: string
  expiresInDays?: number
}

interface SiteFolioProjectMapping {
  projectId: string
  storeNumber: string
  storeName: string
  sfProjectId: number
  syncMeta: {
    lastSyncAt: string
    lastSyncStatus: string
    syncedPages: string[]
  } | null
}

interface SiteFolioSyncStatus {
  projects: SiteFolioProjectMapping[]
  lastGlobalSync: string | null
}

interface SiteFolioSyncResult {
  totalFound: number
  synced: number
  skipped: number
  errors: { projectNumber: string; error: string }[]
}

function SiteFolioTab() {
  const [sessionStatus, setSessionStatus] = useState<SiteFolioSessionStatus | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState<SiteFolioSyncStatus | null>(null)
  const [syncLoading, setSyncLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<SiteFolioSyncResult | null>(null)
  const [syncingProjectId, setSyncingProjectId] = useState<string | null>(null)

  const loadSessionStatus = useCallback(async () => {
    setSessionLoading(true)
    try {
      const res = await fetch("/api/sitefolio/auth")
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to load session status")
      setSessionStatus(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load session status"
      toast.error(message)
      setSessionStatus(null)
    } finally {
      setSessionLoading(false)
    }
  }, [])

  const loadSyncStatus = useCallback(async () => {
    setSyncLoading(true)
    try {
      const res = await fetch("/api/sitefolio/sync/status")
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to load sync status")
      setSyncStatus(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load sync status"
      toast.error(message)
      setSyncStatus(null)
    } finally {
      setSyncLoading(false)
    }
  }, [])

  useEffect(() => { loadSessionStatus() }, [loadSessionStatus])
  useEffect(() => { loadSyncStatus() }, [loadSyncStatus])

  const handleSyncAll = async () => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch("/api/sitefolio/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Sync failed")
      setSyncResult(data)
      toast.success(`Sync complete: ${data.synced} synced, ${data.skipped} skipped`)
      loadSyncStatus()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sync failed"
      toast.error(message)
    } finally {
      setSyncing(false)
    }
  }

  const handleSyncProject = async (projectId: string) => {
    setSyncingProjectId(projectId)
    try {
      const res = await fetch("/api/sitefolio/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Project sync failed")
      toast.success("Project synced successfully")
      loadSyncStatus()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Project sync failed"
      toast.error(message)
    } finally {
      setSyncingProjectId(null)
    }
  }

  return (
    <div className="space-y-4 mt-4">
      {/* ── Connection Status ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="size-4" /> SiteFolio Connection
          </CardTitle>
          <CardDescription>
            Session status for the SiteFolio integration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessionLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : sessionStatus ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-24 shrink-0">Status</span>
                {sessionStatus.active ? (
                  <Badge variant="outline" className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700">
                    <CheckCircle2 className="size-3" /> Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 border-red-200 bg-red-50 text-red-700">
                    <XCircle className="size-3" /> Disconnected
                  </Badge>
                )}
              </div>
              {sessionStatus.memberId && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-24 shrink-0">Member ID</span>
                  <span className="text-sm font-medium">{sessionStatus.memberId}</span>
                </div>
              )}
              {sessionStatus.enterpriseId && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-24 shrink-0">Enterprise ID</span>
                  <span className="text-sm font-medium">{sessionStatus.enterpriseId}</span>
                </div>
              )}
              {sessionStatus.expiresAt && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-24 shrink-0">Expires</span>
                  <span className="text-sm font-medium">
                    {new Date(sessionStatus.expiresAt).toLocaleDateString()}
                    {sessionStatus.expiresInDays != null && (
                      <span className="text-muted-foreground ml-1">({sessionStatus.expiresInDays} days remaining)</span>
                    )}
                  </span>
                </div>
              )}
              {!sessionStatus.active && (
                <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-md p-2 mt-2">
                  <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
                  Run the SiteFolio refresh script locally to re-establish the session.
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Unable to retrieve session status.</p>
          )}
        </CardContent>
      </Card>

      {/* ── Sync Controls ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <RefreshCw className="size-4" /> Data Sync
          </CardTitle>
          <CardDescription>
            Trigger a full sync or view the last sync result.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Last Global Sync:</span>
            <span className="text-sm font-medium">
              {syncLoading ? (
                <Loader2 className="size-3.5 animate-spin inline" />
              ) : syncStatus?.lastGlobalSync ? (
                relativeTime(syncStatus.lastGlobalSync)
              ) : (
                "Never"
              )}
            </span>
          </div>

          <Button onClick={handleSyncAll} disabled={syncing || sessionLoading || !sessionStatus?.active}>
            {syncing ? (
              <><Loader2 className="size-4 animate-spin" /> Syncing...</>
            ) : (
              <><RefreshCw className="size-4" /> Sync All Projects</>
            )}
          </Button>

          {syncResult && (
            <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
              <p className="text-sm font-medium">Sync Results</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span>Found: <strong>{syncResult.totalFound}</strong></span>
                <span>Synced: <strong className="text-emerald-700">{syncResult.synced}</strong></span>
                <span>Skipped: <strong className="text-muted-foreground">{syncResult.skipped}</strong></span>
                <span>Errors: <strong className={(syncResult.errors?.length ?? 0) > 0 ? "text-red-700" : "text-muted-foreground"}>{syncResult.errors?.length ?? 0}</strong></span>
              </div>
              {(syncResult.errors?.length ?? 0) > 0 && (
                <div className="space-y-1 mt-2">
                  {syncResult.errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-red-700 bg-red-50 rounded-md p-2">
                      <XCircle className="size-3.5 shrink-0 mt-0.5" />
                      <span><strong>{err.projectNumber}:</strong> {err.error}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Project Mapping Table ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">
            Project Mapping {syncStatus ? `(${syncStatus.projects.length} linked)` : ""}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={loadSyncStatus} disabled={syncLoading}>
            <RefreshCw className={cn("size-3.5", syncLoading && "animate-spin")} /> Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {syncLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : !syncStatus || syncStatus.projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Globe className="size-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No projects linked to SiteFolio yet.</p>
            </div>
          ) : (
            <div className="divide-y">
              {/* Table Header */}
              <div className="grid grid-cols-[80px_80px_1fr_100px_90px_70px] gap-3 px-6 py-2 text-xs font-medium text-muted-foreground bg-muted/30">
                <span>SF Project</span>
                <span>Store #</span>
                <span>Store Name</span>
                <span>Last Synced</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              {/* Table Rows */}
              {syncStatus.projects.map((p) => (
                <div
                  key={p.projectId}
                  className="grid grid-cols-[80px_80px_1fr_100px_90px_70px] gap-3 px-6 py-3 items-center hover:bg-muted/30 transition-colors"
                >
                  <span className="text-sm font-mono">{p.sfProjectId}</span>
                  <span className="text-sm">{p.storeNumber}</span>
                  <span className="text-sm truncate">{p.storeName}</span>
                  <span className="text-xs text-muted-foreground">
                    {p.syncMeta?.lastSyncAt ? relativeTime(p.syncMeta.lastSyncAt) : "Never"}
                  </span>
                  <span>
                    {p.syncMeta?.lastSyncStatus === "success" ? (
                      <Badge variant="outline" className="gap-1 text-[10px] border-emerald-200 bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="size-2.5" /> Success
                      </Badge>
                    ) : p.syncMeta?.lastSyncStatus === "partial" ? (
                      <Badge variant="outline" className="gap-1 text-[10px] border-amber-200 bg-amber-50 text-amber-700">
                        <AlertTriangle className="size-2.5" /> Partial
                      </Badge>
                    ) : p.syncMeta?.lastSyncStatus === "error" ? (
                      <Badge variant="outline" className="gap-1 text-[10px] border-red-200 bg-red-50 text-red-700">
                        <XCircle className="size-2.5" /> Error
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">--</span>
                    )}
                  </span>
                  <span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleSyncProject(p.projectId)}
                      disabled={syncingProjectId === p.projectId || syncing}
                    >
                      {syncingProjectId === p.projectId ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <><RefreshCw className="size-3" /> Sync</>
                      )}
                    </Button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
