import { ShieldCheck } from "lucide-react"
export default function AdminPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground gap-3 p-6">
      <div className="size-16 rounded-2xl bg-muted flex items-center justify-center">
        <ShieldCheck className="size-8 opacity-30" />
      </div>
      <p className="text-lg font-semibold text-foreground">Admin</p>
      <p className="text-sm">User management, branding, nav builder, module config — coming in Phase 6.</p>
      <p className="text-xs mt-1">User creation is available via the API at <code className="bg-muted px-1 py-0.5 rounded">/api/admin/users</code></p>
    </div>
  )
}
