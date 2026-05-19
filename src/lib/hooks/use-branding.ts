"use client"

import { useState, useEffect } from "react"

interface Branding {
  logoUrl: string | null
  loading: boolean
}

let cachedLogoUrl: string | null | undefined = undefined

export function updateCachedBrandingLogo(logoUrl: string | null) {
  cachedLogoUrl = logoUrl
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("facilione:branding-updated", { detail: { logoUrl } }),
    )
  }
}

export function useBranding(): Branding {
  const [logoUrl, setLogoUrl] = useState<string | null>(cachedLogoUrl ?? null)
  const [loading, setLoading] = useState(cachedLogoUrl === undefined)

  useEffect(() => {
    function handleBrandingUpdate(event: Event) {
      const customEvent = event as CustomEvent<{ logoUrl: string | null }>
      const nextLogoUrl = customEvent.detail?.logoUrl || null
      cachedLogoUrl = nextLogoUrl
      setLogoUrl(nextLogoUrl)
      setLoading(false)
    }

    window.addEventListener("facilione:branding-updated", handleBrandingUpdate)

    fetch("/api/branding")
      .then((res) => res.json())
      .then((data) => {
        const url = data.logoUrl || null
        cachedLogoUrl = url
        setLogoUrl(url)
      })
      .catch(() => {
        cachedLogoUrl = null
        setLogoUrl(null)
      })
      .finally(() => setLoading(false))

    return () => window.removeEventListener("facilione:branding-updated", handleBrandingUpdate)
  }, [])

  return { logoUrl, loading }
}
