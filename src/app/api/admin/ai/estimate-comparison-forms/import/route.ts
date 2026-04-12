import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { requireRoles } from "@/lib/firebase-admin/request-auth"
import { parseComparisonSnapshotWorkbook } from "@/lib/ai/comparison-snapshot-parser"

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRoles(req, ["admin", "cm", "pm"])
    if (!auth.ok) return auth.response

    const form = await req.formData()
    const file = form.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 })
    }

    const lowerName = file.name.toLowerCase()
    if (!(lowerName.endsWith(".xlsx") || lowerName.endsWith(".xlsm") || lowerName.endsWith(".xls"))) {
      return NextResponse.json({ error: "Unsupported file type. Upload .xlsx/.xlsm/.xls" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const parsed = parseComparisonSnapshotWorkbook(file.name, bytes)

    const now = new Date().toISOString()

    // First-class storage for the comparison form itself.
    const formRef = adminDb.collection("estimateComparisonForms").doc()
    await formRef.set({
      ...parsed,
      sourceFileName: file.name,
      sourceFileSize: file.size,
      uploadedBy: auth.uid,
      uploadedAt: now,
      updatedAt: now,
    })

    // Normalized snapshot mirror for candidate retrieval.
    const snapRef = adminDb.collection("comparisonSnapshots").doc()
    await snapRef.set({
      ...parsed,
      sourceType: "estimate-comparison-form",
      sourceFormId: formRef.id,
      sourceFileName: file.name,
      sourceFileSize: file.size,
      uploadedBy: auth.uid,
      uploadedAt: now,
      updatedAt: now,
    })

    return NextResponse.json({
      success: true,
      formId: formRef.id,
      snapshotId: snapRef.id,
      form: {
        id: formRef.id,
        title: parsed.title,
        templateType: parsed.templateType,
        projectType: parsed.projectType,
        estimatedProjectTotal: parsed.estimatedProjectTotal,
      },
    })
  } catch (error) {
    console.error("estimate comparison form import error:", error)
    const message = error instanceof Error ? error.message : "Failed to import estimate comparison form"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
