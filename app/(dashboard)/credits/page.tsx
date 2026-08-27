import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatDateTime, formatCredits } from "@/lib/utils"
import { Zap, TrendingDown, Calendar, CreditCard, ArrowUpRight } from "lucide-react"
import { PLAN_CREDITS, PLAN_PRICES, PLAN_NAMES } from "@/types"

export const metadata = { title: "Credits & Usage" }

export default async function CreditsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(subscription_plan, subscription_status, name)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single()

  if (!membership) redirect("/onboarding")

  const orgId = membership.organization_id
  const org = membership.organizations as unknown as { subscription_plan: string; subscription_status: string; name: string } | null

  const [creditsRes, transactionsRes] = await Promise.all([
    supabase.from("credit_balances").select("*").eq("organization_id", orgId).single(),
    supabase.from("credit_transactions").select("*").eq("organization_id", orgId).order("created_at", { ascending: false }).limit(30),
  ])

  const credits = creditsRes.data
  const transactions = transactionsRes.data || []

  const usagePct = credits
    ? Math.round((credits.used_this_period / credits.monthly_allowance) * 100)
    : 0

  const plan = (org?.subscription_plan || "free") as keyof typeof PLAN_CREDITS

  // Usage by feature
  const featureUsage: Record<string, number> = {}
  transactions
    .filter(t => t.type === "consumption")
    .forEach(t => {
      const feature = t.feature || "other"
      featureUsage[feature] = (featureUsage[feature] || 0) + Math.abs(t.amount)
    })

  const UPGRADE_PLANS = ["starter", "pro", "scale"] as const
  const paymentLinks: Record<string, string> = {
    starter: process.env.STARTER_PAYMENT_LINK || "#",
    pro: process.env.PRO_PAYMENT_LINK || "#",
    scale: process.env.SCALE_PAYMENT_LINK || "#",
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-stone-900">Credits & Usage</h1>
        <p className="text-sm text-stone-500 mt-0.5">Track your monthly credit usage and manage your subscription plan.</p>
      </div>

      {/* Credit overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-semibold text-stone-900">{credits ? formatCredits(credits.balance) : "—"}</div>
                <div className="text-sm text-stone-400 mt-0.5">credits remaining</div>
              </div>
              <div className={`text-right ${usagePct >= 90 ? "text-red-600" : usagePct >= 75 ? "text-amber-600" : "text-stone-500"}`}>
                <div className="text-2xl font-semibold">{usagePct}%</div>
                <div className="text-xs">used</div>
              </div>
            </div>

            <Progress
              value={usagePct}
              className={`h-3 ${usagePct >= 90 ? "[&>div]:bg-red-500" : usagePct >= 75 ? "[&>div]:bg-amber-500" : ""}`}
            />

            <div className="grid grid-cols-3 gap-4 mt-4 text-center">
              <div>
                <div className="text-base font-semibold text-stone-800">{credits ? formatCredits(credits.used_this_period) : "—"}</div>
                <div className="text-xs text-stone-400">used this period</div>
              </div>
              <div>
                <div className="text-base font-semibold text-stone-800">{credits ? formatCredits(credits.monthly_allowance) : "—"}</div>
                <div className="text-xs text-stone-400">monthly allowance</div>
              </div>
              <div>
                <div className="text-base font-semibold text-stone-800">{credits ? formatDate(credits.reset_date) : "—"}</div>
                <div className="text-xs text-stone-400">next reset</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-800" />
              <span className="text-sm font-medium text-stone-700">Current Plan</span>
            </div>
            <div>
              <div className="text-xl font-semibold text-stone-900">{PLAN_NAMES[plan]}</div>
              <div className="text-sm text-stone-500">${PLAN_PRICES[plan]}/month</div>
            </div>
            <div className="text-xs text-stone-400">
              {formatCredits(PLAN_CREDITS[plan])} credits/month
            </div>
            {plan !== "scale" && (
              <Link href="/credits#upgrade">
                <Button size="sm" variant="outline" className="w-full">
                  <ArrowUpRight className="h-4 w-4" /> Upgrade Plan
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Usage breakdown */}
      {Object.keys(featureUsage).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-stone-500" /> Usage Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(featureUsage)
                .sort(([,a], [,b]) => b - a)
                .map(([feature, amount]) => {
                  const pct = credits ? Math.round((amount / credits.used_this_period) * 100) : 0
                  return (
                    <div key={feature}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-stone-600 capitalize">{feature.replace(/_/g, " ")}</span>
                        <span className="text-xs font-medium text-stone-800">{formatCredits(amount)} ({pct}%)</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade plans */}
      <div id="upgrade">
        <h2 className="text-base font-semibold text-stone-900 mb-4">Plans</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {UPGRADE_PLANS.map((p) => {
            const isCurrentPlan = plan === p
            const isUpgrade = PLAN_PRICES[p] > PLAN_PRICES[plan]
            return (
              <Card key={p} className={isCurrentPlan ? "border-amber-800 shadow-md" : ""}>
                <CardContent className="p-5 space-y-4">
                  {isCurrentPlan && (
                    <Badge className="text-xs">Current Plan</Badge>
                  )}
                  <div>
                    <div className="text-lg font-semibold text-stone-900">{PLAN_NAMES[p]}</div>
                    <div className="text-2xl font-bold text-stone-900 mt-1">
                      ${PLAN_PRICES[p]}<span className="text-sm font-normal text-stone-400">/mo</span>
                    </div>
                    <div className="text-sm text-stone-500 mt-1">{formatCredits(PLAN_CREDITS[p])} credits/month</div>
                  </div>
                  <ul className="space-y-1.5 text-sm text-stone-600">
                    {p === "starter" && [
                      "4,000 credits/month",
                      "Opportunity discovery",
                      "AI analysis",
                      "Proposal drafting",
                      "Email support",
                    ].map(f => <li key={f} className="flex items-center gap-1.5"><span className="text-emerald-600 text-xs">✓</span>{f}</li>)}
                    {p === "pro" && [
                      "7,000 credits/month",
                      "Everything in Starter",
                      "Advanced analysis",
                      "Compliance checker",
                      "Priority support",
                    ].map(f => <li key={f} className="flex items-center gap-1.5"><span className="text-emerald-600 text-xs">✓</span>{f}</li>)}
                    {p === "scale" && [
                      "11,000 credits/month",
                      "Everything in Pro",
                      "Bulk opportunity pursuit",
                      "Team collaboration",
                      "Dedicated support",
                    ].map(f => <li key={f} className="flex items-center gap-1.5"><span className="text-emerald-600 text-xs">✓</span>{f}</li>)}
                  </ul>
                  {isCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                  ) : isUpgrade ? (
                    <a href={paymentLinks[p]} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full">Upgrade to {PLAN_NAMES[p]}</Button>
                    </a>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>Downgrade</Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Transaction history */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4 text-stone-500" /> Credit History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <p className="text-xs text-stone-400 text-center py-8">No transactions yet.</p>
          ) : (
            <div className="divide-y divide-stone-100">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-800">{tx.description}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{formatDateTime(tx.created_at)}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`text-sm font-medium ${tx.amount > 0 ? "text-emerald-600" : "text-stone-700"}`}>
                      {tx.amount > 0 ? "+" : ""}{formatCredits(tx.amount)}
                    </div>
                    <div className="text-xs text-stone-400">{formatCredits(tx.balance_after)} balance</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
