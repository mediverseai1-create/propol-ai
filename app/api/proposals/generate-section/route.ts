import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { checkAndDeductCredits } from "@/lib/credits/service"
import { generateWithGemini } from "@/lib/gemini/client"
import { CREDIT_COSTS } from "@/types"

const SECTION_PROMPTS: Record<string, string> = {
  executive_summary: "Write a compelling executive summary for this proposal. It should be 3-4 paragraphs that immediately capture the buyer's attention, state the problem you solve, your approach, and your unique value proposition.",
  cover_letter: "Write a professional cover letter for this proposal submission. Address it to the buyer, express genuine interest, highlight the company's most relevant qualifications, and close with a call to action.",
  technical_proposal: "Write a comprehensive technical proposal section describing how the company will address the opportunity's technical requirements. Include your approach, methodology overview, and technical capabilities.",
  methodology: "Write a detailed methodology section explaining the company's approach to delivering this contract/project. Include specific steps, processes, quality controls, and how you ensure successful delivery.",
  implementation_plan: "Write a detailed implementation plan for this project. Include phases, key milestones, deliverables, and resource allocation. Make it specific and realistic.",
  risk_management: "Write a professional risk management section identifying potential risks and mitigation strategies for this project/contract.",
  team_structure: "Write a team structure section introducing the key team members and their roles for this opportunity. Emphasize relevant experience.",
  timeline: "Write a detailed project timeline section with phases, milestones, and key deliverables. Format it as a clear, professional timeline description.",
  pricing_schedule: "Write a pricing schedule overview explaining the company's pricing approach, value for money, and payment schedule. Note: This section should explain the pricing methodology without fabricating specific prices.",
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { proposalId, organizationId, section } = await request.json()

    if (!SECTION_PROMPTS[section]) {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 })
    }

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
      CREDIT_COSTS.PROPOSAL_SECTION,
      `Generate proposal section: ${section.replace(/_/g, " ")}`,
      "proposal_section",
      proposalId
    )
    if (!creditResult.success) {
      return NextResponse.json({ error: creditResult.error }, { status: 402 })
    }

    const admin = createAdminClient()
    const [proposalRes, memoriesRes] = await Promise.all([
      admin.from("proposals").select("*, opportunities(*)").eq("id", proposalId).single(),
      admin.from("business_memory").select("section, title, content").eq("organization_id", organizationId).limit(25),
    ])

    if (!proposalRes.data) return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    const proposal = proposalRes.data
    const opp = proposal.opportunities as Record<string, unknown> | null
    const memories = memoriesRes.data || []
    const memContext = memories.map(m => `${m.section}: ${m.title}\n${m.content}`).join("\n\n")

    const prompt = `You are PROPOL AI writing a professional proposal section.

OPPORTUNITY: ${opp?.title || "Business opportunity"}
Buyer: ${opp?.buyer_name || "Buyer"}
Type: ${opp?.opportunity_type || "Contract"}
Value: ${opp?.value_max || "Undisclosed"}

COMPANY BUSINESS MEMORY:
${memContext || "Professional services company with relevant experience"}

WIN STRATEGY:
${proposal.strategy || "Deliver exceptional value and quality"}

KEY THEMES:
${Array.isArray(proposal.strong_themes) ? (proposal.strong_themes as string[]).join(", ") : "Quality, Experience, Value"}

SECTION TO WRITE: ${section.replace(/_/g, " ").toUpperCase()}

INSTRUCTIONS: ${SECTION_PROMPTS[section]}

Write in a professional, confident tone. Use specific details from the company's Business Memory where available. Write in first person plural (we/our). The content should be submission-ready. Do not include section headings — write the content only.`

    const content = await generateWithGemini(prompt)

    await admin.from("proposals").update({
      [section]: content,
      updated_at: new Date().toISOString(),
    }).eq("id", proposalId)

    return NextResponse.json({ success: true, content })
  } catch (err: unknown) {
    console.error("Section generation error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Generation failed" }, { status: 500 })
  }
}
