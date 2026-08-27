import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AnalyticsClient } from "./analytics-client"

export const metadata = { title: "Analytics" }

export default async function AnalyticsPage() {
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

  const orgId = membership.organization_id

  const [opportunitiesRes, proposalsRes, transactionsRes] = await Promise.all([
    supabase.from("opportunities").select("id, status, fit_score, recommendation, created_at, value_max").eq("organization_id", orgId),
    supabase.from("proposals").select("id, status, readiness_score, created_at").eq("organization_id", orgId),
    supabase.from("credit_transactions").select("amount, feature, created_at").eq("organization_id", orgId).eq("type", "consumption").limit(100),
  ])

  return (
    <AnalyticsClient
      opportunities={opportunitiesRes.data || []}
      proposals={proposalsRes.data || []}
      transactions={transactionsRes.data || []}
    />
  )
}
