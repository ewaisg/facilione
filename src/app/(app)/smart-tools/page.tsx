import { Wrench } from "lucide-react"
export default function SmartToolsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground gap-3 p-6">
      <div className="size-16 rounded-2xl bg-muted flex items-center justify-center">
        <Wrench className="size-8 opacity-30" />
      </div>
      <p className="text-lg font-semibold text-foreground">Smart Tools</p>
      <p className="text-sm">Estimator, Bid Comparison, Meeting Builder, Pay App Reviewer, Close-Out Kit — coming in Phase 4.</p>
    </div>
  )
}
