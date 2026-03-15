import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FaciliOne — Sign In",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      {children}
    </div>
  )
}
