import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const VALID_SECTIONS = [
  "executive_summary", "cover_letter", "technical_proposal", "methodology",
  "implementation_plan", "risk_management", "team_structure", "timeline", "pricing_schedule",
]

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { proposalId, section, content } = await request.json()

    if (!VALID_SECTIONS.includes(section)) {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data: proposal } = await admin
      .from("proposals")
      .select("organization_id")
      .eq("id", proposalId)
      .single()

    if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("organization_id", proposal.organization_id)
      .single()
    if (!membership) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    await admin.from("proposals").update({
      [section]: content,
      updated_at: new Date().toISOString(),
    }).eq("id", proposalId)

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 })
  }
}
