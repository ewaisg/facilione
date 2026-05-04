"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  RefreshCw,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { SfDirectoryCompany } from "@/lib/sitefolio/parsers/team"

interface SfTeamTabProps {
  projectId: string
}

const CATEGORY_ORDER = [
  "Owner",
  "Professional Consultant",
  "Subconsultant",
  "Contractor",
  "Subcontractor",
  "Government Entity",
  "Equipment/Materials Vendor",
  "Broker/Developer",
  "Utility Company",
  "Other",
  "Team",
]

function categorySort(a: string, b: string): number {
  const ai = CATEGORY_ORDER.indexOf(a)
  const bi = CATEGORY_ORDER.indexOf(b)
  if (ai === -1 && bi === -1) return a.localeCompare(b)
  if (ai === -1) return 1
  if (bi === -1) return -1
  return ai - bi
}

export function SfTeamTab({ projectId }: SfTeamTabProps) {
  const [companies, setCompanies] = useState<SfDirectoryCompany[]>([])
  const [fetchedAt, setFetchedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionExpired, setSessionExpired] = useState(false)

  const fetchTeam = useCallback(
    async (refresh = false) => {
      if (refresh) setRefreshing(true)
      else setLoading(true)
      setError(null)
      setSessionExpired(false)

      try {
        const url = `/api/sitefolio/project/${projectId}/team${refresh ? "?refresh=1" : ""}`
        // __session cookie is set automatically by auth context — no extra header needed
        const res = await fetch(url)
        const data = await res.json()

        if (!res.ok) {
          if (data.code === "SFSessionExpiredError" || data.code === "SFNoSessionError") {
            setSessionExpired(true)
          } else {
            setError(data.error || "Failed to load team directory")
          }
          return
        }

        setCompanies(data.companies ?? [])
        setFetchedAt(data.fetchedAt ?? null)
      } catch {
        setError("Network error loading team directory")
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [projectId],
  )

  useEffect(() => {
    fetchTeam(false)
  }, [fetchTeam])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  if (sessionExpired) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
        <AlertTriangle className="size-8 text-yellow-500 opacity-70" />
        <p className="text-sm font-medium">SiteFolio session expired</p>
        <p className="text-xs text-center max-w-xs">
          The SiteFolio authentication session has expired. Please run the
          refresh script locally to reconnect.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
        <AlertTriangle className="size-8 opacity-40" />
        <p className="text-sm font-medium">{error}</p>
        <Button variant="outline" size="sm" onClick={() => fetchTeam(true)}>
          Try Again
        </Button>
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
        <Clock className="size-8 opacity-40" />
        <p className="text-sm font-medium">No team directory data</p>
        <p className="text-xs">
          This project may not have a team directory in SiteFolio yet.
        </p>
      </div>
    )
  }

  // Group by category
  const grouped = new Map<string, SfDirectoryCompany[]>()
  for (const company of companies) {
    const cat = company.category || "Other"
    if (!grouped.has(cat)) grouped.set(cat, [])
    grouped.get(cat)!.push(company)
  }

  const sortedCategories = Array.from(grouped.keys()).sort(categorySort)
  const totalContacts = companies.reduce((sum, c) => sum + c.contacts.length, 0)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Project Team Directory</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {companies.length} {companies.length === 1 ? "company" : "companies"},{" "}
            {totalContacts} {totalContacts === 1 ? "contact" : "contacts"}
            {fetchedAt && (
              <span className="ml-2">
                &middot; Fetched {formatDate(fetchedAt)}
              </span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => fetchTeam(true)}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RefreshCw className="size-3.5" />
          )}
          Refresh
        </Button>
      </div>

      {/* Category sections */}
      {sortedCategories.map((category) => {
        const cats = grouped.get(category)!
        return (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-foreground">{category}</h4>
              <Badge variant="secondary" className="text-xs">
                {cats.length}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {cats.map((company, idx) => (
                <CompanyCard key={idx} company={company} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CompanyCard({ company }: { company: SfDirectoryCompany }) {
  const address = [company.address, company.city, company.state, company.zip]
    .filter(Boolean)
    .join(", ")

  return (
    <Card className="text-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start gap-2">
          <Building2 className="size-4 text-muted-foreground mt-0.5 shrink-0" />
          <CardTitle className="text-sm font-semibold leading-tight">
            {company.companyName || "Unknown Company"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-2">
        {address && (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3 mt-0.5 shrink-0" />
            <span>{address}</span>
          </div>
        )}
        {company.phone && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="size-3 shrink-0" />
            <span>{company.phone}</span>
          </div>
        )}

        {company.contacts.length > 0 && (
          <div className="border-t pt-2 mt-2 space-y-2">
            {company.contacts.map((contact, i) => (
              <div key={i} className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <User className="size-3 text-muted-foreground shrink-0" />
                  <span>{contact.name}</span>
                </div>
                {contact.title && (
                  <p className="text-xs text-muted-foreground pl-[18px]">
                    {contact.title}
                  </p>
                )}
                <div className="pl-[18px] space-y-0.5">
                  {contact.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="size-3 shrink-0" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Mail className="size-3 text-muted-foreground shrink-0" />
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-primary hover:underline truncate"
                      >
                        {contact.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
