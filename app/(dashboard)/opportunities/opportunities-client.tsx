"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import {
  Search, Plus, Upload, Filter, Clock, Building2, Zap, Loader2,
  ArrowRight, Target, CheckCircle, AlertTriangle,
} from "lucide-react"
import { formatDate, getFitScoreBg, getStatusColor } from "@/lib/utils"
import { CREDIT_COSTS } from "@/types"

interface Opportunity {
  id: string
  title: string
  buyer_name: string | null
  buyer_type: string | null
  opportunity_type: string | null
  value_max: number | null
  currency: string | null
  deadline: string | null
  location: string | null
  fit_score: number | null
  recommendation: string | null
  status: string
  industry: string | null
  source_name: string | null
  created_at: string
}

interface Props {
  opportunities: Opportunity[]
  organizationId: string
  orgProfile: { name: string; subscription_plan: string; industry: string | null; country: string | null } | null
  credits: { balance: number; monthly_allowance: number } | null
  userId: string
}

const STATUS_LABELS: Record<string, string> = {
  all: "All",
  discovered: "Discovered",
  qualified: "Qualified",
  recommended: "Recommended",
  preparing: "Preparing",
  needs_input: "Needs Input",
  ready_to_submit: "Ready to Submit",
  submitted: "Submitted",
  won: "Won",
  lost: "Lost",
}

export function OpportunitiesClient({ opportunities, organizationId, orgProfile, credits, userId }: Props) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showDiscover, setShowDiscover] = useState(false)
  const [discoverCount, setDiscoverCount] = useState<10 | 25 | 50 | 100>(25)
  const [discovering, setDiscovering] = useState(false)
  const [discoverError, setDiscoverError] = useState<string | null>(null)

  const filtered = opportunities.filter((opp) => {
    const matchSearch =
      !search ||
      opp.title.toLowerCase().includes(search.toLowerCase()) ||
      opp.buyer_name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || opp.status === statusFilter
    return matchSearch && matchStatus
  })

  async function handleDiscover() {
    setDiscovering(true)
    setDiscoverError(null)
    try {
      const res = await fetch("/api/opportunities/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          count: discoverCount,
          industry: orgProfile?.industry,
          country: orgProfile?.country,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Discovery failed")
      setShowDiscover(false)
      window.location.reload()
    } catch (err: unknown) {
      setDiscoverError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setDiscovering(false)
    }
  }

  const creditCostPerBatch = discoverCount * CREDIT_COSTS.OPPORTUNITY_DISCOVERY
  const hasEnoughCredits = (credits?.balance || 0) >= creditCostPerBatch

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Opportunities</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {opportunities.length} total · Discover, evaluate, and pursue relevant opportunities.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href="/opportunities/upload">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4" />
              Upload RFP
            </Button>
          </Link>
          <Button size="sm" onClick={() => setShowDiscover(true)}>
            <Search className="h-4 w-4" />
            Find Opportunities
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Search opportunities…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-stone-400">{filtered.length} results</span>
      </div>

      {/* Opportunities list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-3">
            <Search className="h-10 w-10 text-stone-200 mx-auto" />
            <p className="text-sm font-medium text-stone-700">
              {opportunities.length === 0 ? "No opportunities yet" : "No results found"}
            </p>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              {opportunities.length === 0
                ? "Find relevant opportunities matched to your company profile, or upload an RFP you already have."
                : "Try adjusting your search or filters."}
            </p>
            {opportunities.length === 0 && (
              <Button size="sm" className="mt-2" onClick={() => setShowDiscover(true)}>
                <Search className="h-4 w-4" />
                Find Opportunities for Me
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((opp) => (
            <Link key={opp.id} href={`/opportunities/${opp.id}`}>
              <Card className="hover:border-amber-300 transition-colors cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        {opp.fit_score !== null && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${getFitScoreBg(opp.fit_score)}`}>
                            {opp.fit_score}% match
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded border capitalize ${getStatusColor(opp.status)}`}>
                          {opp.status.replace(/_/g, " ")}
                        </span>
                        {opp.recommendation && (
                          <span className={`text-xs px-2 py-0.5 rounded border ${
                            opp.recommendation === "pursue"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : opp.recommendation === "review"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-stone-50 text-stone-500 border-stone-200"
                          }`}>
                            {opp.recommendation === "pursue" ? "✓ Pursue" : opp.recommendation === "review" ? "⚠ Review" : "✕ Pass"}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-medium text-stone-900 group-hover:text-amber-900 transition-colors line-clamp-1">
                        {opp.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        {opp.buyer_name && (
                          <span className="text-xs text-stone-500 flex items-center gap-1">
                            <Building2 className="h-3 w-3" /> {opp.buyer_name}
                          </span>
                        )}
                        {opp.location && (
                          <span className="text-xs text-stone-400">{opp.location}</span>
                        )}
                        {opp.opportunity_type && (
                          <span className="text-xs text-stone-400">{opp.opportunity_type}</span>
                        )}
                        {opp.source_name && (
                          <span className="text-xs text-stone-400">via {opp.source_name}</span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-right space-y-1">
                      {opp.value_max && (
                        <div className="text-sm font-semibold text-stone-800">
                          {opp.currency || "$"}{opp.value_max >= 1000000
                            ? `${(opp.value_max / 1000000).toFixed(1)}M`
                            : `${(opp.value_max / 1000).toFixed(0)}K`}
                        </div>
                      )}
                      {opp.deadline && (
                        <div className="text-xs text-stone-400 flex items-center justify-end gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(opp.deadline)}
                        </div>
                      )}
                      <ArrowRight className="h-4 w-4 text-stone-300 group-hover:text-amber-700 transition-colors ml-auto" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Discover dialog */}
      <Dialog open={showDiscover} onOpenChange={setShowDiscover}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Find Opportunities for Me</DialogTitle>
            <DialogDescription>
              PROPOL AI will search for relevant opportunities matched to {orgProfile?.name || "your company"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-stone-700 mb-2 block">
                How many opportunities should we find?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {([10, 25, 50, 100] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => setDiscoverCount(n)}
                    className={`py-2.5 text-sm font-medium rounded border transition-colors ${
                      discoverCount === n
                        ? "bg-amber-900 text-white border-amber-900"
                        : "bg-white text-stone-700 border-stone-300 hover:border-amber-400"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-stone-50 border border-stone-200 p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600">Credit cost</span>
                <span className="font-medium text-stone-800">{creditCostPerBatch} credits</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600">Your balance</span>
                <span className={`font-medium ${hasEnoughCredits ? "text-emerald-700" : "text-red-600"}`}>
                  {credits?.balance?.toLocaleString() || 0} credits
                </span>
              </div>
            </div>

            {!hasEnoughCredits && (
              <div className="flex items-start gap-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded p-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                Insufficient credits. Please upgrade your plan or reduce the discovery count.
              </div>
            )}

            {discoverError && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2.5">
                {discoverError}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setShowDiscover(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleDiscover}
                disabled={discovering || !hasEnoughCredits}
              >
                {discovering ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Discovering…</>
                ) : (
                  <><Zap className="h-4 w-4" /> Find {discoverCount} Opportunities</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
