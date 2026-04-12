"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, GitBranch, ClipboardList, ArrowRight } from "lucide-react"

const RESOURCES = [
  {
    title: "SOP Quick Reference",
    description: "Phase-by-phase steps with owner, system, baseline weeks, gates, and tips for all 6 project types plus 4 reference appendices.",
    href: "/resources/sops",
    icon: FileText,
    status: "live" as const,
  },
  {
    title: "Project Flowcharts",
    description: "End-to-end process flowcharts for all 5 project types. Pan, zoom, and navigate by phase with color-coded node types.",
    href: "/resources/flowcharts",
    icon: GitBranch,
    status: "live" as const,
  },
  {
    title: "Forms & Templates",
    description: "Meeting agendas, checklists, plan request forms, and other standardized templates — coming soon.",
    href: "/resources",
    icon: ClipboardList,
    status: "coming-soon" as const,
  },
]

export default function ResourcesPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Resources & Knowledge Base</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          SOPs, flowcharts, forms, and reference guides.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {RESOURCES.map((r) => {
          const Icon = r.icon
          const isLive = r.status === "live"

          const content = (
            <Card className={`h-full transition-all ${isLive ? "hover:shadow-md hover:border-primary/30 cursor-pointer group" : "opacity-50"}`}>
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="size-5 text-primary" />
                  </div>
                  {isLive ? (
                    <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      Coming Soon
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-sm mb-1">{r.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">{r.description}</p>
              </CardContent>
            </Card>
          )

          return isLive ? (
            <Link key={r.title} href={r.href}>
              {content}
            </Link>
          ) : (
            <div key={r.title}>{content}</div>
          )
        })}
      </div>
    </div>
  )
}
