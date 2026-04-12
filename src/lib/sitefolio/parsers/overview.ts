import * as cheerio from "cheerio"
import type { Element } from "domhandler"
import type {
  SiteFolioOverview,
  SiteFolioComment,
  SiteFolioTeamContact,
  SiteFolioUpcomingMilestone,
  SiteFolioReportLink,
} from "@/types/sitefolio"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cleanText(value: string): string {
  return (value || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim()
}

function usDateToIso(value: string): string {
  const raw = cleanText(value)
  if (!raw) return ""
  const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return ""
  return `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`
}

/**
 * Reads the text content of a cheerio element matched by a partial-ID
 * selector (using `[id$=...]`). Falls back to exact ID lookup.
 */
function textByIdSuffix(
  $: cheerio.CheerioAPI,
  suffix: string,
): string {
  const el = $(`span[id$="${suffix}"]`).first()
  return cleanText(el.text())
}

/**
 * Reads the inner HTML of an element matched by partial ID, converting
 * `<br>` tags to newline separators and stripping remaining markup.
 * Returns an array of non-empty lines.
 */
function htmlLinesByIdSuffix(
  $: cheerio.CheerioAPI,
  suffix: string,
): string[] {
  const el = $(`span[id$="${suffix}"]`).first()
  if (!el.length) return []
  const html = (el.html() || "").replace(/<br\s*\/?>/gi, "\n")
  const plain = html.replace(/<[^>]*>/g, "")
  return plain
    .split("\n")
    .map((line) => cleanText(line))
    .filter(Boolean)
}

// ---------------------------------------------------------------------------
// Parser: ProjectOverviewView.sf
// ---------------------------------------------------------------------------

export function parseOverview(html: string): {
  overview: SiteFolioOverview
  comments: SiteFolioComment[]
  teamContacts: SiteFolioTeamContact[]
  upcomingMilestones: SiteFolioUpcomingMilestone[]
  reportLinks: SiteFolioReportLink[]
} {
  const empty: ReturnType<typeof parseOverview> = {
    overview: {
      address: "",
      city: "",
      state: "",
      zip: "",
      googleMapsUrl: "",
      identifier: "",
      projectDescription: "",
      projectStatus: "",
      scheduleTemplate: "",
    },
    comments: [],
    teamContacts: [],
    upcomingMilestones: [],
    reportLinks: [],
  }

  if (!html) return empty

  const $ = cheerio.load(html)

  // ------------------------------------------------------------------
  // Overview fields
  // ------------------------------------------------------------------

  // Address — HTML has <br /> separating lines.
  // Line 0: street, Line 1: "City, ST ZIP", Line 2: country (optional)
  const addressLines = htmlLinesByIdSuffix($, "spnAddress")
  const street = addressLines[0] || ""
  const cityStateZipLine = addressLines[1] || ""

  let city = ""
  let state = ""
  let zip = ""

  // Parse "City, ST ZIP" or "City, ST  ZIP"
  const cszMatch = cityStateZipLine.match(
    /^(.+?),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/,
  )
  if (cszMatch) {
    city = cszMatch[1].trim()
    state = cszMatch[2]
    zip = cszMatch[3]
  } else {
    // Fallback: store the entire second line as city
    city = cityStateZipLine
  }

  // Google Maps link
  let googleMapsUrl = ""
  const mapsLink =
    $('a[href*="maps.google"]').first() ||
    $('span[id$="spnMapLink"] a').first()
  if (mapsLink.length) {
    googleMapsUrl = mapsLink.attr("href") || ""
  }

  const identifier = textByIdSuffix($, "spnIdentifiers")
  const projectDescription = textByIdSuffix($, "spnDescription")
  const projectStatus = textByIdSuffix($, "spnProjectStatus")

  const overview: SiteFolioOverview = {
    address: street,
    city,
    state,
    zip,
    googleMapsUrl,
    identifier,
    projectDescription,
    projectStatus,
    scheduleTemplate: "", // obtained from Schedule page, not overview
  }

  // ------------------------------------------------------------------
  // Comments
  // ------------------------------------------------------------------

  const comments: SiteFolioComment[] = []

  // Fixed (latest) comments — rows in the first table BEFORE divVariableComments
  const commentsRoot = $("#U_WP1899099783_spnRoot")
  let fixedCommentsParsed = false

  if (commentsRoot.length) {
    // Try to separate fixed from variable comments
    const variableDiv = commentsRoot.find('[id$="divVariableComments"]').first()

    if (variableDiv.length) {
      // Fixed comments: all table rows in the root OUTSIDE the variable div
      commentsRoot
        .find("table.FORMATTEDTABLE")
        .each((_tableIdx, table) => {
          const $table = $(table)
          // Skip tables inside the variable div
          if ($table.closest('[id$="divVariableComments"]').length) return
          $table.find("tr").each((rowIdx, tr) => {
            const comment = parseCommentRow($, tr, rowIdx, true)
            if (comment) comments.push(comment)
          })
          fixedCommentsParsed = true
        })

      // Variable (older) comments
      variableDiv.find("table.FORMATTEDTABLE tr").each((rowIdx, tr) => {
        const comment = parseCommentRow($, tr, rowIdx, false)
        if (comment) comments.push(comment)
      })
    } else {
      // Cannot distinguish fixed vs variable — parse all rows,
      // first one is isLatest: true
      let isFirst = true
      commentsRoot.find("table.FORMATTEDTABLE tr").each((rowIdx, tr) => {
        const comment = parseCommentRow($, tr, rowIdx, isFirst)
        if (comment) {
          comments.push(comment)
          isFirst = false
        }
      })
    }
  }

  // If no fixed comments were found in the structured approach, mark the
  // first comment as latest if we have any.
  if (!fixedCommentsParsed && comments.length > 0) {
    let hasLatest = false
    for (const c of comments) {
      if (c.isLatest) {
        hasLatest = true
        break
      }
    }
    if (!hasLatest) {
      comments[0].isLatest = true
    }
  }

  // ------------------------------------------------------------------
  // Team Contacts
  // ------------------------------------------------------------------

  const teamContacts: SiteFolioTeamContact[] = []

  // The contacts WebPart varies by page. Look for EVENROW / ODDROW rows
  // in any table, but scope to the broadest selectors that work.
  $("tr.EVENROW, tr.ODDROW").each((_i, tr) => {
    const $tr = $(tr)
    const tds = $tr.find("td")
    if (tds.length < 4) return

    const role = cleanText($(tds[0]).text())
    const name = cleanText($(tds[1]).text())
    const phone = cleanText($(tds[2]).text())
    let email = cleanText($(tds[3]).text())

    // Prefer the mailto link if present
    const mailto = $(tds[3]).find('a[href^="mailto:"]')
    if (mailto.length) {
      email = cleanText(mailto.text()) || (mailto.attr("href") || "").replace(/^mailto:/i, "")
    }

    if (!role && !name) return

    teamContacts.push({ role, name, phone, email })
  })

  // ------------------------------------------------------------------
  // Upcoming Milestones
  // ------------------------------------------------------------------

  const upcomingMilestones: SiteFolioUpcomingMilestone[] = []

  // Look for the Schedule - Upcoming WebPart rows.
  // Selector approach: find links with id containing "aStatusTopicDate",
  // or fall back to td selectors with id containing "tdStatusTopicData".
  $('a[id*="aStatusTopicDate"]').each((_i, el) => {
    const $a = $(el)
    const dateRaw = cleanText($a.attr("title") || $a.text())
    const date = usDateToIso(dateRaw) || dateRaw

    const $tr = $a.closest("tr")
    const milestoneTd = $tr.find('td[id*="tdStatusTopicData"]')
    const phaseTd = $tr.find('td[id*="tdStatusTopicAbbr"]')

    const milestone = cleanText(milestoneTd.text())
    const phase = cleanText(phaseTd.attr("title") || phaseTd.text())

    if (date || milestone) {
      upcomingMilestones.push({ date, milestone, phase })
    }
  })

  // Fallback: if no links with that ID pattern, try broad table scan
  // in the upcoming section
  if (upcomingMilestones.length === 0) {
    $(".WP_DATATABLE tr").each((_i, tr) => {
      const $tr = $(tr)
      const link = $tr.find("a").first()
      const tds = $tr.find("td")
      if (tds.length < 3) return

      const dateRaw = cleanText(link.attr("title") || link.text() || $(tds[0]).text())
      const date = usDateToIso(dateRaw) || dateRaw
      const milestone = cleanText($(tds[1]).text())
      const phase = cleanText($(tds[2]).attr("title") || $(tds[2]).text())

      if (date && milestone) {
        upcomingMilestones.push({ date, milestone, phase })
      }
    })
  }

  // ------------------------------------------------------------------
  // Report Links
  // ------------------------------------------------------------------

  const reportLinks: SiteFolioReportLink[] = []

  $("._REPORT a").each((_i, el) => {
    const $a = $(el)
    const url = $a.attr("href") || ""
    const name = cleanText($a.text())
    if (!name || !url) return

    let format: string
    if (/format!2\b/.test(url)) {
      format = "pdf"
    } else if (/format!(?:3|11)\b/.test(url)) {
      format = "xlsx"
    } else {
      format = "other"
    }

    reportLinks.push({ name, format, url })
  })

  return {
    overview,
    comments,
    teamContacts,
    upcomingMilestones,
    reportLinks,
  }
}

// ---------------------------------------------------------------------------
// Internal: parse a single comment table row
// ---------------------------------------------------------------------------

function parseCommentRow(
  $: cheerio.CheerioAPI,
  tr: Element,
  index: number,
  isLatest: boolean,
): SiteFolioComment | null {
  const $tr = $(tr)

  const dateSpan = $tr.find("span[id*='_date']").first()
  const authorSpan = $tr.find("span[id*='_author']").first()
  const commentSpan = $tr.find("span[id*='_comment']").first()

  const text = cleanText(commentSpan.text())
  if (!text) return null

  const dateRaw = cleanText(dateSpan.attr("title") || dateSpan.text())
  const date = usDateToIso(dateRaw) || dateRaw

  const authorFullName = cleanText(authorSpan.attr("title") || "")
  const authorInitials = cleanText(authorSpan.text())

  // Try to extract a numeric comment ID from onclick attributes
  let commentId = index
  const onclick = $tr.attr("onclick") || ""
  const idMatch = onclick.match(/(\d+)/)
  if (idMatch) {
    commentId = parseInt(idMatch[1], 10)
  }

  return {
    commentId,
    date,
    authorInitials,
    authorFullName,
    text,
    isLatest,
  }
}
