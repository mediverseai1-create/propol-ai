import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OpportunityDetailClient } from "./opportunity-detail-client"

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single()

  if (!membership) redirect("/onboarding")

  const { data: opportunity } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", id)
    .eq("organization_id", membership.organization_id)
    .single()

  if (!opportunity) notFound()

  const { data: credits } = await supabase
    .from("credit_balances")
    .select("balance, monthly_allowance")
    .eq("organization_id", membership.organization_id)
    .single()

  const { data: proposals } = await supabase
    .from("proposals")
    .select("id, title, status, readiness_score, created_at")
    .eq("opportunity_id", id)
    .eq("organization_id", membership.organization_id)

  return (
    <OpportunityDetailClient
      opportunity={opportunity}
      proposals={proposals || []}
      organizationId={membership.organization_id}
      credits={credits}
      userId={user.id}
    />
  )
}
