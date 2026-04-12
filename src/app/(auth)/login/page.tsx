"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/firebase/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn, user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get("from") || "/dashboard"

  // Redirect already-authenticated users away from login
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(from)
    }
  }, [authLoading, user, router, from])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    try {
      await signIn(email, password)
      // Don't manually navigate - let the useEffect handle it
      // after auth state is fully updated and cookie is set
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign in failed"
      if (msg.includes("invalid-credential") || msg.includes("wrong-password") || msg.includes("user-not-found")) {
        toast.error("Invalid email or password")
      } else {
        toast.error("Sign in failed. Please try again.")
      }
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center justify-center size-12 rounded-xl bg-primary mb-4 shadow-lg">
          <Building2 className="size-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">FaciliOne</h1>
        <p className="text-sm text-muted-foreground mt-1">Facilities Engineering PM Platform</p>
      </div>

      <Card className="shadow-xl border-0 ring-1 ring-black/5">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
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
                autoComplete="email"
                autoFocus
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button
              type="submit"
              className="w-full h-10"
              disabled={loading || !email || !password}
            >
              {loading ? (
                <><Loader2 className="size-4 animate-spin" /> Signing in…</>
              ) : (
                "Sign in"
              )}
            </Button>

            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-primary transition-colors text-center w-full"
            >
              Forgot your password?
            </Link>
          </CardFooter>
        </form>
      </Card>

      <p className="text-center text-xs text-muted-foreground mt-6">
        Access is by invitation only. Contact your administrator to get an account.
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
