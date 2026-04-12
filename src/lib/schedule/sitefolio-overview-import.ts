export interface SiteFolioOverviewProjectInfo {
  projectId?: string
  identifierAndName: string
  address: string
  identifiers: string
  description: string
  status: string
}

export interface SiteFolioOverviewComment {
  dateRaw: string
  dateIso: string
  author: string
  comment: string
}

export interface SiteFolioOverviewUpcomingItem {
  dateRaw: string
  dateIso: string
  title: string
  phase: string
}

export interface SiteFolioOverviewContact {
  role: string
  name: string
  phone: string
  email: string
}

export interface SiteFolioOverviewReport {
  title: string
  href: string
}

export interface SiteFolioOverviewImportResult {
  project: SiteFolioOverviewProjectInfo
  comments: SiteFolioOverviewComment[]
  upcoming: SiteFolioOverviewUpcomingItem[]
  contacts: SiteFolioOverviewContact[]
  reports: SiteFolioOverviewReport[]
}

function cleanText(value: string): string {
  return (value || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim()
}

function cleanMultilineText(value: string): string {
  return (value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
}

function usDateToIso(value: string): string {
  const raw = cleanText(value)
  if (!raw) return ""

  const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return ""

  const mm = m[1].padStart(2, "0")
  const dd = m[2].padStart(2, "0")
  const yyyy = m[3]
  return `${yyyy}-${mm}-${dd}`
}

function textById(doc: Document, id: string): string {
  return cleanText(doc.getElementById(id)?.textContent || "")
}

function htmlByIdWithBrToNewline(doc: Document, id: string): string {
  const node = doc.getElementById(id)
  if (!node) return ""
  const html = (node.innerHTML || "").replace(/<br\s*\/?>/gi, "\n")
  const plain = html.replace(/<[^>]*>/g, "")
  return cleanMultilineText(plain)
}

function parseProjectId(html: string): string | undefined {
  const match = html.match(/idProject=(\d+)/i)
  return match?.[1]
}

export function parseSiteFolioOverviewHtml(html: string): SiteFolioOverviewImportResult {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")

  const identifierAndName = textById(doc, "U_ctl46_spnProjectIdentifierAndName")
  const hasGeneralComments = !!doc.getElementById("U_WP1899099783_spnRoot")
  if (!identifierAndName && !hasGeneralComments) {
    throw new Error("Could not detect a valid SiteFolio Project Overview HTML page.")
  }

  const project: SiteFolioOverviewProjectInfo = {
    projectId: parseProjectId(html),
    identifierAndName,
    address: htmlByIdWithBrToNewline(doc, "U_WP2065916108_spnAddress"),
    identifiers: htmlByIdWithBrToNewline(doc, "U_WP2065916108_spnIdentifiers"),
    description: textById(doc, "U_WP2065916108_spnDescription"),
    status: textById(doc, "U_WP2065916108_spnProjectStatus"),
  }

  const commentRows = Array.from(doc.querySelectorAll("#U_WP1899099783_spnRoot table.FORMATTEDTABLE tr"))
  const comments: SiteFolioOverviewComment[] = commentRows
    .map((tr) => {
      const dateRaw = cleanText(tr.querySelector("span[id*='_date']")?.textContent || "")
      const author = cleanText(tr.querySelector("span[id*='_author']")?.textContent || "")
      const comment = cleanText(tr.querySelector("span[id*='_comment']")?.textContent || "")
      return {
        dateRaw,
        dateIso: usDateToIso(dateRaw),
        author,
        comment,
      }
    })
    .filter((item) => item.comment)
    .sort((a, b) => {
      if (a.dateIso && b.dateIso) return b.dateIso.localeCompare(a.dateIso)
      if (a.dateIso) return -1
      if (b.dateIso) return 1
      return 0
    })

  const upcomingRows = Array.from(doc.querySelectorAll("#U_WP1953307112 .WP_DATATABLE tr"))
  const upcoming: SiteFolioOverviewUpcomingItem[] = upcomingRows
    .map((tr) => {
      const link = tr.querySelector("a")
      const tds = tr.querySelectorAll("td")
      const dateRaw = cleanText(link?.textContent || tds[0]?.textContent || "")
      const title = cleanText(tds[1]?.textContent || "")
      const phase = cleanText(tds[2]?.getAttribute("title") || tds[2]?.textContent || "")
      return {
        dateRaw,
        dateIso: usDateToIso(dateRaw),
        title,
        phase,
      }
    })
    .filter((item) => item.dateRaw && item.title)

  const contactRows = Array.from(doc.querySelectorAll("#U_WP208568198 tr.EVENROW, #U_WP208568198 tr.ODDROW"))
  const contacts: SiteFolioOverviewContact[] = contactRows
    .map((tr) => {
      const tds = tr.querySelectorAll("td")
      return {
        role: cleanText(tds[0]?.textContent || ""),
        name: cleanText(tds[1]?.textContent || ""),
        phone: cleanText(tds[2]?.textContent || ""),
        email: cleanText(tds[3]?.textContent || ""),
      }
    })
    .filter((item) => item.role)

  const reports = Array.from(doc.querySelectorAll("#U_WP1946790489 ._REPORT a"))
    .map((a) => ({
      title: cleanText(a.textContent || ""),
      href: a.getAttribute("href") || "",
    }))
    .filter((item) => item.title && item.href)

  return {
    project,
    comments,
    upcoming,
    contacts,
    reports,
  }
}
