"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft, Loader2, Zap, FileText, Clock, Building2, Globe,
  CheckCircle, AlertTriangle, XCircle, Info, ExternalLink, Plus
} from "lucide-react"
import { formatDate, formatCurrency, getFitScoreBg, getStatusColor } from "@/lib/utils"
import { CREDIT_COSTS } from "@/types"
import type { AIAnalysis, OpportunityRequirement } from "@/types"

interface Proposal {
  id: string
  title: string
  status: string
  readiness_score: number | null
  created_at: string
}

interface Props {
  opportunity: Record<string, unknown>
  proposals: Proposal[]
  organizationId: string
  credits: { balance: number; monthly_allowance: number } | null
  userId: string
}

export function OpportunityDetailClient({ opportunity, proposals, organizationId, credits, userId }: Props) {
  const router = useRouter()
  const [analyzing, setAnalyzing] = useState(false)
  const [preparingProposal, setPreparingProposal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const opp = opportunity
  const analysis = opp.ai_analysis as AIAnalysis | null
  const requirements = opp.requirements as OpportunityRequirement[] | null
  const hasEnoughForAnalysis = (credits?.balance || 0) >= CREDIT_COSTS.OPPORTUNITY_ANALYSIS
  const hasEnoughForProposal = (credits?.balance || 0) >= CREDIT_COSTS.PROPOSAL_DRAFT

  async function handleAnalyze() {
    setAnalyzing(true)
    setError(null)
    try {
      const res = await fetch("/api/opportunities/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: opp.id, organizationId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed")
    } finally {
      setAnalyzing(false)
    }
  }

  async function handlePrepareProposal() {
    setPreparingProposal(true)
    setError(null)
    try {
      const res = await fetch("/api/proposals/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: opp.id as string, organizationId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/proposals/${data.proposalId}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to start proposal")
    } finally {
      setPreparingProposal(false)
    }
  }

  const fitScore = opp.fit_score as number | null
  const recommendation = opp.recommendation as string | null
  const status = opp.status as string
  const deadline = opp.deadline as string | null
  const valueMax = opp.value_max as number | null
  const currency = opp.currency as string | null
  const buyerName = opp.buyer_name as string | null
  const location = opp.location as string | null
  const sourceUrl = opp.source_url as string | null

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {/* Back + header */}
      <div>
        <Link href="/opportunities" className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> All opportunities
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {fitScore !== null && (
                <span className={`text-sm font-semibold px-2.5 py-1 rounded border ${getFitScoreBg(fitScore)}`}>
                  {fitScore}% match
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded border capitalize ${getStatusColor(status)}`}>
                {status.replace(/_/g, " ")}
              </span>
              {recommendation && (
                <span className={`text-xs px-2 py-0.5 rounded border ${
                  recommendation === "pursue" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  recommendation === "review" ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-stone-50 text-stone-500 border-stone-200"
                }`}>
                  {recommendation === "pursue" ? "✓ Pursue" : recommendation === "review" ? "⚠ Review" : "✕ Pass"}
                </span>
              )}
            </div>
            <h1 className="text-xl font-semibold text-stone-900">{opp.title as string}</h1>

            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-stone-500">
              {buyerName && <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" />{buyerName}</span>}
              {location && <span className="flex items-center gap-1.5"><Globe className="h-4 w-4" />{location}</span>}
              {deadline && <span className="flex items-center gap-1.5 text-red-600"><Clock className="h-4 w-4" />Due {formatDate(deadline)}</span>}
              {valueMax && <span className="font-medium text-stone-700">{currency || "$"}{valueMax >= 1000000 ? `${(valueMax/1000000).toFixed(1)}M` : `${(valueMax/1000).toFixed(0)}K`}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            {!analysis && (
              <Button onClick={handleAnalyze} disabled={analyzing || !hasEnoughForAnalysis} size="sm">
                {analyzing ? <><Loader2 className="h-4 w-4 animate-spin" />Analyzing…</> : <><Zap className="h-4 w-4" />Analyze Fit ({CREDIT_COSTS.OPPORTUNITY_ANALYSIS} credits)</>}
              </Button>
            )}
            {analysis && proposals.length === 0 && (
              <Button onClick={handlePrepareProposal} disabled={preparingProposal || !hasEnoughForProposal} size="sm">
                {preparingProposal ? <><Loader2 className="h-4 w-4 animate-spin" />Preparing…</> : <><FileText className="h-4 w-4" />Prepare with PROPOL ({CREDIT_COSTS.PROPOSAL_DRAFT} credits)</>}
              </Button>
            )}
            {proposals.length > 0 && (
              <Link href={`/proposals/${proposals[0].id}`}>
                <Button size="sm" variant="outline" className="w-full">
                  <FileText className="h-4 w-4" /> Open Proposal
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {error} {!hasEnoughForAnalysis && <Link href="/credits" className="underline font-medium">Upgrade plan</Link>}
        </div>
      )}

      <Tabs defaultValue={analysis ? "analysis" : "overview"}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {analysis && <TabsTrigger value="analysis">AI Analysis</TabsTrigger>}
          {requirements && requirements.length > 0 && <TabsTrigger value="requirements">Requirements</TabsTrigger>}
          {proposals.length > 0 && <TabsTrigger value="proposals">Proposals</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Opportunity Details</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Type", value: opp.opportunity_type as string | null },
                  { label: "Buyer", value: opp.buyer_name as string | null },
                  { label: "Industry", value: opp.industry as string | null },
                  { label: "Location", value: opp.location as string | null },
                  { label: "Published", value: opp.published_date ? formatDate(opp.published_date as string) : null },
                  { label: "Deadline", value: deadline ? formatDate(deadline) : null },
                  { label: "Source", value: opp.source_name as string | null },
                ].filter(f => f.value).map((f) => (
                  <div key={f.label} className="flex justify-between text-sm">
                    <span className="text-stone-500">{f.label}</span>
                    <span className="text-stone-800 font-medium">{f.value}</span>
                  </div>
                ))}
                {sourceUrl && (
                  <a href={sourceUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-amber-800 hover:underline">
                    <ExternalLink className="h-3 w-3" /> View original source
                  </a>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Description</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">
                  {(opp.description as string | null) || "No description available. Run AI analysis to extract details from the opportunity document."}
                </p>
              </CardContent>
            </Card>
          </div>

          {!analysis && (
            <Card className="border-dashed border-amber-200 bg-amber-50/50">
              <CardContent className="py-8 text-center space-y-3">
                <Zap className="h-8 w-8 text-amber-600 mx-auto" />
                <p className="text-sm font-medium text-stone-800">Run AI analysis to evaluate this opportunity</p>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  PROPOL will analyze your fit, evaluate requirements, identify missing elements, and recommend whether to pursue.
                </p>
                <Button onClick={handleAnalyze} disabled={analyzing || !hasEnoughForAnalysis} size="sm">
                  {analyzing ? <><Loader2 className="h-4 w-4 animate-spin" />Analyzing…</> : `Analyze Fit (${CREDIT_COSTS.OPPORTUNITY_ANALYSIS} credits)`}
                </Button>
                {!hasEnoughForAnalysis && (
                  <p className="text-xs text-red-600">Insufficient credits. <Link href="/credits" className="underline">Upgrade</Link></p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {analysis && (
          <TabsContent value="analysis" className="mt-4 space-y-4">
            {/* Scores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Fit Score", value: fitScore || 0 },
                { label: "Eligibility", value: analysis.eligibility_score || 0 },
              ].map((score) => (
                <Card key={score.label}>
                  <CardContent className="p-4 text-center">
                    <div className={`text-2xl font-bold ${score.value >= 80 ? "text-emerald-600" : score.value >= 60 ? "text-amber-600" : "text-red-500"}`}>
                      {score.value}%
                    </div>
                    <div className="text-xs text-stone-500 mt-1">{score.label}</div>
                    <Progress value={score.value} className="mt-2 h-1.5" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">AI Summary</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-stone-700 leading-relaxed">{analysis.summary}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.strengths?.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600" /> Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5">
                      {analysis.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-stone-700 flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {analysis.weaknesses?.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" /> Gaps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5">
                      {analysis.weaknesses.map((w, i) => (
                        <li key={i} className="text-sm text-stone-700 flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span> {w}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {analysis.win_strategy && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Win Strategy</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-stone-700 leading-relaxed">{analysis.win_strategy}</p>
                </CardContent>
              </Card>
            )}

            {analysis.disqualifiers?.length > 0 && (
              <Card className="border-red-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                    <XCircle className="h-4 w-4" /> Potential Disqualifiers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {analysis.disqualifiers.map((d, i) => (
                      <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                        <span className="mt-0.5">•</span> {d}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {requirements && requirements.length > 0 && (
          <TabsContent value="requirements" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-stone-100">
                  {requirements.map((req, i) => (
                    <div key={i} className="p-4 flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        {req.status === "available" ? <CheckCircle className="h-4 w-4 text-emerald-600" /> :
                         req.status === "can_create" ? <Zap className="h-4 w-4 text-amber-600" /> :
                         req.status === "needs_input" ? <AlertTriangle className="h-4 w-4 text-orange-600" /> :
                         req.status === "external" ? <XCircle className="h-4 w-4 text-red-500" /> :
                         <Info className="h-4 w-4 text-stone-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-stone-800">{req.title}</span>
                          {req.type === "mandatory" && (
                            <span className="text-xs px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded">Required</span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">{req.description}</p>
                        {req.evidence && (
                          <p className="text-xs text-emerald-700 mt-0.5 italic">{req.evidence}</p>
                        )}
                      </div>
                      <Badge variant={
                        req.status === "available" ? "success" :
                        req.status === "can_create" ? "warning" :
                        req.status === "needs_input" ? "warning" :
                        req.status === "external" ? "destructive" : "secondary"
                      }>
                        {req.status === "available" ? "Available" :
                         req.status === "can_create" ? "Can Create" :
                         req.status === "needs_input" ? "Needs Input" :
                         req.status === "external" ? "External" : "Missing"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {proposals.length > 0 && (
          <TabsContent value="proposals" className="mt-4 space-y-2">
            {proposals.map((p) => (
              <Link key={p.id} href={`/proposals/${p.id}`}>
                <Card className="hover:border-amber-300 cursor-pointer transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-stone-900">{p.title}</p>
                      <p className="text-xs text-stone-400 mt-0.5 capitalize">{p.status.replace(/_/g, " ")}</p>
                    </div>
                    {p.readiness_score !== null && (
                      <span className={`text-sm font-semibold ${p.readiness_score >= 80 ? "text-emerald-600" : "text-amber-600"}`}>
                        {p.readiness_score}% ready
                      </span>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
