"use client"

import { useState } from "react"
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
import { Loader2, LogOut, Lock, User, Mail, Shield, Building2 } from "lucide-react"

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  cm: "Construction Manager",
  pm: "Project Manager",
}

export default function ProfilePage() {
  const { user, firebaseUser, signOut, updateUserPassword } = useAuth()
  const router = useRouter()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

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

      {/* Sign out card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Session</CardTitle>
          <CardDescription>Sign out of your FaciliOne account on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
