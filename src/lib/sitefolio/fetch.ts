import { getStoredSession } from "./session-store"

const SF_BASE = "https://www.sitefolio.net"

export class SFSessionExpiredError extends Error {
  constructor() {
    super("SiteFolio session expired. Run refresh script locally.")
    this.name = "SFSessionExpiredError"
  }
}

export class SFNoSessionError extends Error {
  constructor() {
    super("No SiteFolio session found. Run refresh script locally to authenticate.")
    this.name = "SFNoSessionError"
  }
}

function sfHeaders(cookies: string, contentType?: string): Record<string, string> {
  return {
    Cookie: cookies,
    "X-Requested-With": "XMLHttpRequest",
    Accept: "*/*",
    Referer: "https://www.sitefolio.net/",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    ...(contentType ? { "Content-Type": contentType } : {}),
  }
}

/**
 * Call a SiteFolio ASMX endpoint.
 * Sends form-encoded params. Returns raw XML/HTML string.
 *
 * Example:
 *   const html = await sfAsmxCall(
 *     "/ws/Documents/Documents.asmx/EnumerateTeamPageDocumentsMarkupInitial",
 *     { folderID: 0, teamPageGroupID: 22, teamID: 1077, maxItemCount: 48,
 *       includeFolderPath: false, enterpriseContextID: 8252 }
 *   );
 */
export async function sfAsmxCall(
  endpoint: string,
  params: Record<string, string | number | boolean> = {},
): Promise<string> {
  const session = await getStoredSession()
  if (!session) throw new SFNoSessionError()

  const body = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    body.append(key, String(value))
  }

  const res = await fetch(`${SF_BASE}${endpoint}`, {
    method: "POST",
    redirect: "manual",
    headers: sfHeaders(session.cookies, "application/x-www-form-urlencoded; charset=utf-8"),
    body: body.toString(),
  })

  if (res.status === 302) throw new SFSessionExpiredError()

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`SiteFolio ASMX ${res.status} on ${endpoint}: ${text.slice(0, 200)}`)
  }

  return res.text()
}

/**
 * Fetch a SiteFolio page (GET). Returns raw HTML for DOM parsing.
 *
 * Example:
 *   const html = await sfPageFetch(
 *     "/Kroger/ViewContactProjects.sf?idContact=83709&idBusiness=8252"
 *   );
 */
export async function sfPageFetch(path: string): Promise<string> {
  const session = await getStoredSession()
  if (!session) throw new SFNoSessionError()

  const res = await fetch(`${SF_BASE}${path}`, {
    method: "GET",
    redirect: "manual",
    headers: sfHeaders(session.cookies),
  })

  if (res.status === 302) throw new SFSessionExpiredError()

  if (!res.ok) {
    throw new Error(`SiteFolio page ${res.status} on ${path}`)
  }

  return res.text()
}
