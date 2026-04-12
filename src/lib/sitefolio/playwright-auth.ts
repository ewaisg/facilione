/**
 * SiteFolio SSO Auth via Playwright
 * Handles full PingOne DaVinci SAML 2.0 flow.
 * Only runs locally — NOT on Vercel.
 */

import { chromium, type Browser, type BrowserContext, type Page } from "playwright"

const PINGONE_SSO_URL =
  "https://auth.pingone.com/1b93dc23-a27b-4a7d-b0eb-c55c0c10e862/saml20/idp/startsso" +
  "?spEntityId=https://auth.sitefolio.com/3WSaEPhfdxDqHlDOvMrCyXgEf"

const TIMEOUT = 30_000

export interface SFCookieSession {
  cookies: string // Full Cookie header string
  cookieMap: Record<string, string> // Individual cookie name→value
  memberId: number // 83709
  enterpriseId: number // 8252
  obtainedAt: number // epoch ms
  expiresAt: number // epoch ms (~1 year for SSO)
}

export async function authenticateSiteFolio(
  username: string,
  password: string,
  headless = true,
): Promise<SFCookieSession> {
  const browser: Browser = await chromium.launch({
    headless,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  const context: BrowserContext = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    locale: "en-US",
    timezoneId: "America/Denver",
  })

  const page: Page = await context.newPage()

  try {
    await page.goto(PINGONE_SSO_URL, { waitUntil: "domcontentloaded", timeout: TIMEOUT })

    const landed = await Promise.race([
      page
        .waitForURL(/sitefolio\.net/, { timeout: 5000 })
        .then(() => "sitefolio" as const),
      page
        .waitForSelector('input[type="text"], input[type="email"]', { timeout: 5000 })
        .then(() => "username-form" as const),
      page
        .waitForSelector('input[type="password"]', { timeout: 5000 })
        .then(() => "password-form" as const),
    ]).catch(() => "unknown" as const)

    if (landed !== "sitefolio") {
      if (landed === "username-form") {
        const usernameInput = page.locator('input[type="text"], input[type="email"]').first()
        await usernameInput.fill(username)

        const nextBtn = page
          .locator(
            'button[type="submit"], input[type="submit"], button:has-text("Next"), button:has-text("Continue"), button:has-text("Sign On"), button:has-text("Sign In")',
          )
          .first()

        if ((await nextBtn.count()) > 0) {
          await nextBtn.click()
        } else {
          await usernameInput.press("Enter")
        }

        await page.waitForSelector('input[type="password"]', { timeout: TIMEOUT })
      }

      const passwordInput = page.locator('input[type="password"]').first()
      await passwordInput.fill(password)

      const submitBtn = page
        .locator(
          'button[type="submit"], input[type="submit"], button:has-text("Sign In"), button:has-text("Sign On"), button:has-text("Submit")',
        )
        .first()

      if ((await submitBtn.count()) > 0) {
        await submitBtn.click()
      } else {
        await passwordInput.press("Enter")
      }

      await page.waitForURL(/sitefolio\.net/, { timeout: TIMEOUT })
    }

    await page.waitForLoadState("networkidle", { timeout: TIMEOUT })

    const allCookies = await context.cookies()
    const sfCookies = allCookies.filter(
      (c) => c.domain.includes("sitefolio.net") || c.domain.includes("sitefolio.com"),
    )

    if (!sfCookies.some((c) => c.name === "Session" || c.name === "Member")) {
      throw new Error("SiteFolio Session/Member cookies not found after SSO.")
    }

    const memberCookie = sfCookies.find((c) => c.name === "Member")?.value ?? ""
    const memberId = parseInt(memberCookie.match(/ID=(\d+)/)?.[1] ?? "83709")
    const enterpriseId = parseInt(memberCookie.match(/Authority=(\d+)/)?.[1] ?? "8252")

    const cookieMap: Record<string, string> = {}
    for (const c of sfCookies) cookieMap[c.name] = c.value

    const sessionCookie = sfCookies.find((c) => c.name === "Session")?.value ?? ""
    const expireMatch = sessionCookie.match(/Expire=([^&]+)/)
    const expiresAt = expireMatch
      ? new Date(decodeURIComponent(expireMatch[1])).getTime()
      : Date.now() + 365 * 24 * 60 * 60 * 1000

    return {
      cookies: sfCookies.map((c) => `${c.name}=${c.value}`).join("; "),
      cookieMap,
      memberId,
      enterpriseId,
      obtainedAt: Date.now(),
      expiresAt,
    }
  } finally {
    await browser.close()
  }
}
