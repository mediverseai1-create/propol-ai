import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { FileText, ArrowRight, Clock, CheckCircle } from "lucide-react"
import { formatDate, getStatusColor } from "@/lib/utils"

export const metadata = { title: "Proposals" }

export default async function ProposalsPage() {
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

  const { data: proposals } = await supabase
    .from("proposals")
    .select("*, opportunities(title, deadline, buyer_name, fit_score)")
    .eq("organization_id", membership.organization_id)
    .order("updated_at", { ascending: false })

  const items = proposals || []
  const stats = {
    total: items.length,
    active: items.filter(p => ["drafting", "in_review", "needs_input"].includes(p.status)).length,
    ready: items.filter(p => p.status === "ready").length,
    submitted: items.filter(p => p.status === "submitted").length,
    won: items.filter(p => p.status === "won").length,
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Proposals</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {stats.total} proposals · {stats.active} in progress · {stats.ready} ready to submit
          </p>
        </div>
        <Link href="/opportunities">
          <Button size="sm" variant="outline">
            <FileText className="h-4 w-4" /> Start from Opportunity
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total },
          { label: "In Progress", value: stats.active },
          { label: "Ready to Submit", value: stats.ready },
          { label: "Won", value: stats.won },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-semibold text-stone-900">{s.value}</div>
              <div className="text-xs text-stone-400 mt-0.5">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-3">
            <FileText className="h-10 w-10 text-stone-200 mx-auto" />
            <p className="text-sm font-medium text-stone-700">No proposals yet</p>
            <p className="text-xs text-stone-400">Open an opportunity and click "Prepare with PROPOL" to start a proposal.</p>
            <Link href="/opportunities">
              <Button size="sm" className="mt-2">View Opportunities</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((prop) => {
            const opp = prop.opportunities as { title: string; deadline: string | null; buyer_name: string | null; fit_score: number | null } | null
            return (
              <Link key={prop.id} href={`/proposals/${prop.id}`}>
                <Card className="hover:border-amber-300 transition-colors cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded border capitalize ${getStatusColor(prop.status)}`}>
                            {prop.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-stone-900 truncate">{prop.title}</p>
                        {opp && (
                          <p className="text-xs text-stone-400 mt-0.5 truncate">
                            {opp.buyer_name && `${opp.buyer_name} · `}{opp.title}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-2">
                        {prop.readiness_score !== null && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-stone-500">Readiness</span>
                            <span className={`text-sm font-semibold ${prop.readiness_score >= 80 ? "text-emerald-600" : prop.readiness_score >= 60 ? "text-amber-600" : "text-red-500"}`}>
                              {prop.readiness_score}%
                            </span>
                          </div>
                        )}
                        {opp?.deadline && (
                          <span className="text-xs text-stone-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {formatDate(opp.deadline)}
                          </span>
                        )}
                        <ArrowRight className="h-4 w-4 text-stone-300 group-hover:text-amber-700 transition-colors" />
                      </div>
                    </div>

                    {prop.readiness_score !== null && (
                      <Progress value={prop.readiness_score} className="mt-3 h-1" />
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
