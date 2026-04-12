import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FaciliOne — Sign In",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 dark:from-background dark:via-background dark:to-primary/10 p-4">
      {children}
    </div>
  )
}
