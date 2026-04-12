import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

type ParserType = "overview" | "schedule" | "files-reports"

interface ApplyPayload {
  projectId: string
  parserType: ParserType
  summary: Record<string, unknown>
  extracted?: Record<string, unknown>
  applyOptions?: {
    updateProjectFromOverview?: boolean
    writeWeeklyComment?: boolean
    weeklyCommentText?: string
  }
  source?: {
    fileName?: string
    size?: number
    storagePath?: string
    downloadUrl?: string
  }
}

function getWeekStartISO(date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString().slice(0, 10)
}

function parseAddress(address: string): {
  storeAddress?: string
  storeCity?: string
  storeState?: string
} {
  const lines = (address || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length === 0) return {}

  const out: { storeAddress?: string; storeCity?: string; storeState?: string } = {
    storeAddress: lines[0],
  }

  if (lines.length > 1) {
    const cityState = lines[1]
    const m = cityState.match(/^(.+?),\s*([A-Z]{2})\b/i)
    if (m) {
      out.storeCity = m[1].trim()
      out.storeState = m[2].toUpperCase()
    }
  }

  return out
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ApplyPayload

    if (!body.projectId || !body.parserType) {
      return NextResponse.json({ error: "projectId and parserType are required" }, { status: 400 })
    }

    const projectRef = adminDb.collection("projects").doc(body.projectId)
    const projectSnap = await projectRef.get()
    if (!projectSnap.exists) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const now = new Date().toISOString()

    const importRef = projectRef.collection("imports").doc()
    await importRef.set({
      parserType: body.parserType,
      summary: body.summary || {},
      extracted: body.extracted || {},
      source: body.source || {},
      createdAt: now,
      updatedAt: now,
      createdBy: "admin",
    })

    const updates: Record<string, unknown> = {
      updatedAt: now,
    }

    if (body.applyOptions?.updateProjectFromOverview && body.parserType === "overview") {
      const extractedProject = (body.extracted?.project || {}) as Record<string, unknown>
      const address = typeof extractedProject.address === "string" ? extractedProject.address : ""
      const parsedAddress = parseAddress(address)

      if (typeof extractedProject.status === "string" && extractedProject.status.trim()) {
        updates.status = extractedProject.status.trim().toLowerCase().replace(/\s+/g, "-")
      }

      if (typeof extractedProject.description === "string") {
        updates.notes = extractedProject.description
      }

      if (parsedAddress.storeAddress) updates.storeAddress = parsedAddress.storeAddress
      if (parsedAddress.storeCity) updates.storeCity = parsedAddress.storeCity
      if (parsedAddress.storeState) updates.storeState = parsedAddress.storeState
    }

    await projectRef.update(updates)

    if (body.applyOptions?.writeWeeklyComment && body.applyOptions.weeklyCommentText) {
      const weekStart = getWeekStartISO()
      const weeklyId = `${weekStart}_admin-import`
      await projectRef.collection("weeklyUpdates").doc(weeklyId).set(
        {
          projectId: body.projectId,
          weekStart,
          comment: body.applyOptions.weeklyCommentText,
          createdBy: "admin-import",
          createdByName: "Admin Import",
          createdAt: now,
          updatedAt: now,
          sourceImportId: importRef.id,
        },
        { merge: true },
      )
    }

    return NextResponse.json({
      success: true,
      projectId: body.projectId,
      importId: importRef.id,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to apply parsing payload"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
