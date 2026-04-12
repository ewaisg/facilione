import { type NextRequest, NextResponse } from "next/server"
import { requireAppUser } from "@/lib/firebase-admin/request-auth"

// Stub: AI Minutes from Images (OCR)
// Requires Azure Computer Vision or similar OCR integration — not yet configured.
// When ready, this route will:
// 1. Accept an image file or pre-extracted OCR text
// 2. Extract text from image (via Azure Computer Vision)
// 3. Forward the extracted text to /api/ai/forms/generate-minutes for structuring

interface ImageMinutesRequest {
  extractedText?: string
  templateType: string
  projectData: {
    storeNumber?: string
    storeName?: string
    projectType?: string
    currentPhase?: string
  }
  agendaItems: string[]
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAppUser(req)
    if (!auth.ok) return auth.response

    const body = (await req.json()) as ImageMinutesRequest

    // If pre-extracted text is provided, forward to generate-minutes
    if (body.extractedText) {
      const generateRes = await fetch(new URL("/api/ai/forms/generate-minutes", req.url), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: req.headers.get("cookie") || "",
        },
        body: JSON.stringify({
          rawNotes: body.extractedText,
          templateType: body.templateType,
          projectData: body.projectData,
          agendaItems: body.agendaItems,
        }),
      })

      const result = await generateRes.json()
      return NextResponse.json(result, { status: generateRes.status })
    }

    return NextResponse.json(
      {
        error: "Image OCR not yet configured",
        message:
          "This feature requires Azure Computer Vision or similar OCR integration. " +
          "Provide extractedText field to process pre-extracted image text.",
      },
      { status: 501 },
    )
  } catch (error) {
    console.error("image-minutes API error:", error)
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
  }
}
