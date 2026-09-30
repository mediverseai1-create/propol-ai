import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import { LowCreditBanner } from "@/components/dashboard/low-credit-banner"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Get organization
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(id, name, subscription_plan)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single()

  if (!membership && !profile) {
    redirect("/onboarding")
  }

  // Get credits
  let credits = null
  if (membership) {
    const { data: creditData } = await supabase
      .from("credit_balances")
      .select("balance, monthly_allowance, used_this_period, reset_date")
      .eq("organization_id", membership.organization_id)
      .single()
    credits = creditData
  }

  const org = membership?.organizations as unknown as { id: string; name: string; subscription_plan: string } | null
  const usagePct = credits
    ? ((credits.monthly_allowance - credits.balance) / credits.monthly_allowance) * 100
    : 0

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0f0b08", overflow: "hidden" }}>
      <Sidebar
        credits={credits}
        orgName={org?.name}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <Topbar
          userName={profile?.full_name || undefined}
          userEmail={user.email}
          avatarUrl={profile?.avatar_url || undefined}
        />

        {credits && usagePct >= 75 && (
          <LowCreditBanner
            balance={credits.balance}
            monthly={credits.monthly_allowance}
            usagePct={usagePct}
          />
        )}

        <main style={{ flex: 1, overflowY: "auto", background: "#f9f8f7" }}>
          {children}
        </main>
      </div>
    </div>
  )
}
