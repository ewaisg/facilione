import * as cheerio from "cheerio"
import type { Element } from "domhandler"
import type { SiteFolioProject } from "@/types/sitefolio"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cleanText(value: string): string {
  return (value || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim()
}

// ---------------------------------------------------------------------------
// Parser: ViewContactProjects.sf → SiteFolioProject[]
// ---------------------------------------------------------------------------

/**
 * Parses the "Current Projects" listing from SiteFolio's
 * ViewContactProjects.sf page and returns a flat array of
 * `SiteFolioProject` records.
 *
 * Store header rows (colspan 3, bold/underline) provide shared
 * storeNumber / storeName / storeLocation for the project rows that
 * follow until the next store header.
 */
export function parseProjectsList(html: string): SiteFolioProject[] {
  if (!html) return []

  const $ = cheerio.load(html)
  const projects: SiteFolioProject[] = []

  // 1. Find the "Current Projects" WebPart container.
  //    Walk every div.TITLE looking for one whose text includes
  //    "Current Projects", then grab its sibling WP_BODYCONTAINER.
  let bodyContainer: cheerio.Cheerio<Element> | null = null

  $("div.TITLE").each((_i, el) => {
    const text = cleanText($(el).text())
    if (text.includes("Current Projects")) {
      // The body container is a sibling of the TITLE div
      bodyContainer = $(el).siblings("div.WP_BODYCONTAINER").first()
      return false // break
    }
  })

  if (!bodyContainer) return projects

  // 2. Inside that container, find the data table.
  const table = $(bodyContainer).find("table.WP_DATATABLE").first()
  if (!table.length) return projects

  // 3. Walk rows: detect store headers vs project detail rows.
  let currentStoreNumber = ""
  let currentStoreName = ""
  let currentStoreLocation = ""

  table.find("tr").each((_i, tr) => {
    const $tr = $(tr)

    // --- Store header detection ---
    // A store header row has a <td colspan="3"> with bold/underline text.
    const colspanTd = $tr.find('td[colspan="3"]')
    if (colspanTd.length) {
      const hasBold = colspanTd.find("b, strong").length > 0 || colspanTd.find("u").length > 0
      if (hasBold) {
        const headerText = cleanText(colspanTd.text())
        // Pattern: "620-00164 — KS-164, Windsor, CO - Windsor East"
        //   storeNumber = 620-00164
        //   rest after " — " = "KS-164, Windsor, CO - Windsor East"
        //   storeName = KS-164
        //   storeLocation = Windsor, CO - Windsor East
        const dashMatch = headerText.match(
          /^([\w-]+)\s*[—\u2014-]\s*(.+)$/,
        )
        if (dashMatch) {
          currentStoreNumber = dashMatch[1].trim()
          const rest = dashMatch[2].trim()
          const firstComma = rest.indexOf(",")
          if (firstComma !== -1) {
            currentStoreName = rest.slice(0, firstComma).trim()
            currentStoreLocation = rest.slice(firstComma + 1).trim()
          } else {
            currentStoreName = rest
            currentStoreLocation = ""
          }
        } else {
          // Fallback: use the entire header as storeName
          currentStoreNumber = ""
          currentStoreName = headerText
          currentStoreLocation = ""
        }
        return // continue to next row
      }
    }

    // --- Project detail detection ---
    const link = $tr.find('a[href*="ProjectOverviewView"]').first()
    if (!link.length) return // not a project row

    const href = link.attr("href") || ""
    const linkText = cleanText(link.text())

    // Extract sfProjectId from href query param idProject=NNNN
    let sfProjectId = 0
    const idMatch = href.match(/idProject=(\d+)/i)
    if (idMatch) {
      sfProjectId = parseInt(idMatch[1], 10)
    }

    // Parse link text:
    // "{projectNumber} {year} {description}, {phase}, {projectType}"
    // e.g. "620-00164-01 2028 New Store, Bidding, New Store-Net New"
    let projectNumber = ""
    let year = ""
    let description = ""
    let phase = ""
    let projectType = ""

    // First token is projectNumber, second is year, rest is the comma-separated tail
    const tokens = linkText.match(/^([\w-]+)\s+(\d{4})\s+(.*)$/)
    if (tokens) {
      projectNumber = tokens[1]
      year = tokens[2]
      const tail = tokens[3]
      // Split the tail by commas
      const parts = tail.split(",").map((s) => s.trim())
      if (parts.length >= 3) {
        description = parts.slice(0, parts.length - 2).join(", ")
        phase = parts[parts.length - 2]
        projectType = parts[parts.length - 1]
      } else if (parts.length === 2) {
        description = parts[0]
        phase = parts[1]
      } else {
        description = tail
      }
    } else {
      // Fallback: can't parse structured parts
      description = linkText
    }

    // Extract role from text after the </a> tag.
    // The parent TD may contain: <a>...</a> Role: FE Project Manager
    const parentTd = link.parent()
    const fullTdText = cleanText(parentTd.text())
    let role = ""
    const roleMatch = fullTdText.match(/Role:\s*(.+)$/i)
    if (roleMatch) {
      role = roleMatch[1].trim()
    }

    projects.push({
      sfProjectId,
      projectNumber,
      year,
      description,
      phase,
      projectType,
      role,
      storeNumber: currentStoreNumber,
      storeName: currentStoreName,
      storeLocation: currentStoreLocation,
      overviewUrl: href,
    })
  })

  return projects
}
