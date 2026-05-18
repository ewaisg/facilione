import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { requireRoles } from "@/lib/firebase-admin/request-auth"
import { getStorage } from "firebase-admin/storage"
import { getApps } from "firebase-admin/app"

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
  "image/webp",
]

const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2MB

const BRANDING_DOC_PATH = "systemSettings/branding"

function getStorageBucket() {
  const app = getApps()[0]
  const bucketName =
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "facilione.firebasestorage.app"
  return getStorage(app).bucket(bucketName)
}

function getExtFromContentType(contentType: string): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/svg+xml": "svg",
    "image/webp": "webp",
  }
  return map[contentType] || "png"
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireRoles(req, ["admin"])
    if (!auth.ok) return auth.response

    const docSnap = await adminDb.doc(BRANDING_DOC_PATH).get()

    if (!docSnap.exists) {
      return NextResponse.json({ logoUrl: null })
    }

    const data = docSnap.data()
    return NextResponse.json({
      logoUrl: data?.logoUrl || null,
      logoPath: data?.logoPath || null,
      updatedAt: data?.updatedAt || null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch branding"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireRoles(req, ["admin"])
    if (!auth.ok) return auth.response

    const formData = await req.formData()
    const file = formData.get("logo")

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "logo file is required" }, { status: 400 })
    }

    // Validate content type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type "${file.type}". Allowed: png, jpg, jpeg, svg, webp`,
        },
        { status: 400 },
      )
    }

    // Validate file size
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File size exceeds 2MB limit" },
        { status: 400 },
      )
    }

    const bucket = getStorageBucket()

    // Delete old logo if one exists
    const docSnap = await adminDb.doc(BRANDING_DOC_PATH).get()
    if (docSnap.exists) {
      const oldPath = docSnap.data()?.logoPath
      if (oldPath) {
        try {
          await bucket.file(oldPath).delete()
        } catch {
          // Old file may not exist — ignore deletion errors
        }
      }
    }

    // Upload new logo
    const ext = getExtFromContentType(file.type)
    const timestamp = Date.now()
    const storagePath = `branding/logo-${timestamp}.${ext}`

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const storageFile = bucket.file(storagePath)

    await storageFile.save(fileBuffer, {
      metadata: {
        contentType: file.type,
      },
    })

    // Make the file publicly readable and get the public URL
    await storageFile.makePublic()
    const logoUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`

    // Save branding metadata to Firestore
    const updatedAt = new Date().toISOString()
    await adminDb.doc(BRANDING_DOC_PATH).set({
      logoUrl,
      logoPath: storagePath,
      updatedAt,
      updatedBy: auth.uid,
    })

    return NextResponse.json({ logoUrl, logoPath: storagePath })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to upload logo"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireRoles(req, ["admin"])
    if (!auth.ok) return auth.response

    const docSnap = await adminDb.doc(BRANDING_DOC_PATH).get()

    if (!docSnap.exists || !docSnap.data()?.logoPath) {
      return NextResponse.json({ success: true })
    }

    const logoPath = docSnap.data()?.logoPath

    // Delete file from Storage
    const bucket = getStorageBucket()
    try {
      await bucket.file(logoPath).delete()
    } catch {
      // File may already be deleted — continue
    }

    // Clear the Firestore doc
    await adminDb.doc(BRANDING_DOC_PATH).set({
      logoUrl: null,
      logoPath: null,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.uid,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete logo"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
