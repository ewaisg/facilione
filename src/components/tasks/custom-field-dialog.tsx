"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ProjectInfoFieldType } from "@/types"

const FIELD_TYPE_OPTIONS: Array<{ value: ProjectInfoFieldType; label: string }> = [
  { value: "text", label: "Text" },
  { value: "long-note", label: "Long Note" },
  { value: "date", label: "Date" },
  { value: "number", label: "Number" },
  { value: "currency", label: "Currency" },
  { value: "boolean", label: "Yes/No" },
  { value: "link", label: "Link" },
]

interface CustomFieldDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (field: { label: string; type: ProjectInfoFieldType; value: null; sortOrder: number; pinned: boolean }) => void
  nextSortOrder: number
}

export function CustomFieldDialog({ open, onOpenChange, onSave, nextSortOrder }: CustomFieldDialogProps) {
  const [label, setLabel] = useState("")
  const [type, setType] = useState<ProjectInfoFieldType>("text")

  const handleSave = () => {
    if (!label.trim()) return
    onSave({
      label: label.trim(),
      type,
      value: null,
      sortOrder: nextSortOrder,
      pinned: false,
    })
    setLabel("")
    setType("text")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Custom Field</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Field Name</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Vendor Contact"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Field Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as ProjectInfoFieldType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!label.trim()}>
              Add Field
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
