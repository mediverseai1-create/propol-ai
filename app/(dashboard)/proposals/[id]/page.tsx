import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProposalDetailClient } from "./proposal-detail-client"

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: proposal } = await supabase
    .from("proposals")
    .select("*, opportunities(*)")
    .eq("id", id)
    .eq("organization_id", membership.organization_id)
    .single()

  if (!proposal) notFound()

  const { data: credits } = await supabase
    .from("credit_balances")
    .select("balance")
    .eq("organization_id", membership.organization_id)
    .single()

  return (
    <ProposalDetailClient
      proposal={proposal}
      organizationId={membership.organization_id}
      credits={credits}
      userId={user.id}
    />
  )
}
