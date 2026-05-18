"use client"

import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HistoryNavigatorProps {
  currentDate: string | null
  availableDates: string[]
  onNavigate: (date: string | null) => void
}

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-")
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10)
}

export function HistoryNavigator({ currentDate, availableDates, onNavigate }: HistoryNavigatorProps) {
  const today = getToday()
  const isLive = currentDate === null
  const sortedDates = [...availableDates].sort()

  const currentIdx = currentDate ? sortedDates.indexOf(currentDate) : -1
  const canGoBack = isLive ? sortedDates.length > 0 : currentIdx > 0
  const canGoForward = !isLive && currentDate !== null

  const handleBack = () => {
    if (isLive) {
      const lastDate = sortedDates[sortedDates.length - 1]
      if (lastDate && lastDate !== today) {
        onNavigate(lastDate)
      } else if (sortedDates.length > 1) {
        onNavigate(sortedDates[sortedDates.length - 2])
      }
    } else if (currentIdx > 0) {
      onNavigate(sortedDates[currentIdx - 1])
    }
  }

  const handleForward = () => {
    if (!isLive && currentDate !== null) {
      if (currentIdx < sortedDates.length - 1) {
        const nextDate = sortedDates[currentIdx + 1]
        if (nextDate === today) {
          onNavigate(null)
        } else {
          onNavigate(nextDate)
        }
      } else {
        onNavigate(null)
      }
    }
  }

  if (availableDates.length === 0 && isLive) return null

  return (
    <div className="mt-3 flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="size-7 p-0"
        onClick={handleBack}
        disabled={!canGoBack}
      >
        <ChevronLeft className="size-4" />
      </Button>

      <span
        className={cn(
          "text-[11px] font-medium min-w-[100px] text-center",
          isLive ? "text-foreground" : "text-amber-700",
        )}
      >
        {isLive ? "Live" : formatDisplayDate(currentDate!)}
      </span>

      <Button
        variant="ghost"
        size="sm"
        className="size-7 p-0"
        onClick={handleForward}
        disabled={!canGoForward}
      >
        <ChevronRight className="size-4" />
      </Button>

      {!isLive && (
        <Button
          variant="outline"
          size="sm"
          className="text-[11px] h-6 px-2 gap-1"
          onClick={() => onNavigate(null)}
        >
          <RotateCcw className="size-3" />
          Return to Live
        </Button>
      )}
    </div>
  )
}
