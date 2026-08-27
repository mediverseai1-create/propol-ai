import { createAdminClient } from "@/lib/supabase/admin"
import { PLAN_CREDITS } from "@/types"
import type { SubscriptionPlan } from "@/types"

export async function getOrganizationCredits(organizationId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("credit_balances")
    .select("*")
    .eq("organization_id", organizationId)
    .single()

  if (error || !data) return null
  return data
}

export async function checkAndDeductCredits(
  organizationId: string,
  userId: string,
  amount: number,
  description: string,
  feature: string,
  referenceId?: string
): Promise<{ success: boolean; error?: string; balance?: number }> {
  const supabase = createAdminClient()

  // Get current balance
  const { data: creditData, error: fetchError } = await supabase
    .from("credit_balances")
    .select("*")
    .eq("organization_id", organizationId)
    .single()

  if (fetchError || !creditData) {
    return { success: false, error: "Could not retrieve credit balance" }
  }

  if (creditData.balance < amount) {
    return {
      success: false,
      error: `Insufficient credits. Required: ${amount}, Available: ${creditData.balance}`,
    }
  }

  const newBalance = creditData.balance - amount
  const newUsed = creditData.used_this_period + amount

  // Update balance
  const { error: updateError } = await supabase
    .from("credit_balances")
    .update({
      balance: newBalance,
      used_this_period: newUsed,
      updated_at: new Date().toISOString(),
    })
    .eq("organization_id", organizationId)

  if (updateError) {
    return { success: false, error: "Failed to deduct credits" }
  }

  // Record transaction
  await supabase.from("credit_transactions").insert({
    organization_id: organizationId,
    user_id: userId,
    type: "consumption",
    amount: -amount,
    balance_after: newBalance,
    description,
    feature,
    reference_id: referenceId,
  })

  return { success: true, balance: newBalance }
}

export async function allocateMonthlyCredits(
  organizationId: string,
  plan: SubscriptionPlan
) {
  const supabase = createAdminClient()
  const allowance = PLAN_CREDITS[plan]

  const resetDate = new Date()
  resetDate.setMonth(resetDate.getMonth() + 1)

  const { data: existing } = await supabase
    .from("credit_balances")
    .select("id")
    .eq("organization_id", organizationId)
    .single()

  if (existing) {
    await supabase
      .from("credit_balances")
      .update({
        balance: allowance,
        monthly_allowance: allowance,
        used_this_period: 0,
        reset_date: resetDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("organization_id", organizationId)
  } else {
    await supabase.from("credit_balances").insert({
      organization_id: organizationId,
      balance: allowance,
      monthly_allowance: allowance,
      used_this_period: 0,
      reset_date: resetDate.toISOString(),
    })
  }

  // Record allocation transaction
  await supabase.from("credit_transactions").insert({
    organization_id: organizationId,
    type: "allocation",
    amount: allowance,
    balance_after: allowance,
    description: `Monthly credit allocation - ${plan.toUpperCase()} plan`,
    feature: "subscription",
  })
}

export async function initializeOrganizationCredits(
  organizationId: string,
  plan: SubscriptionPlan = "free"
) {
  await allocateMonthlyCredits(organizationId, plan)
}

export async function getCreditUsageBreakdown(organizationId: string) {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from("credit_transactions")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("type", "consumption")
    .order("created_at", { ascending: false })
    .limit(50)

  if (!data) return {}

  const breakdown: Record<string, number> = {}
  for (const tx of data) {
    const feature = tx.feature || "other"
    breakdown[feature] = (breakdown[feature] || 0) + Math.abs(tx.amount)
  }

  return breakdown
}
