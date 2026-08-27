import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { formatCredits, formatDate, timeAgo, getFitScoreBg, getStatusColor } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Search, FileText, Zap, TrendingUp, ArrowRight, Clock,
  CheckCircle, AlertCircle, Target, GitBranch
} from "lucide-react"

export const metadata = { title: "Dashboard" }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(id, name, subscription_plan)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single()

  if (!membership) redirect("/onboarding")

  const orgId = membership.organization_id
  const org = membership.organizations as unknown as { id: string; name: string; subscription_plan: string } | null

  // Parallel data fetch
  const [creditsRes, opportunitiesRes, proposalsRes, activityRes] = await Promise.all([
    supabase.from("credit_balances").select("*").eq("organization_id", orgId).single(),
    supabase.from("opportunities").select("id, title, fit_score, status, recommendation, deadline, buyer_name, value_max, currency").eq("organization_id", orgId).order("created_at", { ascending: false }).limit(5),
    supabase.from("proposals").select("id, title, status, readiness_score, opportunities(title)").eq("organization_id", orgId).order("updated_at", { ascending: false }).limit(5),
    supabase.from("activity_logs").select("*").eq("organization_id", orgId).order("created_at", { ascending: false }).limit(8),
  ])

  const credits = creditsRes.data
  const opportunities = opportunitiesRes.data || []
  const proposals = proposalsRes.data || []
  const activity = activityRes.data || []

  const usagePct = credits
    ? Math.round(((credits.monthly_allowance - credits.balance) / credits.monthly_allowance) * 100)
    : 0

  // Pipeline counts
  const { data: pipelineCounts } = await supabase
    .from("opportunities")
    .select("status")
    .eq("organization_id", orgId)

  const counts = {
    total: pipelineCounts?.length || 0,
    pursuing: pipelineCounts?.filter(o => ["preparing", "needs_input", "ready_for_review", "ready_to_submit"].includes(o.status)).length || 0,
    submitted: pipelineCounts?.filter(o => o.status === "submitted").length || 0,
    won: pipelineCounts?.filter(o => o.status === "won").length || 0,
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Good morning</h1>
          <p className="text-sm text-stone-500 mt-0.5">{org?.name} · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/opportunities?action=discover">
            <Button size="sm" variant="outline">
              <Search className="h-4 w-4" />
              Find Opportunities
            </Button>
          </Link>
          <Link href="/opportunities/upload">
            <Button size="sm">
              <FileText className="h-4 w-4" />
              I Have an Opportunity
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "In Pipeline", value: counts.total, icon: GitBranch, color: "text-blue-600", sub: `${counts.pursuing} active` },
          { label: "Being Prepared", value: counts.pursuing, icon: FileText, color: "text-amber-700", sub: "proposals in progress" },
          { label: "Submitted", value: counts.submitted, icon: CheckCircle, color: "text-emerald-600", sub: "awaiting decision" },
          { label: "Won", value: counts.won, icon: Target, color: "text-purple-600", sub: "this year" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-stone-500 font-medium uppercase tracking-wide">{kpi.label}</span>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
              <div className="text-2xl font-semibold text-stone-900">{kpi.value}</div>
              <div className="text-xs text-stone-400 mt-0.5">{kpi.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Opportunities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-700">Recent Opportunities</h2>
            <Link href="/opportunities" className="text-xs text-amber-800 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {opportunities.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Search className="h-8 w-8 text-stone-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-stone-700">No opportunities yet</p>
                <p className="text-xs text-stone-400 mt-1 mb-4">Discover relevant opportunities or upload one you already have.</p>
                <Link href="/opportunities?action=discover">
                  <Button size="sm">Find Opportunities</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {opportunities.map((opp) => (
                <Link key={opp.id} href={`/opportunities/${opp.id}`}>
                  <Card className="hover:border-amber-300 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {opp.fit_score && (
                              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${getFitScoreBg(opp.fit_score)}`}>
                                {opp.fit_score}% match
                              </span>
                            )}
                            <span className={`text-xs px-1.5 py-0.5 rounded border ${getStatusColor(opp.status)}`}>
                              {opp.status.replace(/_/g, " ")}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-stone-900 truncate">{opp.title}</p>
                          <div className="flex items-center gap-3 mt-1">
                            {opp.buyer_name && <span className="text-xs text-stone-500">{opp.buyer_name}</span>}
                            {opp.deadline && (
                              <span className="text-xs text-stone-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(opp.deadline)}
                              </span>
                            )}
                          </div>
                        </div>
                        {opp.value_max && (
                          <div className="text-right shrink-0">
                            <div className="text-sm font-medium text-stone-800">
                              {opp.currency || "$"}{(opp.value_max / 1000).toFixed(0)}K
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Recent Proposals */}
          {proposals.length > 0 && (
            <>
              <div className="flex items-center justify-between pt-2">
                <h2 className="text-sm font-semibold text-stone-700">Active Proposals</h2>
                <Link href="/proposals" className="text-xs text-amber-800 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {proposals.map((prop) => {
                  const opp = prop.opportunities as unknown as { title: string } | null
                  return (
                    <Link key={prop.id} href={`/proposals/${prop.id}`}>
                      <Card className="hover:border-amber-300 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-stone-900 truncate">{prop.title}</p>
                              {opp && <p className="text-xs text-stone-400 mt-0.5 truncate">{opp.title}</p>}
                            </div>
                            {prop.readiness_score !== null && (
                              <div className="shrink-0 flex items-center gap-2">
                                <span className="text-xs text-stone-500">Readiness</span>
                                <span className={`text-sm font-semibold ${prop.readiness_score >= 80 ? "text-emerald-600" : prop.readiness_score >= 60 ? "text-amber-600" : "text-red-500"}`}>
                                  {prop.readiness_score}%
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Credit card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Credits & Usage</CardTitle>
                <Link href="/credits" className="text-xs text-amber-800 hover:underline">Details</Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {credits ? (
                <>
                  <div className="text-center py-2">
                    <div className="text-3xl font-semibold text-stone-900">{formatCredits(credits.balance)}</div>
                    <div className="text-xs text-stone-400 mt-0.5">credits remaining</div>
                  </div>
                  <Progress value={usagePct} className="h-2" />
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <div className="text-sm font-medium text-stone-800">{formatCredits(credits.used_this_period)}</div>
                      <div className="text-xs text-stone-400">used</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-stone-800">{formatCredits(credits.monthly_allowance)}</div>
                      <div className="text-xs text-stone-400">monthly</div>
                    </div>
                  </div>
                  <div className="text-xs text-stone-400 text-center">
                    Resets {formatDate(credits.reset_date)}
                  </div>
                  <Link href="/credits">
                    <Button variant="outline" size="sm" className="w-full">
                      <Zap className="h-4 w-4" /> Upgrade Plan
                    </Button>
                  </Link>
                </>
              ) : (
                <p className="text-xs text-stone-400">Loading credits…</p>
              )}
            </CardContent>
          </Card>

          {/* Activity feed */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activity.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-4">No activity yet.</p>
              ) : (
                <div className="space-y-3">
                  {activity.map((item) => (
                    <div key={item.id} className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-800 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-xs text-stone-700 leading-snug">{item.description}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{timeAgo(item.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Find opportunities", href: "/opportunities?action=discover", icon: Search },
                { label: "Upload an RFP", href: "/opportunities/upload", icon: FileText },
                { label: "View pipeline", href: "/pipeline", icon: GitBranch },
                { label: "Build Business Memory", href: "/business-memory", icon: TrendingUp },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded hover:bg-stone-50 text-sm text-stone-600 hover:text-stone-900 transition-colors cursor-pointer border border-transparent hover:border-stone-200">
                    <action.icon className="h-4 w-4 text-amber-800" />
                    {action.label}
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
