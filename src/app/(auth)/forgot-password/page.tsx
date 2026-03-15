"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/firebase/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { sendResetEmail } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await sendResetEmail(email)
      setSent(true)
    } catch {
      toast.error("Could not send reset email. Check the address and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center justify-center size-12 rounded-xl bg-[#1b3d6e] mb-4 shadow-lg">
          <Building2 className="size-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">FaciliOne</h1>
      </div>

      <Card className="shadow-xl border-0 ring-1 ring-black/5">
        {sent ? (
          <CardContent className="pt-6 pb-6 text-center space-y-4">
            <CheckCircle2 className="size-10 text-emerald-500 mx-auto" />
            <div>
              <p className="font-semibold">Check your inbox</p>
              <p className="text-sm text-muted-foreground mt-1">
                We sent a password reset link to <strong>{email}</strong>
              </p>
            </div>
            <Link href="/login">
              <Button variant="outline" className="w-full mt-2">
                <ArrowLeft className="size-4" /> Back to sign in
              </Button>
            </Link>
          </CardContent>
        ) : (
          <>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">Reset password</CardTitle>
              <CardDescription>Enter your email and we&apos;ll send a reset link</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    required
                    disabled={loading}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 pt-2">
                <Button
                  type="submit"
                  className="w-full bg-[#1b3d6e] hover:bg-[#162f55] h-10"
                  disabled={loading || !email}
                >
                  {loading ? <><Loader2 className="size-4 animate-spin" /> Sending…</> : "Send reset link"}
                </Button>
                <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors text-center w-full flex items-center justify-center gap-1">
                  <ArrowLeft className="size-3" /> Back to sign in
                </Link>
              </CardFooter>
            </form>
          </>
        )}
      </Card>
    </div>
  )
}
