import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, getFitScoreBg } from "@/lib/utils"
import { Clock, DollarSign } from "lucide-react"

export const metadata = { title: "Pipeline" }

const PIPELINE_STAGES = [
  { key: "discovered", label: "Discovered", color: "bg-blue-100 text-blue-700" },
  { key: "qualified", label: "Qualified", color: "bg-purple-100 text-purple-700" },
  { key: "preparing", label: "Preparing", color: "bg-amber-100 text-amber-700" },
  { key: "needs_input", label: "Needs Input", color: "bg-orange-100 text-orange-700" },
  { key: "ready_to_submit", label: "Ready", color: "bg-teal-100 text-teal-700" },
  { key: "submitted", label: "Submitted", color: "bg-indigo-100 text-indigo-700" },
  { key: "won", label: "Won", color: "bg-emerald-100 text-emerald-700" },
]

export default async function PipelinePage() {
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

  const { data: opportunities } = await supabase
    .from("opportunities")
    .select("id, title, status, fit_score, deadline, value_max, currency, buyer_name")
    .eq("organization_id", membership.organization_id)
    .not("status", "in", '("lost","passed")')
    .order("fit_score", { ascending: false })

  const items = opportunities || []

  const byStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.key] = items.filter(o => o.status === stage.key)
    return acc
  }, {} as Record<string, typeof items>)

  const totalValue = items.reduce((sum, o) => sum + (o.value_max || 0), 0)

  return (
    <div className="p-6 max-w-full space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Opportunity Pipeline</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {items.length} active opportunities · ${(totalValue / 1000000).toFixed(1)}M total pipeline value
          </p>
        </div>
      </div>

      {/* Kanban board */}
      <div className="overflow-x-auto pb-4 scrollbar-thin">
        <div className="flex gap-4 min-w-max">
          {PIPELINE_STAGES.map((stage) => {
            const stageItems = byStage[stage.key] || []
            const stageValue = stageItems.reduce((s, o) => s + (o.value_max || 0), 0)

            return (
              <div key={stage.key} className="w-64 flex-none">
                <div className="mb-2 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stage.color}`}>
                      {stage.label}
                    </span>
                    <span className="text-xs text-stone-400">{stageItems.length}</span>
                  </div>
                  {stageValue > 0 && (
                    <span className="text-xs text-stone-400">
                      ${stageValue >= 1000000 ? `${(stageValue/1000000).toFixed(1)}M` : `${(stageValue/1000).toFixed(0)}K`}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {stageItems.length === 0 && (
                    <div className="h-20 border-2 border-dashed border-stone-200 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-stone-300">Empty</span>
                    </div>
                  )}

                  {stageItems.map((opp) => (
                    <Link key={opp.id} href={`/opportunities/${opp.id}`}>
                      <div className="bg-white border border-stone-200 rounded-lg p-3 hover:border-amber-300 transition-colors cursor-pointer shadow-sm">
                        {opp.fit_score !== null && (
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${getFitScoreBg(opp.fit_score)}`}>
                            {opp.fit_score}%
                          </span>
                        )}
                        <p className="text-xs font-medium text-stone-800 mt-1.5 line-clamp-2">{opp.title}</p>
                        {opp.buyer_name && (
                          <p className="text-xs text-stone-400 mt-1 truncate">{opp.buyer_name}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          {opp.value_max && (
                            <span className="text-xs font-medium text-stone-600">
                              {opp.currency || "$"}{opp.value_max >= 1000000 ? `${(opp.value_max/1000000).toFixed(1)}M` : `${(opp.value_max/1000).toFixed(0)}K`}
                            </span>
                          )}
                          {opp.deadline && (
                            <span className="text-xs text-stone-400 flex items-center gap-0.5">
                              <Clock className="h-3 w-3" />
                              {formatDate(opp.deadline)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
