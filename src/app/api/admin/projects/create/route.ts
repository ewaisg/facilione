import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { requireRoles } from "@/lib/firebase-admin/request-auth"

/**
 * POST /api/admin/projects/create
 * Quick-create a project with minimal fields.
 * Optionally seeds phases if grandOpeningDate and projectType are provided.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await requireRoles(req, ["admin", "cm", "pm"])
    if (!auth.ok) return auth.response

    const body = await req.json()
    const {
      storeNumber, storeName, storeCity, storeState, projectType,
      status, healthStatus, grandOpeningDate, totalBudget, notes,
      pmUserId, oracleParentProject, oracleProjectNumber,
    } = body

    if (!storeNumber || !storeName || !projectType) {
      return NextResponse.json(
        { error: "storeNumber, storeName, and projectType are required" },
        { status: 400 },
      )
    }

    const now = new Date().toISOString()
    const projectRef = adminDb.collection("projects").doc()
    const userSnap = await adminDb.collection("users").doc(auth.uid).get()
    const creatorOrgId = String(userSnap.data()?.orgId || "default").trim() || "default"
    const normalizedPmUserId = String(pmUserId || "").trim() || auth.uid

    const projectData = {
      storeNumber,
      storeName,
      storeAddress: body.storeAddress || "",
      storeCity: storeCity || "",
      storeState: storeState || "CO",
      projectType,
      status: status || "planning",
      healthStatus: healthStatus || "green",
      grandOpeningDate: grandOpeningDate || null,
      constructionStartDate: null,
      pmUserId: normalizedPmUserId,
      cmUserId: null,
      orgId: creatorOrgId,
      oracleParentProject: oracleParentProject || "",
      oracleProjectNumber: oracleProjectNumber || null,
      currentPhaseIndex: 0,
      totalBudget: totalBudget ? Number(totalBudget) : 0,
      committedCost: 0,
      actualCost: 0,
      forecastCost: 0,
      notes: notes || "",
      tags: [],
      createdAt: now,
      updatedAt: now,
    }

    await projectRef.set(projectData)

    return NextResponse.json({
      success: true,
      id: projectRef.id,
      storeNumber,
      storeName,
      projectType,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create project"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
