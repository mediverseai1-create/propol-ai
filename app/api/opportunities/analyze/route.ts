import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { checkAndDeductCredits } from "@/lib/credits/service"
import { generateJSONWithGemini } from "@/lib/gemini/client"
import { CREDIT_COSTS } from "@/types"
import type { AIAnalysis, OpportunityRequirement } from "@/types"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { opportunityId, organizationId } = await request.json()

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
      CREDIT_COSTS.OPPORTUNITY_ANALYSIS,
      `Opportunity analysis`,
      "opportunity_analysis",
      opportunityId
    )
    if (!creditResult.success) {
      return NextResponse.json({ error: creditResult.error }, { status: 402 })
    }

    const admin = createAdminClient()

    const [oppRes, memoriesRes, orgRes] = await Promise.all([
      admin.from("opportunities").select("*").eq("id", opportunityId).single(),
      admin.from("business_memory").select("section, title, content").eq("organization_id", organizationId).limit(30),
      admin.from("organizations").select("name, industry, country, size, description").eq("id", organizationId).single(),
    ])

    if (!oppRes.data) return NextResponse.json({ error: "Opportunity not found" }, { status: 404 })

    const opp = oppRes.data
    const memories = memoriesRes.data || []
    const org = orgRes.data

    const memoryContext = memories.map(m => `${m.section}: ${m.title}\n${m.content}`).join("\n\n")

    const prompt = `You are PROPOL AI, an expert procurement intelligence system. Analyze this opportunity for the given company.

COMPANY PROFILE:
- Name: ${org?.name}
- Industry: ${org?.industry}
- Country: ${org?.country}
- Size: ${org?.size}
- Description: ${org?.description || "Not provided"}

BUSINESS MEMORY (capabilities, experience, certifications):
${memoryContext || "No detailed memory available yet"}

OPPORTUNITY TO ANALYZE:
- Title: ${opp.title}
- Description: ${opp.description || "No description"}
- Buyer: ${opp.buyer_name || "Unknown"} (${opp.buyer_type || "Unknown type"})
- Type: ${opp.opportunity_type || "Unknown"}
- Value: ${opp.value_min || 0} - ${opp.value_max || 0} ${opp.currency || "USD"}
- Location: ${opp.location || "Unknown"}
- Industry: ${opp.industry || "Unknown"}
- Deadline: ${opp.deadline || "Unknown"}

Provide a comprehensive analysis. Return JSON with this exact structure:
{
  "fit_score": number (0-100, honest assessment),
  "eligibility_score": number (0-100),
  "recommendation": "pursue" | "review" | "pass",
  "summary": "2-3 sentence honest assessment",
  "strengths": ["strength 1", "strength 2", ...],
  "weaknesses": ["weakness 1", "weakness 2", ...],
  "risks": ["risk 1", "risk 2", ...],
  "key_themes": ["theme 1", "theme 2", ...],
  "win_strategy": "paragraph describing how to win",
  "disqualifiers": ["any factors that could disqualify this company"],
  "missing_requirements": [
    {
      "id": "req_1",
      "title": "requirement name",
      "description": "what is required",
      "type": "mandatory" | "preferred",
      "status": "available" | "can_create" | "needs_input" | "external" | "missing",
      "evidence": "what evidence exists if available",
      "notes": "how to address this"
    }
  ]
}`

    const analysis = await generateJSONWithGemini<AIAnalysis>(prompt)

    // Clamp scores
    const fitScore = Math.min(100, Math.max(0, analysis.fit_score || 50))
    const eligibilityScore = Math.min(100, Math.max(0, analysis.eligibility_score || 50))

    const newStatus = fitScore >= 80 ? "recommended" : fitScore >= 60 ? "qualified" : "discovered"

    await admin.from("opportunities").update({
      fit_score: fitScore,
      eligibility_score: eligibilityScore,
      recommendation: analysis.recommendation,
      status: newStatus,
      ai_analysis: analysis as unknown as Record<string, unknown>,
      requirements: analysis.missing_requirements as unknown as Record<string, unknown>[],
      missing_requirements: analysis.missing_requirements?.filter(r => r.status !== "available") as unknown as Record<string, unknown>[],
      credits_used: (opp.credits_used || 0) + CREDIT_COSTS.OPPORTUNITY_ANALYSIS,
      analyzed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", opportunityId)

    await admin.from("activity_logs").insert({
      organization_id: organizationId,
      user_id: user.id,
      action: "opportunity_analyzed",
      entity_type: "opportunity",
      entity_id: opportunityId,
      description: `Analyzed opportunity: ${opp.title} — ${fitScore}% fit score`,
    })

    return NextResponse.json({ success: true, fitScore, recommendation: analysis.recommendation })
  } catch (err: unknown) {
    console.error("Analysis error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Analysis failed" }, { status: 500 })
  }
}
