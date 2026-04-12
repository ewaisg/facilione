import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/firebase-admin/request-auth"
import {
  sfAsmxCall,
  sfPageFetch,
  SFSessionExpiredError,
  SFNoSessionError,
} from "@/lib/sitefolio/fetch"

type Params = { params: Promise<{ path: string[] }> }

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await requireRoles(req, ["admin"])
  if (!auth.ok) return auth.response

  const { path } = await params
  const endpoint = "/" + path.join("/")
  const body = await req.json().catch(() => ({}))

  try {
    const xml = await sfAsmxCall(endpoint, body)
    return NextResponse.json({ ok: true, data: xml })
  } catch (error) {
    return sfErrorResponse(error)
  }
}

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await requireRoles(req, ["admin"])
  if (!auth.ok) return auth.response

  const { path } = await params
  const pagePath = "/" + path.join("/")
  const url = new URL(req.url)
  const queryString = url.search

  try {
    const html = await sfPageFetch(pagePath + queryString)
    return NextResponse.json({ ok: true, data: html })
  } catch (error) {
    return sfErrorResponse(error)
  }
}

function sfErrorResponse(error: unknown): NextResponse {
  if (error instanceof SFNoSessionError) {
    return NextResponse.json({ ok: false, error: error.message, code: "NO_SESSION" }, { status: 401 })
  }
  if (error instanceof SFSessionExpiredError) {
    return NextResponse.json(
      { ok: false, error: error.message, code: "SESSION_EXPIRED" },
      { status: 401 },
    )
  }
  const message = error instanceof Error ? error.message : String(error)
  return NextResponse.json({ ok: false, error: message }, { status: 500 })
}
