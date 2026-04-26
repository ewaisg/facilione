"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/firebase/auth-context"
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, LogOut, Lock, User, Mail, Shield, Building2, Monitor, Smartphone, Tablet, AlertTriangle } from "lucide-react"
import { getUserSessions, deleteSession } from "@/lib/firebase/sessions"
import type { UserSession } from "@/types"

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  cm: "Construction Manager",
  pm: "Project Manager",
}

export default function ProfilePage() {
  const { user, firebaseUser, signOut, signOutAllDevices, updateUserPassword } = useAuth()
  const router = useRouter()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [signingOutAll, setSigningOutAll] = useState(false)
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [removingSession, setRemovingSession] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const loadSessions = async () => {
      try {
        const userSessions = await getUserSessions(user.uid)
        setSessions(userSessions)
      } catch (err) {
        console.error("Failed to load sessions:", err)
        toast.error("Failed to load active sessions")
      } finally {
        setLoadingSessions(false)
      }
    }

    loadSessions()
  }, [user])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const currentSessionId = typeof window !== "undefined"
    ? sessionStorage.getItem("facilione-session-id")
    : null

  const initials = user.displayName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U"

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPassword || !confirmPassword || !currentPassword) {
      toast.error("Please fill in all password fields.")
      return
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.")
      return
    }

    if (!firebaseUser || !firebaseUser.email) {
      toast.error("Unable to verify current session. Please sign in again.")
      return
    }

    setChangingPassword(true)
    try {
      // Re-authenticate before changing password
      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword)
      await reauthenticateWithCredential(firebaseUser, credential)

      await updateUserPassword(newPassword)
      toast.success("Password updated successfully.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update password."
      if (message.includes("wrong-password") || message.includes("invalid-credential")) {
        toast.error("Current password is incorrect.")
      } else if (message.includes("weak-password")) {
        toast.error("Password is too weak. Please choose a stronger password.")
      } else {
        toast.error(message)
      }
    } finally {
      setChangingPassword(false)
    }
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      router.push("/login")
    } catch {
      toast.error("Failed to sign out. Please try again.")
      setSigningOut(false)
    }
  }

  const handleSignOutAll = async () => {
    if (!confirm("This will sign you out from ALL devices. Continue?")) {
      return
    }

    setSigningOutAll(true)
    try {
      await signOutAllDevices()
      router.push("/login")
      toast.success("Signed out from all devices")
    } catch (err) {
      console.error("Failed to sign out all devices:", err)
      toast.error("Failed to sign out from all devices. Please try again.")
      setSigningOutAll(false)
    }
  }

  const handleRemoveSession = async (sessionId: string) => {
    setRemovingSession(sessionId)
    try {
      await deleteSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      toast.success("Session removed")
    } catch (err) {
      console.error("Failed to remove session:", err)
      toast.error("Failed to remove session")
    } finally {
      setRemovingSession(null)
    }
  }

  const getDeviceIcon = (platform: string) => {
    switch (platform) {
      case "mobile":
        return Smartphone
      case "tablet":
        return Tablet
      default:
        return Monitor
    }
  }

  const formatLastActive = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 5) return "Active now"
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return "Yesterday"
    return `${diffDays} days ago`
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account settings and security.
        </p>
      </div>

      {/* Profile info card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Account Information</CardTitle>
          <CardDescription>Your personal details and role within FaciliOne.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={user.avatarUrl || ""} alt={user.displayName || "User"} />
              <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-foreground">{user.displayName}</p>
              <Badge variant="secondary">{ROLE_LABELS[user.role] || user.role}</Badge>
            </div>
          </div>

          <Separator />

          {/* Details grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground">
                <Mail className="size-3.5" />
                Email
              </Label>
              <p className="text-sm font-medium text-foreground">{user.email}</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground">
                <User className="size-3.5" />
                Display Name
              </Label>
              <p className="text-sm font-medium text-foreground">{user.displayName}</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground">
                <Shield className="size-3.5" />
                Role
              </Label>
              <p className="text-sm font-medium text-foreground">{ROLE_LABELS[user.role] || user.role}</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground">
                <Building2 className="size-3.5" />
                Organization
              </Label>
              <p className="text-sm font-medium text-foreground">{user.orgId}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change password card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Lock className="size-4" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password. You will need to enter your current password for verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                autoComplete="current-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
            </div>

            <Button type="submit" disabled={changingPassword}>
              {changingPassword && <Loader2 className="size-4 animate-spin" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Sessions card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Monitor className="size-4" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            Devices where you&apos;re currently signed in. Remove any sessions you don&apos;t recognize.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingSessions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="size-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No active sessions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const DeviceIcon = getDeviceIcon(session.deviceInfo.platform)
                const isCurrentSession = session.id === currentSessionId
                return (
                  <div
                    key={session.id}
                    className="flex items-start justify-between p-3 border rounded-lg bg-background"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <DeviceIcon className="size-5 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            {session.deviceInfo.browser} on {session.deviceInfo.os}
                          </p>
                          {isCurrentSession && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              This device
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatLastActive(session.lastActiveAt)}
                        </p>
                      </div>
                    </div>
                    {!isCurrentSession && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSession(session.id)}
                        disabled={removingSession === session.id}
                      >
                        {removingSession === session.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          "Remove"
                        )}
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {sessions.length > 1 && (
            <>
              <Separator />
              <Button
                variant="destructive"
                size="sm"
                onClick={handleSignOutAll}
                disabled={signingOutAll}
              >
                {signingOutAll && <Loader2 className="size-4 animate-spin" />}
                Sign Out All Devices
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Sign out current device card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Sign Out</CardTitle>
          <CardDescription>Sign out of your FaciliOne account on this device only.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
            Sign Out This Device
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
