import { type NextRequest, NextResponse } from "next/server"
import { requireAppUser } from "@/lib/firebase-admin/request-auth"

// Stub: AI Minutes from Audio Transcription
// Requires Azure Speech Services or Whisper API integration — not yet configured.
// When ready, this route will:
// 1. Accept an audio file or pre-transcribed text
// 2. Transcribe audio to text (via Azure Speech / Whisper)
// 3. Forward the transcribed text to /api/ai/forms/generate-minutes for structuring

interface TranscribeMinutesRequest {
  transcribedText?: string
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

    const body = (await req.json()) as TranscribeMinutesRequest

    // If pre-transcribed text is provided, forward to generate-minutes
    if (body.transcribedText) {
      const generateRes = await fetch(new URL("/api/ai/forms/generate-minutes", req.url), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: req.headers.get("cookie") || "",
        },
        body: JSON.stringify({
          rawNotes: body.transcribedText,
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
        error: "Audio transcription not yet configured",
        message:
          "This feature requires Azure Speech Services or Whisper API integration. " +
          "Provide transcribedText field to process pre-transcribed audio.",
      },
      { status: 501 },
    )
  } catch (error) {
    console.error("transcribe-minutes API error:", error)
    return NextResponse.json({ error: "Failed to process transcription" }, { status: 500 })
  }
}
