import { Bot } from "lucide-react"
export default function CopilotPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground gap-3 p-6">
      <div className="size-16 rounded-2xl bg-muted flex items-center justify-center">
        <Bot className="size-8 opacity-30" />
      </div>
      <p className="text-lg font-semibold text-foreground">AI Copilot</p>
      <p className="text-sm">SOP-grounded AI assistant with document Q&A — coming in Phase 5.</p>
    </div>
  )
}
