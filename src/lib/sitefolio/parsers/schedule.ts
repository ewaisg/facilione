import * as cheerio from "cheerio"
import type { Element } from "domhandler"
import type {
  SiteFolioSchedulePhase,
  SiteFolioMilestone,
  SiteFolioMilestoneNote,
} from "@/types/sitefolio"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cleanText(value: string): string {
  return (value || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim()
}

/**
 * Converts a US-format date (MM/DD/YYYY) to ISO (YYYY-MM-DD).
 * Returns `null` for empty strings, em-dashes, or unparseable values.
 */
function usDateToIsoOrNull(value: string): string | null {
  // Strip em-dashes (U+2014) and regular dashes used as placeholders
  const raw = cleanText(value).replace(/\u2014/g, "").trim()
  if (!raw) return null

  const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return null

  return `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`
}

// ---------------------------------------------------------------------------
// Parser: Scheduling.sf
// ---------------------------------------------------------------------------

/**
 * Parses the SiteFolio Scheduling.sf page HTML and returns the schedule
 * phases, milestones (with notes), and the schedule template name.
 */
export function parseSchedule(html: string): {
  phases: SiteFolioSchedulePhase[]
  milestones: SiteFolioMilestone[]
  scheduleTemplate: string
} {
  const empty: ReturnType<typeof parseSchedule> = {
    phases: [],
    milestones: [],
    scheduleTemplate: "",
  }

  if (!html) return empty

  const $ = cheerio.load(html)

  // ------------------------------------------------------------------
  // Schedule Template
  // ------------------------------------------------------------------

  let scheduleTemplate = ""
  const templatesDiv = $("#divScheduleTemplates")
  if (templatesDiv.length) {
    // The last child div contains "<b>Client</b>: Template Name"
    const lastDiv = templatesDiv.children("div").last()
    if (lastDiv.length) {
      const boldText = cleanText(lastDiv.find("b").first().text())
      // The full text includes the bold portion + ": Template Name"
      const fullText = cleanText(lastDiv.text())
      // Remove the bold prefix and colon to get the template name
      if (boldText && fullText.startsWith(boldText)) {
        const afterBold = fullText.slice(boldText.length).replace(/^[:\s]+/, "").trim()
        scheduleTemplate = afterBold
      } else {
        // Fallback: use the full text
        scheduleTemplate = fullText
      }
    }
  }

  // ------------------------------------------------------------------
  // Phases & Milestones
  // ------------------------------------------------------------------

  const phases: SiteFolioSchedulePhase[] = []
  const milestones: SiteFolioMilestone[] = []
  const seenPhaseIds = new Set<number>()

  const tbody = $("#tbScheduleDates")
  if (!tbody.length) return { phases, milestones, scheduleTemplate }

  let currentPhaseName = ""
  let lastMilestone: SiteFolioMilestone | null = null

  tbody.find("tr").each((_i, tr) => {
    const $tr = $(tr)
    const className = $tr.attr("class") || ""

    // Skip shim and spacer rows
    if (className.includes("SHIM") || className.includes("SPCR")) return

    // --- Phase header (tr.CAT) ---
    if (className.includes("CAT")) {
      const phaseIdStr = $tr.attr("data-id") || ""
      const phaseId = parseInt(phaseIdStr, 10) || 0
      const phaseName = cleanText($tr.find("td.SC").text())
      currentPhaseName = phaseName

      if (phaseId && !seenPhaseIds.has(phaseId)) {
        seenPhaseIds.add(phaseId)
        phases.push({ phaseId, phaseName })
      }

      lastMilestone = null
      return
    }

    // --- Milestone row (tr.MSC) ---
    if (className.includes("MSC") && !className.includes("MSCN")) {
      const milestoneId = parseInt($tr.attr("data-id") || "0", 10) || 0
      const milestoneName = cleanText($tr.find("td.ST").text())

      const baselineDate = usDateToIsoOrNull(
        $tr.find('td.SD[data-num="1"]').text(),
      )
      const projectedDate = usDateToIsoOrNull(
        $tr.find('td.SD[data-num="2"]').text(),
      )
      const projectedAltDate = usDateToIsoOrNull(
        $tr.find('td.SD[data-num="3"]').text(),
      )
      const actualDate = usDateToIsoOrNull(
        $tr.find('td.SD[data-num="4"]').text(),
      )

      // Completion percentage
      const pctText = cleanText($tr.find("td.SP").text()).replace(/%/g, "")
      const completionPct = parseInt(pctText, 10) || 0

      // Complete flag
      const isComplete = className.includes("COMPLETE")

      const milestone: SiteFolioMilestone = {
        milestoneId,
        phaseName: currentPhaseName,
        milestoneName,
        baselineDate,
        projectedDate,
        projectedAltDate,
        actualDate,
        completionPct,
        isComplete,
        notes: [],
      }

      milestones.push(milestone)
      lastMilestone = milestone
      return
    }

    // --- Milestone note row (tr.MSCN) ---
    if (className.includes("MSCN") && lastMilestone) {
      const noteEntries = parseNoteRow($, $tr)
      for (const note of noteEntries) {
        lastMilestone.notes.push(note)
      }
    }
  })

  return { phases, milestones, scheduleTemplate }
}

// ---------------------------------------------------------------------------
// Internal: parse a note row
// ---------------------------------------------------------------------------

function parseNoteRow(
  $: cheerio.CheerioAPI,
  $tr: cheerio.Cheerio<Element>,
): SiteFolioMilestoneNote[] {
  const notes: SiteFolioMilestoneNote[] = []

  // Each note row can contain multiple div.BY + div.NOTE pairs
  const byDivs = $tr.find("div.BY")

  byDivs.each((_i, byEl) => {
    const $by = $(byEl)
    const byText = cleanText($by.text())
    // Pattern: "04/18/2025 rmm" → date + author initials
    const byMatch = byText.match(/^(\d{1,2}\/\d{1,2}\/\d{4})\s+(.+)$/)

    let date = ""
    let author = ""
    if (byMatch) {
      date = usDateToIsoOrNull(byMatch[1]) || byMatch[1]
      author = byMatch[2].trim()
    } else {
      // Fallback: use the entire text as author
      author = byText
    }

    // The NOTE div is typically the next sibling
    const $note = $by.next("div.NOTE")
    const text = cleanText($note.text())

    if (text) {
      notes.push({ date, author, text })
    }
  })

  // Fallback: if no div.BY elements found, try to grab any NOTE divs
  if (byDivs.length === 0) {
    $tr.find("div.NOTE").each((_i, noteEl) => {
      const text = cleanText($(noteEl).text())
      if (text) {
        notes.push({ date: "", author: "", text })
      }
    })
  }

  return notes
}
