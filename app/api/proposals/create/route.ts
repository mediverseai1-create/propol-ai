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
      CREDIT_COSTS.PROPOSAL_DRAFT,
      "Initial proposal setup and gap analysis",
      "proposal_draft",
      opportunityId
    )
    if (!creditResult.success) {
      return NextResponse.json({ error: creditResult.error }, { status: 402 })
    }

    const admin = createAdminClient()

    const [oppRes, memoriesRes] = await Promise.all([
      admin.from("opportunities").select("*").eq("id", opportunityId).single(),
      admin.from("business_memory").select("section, title, content").eq("organization_id", organizationId).limit(30),
    ])

    if (!oppRes.data) return NextResponse.json({ error: "Opportunity not found" }, { status: 404 })
    const opp = oppRes.data
    const memories = memoriesRes.data || []
    const memContext = memories.map(m => `${m.section}: ${m.title}\n${m.content}`).join("\n\n")

    // Generate initial proposal structure and compliance checklist
    const prompt = `You are PROPOL AI. Create an initial proposal structure for this opportunity.

OPPORTUNITY: ${opp.title}
Description: ${opp.description}
Buyer: ${opp.buyer_name}
Type: ${opp.opportunity_type}
Value: ${opp.value_max}

COMPANY CAPABILITIES:
${memContext || "Standard professional services company"}

Generate the initial proposal framework. Return JSON:
{
  "strategy": "2-3 paragraph win strategy",
  "strong_themes": ["theme 1", "theme 2", "theme 3"],
  "compliance_checklist": [
    { "id": "c1", "item": "compliance item", "met": true/false, "notes": "any notes" }
  ],
  "missing_items": [
    { "severity": "critical|major|minor", "title": "item title", "description": "what is missing", "resolution": "how to resolve" }
  ]
}`

    const framework = await generateJSONWithGemini<{
      strategy: string
      strong_themes: string[]
      compliance_checklist: { id: string; item: string; met: boolean; notes?: string }[]
      missing_items: { severity: string; title: string; description: string; resolution?: string }[]
    }>(prompt)

    const { data: proposal, error } = await admin.from("proposals").insert({
      organization_id: organizationId,
      opportunity_id: opportunityId,
      title: `Proposal: ${opp.title}`,
      status: "drafting",
      strategy: framework.strategy,
      strong_themes: framework.strong_themes as unknown as Record<string, unknown>[],
      compliance_checklist: framework.compliance_checklist as unknown as Record<string, unknown>[],
      missing_items: framework.missing_items as unknown as Record<string, unknown>[],
      credits_used: CREDIT_COSTS.PROPOSAL_DRAFT,
      created_by: user.id,
    }).select().single()

    if (error) throw error

    // Update opportunity status
    await admin.from("opportunities").update({
      status: "preparing",
      updated_at: new Date().toISOString(),
    }).eq("id", opportunityId)

    await admin.from("activity_logs").insert({
      organization_id: organizationId,
      user_id: user.id,
      action: "proposal_created",
      entity_type: "proposal",
      entity_id: proposal.id,
      description: `Started proposal for: ${opp.title}`,
    })

    return NextResponse.json({ proposalId: proposal.id })
  } catch (err: unknown) {
    console.error("Proposal creation error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 })
  }
}
