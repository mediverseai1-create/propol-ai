import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { slugify } from "@/lib/utils"
import { initializeOrganizationCredits } from "@/lib/credits/service"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { profile, company } = body

    const admin = createAdminClient()

    // Upsert profile
    const { error: profileError } = await admin.from("profiles").upsert({
      id: user.id,
      email: user.email!,
      full_name: profile.full_name,
      job_title: profile.job_title,
      phone: profile.phone || null,
      updated_at: new Date().toISOString(),
    })
    if (profileError) return NextResponse.json({ error: "Profile: " + profileError.message }, { status: 500 })

    // Create organization
    const slug = slugify(company.name) + "-" + Math.random().toString(36).slice(2, 6)
    const { data: org, error: orgError } = await admin.from("organizations").insert({
      name: company.name,
      slug,
      industry: company.industry || null,
      country: company.country || null,
      size: company.size || null,
      website: company.website || null,
      description: company.description || null,
      owner_id: user.id,
      subscription_plan: "free",
      subscription_status: "active",
    }).select().single()

    if (orgError) return NextResponse.json({ error: "Organization: " + orgError.message }, { status: 500 })

    // Add owner as member
    const { error: memberError } = await admin.from("organization_members").insert({
      organization_id: org.id,
      user_id: user.id,
      role: "owner",
      status: "active",
      joined_at: new Date().toISOString(),
    })
    if (memberError) return NextResponse.json({ error: "Member: " + memberError.message }, { status: 500 })

    // Initialize credits
    await initializeOrganizationCredits(org.id, "free")

    return NextResponse.json({ success: true, organizationId: org.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
