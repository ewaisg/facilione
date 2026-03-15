import { BarChart3 } from "lucide-react"
export default function AnalyticsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground gap-3 p-6">
      <div className="size-16 rounded-2xl bg-muted flex items-center justify-center">
        <BarChart3 className="size-8 opacity-30" />
      </div>
      <p className="text-lg font-semibold text-foreground">Analytics</p>
      <p className="text-sm">Portfolio analytics and historical benchmarks — coming in Phase 5.</p>
    </div>
  )
}
