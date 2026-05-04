import * as cheerio from "cheerio"
import type { Element } from "domhandler"

export interface SfDirectoryContact {
  name: string
  title: string
  phone: string
  email: string
}

export interface SfDirectoryCompany {
  category: string
  companyName: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  contacts: SfDirectoryContact[]
}

function cleanText(value: string): string {
  return (value || "").replace(/ /g, " ").replace(/\s+/g, " ").trim()
}

/**
 * Parses the AJAX GET response HTML from:
 * GET /Kroger/Directory2/Directory/Index?projectID={sfId}&pdetID=0&enterpriseFilterID=0&directoryEntryFilterID=
 *
 * The response is injected into #pdlp_content on the team page.
 * Directory2 renders companies as grouped blocks, each with a header row
 * and one or more contact rows beneath it.
 */
export function parseTeamDirectory(html: string): SfDirectoryCompany[] {
  if (!html || !html.trim()) return []

  const $ = cheerio.load(html)
  const companies: SfDirectoryCompany[] = []

  // Directory2 renders a table per category, or groups companies
  // within a section header. Try multiple known patterns.

  // Pattern A: category headings in <div class="dirCatHeader"> or similar,
  // with company blocks in <div class="dirEntry"> or <tr> rows beneath.
  // Pattern B: flat table rows where the first TD identifies category.

  // First, try the structured directory2 layout — category dividers followed
  // by company rows. SiteFolio Directory2 typically renders:
  //   <div class="dir-entry"> or <tr data-type="..."> blocks
  // We scan all table rows and look for category headers vs entry rows.

  // Attempt 1: Look for category label rows and company entry rows in tables
  let parsed = false

  // Directory2 uses a table with alternating category header rows and entry rows.
  // Category headers: <tr> containing <td class="dirCatLabel"> or <th> with category name
  // Company rows: <tr> with multiple cells (company name, address, phone, contacts)

  // Try to find a top-level container first
  const container = $(".directory-list, #directory-list, .dir-list, .pdlp-inner, .dir-content").first()

  let currentCategory = "Other"

  const trSelector = container.length ? container.find("tr") : $("tr")
  trSelector.each((_i, tr) => {
    const $tr = $(tr)
    const tds = $tr.find("td, th")

    if (!tds.length) return

    const firstTd = $(tds[0])
    const firstText = cleanText(firstTd.text())

    // Detect category header rows: single cell spanning full width,
    // or <th> element, or cell with class containing "cat", "header", "group"
    const isCategoryRow =
      tds.length === 1 ||
      firstTd.is("th") ||
      firstTd.hasClass("dirCatLabel") ||
      firstTd.hasClass("categoryLabel") ||
      firstTd.hasClass("cat-header") ||
      ($tr.hasClass("dirCatRow") || $tr.hasClass("categoryRow") || $tr.hasClass("cat-header")) ||
      (tds.length <= 2 && firstTd.attr("colspan") && parseInt(firstTd.attr("colspan") || "1") > 2)

    if (isCategoryRow && firstText) {
      // Known category names from PAGE-05 doc
      const knownCategories = [
        "Owner", "Professional Consultant", "Subconsultant",
        "Contractor", "Subcontractor", "Government Entity",
        "Equipment/Materials Vendor", "Other", "Utility Company",
        "Broker/Developer",
      ]
      const matchedCat = knownCategories.find((cat) =>
        firstText.toLowerCase().includes(cat.toLowerCase()),
      )
      if (matchedCat || firstText.length < 60) {
        currentCategory = matchedCat || firstText
        parsed = true
        return
      }
    }

    // Skip header/label-only rows
    if (tds.length < 3) return

    // Try to extract company entry from this row
    // Common layout: [Company Name] [Address] [Phone] [Contact Name/Email]
    // Or: [Company Name + Address block] [contacts block]
    const company = parseCompanyRow($, tr, currentCategory)
    if (company) {
      companies.push(company)
      parsed = true
    }
  })

  // Attempt 2: Look for div-based directory entries if table approach found nothing
  if (!parsed || companies.length === 0) {
    $("[class*='dir-entry'], [class*='dirEntry'], [class*='directory-entry']").each((_i, el) => {
      const $el = $(el)
      const categoryEl = $el.find("[class*='cat'], [class*='category']").first()
      const cat = cleanText(categoryEl.text()) || currentCategory

      const nameEl = $el.find("[class*='company'], [class*='name'], [class*='org']").first()
      const companyName = cleanText(nameEl.text())
      if (!companyName) return

      const addrEl = $el.find("[class*='address'], [class*='addr']").first()
      const fullAddr = cleanText(addrEl.text())

      const phoneEl = $el.find("[class*='phone']").first()
      const phone = cleanText(phoneEl.text())

      const contacts: SfDirectoryContact[] = []
      $el.find("[class*='contact'], tr.EVENROW, tr.ODDROW").each((_j, contactEl) => {
        const contact = parseContactEl($, contactEl)
        if (contact) contacts.push(contact)
      })

      companies.push({
        category: cat,
        companyName,
        address: fullAddr,
        city: "",
        state: "",
        zip: "",
        phone,
        contacts,
      })
    })
  }

  // Attempt 3: Fallback to the same EVENROW/ODDROW pattern used by overview parser
  // This gives at least the basic contact list even without company grouping
  if (companies.length === 0) {
    const contacts: SfDirectoryContact[] = []
    $("tr.EVENROW, tr.ODDROW").each((_i, tr) => {
      const $tr = $(tr)
      const tds = $tr.find("td")
      if (tds.length < 3) return

      const name = cleanText($(tds[0]).text())
      const title = tds.length > 1 ? cleanText($(tds[1]).text()) : ""
      const phone = tds.length > 2 ? cleanText($(tds[2]).text()) : ""
      let email = tds.length > 3 ? cleanText($(tds[3]).text()) : ""

      const mailto = tds.length > 3 ? $(tds[3]).find('a[href^="mailto:"]') : null
      if (mailto?.length) {
        email = cleanText(mailto.text()) || (mailto.attr("href") || "").replace(/^mailto:/i, "")
      }

      if (!name) return
      contacts.push({ name, title, phone, email })
    })

    if (contacts.length > 0) {
      companies.push({
        category: "Team",
        companyName: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        phone: "",
        contacts,
      })
    }
  }

  return companies
}

function parseCompanyRow(
  $: cheerio.CheerioAPI,
  tr: Element,
  category: string,
): SfDirectoryCompany | null {
  const $tr = $(tr)
  const tds = $tr.find("td")

  if (tds.length < 2) return null

  // First cell typically has company name (and possibly address beneath it)
  const firstCell = $(tds[0])
  const firstCellHtml = (firstCell.html() || "").replace(/<br\s*\/?>/gi, "\n")
  const firstCellLines = firstCellHtml
    .replace(/<[^>]*>/g, "")
    .split("\n")
    .map((l) => cleanText(l))
    .filter(Boolean)

  if (!firstCellLines.length) return null

  const companyName = firstCellLines[0]
  if (!companyName || companyName.length > 100) return null

  // Remaining lines in first cell = address
  const addressLines = firstCellLines.slice(1)
  let address = ""
  let city = ""
  let state = ""
  let zip = ""

  if (addressLines.length > 0) {
    address = addressLines[0]
  }
  if (addressLines.length > 1) {
    const cszMatch = addressLines[1].match(/^(.+?),?\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/)
    if (cszMatch) {
      city = cszMatch[1].trim()
      state = cszMatch[2]
      zip = cszMatch[3]
    } else {
      city = addressLines[1]
    }
  }

  // Phone in second or third cell
  let phone = ""
  if (tds.length > 1) phone = cleanText($(tds[1]).text())

  // Contacts: look for nested contact rows, or parse remaining cells
  const contacts: SfDirectoryContact[] = []

  // Check if there are nested contact rows inside this row's cells
  $tr.find("tr.EVENROW, tr.ODDROW, [class*='contact-row']").each((_i, contactTr) => {
    const contact = parseContactEl($, contactTr)
    if (contact) contacts.push(contact)
  })

  // If no nested rows, check if the remaining TDs hold a single contact
  if (contacts.length === 0 && tds.length >= 3) {
    const nameCell = tds.length > 2 ? cleanText($(tds[2]).text()) : ""
    const emailCell = tds.length > 3 ? $(tds[3]) : null
    let email = ""

    if (emailCell) {
      const mailto = emailCell.find('a[href^="mailto:"]')
      if (mailto.length) {
        email = cleanText(mailto.text()) || (mailto.attr("href") || "").replace(/^mailto:/i, "")
      } else {
        email = cleanText(emailCell.text())
      }
    }

    if (nameCell) {
      contacts.push({ name: nameCell, title: "", phone: "", email })
    }
  }

  return {
    category,
    companyName,
    address,
    city,
    state,
    zip,
    phone,
    contacts,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseContactEl($: cheerio.CheerioAPI, el: any): SfDirectoryContact | null {
  const $el = $(el)
  const tds = $el.find("td")

  if (tds.length >= 2) {
    const name = cleanText($(tds[0]).text())
    const title = tds.length > 1 ? cleanText($(tds[1]).text()) : ""
    const phone = tds.length > 2 ? cleanText($(tds[2]).text()) : ""
    let email = tds.length > 3 ? cleanText($(tds[3]).text()) : ""

    const mailto = tds.length > 3 ? $(tds[3]).find('a[href^="mailto:"]') : null
    if (mailto?.length) {
      email = cleanText(mailto.text()) || (mailto.attr("href") || "").replace(/^mailto:/i, "")
    }

    if (!name) return null
    return { name, title, phone, email }
  }

  // Single-cell or div-based contact
  const name = cleanText($el.find("[class*='name']").first().text() || $el.text())
  if (!name) return null

  const title = cleanText($el.find("[class*='title'], [class*='role']").first().text())
  const phone = cleanText($el.find("[class*='phone']").first().text())
  const mailto = $el.find('a[href^="mailto:"]')
  const email = mailto.length
    ? cleanText(mailto.text()) || (mailto.attr("href") || "").replace(/^mailto:/i, "")
    : ""

  return { name, title, phone, email }
}

