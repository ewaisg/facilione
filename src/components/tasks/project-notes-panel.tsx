"use client"

import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ProjectNotesPanelProps {
  notes: string
  isHistorical: boolean
  onUpdateNotes: (notes: string) => void
}

export function ProjectNotesPanel({ notes, isHistorical, onUpdateNotes }: ProjectNotesPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const localRef = useRef(notes)

  useEffect(() => {
    localRef.current = notes
    if (textareaRef.current && textareaRef.current.value !== notes) {
      textareaRef.current.value = notes
    }
  }, [notes])

  const handleBlur = () => {
    const val = textareaRef.current?.value ?? ""
    if (val !== localRef.current) {
      onUpdateNotes(val)
    }
  }

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
          Project Notes
        </span>
      </div>
      <textarea
        ref={textareaRef}
        defaultValue={notes}
        onBlur={handleBlur}
        disabled={isHistorical}
        placeholder={isHistorical ? "No notes for this date" : "Add project notes..."}
        className={cn(
          "w-full min-h-[100px] rounded-md border border-border bg-yellow-50/50 px-3 py-2 text-xs",
          "outline-none resize-y transition-colors",
          "focus:ring-2 focus:ring-blue-400 focus:border-blue-400",
          isHistorical && "opacity-70 cursor-not-allowed bg-muted/30",
        )}
      />
    </div>
  )
}
