"use client"

import { useState, useEffect } from "react"

interface Branding {
  logoUrl: string | null
  loading: boolean
}

let cachedLogoUrl: string | null | undefined = undefined

export function useBranding(): Branding {
  const [logoUrl, setLogoUrl] = useState<string | null>(cachedLogoUrl ?? null)
  const [loading, setLoading] = useState(cachedLogoUrl === undefined)

  useEffect(() => {
    if (cachedLogoUrl !== undefined) return

    fetch("/api/branding")
      .then((res) => res.json())
      .then((data) => {
        const url = data.logoUrl || null
        cachedLogoUrl = url
        setLogoUrl(url)
      })
      .catch(() => {
        cachedLogoUrl = null
      })
      .finally(() => setLoading(false))
  }, [])

  return { logoUrl, loading }
}
