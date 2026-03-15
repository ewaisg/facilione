import { Users } from "lucide-react"
export default function TeamPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground gap-3 p-6">
      <div className="size-16 rounded-2xl bg-muted flex items-center justify-center">
        <Users className="size-8 opacity-30" />
      </div>
      <p className="text-lg font-semibold text-foreground">Team</p>
      <p className="text-sm">Team directory, project assignments, and workload view — coming in Phase 6.</p>
    </div>
  )
}
