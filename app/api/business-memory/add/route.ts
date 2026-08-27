import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { organizationId, section, title, content, source_type } = await request.json()

    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("organization_id", organizationId)
      .single()
    if (!membership) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const admin = createAdminClient()

    const { data, error } = await admin.from("business_memory").insert({
      organization_id: organizationId,
      section,
      title,
      content,
      source_type: source_type || "manual",
      is_verified: true,
      created_by: user.id,
    }).select().single()

    if (error) throw error

    await admin.from("activity_logs").insert({
      organization_id: organizationId,
      user_id: user.id,
      action: "memory_added",
      entity_type: "business_memory",
      entity_id: data.id,
      description: `Added Business Memory: ${title} (${section})`,
    })

    return NextResponse.json({ success: true, id: data.id })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 })
  }
}
