"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft, Loader2, Zap, CheckCircle, AlertTriangle, XCircle,
  FileText, Eye, Send, RefreshCw
} from "lucide-react"
import { formatDate, getStatusColor } from "@/lib/utils"
import { CREDIT_COSTS } from "@/types"
import type { ReadinessReport, ReadinessIssue } from "@/types"

interface Props {
  proposal: Record<string, unknown>
  organizationId: string
  credits: { balance: number } | null
  userId: string
}

export function ProposalDetailClient({ proposal, organizationId, credits, userId }: Props) {
  const router = useRouter()
  const [generatingSection, setGeneratingSection] = useState<string | null>(null)
  const [scoringReadiness, setScoringReadiness] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  const p = proposal
  const opp = p.opportunities as Record<string, unknown> | null
  const readiness = p.readiness_score as number | null
  const missingItems = p.missing_items as { severity: string; title: string; description: string; resolution?: string }[] | null
  const complianceChecklist = p.compliance_checklist as { id: string; item: string; met: boolean; notes?: string }[] | null

  const sections = [
    { key: "executive_summary", label: "Executive Summary" },
    { key: "cover_letter", label: "Cover Letter" },
    { key: "technical_proposal", label: "Technical Proposal" },
    { key: "methodology", label: "Methodology" },
    { key: "implementation_plan", label: "Implementation Plan" },
    { key: "risk_management", label: "Risk Management" },
    { key: "team_structure", label: "Team Structure" },
    { key: "timeline", label: "Project Timeline" },
    { key: "pricing_schedule", label: "Pricing Schedule" },
  ]

  async function generateSection(sectionKey: string) {
    setGeneratingSection(sectionKey)
    setError(null)
    try {
      const res = await fetch("/api/proposals/generate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: p.id,
          organizationId,
          section: sectionKey,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Generation failed")
    } finally {
      setGeneratingSection(null)
    }
  }

  async function scoreReadiness() {
    setScoringReadiness(true)
    setError(null)
    try {
      const res = await fetch("/api/proposals/score-readiness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: p.id, organizationId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Scoring failed")
    } finally {
      setScoringReadiness(false)
    }
  }

  const completedSections = sections.filter(s => p[s.key])
  const completionPct = Math.round((completedSections.length / sections.length) * 100)

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <Link href="/proposals" className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> All proposals
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded border capitalize ${getStatusColor(p.status as string)}`}>
                {(p.status as string).replace(/_/g, " ")}
              </span>
            </div>
            <h1 className="text-xl font-semibold text-stone-900">{p.title as string}</h1>
            {opp && (
              <p className="text-sm text-stone-500 mt-0.5">
                For: {opp.title as string}
                {(opp.deadline as string | null) && ` · Due ${formatDate(opp.deadline as string)}`}
              </p>
            )}
          </div>

          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={scoreReadiness} disabled={scoringReadiness}>
              {scoringReadiness ? <><Loader2 className="h-4 w-4 animate-spin" />Scoring…</> : <><Eye className="h-4 w-4" />Score Readiness</>}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>
      )}

      {/* Readiness overview */}
      {readiness !== null && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Overall Readiness", value: readiness },
            { label: "Eligibility", value: p.eligibility_score as number || 0 },
            { label: "Requirements", value: p.requirements_score as number || 0 },
            { label: "Evidence", value: p.evidence_score as number || 0 },
          ].map((score) => (
            <Card key={score.label}>
              <CardContent className="p-4">
                <div className={`text-2xl font-bold ${score.value >= 80 ? "text-emerald-600" : score.value >= 60 ? "text-amber-600" : "text-red-500"}`}>
                  {score.value}%
                </div>
                <div className="text-xs text-stone-500 mt-0.5">{score.label}</div>
                <Progress value={score.value} className="mt-2 h-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="sections">
        <TabsList>
          <TabsTrigger value="sections">Proposal Sections ({completedSections.length}/{sections.length})</TabsTrigger>
          {missingItems && missingItems.length > 0 && (
            <TabsTrigger value="gaps">Gaps ({missingItems.length})</TabsTrigger>
          )}
          {complianceChecklist && complianceChecklist.length > 0 && (
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="sections" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-500">{completionPct}% of proposal sections completed</p>
            <Progress value={completionPct} className="w-32 h-1.5" />
          </div>

          {sections.map((section) => {
            const content = p[section.key] as string | null
            const isGenerating = generatingSection === section.key
            const isEditing = editingSection === section.key

            return (
              <Card key={section.key}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {content ? (
                        <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-stone-300 shrink-0" />
                      )}
                      {section.label}
                    </CardTitle>
                    <div className="flex gap-1.5">
                      {content && !isEditing && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => { setEditingSection(section.key); setEditContent(content) }}
                        >
                          Edit
                        </Button>
                      )}
                      {isEditing && (
                        <>
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditingSection(null)}>
                            Cancel
                          </Button>
                          <Button size="sm" className="h-7 text-xs" onClick={async () => {
                            const res = await fetch("/api/proposals/update-section", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ proposalId: p.id, section: section.key, content: editContent }),
                            })
                            if (res.ok) { setEditingSection(null); router.refresh() }
                          }}>
                            Save
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant={content ? "outline" : "default"}
                        className="h-7 text-xs"
                        onClick={() => generateSection(section.key)}
                        disabled={isGenerating || (credits?.balance || 0) < CREDIT_COSTS.PROPOSAL_SECTION}
                      >
                        {isGenerating ? (
                          <><Loader2 className="h-3 w-3 animate-spin" />Generating…</>
                        ) : content ? (
                          <><RefreshCw className="h-3 w-3" />Regenerate</>
                        ) : (
                          <><Zap className="h-3 w-3" />Generate ({CREDIT_COSTS.PROPOSAL_SECTION} cr)</>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {(content || isEditing) && (
                  <CardContent className="pt-0">
                    {isEditing ? (
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={8}
                        className="text-sm"
                      />
                    ) : (
                      <div className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto scrollbar-thin">
                        {content}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )
          })}
        </TabsContent>

        {missingItems && missingItems.length > 0 && (
          <TabsContent value="gaps" className="mt-4 space-y-2">
            {missingItems.map((item, i) => (
              <Card key={i} className={item.severity === "critical" ? "border-red-200" : item.severity === "major" ? "border-orange-200" : ""}>
                <CardContent className="p-4 flex items-start gap-3">
                  {item.severity === "critical" ? <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" /> :
                   item.severity === "major" ? <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" /> :
                   <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />}
                  <div>
                    <p className="text-sm font-medium text-stone-800">{item.title}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{item.description}</p>
                    {item.resolution && (
                      <p className="text-xs text-amber-800 mt-1 font-medium">{item.resolution}</p>
                    )}
                  </div>
                  <Badge className="ml-auto shrink-0" variant={item.severity === "critical" ? "destructive" : "warning"}>
                    {item.severity}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        )}

        {complianceChecklist && complianceChecklist.length > 0 && (
          <TabsContent value="compliance" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-stone-100">
                  {complianceChecklist.map((item, i) => (
                    <div key={i} className="p-3 flex items-start gap-3">
                      {item.met ? (
                        <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-stone-800">{item.item}</p>
                        {item.notes && <p className="text-xs text-stone-400 mt-0.5">{item.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
