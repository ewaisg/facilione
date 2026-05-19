"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Preferences {
  landingPage: string
  tableDensity: string
}

const STORAGE_KEY = "facilione-preferences"

const DEFAULT_PREFERENCES: Preferences = {
  landingPage: "/dashboard",
  tableDensity: "comfortable",
}

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return

    try {
      setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(stored) })
    } catch {
      setPreferences(DEFAULT_PREFERENCES)
    }
  }, [])

  const updatePreference = (key: keyof Preferences, value: string) => {
    const next = { ...preferences, [key]: value }
    setPreferences(next)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    toast.success("Preference saved")
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Preferences</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Personal app defaults for this browser.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">App Defaults</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Default landing page</Label>
            <Select
              value={preferences.landingPage}
              onValueChange={(value) => updatePreference("landingPage", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="/dashboard">Dashboard</SelectItem>
                <SelectItem value="/projects">Projects</SelectItem>
                <SelectItem value="/fe-copilot">FE Copilot</SelectItem>
                <SelectItem value="/smart-tools">Smart Tools</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Table density</Label>
            <Select
              value={preferences.tableDensity}
              onValueChange={(value) => updatePreference("tableDensity", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="comfortable">Comfortable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
