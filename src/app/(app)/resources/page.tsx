import { BookOpen } from "lucide-react"
export default function ResourcesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground gap-3 p-6">
      <div className="size-16 rounded-2xl bg-muted flex items-center justify-center">
        <BookOpen className="size-8 opacity-30" />
      </div>
      <p className="text-lg font-semibold text-foreground">Resources & Knowledge Base</p>
      <p className="text-sm">SOPs, schedule templates, forms, estimating guides, Oracle reference — coming in Phase 4.</p>
    </div>
  )
}
