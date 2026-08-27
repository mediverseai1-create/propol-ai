import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { organizationId, title, content, url } = await request.json()

    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("organization_id", organizationId)
      .single()
    if (!membership) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const admin = createAdminClient()

    const { data: opp, error } = await admin.from("opportunities").insert({
      organization_id: organizationId,
      title,
      description: content || null,
      source_url: url || null,
      source_name: url ? "User provided URL" : "User upload",
      status: "discovered",
      created_by: user.id,
    }).select().single()

    if (error) throw error

    await admin.from("activity_logs").insert({
      organization_id: organizationId,
      user_id: user.id,
      action: "opportunity_uploaded",
      entity_type: "opportunity",
      entity_id: opp.id,
      description: `Added opportunity: ${title}`,
    })

    return NextResponse.json({ opportunityId: opp.id })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Upload failed" }, { status: 500 })
  }
}
