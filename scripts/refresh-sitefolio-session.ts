/**
 * SiteFolio Session Refresh
 * Run locally: npx tsx scripts/refresh-sitefolio-session.ts
 * Requires: Playwright + Chromium on this machine
 * Requires: .env.local with SITEFOLIO_USERNAME and SITEFOLIO_PASSWORD
 */

import { config } from "dotenv"
config({ path: ".env.local" })

import { authenticateSiteFolio } from "../src/lib/sitefolio/playwright-auth"
import { storeSession } from "../src/lib/sitefolio/session-store"

async function main() {
  const username = process.env.SITEFOLIO_USERNAME
  const password = process.env.SITEFOLIO_PASSWORD

  if (!username || !password) {
    console.error("Missing SITEFOLIO_USERNAME or SITEFOLIO_PASSWORD in .env.local")
    process.exit(1)
  }

  console.log(`Authenticating as ${username}...`)

  const session = await authenticateSiteFolio(username, password, true)

  console.log("Auth successful.")
  console.log(`  Member ID:     ${session.memberId}`)
  console.log(`  Enterprise ID: ${session.enterpriseId}`)
  console.log(`  Cookies:       ${Object.keys(session.cookieMap).length} cookies captured`)
  console.log(`  Expires:       ${new Date(session.expiresAt).toLocaleDateString()}`)

  await storeSession(session)
  console.log("Session stored in Firestore (sitefolio_sessions/current).")
}

main().catch((e) => {
  console.error("Auth failed:", e.message)
  process.exit(1)
})
