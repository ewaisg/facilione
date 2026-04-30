import * as cheerio from "cheerio"
import type { SiteFolioProject } from "@/types/sitefolio"

function cleanText(value: string): string {
  return (value || "").replace(/ /g, " ").replace(/\s+/g, " ").trim()
}

/**
 * Parses the "Current Projects" listing from SiteFolio's
 * ViewContactProjects.sf page and returns a flat array of
 * `SiteFolioProject` records.
 *
 * Store header rows have a single <td colspan="3"> with bold/underline
 * styling (via inline style or tags) containing the store identifier.
 * Project detail rows follow, each containing an <a> link to
 * ProjectOverviewView.sf.
 */
export function parseProjectsList(html: string): SiteFolioProject[] {
  if (!html) return []

  const $ = cheerio.load(html)
  const projects: SiteFolioProject[] = []

  // Find the WP_DATATABLE that contains the current projects.
  // Strategy: look for a table with class WP_DATATABLE that has project links.
  // Fallback: look for the "Current Projects" title and find the table in the
  // same webpart body container.
  let table = $('table.WP_DATATABLE').filter((_i, el) => {
    return $(el).find('a[href*="ProjectOverviewView"]').length > 0
  }).first()

  if (!table.length) {
    // Fallback: find "Current Projects" text and walk up to the container
    $("div.TITLE").each((_i, el) => {
      const text = cleanText($(el).text())
      if (text.includes("Current Projects")) {
        const webpart = $(el).closest(".WEBPART, [id^='divWebPartRoot']")
        if (webpart.length) {
          table = webpart.find("table.WP_DATATABLE").first()
        }
        if (!table.length) {
          table = $(el).closest(".WEBPART_TITLE").next(".WP_BODYCONTAINER").find("table.WP_DATATABLE").first()
        }
        return false
      }
    })
  }

  if (!table.length) return projects

  let currentStoreNumber = ""
  let currentStoreName = ""
  let currentStoreLocation = ""

  table.find("tr").each((_i, tr) => {
    const $tr = $(tr)

    // --- Store header detection ---
    // A store header row has a <td colspan="3"> with bold styling.
    // The styling may come from inline style (font-weight:bold) or <b>/<strong>/<u> tags.
    const colspanTd = $tr.find('td[colspan="3"]')
    if (colspanTd.length) {
      const style = (colspanTd.attr("style") || "").toLowerCase()
      const hasBoldStyle = style.includes("font-weight") && style.includes("bold")
      const hasBoldTag = colspanTd.find("b, strong, u").length > 0
      if (hasBoldStyle || hasBoldTag) {
        const headerText = cleanText(colspanTd.text())

        // Parse store header. Known formats:
        //   "620-00012 KS-012 Pueblo, CO - Sunset Plaza Kroger"
        //   "620-00012 KS-012, Pueblo, CO - Sunset Plaza Kroger"
        //   "620-00164 Windsor, CO - Windsor East Kroger"
        //   "620-00096 KS-096 Greenwood Village Kroger"
        //
        // Pattern: storeNumber [storeName][, location]
        // The storeNumber is always the first token (digits-digits format).

        // Extract leading oracle-style number (e.g. "620-00012")
        const leadMatch = headerText.match(/^([\d]+-[\d]+)\s+(.*)$/)
        if (leadMatch) {
          currentStoreNumber = leadMatch[1].trim()
          const rest = leadMatch[2].trim()

          // Try to extract "KS-NNN" store name from the rest
          const ksMatch = rest.match(/^(KS-\d+)[,\s]+(.*)$/i)
          if (ksMatch) {
            currentStoreName = ksMatch[1].trim()
            currentStoreLocation = ksMatch[2].trim()
          } else {
            // No KS-NNN prefix — treat everything as location
            currentStoreName = currentStoreNumber
            currentStoreLocation = rest
          }
        } else {
          // Fallback: try em-dash or dash pattern
          const dashMatch = headerText.match(/^([\w-]+)\s*[——-]\s*(.+)$/)
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
            currentStoreNumber = ""
            currentStoreName = headerText
            currentStoreLocation = ""
          }
        }
        return // continue to next row
      }
    }

    // --- Project detail detection ---
    const link = $tr.find('a[href*="ProjectOverviewView"]').first()
    if (!link.length) return

    const href = link.attr("href") || ""
    const linkText = cleanText(link.text())

    // Extract sfProjectId from href query param idProject=NNNN
    let sfProjectId = 0
    const idMatch = href.match(/idProject=(\d+)/i)
    if (idMatch) {
      sfProjectId = parseInt(idMatch[1], 10)
    }

    // Parse link text:
    // "620-00012-03 2026 WIW, Construction Planning, Within-the-Walls Remodel"
    let projectNumber = ""
    let year = ""
    let description = ""
    let phase = ""
    let projectType = ""

    const tokens = linkText.match(/^([\w-]+)\s+(\d{4})\s+(.*)$/)
    if (tokens) {
      projectNumber = tokens[1]
      year = tokens[2]
      const tail = tokens[3]
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
      description = linkText
    }

    // Extract role from text after the </a> tag.
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
