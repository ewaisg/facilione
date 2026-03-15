import { Settings } from "lucide-react"
export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground gap-3 p-6">
      <div className="size-16 rounded-2xl bg-muted flex items-center justify-center">
        <Settings className="size-8 opacity-30" />
      </div>
      <p className="text-lg font-semibold text-foreground">Settings</p>
      <p className="text-sm">Profile, notifications, display preferences — coming in Phase 6.</p>
    </div>
  )
}
