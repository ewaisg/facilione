"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { FLOWCHARTS, FLOWCHART_KEYS, LEGEND_ITEMS } from "@/constants/flowchart-data"
import { cn } from "@/lib/utils"
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function FlowchartsPage() {
  const [activeTab, setActiveTab] = useState<string>("ns")
  const [scale, setScale] = useState(0.55)
  const [panX, setPanX] = useState(20)
  const [panY, setPanY] = useState(20)
  const [isPanning, setIsPanning] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [legendOpen, setLegendOpen] = useState(false)
  const [rendered, setRendered] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const canvasRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  const chart = FLOWCHARTS[activeTab]

  // ── Mermaid initialization and rendering ──
  useEffect(() => {
    let cancelled = false

    async function initMermaid() {
      const mermaid = (await import("mermaid")).default
      mermaid.initialize({
        startOnLoad: false,
        theme: "default",
        themeVariables: {
          primaryColor: "#1e4e8c",
          primaryTextColor: "#fff",
          primaryBorderColor: "#1a3a6b",
          lineColor: "#94a3b8",
          secondaryColor: "#c87010",
          tertiaryColor: "#155a30",
          background: "#f5f6f8",
          mainBkg: "#1e4e8c",
          nodeBorder: "#1a3a6b",
          clusterBkg: "#f0f2f5",
          clusterBorder: "#dfe2e8",
          titleColor: "#5a6070",
          edgeLabelBackground: "#f5f6f8",
          fontSize: "13px",
        },
        flowchart: {
          htmlLabels: true,
          curve: "basis",
          padding: 16,
          nodeSpacing: 30,
          rankSpacing: 50,
        },
      })

      if (!cancelled) {
        await renderChart(activeTab, mermaid)
        setLoading(false)

        // Pre-render other charts in background
        for (const key of FLOWCHART_KEYS) {
          if (key !== activeTab && !cancelled) {
            setTimeout(() => renderChart(key, mermaid), 300)
          }
        }
      }
    }

    initMermaid()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function renderChart(key: string, mermaid: typeof import("mermaid").default) {
    if (rendered.has(key)) return
    const container = document.getElementById(`chart-${key}`)
    if (!container) return

    try {
      const id = `mermaid-${key}-${Date.now()}`
      const { svg } = await mermaid.render(id, FLOWCHARTS[key].code)
      container.innerHTML = svg
      setRendered((prev) => new Set(prev).add(key))
    } catch (e) {
      container.innerHTML = `<div class="text-red-500 p-6">Error rendering ${FLOWCHARTS[key].title}: ${e instanceof Error ? e.message : "Unknown error"}</div>`
    }
  }

  // ── Pan & Zoom ──
  const zoomIn = () => setScale((s) => Math.min(s * 1.2, 3))
  const zoomOut = () => setScale((s) => Math.max(s / 1.2, 0.1))
  const resetView = () => { setScale(0.55); setPanX(20); setPanY(20) }

  const fitToScreen = useCallback(() => {
    const wrap = canvasRef.current
    const activeSvg = document.querySelector(`#chart-${activeTab} svg`) as SVGElement | null
    if (!wrap || !activeSvg) return

    const svgRect = activeSvg.getBoundingClientRect()
    const wrapRect = wrap.getBoundingClientRect()
    const scaleX = (wrapRect.width - 60) / (svgRect.width / scale)
    const scaleY = (wrapRect.height - 60) / (svgRect.height / scale)
    setScale(Math.min(scaleX, scaleY, 1.5))
    setPanX(20)
    setPanY(20)
  }, [activeTab, scale])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsPanning(true)
    setStartPos({ x: e.clientX - panX, y: e.clientY - panY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return
    setPanX(e.clientX - startPos.x)
    setPanY(e.clientY - startPos.y)
  }

  const handleMouseUp = () => setIsPanning(false)

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale((s) => Math.max(0.1, Math.min(3, s * delta)))
  }

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "+" || e.key === "=") zoomIn()
      if (e.key === "-") zoomOut()
      if (e.key === "0") resetView()
      if (e.key === "f" || e.key === "F") fitToScreen()
      if (e.key === "l" || e.key === "L") setLegendOpen((o) => !o)
      const tabKeys: Record<string, string> = { "1": "ns", "2": "er", "3": "wiw", "4": "fc", "5": "mc" }
      if (tabKeys[e.key]) setActiveTab(tabKeys[e.key])
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [fitToScreen])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab Bar */}
      <div className="flex items-center gap-0.5 px-4 border-b bg-background flex-shrink-0 overflow-x-auto">
        {FLOWCHART_KEYS.map((key) => {
          const fc = FLOWCHARTS[key]
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              {fc.title}
              <Badge variant="secondary" className="ml-2 text-[10px] font-mono px-1.5 py-0 h-4">
                {fc.baseline}
              </Badge>
            </button>
          )
        })}
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background flex-shrink-0">
        <div className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{chart.title}</span>
          {" "}&middot; Baseline: {chart.baseline} &middot; {chart.phases} Phases
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon-sm" onClick={zoomOut} title="Zoom Out">
            <ZoomOut className="size-3.5" />
          </Button>
          <span className="text-xs font-mono text-muted-foreground min-w-[42px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="outline" size="icon-sm" onClick={zoomIn} title="Zoom In">
            <ZoomIn className="size-3.5" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={resetView} title="Reset View">
            <RotateCcw className="size-3.5" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={fitToScreen} title="Fit to Screen">
            <Maximize2 className="size-3.5" />
          </Button>
          <Button
            variant={legendOpen ? "default" : "outline"}
            size="sm"
            onClick={() => setLegendOpen(!legendOpen)}
            className="ml-2 text-xs gap-1"
          >
            <Info className="size-3" /> Legend
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className={cn("flex-1 overflow-hidden relative", isPanning ? "cursor-grabbing" : "cursor-grab")}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          ref={innerRef}
          className="absolute origin-top-left p-10 min-w-full min-h-full"
          style={{ transform: `translate(${panX}px, ${panY}px) scale(${scale})` }}
        >
          {loading && (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm gap-2">
              <div className="size-5 border-2 border-border border-t-primary rounded-full animate-spin" />
              Rendering flowcharts...
            </div>
          )}

          {FLOWCHART_KEYS.map((key) => (
            <div
              key={key}
              id={`chart-${key}`}
              className={cn(activeTab === key ? "block" : "hidden")}
            />
          ))}
        </div>

        {/* Legend Panel */}
        {legendOpen && (
          <div className="absolute top-3 right-3 bg-card border rounded-lg p-4 shadow-lg z-50 min-w-[200px]">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Node Types
            </div>
            <div className="space-y-2">
              {LEGEND_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <div
                    className="size-4 rounded flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
