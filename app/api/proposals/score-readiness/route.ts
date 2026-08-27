import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { checkAndDeductCredits } from "@/lib/credits/service"
import { generateJSONWithGemini } from "@/lib/gemini/client"
import { CREDIT_COSTS } from "@/types"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { proposalId, organizationId } = await request.json()

    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("organization_id", organizationId)
      .single()
    if (!membership) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const creditResult = await checkAndDeductCredits(
      organizationId,
      user.id,
      CREDIT_COSTS.READINESS_SCORE,
      "Proposal readiness scoring",
      "readiness_score",
      proposalId
    )
    if (!creditResult.success) {
      return NextResponse.json({ error: creditResult.error }, { status: 402 })
    }

    const admin = createAdminClient()
    const { data: proposal } = await admin
      .from("proposals")
      .select("*, opportunities(*)")
      .eq("id", proposalId)
      .single()

    if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const sections = [
      "executive_summary", "cover_letter", "technical_proposal",
      "methodology", "implementation_plan", "risk_management",
      "team_structure", "timeline", "pricing_schedule",
    ]
    const completed = sections.filter(s => proposal[s])
    const sectionCompletionPct = Math.round((completed.length / sections.length) * 100)

    const prompt = `Score this proposal for submission readiness.

Completed sections: ${completed.join(", ")}
Missing sections: ${sections.filter(s => !proposal[s]).join(", ")}
Section completion: ${sectionCompletionPct}%

Compliance checklist status: ${JSON.stringify(proposal.compliance_checklist || [])}
Missing items: ${JSON.stringify(proposal.missing_items || [])}

Return JSON:
{
  "overall_score": number (0-100),
  "eligibility_score": number (0-100),
  "requirements_score": number (0-100),
  "evidence_score": number (0-100),
  "quality_score": number (0-100),
  "compliance_score": number (0-100),
  "documents_score": number (0-100),
  "updated_missing_items": [
    { "severity": "critical|major|minor", "title": "title", "description": "what needs attention", "resolution": "how to fix" }
  ]
}`

    const scores = await generateJSONWithGemini<{
      overall_score: number
      eligibility_score: number
      requirements_score: number
      evidence_score: number
      quality_score: number
      compliance_score: number
      documents_score: number
      updated_missing_items: { severity: string; title: string; description: string; resolution?: string }[]
    }>(prompt)

    const clamp = (v: number) => Math.min(100, Math.max(0, v || 0))

    const newStatus = scores.overall_score >= 85 ? "ready" : scores.overall_score >= 60 ? "in_review" : "needs_input"

    await admin.from("proposals").update({
      readiness_score: clamp(scores.overall_score),
      eligibility_score: clamp(scores.eligibility_score),
      requirements_score: clamp(scores.requirements_score),
      evidence_score: clamp(scores.evidence_score),
      quality_score: clamp(scores.quality_score),
      compliance_score: clamp(scores.compliance_score),
      documents_score: clamp(scores.documents_score),
      missing_items: scores.updated_missing_items as unknown as Record<string, unknown>[],
      status: newStatus,
      updated_at: new Date().toISOString(),
    }).eq("id", proposalId)

    return NextResponse.json({ success: true, score: clamp(scores.overall_score) })
  } catch (err: unknown) {
    console.error("Readiness scoring error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Scoring failed" }, { status: 500 })
  }
}
