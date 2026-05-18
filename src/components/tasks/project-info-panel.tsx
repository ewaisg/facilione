"use client"

import { useState } from "react"
import { Plus, Trash2, Pin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DEFAULT_PROJECT_INFO_FIELDS } from "@/types/task"
import type { TaskProject, CustomFieldDefinition, ProjectInfoFieldType } from "@/types"

interface ProjectInfoPanelProps {
  project: TaskProject
  customFields: CustomFieldDefinition[]
  onUpdateProjectInfo: (info: Record<string, { label: string; type: ProjectInfoFieldType; value: string | number | boolean | null }>) => void
  onAddCustomField: (field: { label: string; type: ProjectInfoFieldType; value: string | number | boolean | null; sortOrder: number; pinned: boolean }) => void
  onUpdateCustomField: (fieldId: string, updates: Partial<CustomFieldDefinition>) => void
  onDeleteCustomField: (fieldId: string) => void
  onShowAddField: () => void
}

export function ProjectInfoPanel({
  project,
  customFields,
  onUpdateProjectInfo,
  onUpdateCustomField,
  onDeleteCustomField,
  onShowAddField,
}: ProjectInfoPanelProps) {
  const info = project.projectInfo || {}

  const handleFieldChange = (key: string, label: string, type: ProjectInfoFieldType, value: string | number | boolean | null) => {
    const updated = { ...info, [key]: { label, type, value } }
    onUpdateProjectInfo(updated)
  }

  return (
    <div className="w-72 border-l border-border bg-background flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex-shrink-0">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Project Info</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {/* Default fields */}
        {DEFAULT_PROJECT_INFO_FIELDS.map((field) => {
          const current = info[field.key]
          const value = current?.value ?? null

          return (
            <FieldRow
              key={field.key}
              label={field.label}
              type={field.type}
              value={value}
              onChange={(v) => handleFieldChange(field.key, field.label, field.type, v)}
            />
          )
        })}

        {/* Custom fields */}
        {customFields.length > 0 && (
          <>
            <div className="pt-3 pb-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                Custom Fields
              </span>
            </div>
            {customFields.map((field) => (
              <div key={field.id} className="group relative">
                <FieldRow
                  label={field.label}
                  type={field.type}
                  value={field.value}
                  onChange={(v) => onUpdateCustomField(field.id, { value: v })}
                />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => onUpdateCustomField(field.id, { pinned: !field.pinned })}
                    className={cn(
                      "p-0.5 rounded transition-colors",
                      field.pinned ? "text-blue-600" : "text-muted-foreground/50 hover:text-blue-600",
                    )}
                  >
                    <Pin className="size-2.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCustomField(field.id)}
                    className="p-0.5 text-muted-foreground/50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="size-2.5" />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="px-3 py-2 border-t border-border flex-shrink-0">
        <Button variant="ghost" size="sm" className="w-full text-xs gap-1.5" onClick={onShowAddField}>
          <Plus className="size-3" />
          Add Field
        </Button>
      </div>
    </div>
  )
}

interface FieldRowProps {
  label: string
  type: ProjectInfoFieldType
  value: string | number | boolean | null
  onChange: (value: string | number | boolean | null) => void
}

function FieldRow({ label, type, value, onChange }: FieldRowProps) {
  const [editing, setEditing] = useState(false)

  const renderValue = () => {
    switch (type) {
      case "date":
        return (
          <input
            type="date"
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value || null)}
            className="text-[11px] border-0 bg-transparent p-0 outline-none text-right w-full focus:ring-0"
          />
        )
      case "boolean":
        return (
          <button
            type="button"
            onClick={() => onChange(!value)}
            className="text-[11px] font-medium"
          >
            {value ? "Yes" : "No"}
          </button>
        )
      case "currency":
        return (
          <div className="flex items-center gap-0.5">
            <span className="text-[10px] text-muted-foreground">$</span>
            <input
              type="number"
              value={typeof value === "number" ? value : ""}
              onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
              onFocus={() => setEditing(true)}
              onBlur={() => setEditing(false)}
              className={cn(
                "text-[11px] border-0 bg-transparent p-0 outline-none text-right w-full",
                editing && "ring-1 ring-blue-400 rounded px-1",
              )}
              placeholder="—"
            />
          </div>
        )
      case "number":
        return (
          <input
            type="number"
            value={typeof value === "number" ? value : ""}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
            onFocus={() => setEditing(true)}
            onBlur={() => setEditing(false)}
            className={cn(
              "text-[11px] border-0 bg-transparent p-0 outline-none text-right w-full",
              editing && "ring-1 ring-blue-400 rounded px-1",
            )}
            placeholder="—"
          />
        )
      case "link":
        return (
          <input
            type="url"
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value || null)}
            onFocus={() => setEditing(true)}
            onBlur={() => setEditing(false)}
            className={cn(
              "text-[11px] border-0 bg-transparent p-0 outline-none text-right w-full text-blue-600 underline",
              editing && "ring-1 ring-blue-400 rounded px-1 no-underline text-foreground",
            )}
            placeholder="—"
          />
        )
      case "long-note":
      case "text":
      default:
        return (
          <input
            type="text"
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value || null)}
            onFocus={() => setEditing(true)}
            onBlur={() => setEditing(false)}
            className={cn(
              "text-[11px] border-0 bg-transparent p-0 outline-none text-right w-full",
              editing && "ring-1 ring-blue-400 rounded px-1",
            )}
            placeholder="—"
          />
        )
    }
  }

  return (
    <div className="flex items-center justify-between gap-2 py-1 px-1 rounded hover:bg-muted/50 min-h-[26px]">
      <span className="text-[11px] text-muted-foreground whitespace-nowrap flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 min-w-0 max-w-[120px]">
        {renderValue()}
      </div>
    </div>
  )
}
