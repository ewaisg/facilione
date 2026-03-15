import { Calendar } from "lucide-react"
export default function CalendarPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground gap-3 p-6">
      <div className="size-16 rounded-2xl bg-muted flex items-center justify-center">
        <Calendar className="size-8 opacity-30" />
      </div>
      <p className="text-lg font-semibold text-foreground">Calendar</p>
      <p className="text-sm">Portfolio-wide milestones, gates, SWPPP inspections, and SPG windows — coming in Phase 2.</p>
    </div>
  )
}
