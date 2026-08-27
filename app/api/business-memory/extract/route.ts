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

    const { organizationId, content } = await request.json()

    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("organization_id", organizationId)
      .single()
    if (!membership) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const creditResult = await checkAndDeductCredits(
      organizationId, user.id, CREDIT_COSTS.BUSINESS_MEMORY_EXTRACTION,
      "Business memory extraction", "business_memory_extraction"
    )
    if (!creditResult.success) return NextResponse.json({ error: creditResult.error }, { status: 402 })

    const prompt = `Extract structured business information from this document/text and organize it into Business Memory entries.

TEXT:
${content}

Extract as many relevant pieces of information as possible. Return a JSON array of memory entries:
[
  {
    "section": "one of: Company Overview|Services & Capabilities|Industries Served|Key Projects & Case Studies|Team & Expertise|Certifications & Accreditations|Geographic Presence|Technology & Tools|Pricing & Commercial|References & Testimonials|Previous Proposals|Policies & Compliance|Financial Capacity|Partnerships & Alliances",
    "title": "specific title for this piece of information",
    "content": "detailed content, 2-5 sentences"
  }
]

Only extract information that is actually present in the text. Do not fabricate.`

    const entries = await generateJSONWithGemini<{ section: string; title: string; content: string }[]>(prompt)

    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ success: true, count: 0 })
    }

    const admin = createAdminClient()
    await admin.from("business_memory").insert(
      entries.map(e => ({
        organization_id: organizationId,
        section: e.section,
        title: e.title,
        content: e.content,
        source_type: "extracted" as const,
        is_verified: false,
        created_by: user.id,
      }))
    )

    return NextResponse.json({ success: true, count: entries.length })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Extraction failed" }, { status: 500 })
  }
}
