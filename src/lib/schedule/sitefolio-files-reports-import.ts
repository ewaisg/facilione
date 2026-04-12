export interface SiteFolioFolderItem {
  name: string
  href: string
}

export interface SiteFolioFileItem {
  name: string
  href: string
}

export interface SiteFolioReportItem {
  title: string
  href: string
}

export interface SiteFolioFilesReportsImportResult {
  folders: SiteFolioFolderItem[]
  files: SiteFolioFileItem[]
  reports: SiteFolioReportItem[]
}

function cleanText(value: string): string {
  return (value || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim()
}

function dedupeByKey<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>()
  const out: T[] = []

  for (const item of items) {
    const key = keyFn(item)
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }

  return out
}

function toAbsoluteSiteFolioHref(href: string): string {
  if (!href) return ""
  if (href.startsWith("http://") || href.startsWith("https://")) return href
  if (href.startsWith("/")) return href
  return `/${href}`
}

export function parseSiteFolioFilesReportsHtml(html: string): SiteFolioFilesReportsImportResult {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")

  const allAnchors = Array.from(doc.querySelectorAll("a"))

  const folderCandidates = allAnchors
    .map((a) => {
      const href = toAbsoluteSiteFolioHref(a.getAttribute("href") || "")
      const name = cleanText(a.textContent || "")
      return { name, href }
    })
    .filter(
      (item) =>
        item.name &&
        item.href &&
        (/ProjectDocuments\.sf/i.test(item.href) || /idFolder=/i.test(item.href)) &&
        !/idDocument=/i.test(item.href),
    )

  const fileCandidates = allAnchors
    .map((a) => {
      const href = toAbsoluteSiteFolioHref(a.getAttribute("href") || "")
      const name = cleanText(a.textContent || "")
      return { name, href }
    })
    .filter(
      (item) =>
        item.name &&
        item.href &&
        (/\/files\//i.test(item.href) || /idDocument=/i.test(item.href) || /ProjDocumentHistoryView\.sf/i.test(item.href)),
    )

  const reportCandidates = allAnchors
    .map((a) => {
      const href = toAbsoluteSiteFolioHref(a.getAttribute("href") || "")
      const title = cleanText(a.textContent || "")
      return { title, href }
    })
    .filter((item) => item.title && item.href && /\/reports\//i.test(item.href))

  const folders = dedupeByKey(folderCandidates, (item) => `${item.href}|${item.name}`)
  const files = dedupeByKey(fileCandidates, (item) => `${item.href}|${item.name}`)
  const reports = dedupeByKey(reportCandidates, (item) => `${item.href}|${item.title}`)

  if (folders.length === 0 && files.length === 0 && reports.length === 0) {
    throw new Error("No files, folders, or report links were found in the provided SiteFolio HTML.")
  }

  return {
    folders,
    files,
    reports,
  }
}
