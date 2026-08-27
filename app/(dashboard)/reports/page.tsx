import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClipboardList, FileText, TrendingUp, Download } from "lucide-react"
import { formatDate } from "@/lib/utils"

export const metadata = { title: "Reports" }

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(name, subscription_plan)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single()

  if (!membership) redirect("/onboarding")

  const orgId = membership.organization_id
  const org = membership.organizations as unknown as { name: string; subscription_plan: string } | null

  const [opportunitiesRes, proposalsRes, creditsRes] = await Promise.all([
    supabase.from("opportunities").select("id, title, status, fit_score, value_max, deadline, recommendation, buyer_name").eq("organization_id", orgId).not("status", "in", '("passed")'),
    supabase.from("proposals").select("id, title, status, readiness_score, opportunities(title, buyer_name, deadline)").eq("organization_id", orgId).order("updated_at", { ascending: false }),
    supabase.from("credit_balances").select("balance, monthly_allowance, used_this_period").eq("organization_id", orgId).single(),
  ])

  const opportunities = opportunitiesRes.data || []
  const proposals = proposalsRes.data || []
  const credits = creditsRes.data

  const stats = {
    totalOpps: opportunities.length,
    pursuing: opportunities.filter(o => ["preparing", "ready_to_submit", "ready_for_review"].includes(o.status)).length,
    submitted: opportunities.filter(o => o.status === "submitted").length,
    won: opportunities.filter(o => o.status === "won").length,
    avgFit: opportunities.filter(o => o.fit_score).reduce((s, o) => s + (o.fit_score || 0), 0) / Math.max(opportunities.filter(o => o.fit_score).length, 1),
    pipelineValue: opportunities.filter(o => !["lost"].includes(o.status)).reduce((s, o) => s + (o.value_max || 0), 0),
    readyToSubmit: proposals.filter(p => p.status === "ready").length,
    totalProposals: proposals.length,
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Reports</h1>
          <p className="text-sm text-stone-500 mt-0.5">Pipeline summaries and performance reports.</p>
        </div>
      </div>

      {/* Available reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-amber-800" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-900">Pipeline Summary</h3>
                <p className="text-xs text-stone-400">Overview of all opportunities</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Opportunities", value: stats.totalOpps },
                { label: "Avg Fit Score", value: `${Math.round(stats.avgFit)}%` },
                { label: "In Progress", value: stats.pursuing },
                { label: "Won", value: stats.won },
              ].map(s => (
                <div key={s.label} className="bg-stone-50 rounded p-2.5">
                  <div className="text-sm font-semibold text-stone-900">{s.value}</div>
                  <div className="text-xs text-stone-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="text-xs text-stone-400">Generated: {formatDate(new Date())}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-900">Proposal Status Report</h3>
                <p className="text-xs text-stone-400">All proposals and readiness scores</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Proposals", value: stats.totalProposals },
                { label: "Ready to Submit", value: stats.readyToSubmit },
                { label: "Submitted", value: stats.submitted },
                { label: "Won", value: stats.won },
              ].map(s => (
                <div key={s.label} className="bg-stone-50 rounded p-2.5">
                  <div className="text-sm font-semibold text-stone-900">{s.value}</div>
                  <div className="text-xs text-stone-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="text-xs text-stone-400">Generated: {formatDate(new Date())}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-900">Credit Usage Report</h3>
                <p className="text-xs text-stone-400">Credit consumption this billing period</p>
              </div>
            </div>

            {credits && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Credits Used", value: credits.used_this_period.toLocaleString() },
                  { label: "Credits Remaining", value: credits.balance.toLocaleString() },
                  { label: "Monthly Allowance", value: credits.monthly_allowance.toLocaleString() },
                  { label: "Utilization", value: `${Math.round(credits.used_this_period / credits.monthly_allowance * 100)}%` },
                ].map(s => (
                  <div key={s.label} className="bg-stone-50 rounded p-2.5">
                    <div className="text-sm font-semibold text-stone-900">{s.value}</div>
                    <div className="text-xs text-stone-400 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            <Link href="/credits">
              <Button variant="outline" size="sm" className="w-full">View Full Usage Details</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Top opportunities table */}
      {opportunities.filter(o => o.fit_score && o.fit_score >= 70).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">High-Fit Opportunities (70%+)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50">
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-stone-500">Opportunity</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-stone-500">Buyer</th>
                    <th className="text-center py-2.5 px-4 text-xs font-medium text-stone-500">Fit</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-stone-500">Status</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-stone-500">Deadline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {opportunities
                    .filter(o => o.fit_score && o.fit_score >= 70)
                    .sort((a, b) => (b.fit_score || 0) - (a.fit_score || 0))
                    .slice(0, 10)
                    .map((opp) => (
                      <tr key={opp.id} className="hover:bg-stone-50">
                        <td className="py-3 px-4">
                          <Link href={`/opportunities/${opp.id}`} className="text-amber-800 hover:underline line-clamp-1">
                            {opp.title}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-stone-500 text-xs">{opp.buyer_name || "—"}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-xs font-semibold ${(opp.fit_score || 0) >= 85 ? "text-emerald-600" : "text-amber-600"}`}>
                            {opp.fit_score}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-stone-500 capitalize">{opp.status.replace(/_/g, " ")}</td>
                        <td className="py-3 px-4 text-xs text-stone-400">{opp.deadline ? formatDate(opp.deadline) : "—"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
