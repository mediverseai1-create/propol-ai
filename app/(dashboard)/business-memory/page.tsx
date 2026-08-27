import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BusinessMemoryClient } from "./business-memory-client"

export const metadata = { title: "Business Memory" }

export default async function BusinessMemoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(name, industry, country, description)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single()

  if (!membership) redirect("/onboarding")

  const { data: memories } = await supabase
    .from("business_memory")
    .select("*")
    .eq("organization_id", membership.organization_id)
    .order("section", { ascending: true })

  const { data: credits } = await supabase
    .from("credit_balances")
    .select("balance")
    .eq("organization_id", membership.organization_id)
    .single()

  const org = membership.organizations as unknown as { name: string; industry: string | null; country: string | null; description: string | null } | null

  return (
    <BusinessMemoryClient
      memories={memories || []}
      organizationId={membership.organization_id}
      orgProfile={org}
      credits={credits}
      userId={user.id}
    />
  )
}
