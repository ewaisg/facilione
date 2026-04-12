"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Calculator, ArrowRight, ScaleIcon } from "lucide-react"

const TOOLS = [
  { id: "estimator", title: "Estimator", description: "Build project estimates with dynamic sections, contingency calc, CSV/XLSX import, and formatted Excel export.", href: "/smart-tools/estimator", icon: Calculator, status: "live" as const },
  { id: "bid-comparison", title: "Bid Comparison", description: "Side-by-side GC Trade Proposal comparison with delta analysis.", href: "/smart-tools", icon: ScaleIcon, status: "phase-4" as const },
]

export default function SmartToolsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Smart Tools</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Automated structured tools for every PM task. Click any live tool to open.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {TOOLS.map((tool) => {
          const Icon = tool.icon
          const isLive = tool.status === "live"

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
                      {tool.status.replace("phase-", "Phase ")}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-sm mb-1">{tool.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">{tool.description}</p>
              </CardContent>
            </Card>
          )

          return isLive ? (
            <Link key={tool.id} href={tool.href}>{content}</Link>
          ) : (
            <div key={tool.id}>{content}</div>
          )
        })}
      </div>
    </div>
  )
}
