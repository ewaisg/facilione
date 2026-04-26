/**
 * Next Steps List - Numbered list with inline editing
 */

"use client"

import { X } from "lucide-react"
import type { NextStep } from "@/types"

interface NextStepsListProps {
  steps: NextStep[]
  onUpdateStep: (stepId: string, text: string) => void
  onDeleteStep: (stepId: string) => void
  onAddStep: () => void
}

export function NextStepsList({
  steps,
  onUpdateStep,
  onDeleteStep,
  onAddStep,
}: NextStepsListProps) {
  return (
    <div className="mt-6">
      <h3 className="text-xs font-bold text-navy uppercase tracking-wide mb-3">
        Upcoming Next Steps
      </h3>

      <div className="space-y-2">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex gap-2 items-start">
            {/* Step Number */}
            <div className="w-6 h-6 bg-navy text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
              {idx + 1}
            </div>

            {/* Step Text */}
            <div
              contentEditable
              suppressContentEditableWarning
              className="flex-1 bg-white border border-border rounded px-3 py-2 text-sm min-h-[32px] outline-none focus:ring-2 focus:ring-blue-400"
              onBlur={(e) => {
                const newText = e.currentTarget.textContent?.trim() || ""
                if (newText && newText !== step.text) {
                  onUpdateStep(step.id, newText)
                }
              }}
              dangerouslySetInnerHTML={{ __html: step.text }}
            />

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => onDeleteStep(step.id)}
              className="text-gray-300 hover:text-red-600 transition-colors flex-shrink-0 p-1"
              title="Remove step"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Step Button */}
      <button
        type="button"
        onClick={onAddStep}
        className="mt-3 border border-dashed border-gray-300 rounded px-4 py-2 text-xs text-gray-400 hover:text-navy hover:border-navy transition-colors"
      >
        + Add next step
      </button>
    </div>
  )
}
