import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OpportunitiesClient } from "./opportunities-client"

export const metadata = { title: "Opportunities" }

export default async function OpportunitiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(name, subscription_plan, industry, country)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single()

  if (!membership) redirect("/onboarding")

  const { data: opportunities } = await supabase
    .from("opportunities")
    .select("*")
    .eq("organization_id", membership.organization_id)
    .order("created_at", { ascending: false })

  const { data: credits } = await supabase
    .from("credit_balances")
    .select("balance, monthly_allowance")
    .eq("organization_id", membership.organization_id)
    .single()

  const org = membership.organizations as unknown as { name: string; subscription_plan: string; industry: string | null; country: string | null } | null

  return (
    <OpportunitiesClient
      opportunities={opportunities || []}
      organizationId={membership.organization_id}
      orgProfile={org}
      credits={credits}
      userId={user.id}
    />
  )
}
