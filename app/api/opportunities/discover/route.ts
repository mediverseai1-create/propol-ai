import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkAndDeductCredits } from "@/lib/credits/service"
import { generateJSONWithGemini } from "@/lib/gemini/client"
import { CREDIT_COSTS } from "@/types"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { organizationId, count, industry, country } = await request.json()

    // Verify membership
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("organization_id", organizationId)
      .single()
    if (!membership) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const validCount = [10, 25, 50, 100].includes(count) ? count : 25
    const creditCost = validCount * CREDIT_COSTS.OPPORTUNITY_DISCOVERY

    // Deduct credits
    const creditResult = await checkAndDeductCredits(
      organizationId,
      user.id,
      creditCost,
      `Opportunity discovery: ${validCount} opportunities`,
      "opportunity_discovery"
    )

    if (!creditResult.success) {
      return NextResponse.json({ error: creditResult.error }, { status: 402 })
    }

    // Get business memory context
    const admin = createAdminClient()
    const { data: memories } = await admin
      .from("business_memory")
      .select("section, title, content")
      .eq("organization_id", organizationId)
      .limit(20)

    const memoryContext = memories?.map(m => `${m.section}: ${m.title} — ${m.content}`).join("\n") || ""

    const { data: orgData } = await admin
      .from("organizations")
      .select("name, industry, country, description, size")
      .eq("id", organizationId)
      .single()

    const prompt = `You are a procurement intelligence assistant. Generate ${validCount} realistic, diverse business opportunity listings that would be relevant for this company.

Company Profile:
- Name: ${orgData?.name || "The company"}
- Industry: ${orgData?.industry || industry || "Technology & Services"}
- Country: ${orgData?.country || country || "United States"}
- Size: ${orgData?.size || "Medium"}
- Description: ${orgData?.description || ""}

Business Memory (what they do and their capabilities):
${memoryContext || "General business services company"}

Generate ${validCount} opportunities. They should be diverse in type (government contracts, private RFPs, grants, enterprise contracts, NGO projects) and realistic. Mix opportunity values from small ($50K) to large ($5M+). Include a variety of industries and buyers.

Return a JSON array of exactly ${validCount} objects. Each object must have:
{
  "title": "specific opportunity title",
  "description": "2-3 sentence description",
  "buyer_name": "buyer organization name",
  "buyer_type": "government|private|ngo|international",
  "opportunity_type": "RFP|RFQ|Tender|Grant|Contract|ITB",
  "value_min": number (USD),
  "value_max": number (USD),
  "currency": "USD",
  "deadline": "YYYY-MM-DD (between 2 weeks and 4 months from today: ${new Date().toISOString().split('T')[0]})",
  "location": "City, State/Country",
  "country": "country name",
  "industry": "industry name",
  "source_name": "source portal name",
  "fit_score": number (0-100, based on how well this company would fit),
  "eligibility_score": number (0-100),
  "recommendation": "pursue|review|pass"
}`

    const discovered = await generateJSONWithGemini<Record<string, unknown>[]>(prompt)

    if (!Array.isArray(discovered)) {
      throw new Error("Invalid AI response format")
    }

    // Insert opportunities
    const toInsert = discovered.slice(0, validCount).map((opp) => ({
      organization_id: organizationId,
      title: String(opp.title || "Untitled Opportunity"),
      description: String(opp.description || ""),
      buyer_name: opp.buyer_name ? String(opp.buyer_name) : null,
      buyer_type: opp.buyer_type ? String(opp.buyer_type) : null,
      opportunity_type: opp.opportunity_type ? String(opp.opportunity_type) : null,
      value_min: typeof opp.value_min === "number" ? opp.value_min : null,
      value_max: typeof opp.value_max === "number" ? opp.value_max : null,
      currency: opp.currency ? String(opp.currency) : "USD",
      deadline: opp.deadline ? String(opp.deadline) : null,
      location: opp.location ? String(opp.location) : null,
      country: opp.country ? String(opp.country) : null,
      industry: opp.industry ? String(opp.industry) : null,
      source_name: opp.source_name ? String(opp.source_name) : "PROPOL Discovery",
      fit_score: typeof opp.fit_score === "number" ? Math.min(100, Math.max(0, opp.fit_score)) : null,
      eligibility_score: typeof opp.eligibility_score === "number" ? Math.min(100, Math.max(0, opp.eligibility_score)) : null,
      recommendation: ["pursue", "review", "pass"].includes(String(opp.recommendation)) ? opp.recommendation as "pursue" | "review" | "pass" : null,
      status: "discovered" as const,
      created_by: user.id,
      analyzed_at: new Date().toISOString(),
    }))

    const { error: insertError } = await admin.from("opportunities").insert(toInsert)
    if (insertError) throw insertError

    // Log activity
    await admin.from("activity_logs").insert({
      organization_id: organizationId,
      user_id: user.id,
      action: "opportunity_discovery",
      entity_type: "opportunity",
      description: `Discovered ${toInsert.length} new opportunities via PROPOL AI`,
    })

    return NextResponse.json({ success: true, count: toInsert.length })
  } catch (err: unknown) {
    console.error("Discovery error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Discovery failed" }, { status: 500 })
  }
}
