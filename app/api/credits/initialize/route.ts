import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { initializeOrganizationCredits } from "@/lib/credits/service"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { organizationId } = await request.json()
    if (!organizationId) return NextResponse.json({ error: "Missing organizationId" }, { status: 400 })

    // Verify user belongs to this org
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("organization_id", organizationId)
      .single()

    if (!membership) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    await initializeOrganizationCredits(organizationId, "free")

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 })
  }
}
