"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from "recharts"

interface Props {
  opportunities: { id: string; status: string; fit_score: number | null; recommendation: string | null; created_at: string; value_max: number | null }[]
  proposals: { id: string; status: string; readiness_score: number | null; created_at: string }[]
  transactions: { amount: number; feature: string | null; created_at: string }[]
}

const STATUS_COLORS = {
  won: "#059669",
  submitted: "#6366f1",
  ready_to_submit: "#0d9488",
  preparing: "#d97706",
  needs_input: "#ea580c",
  qualified: "#7c3aed",
  discovered: "#3b82f6",
  lost: "#ef4444",
  passed: "#9ca3af",
}

const CHART_COLORS = ["#78350f", "#92400e", "#b45309", "#d97706", "#fbbf24"]

export function AnalyticsClient({ opportunities, proposals, transactions }: Props) {
  // Fit score distribution
  const scoreRanges = [
    { range: "90-100%", count: 0 },
    { range: "80-89%", count: 0 },
    { range: "70-79%", count: 0 },
    { range: "60-69%", count: 0 },
    { range: "<60%", count: 0 },
  ]
  opportunities.forEach(o => {
    if (!o.fit_score) return
    if (o.fit_score >= 90) scoreRanges[0].count++
    else if (o.fit_score >= 80) scoreRanges[1].count++
    else if (o.fit_score >= 70) scoreRanges[2].count++
    else if (o.fit_score >= 60) scoreRanges[3].count++
    else scoreRanges[4].count++
  })

  // Status distribution for pie
  const statusCounts: Record<string, number> = {}
  opportunities.forEach(o => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1
  })
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }))

  // Monthly pipeline value trend (last 6 months)
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    return d.toLocaleString("en-US", { month: "short" })
  })
  const monthlyData = months.map((month, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const monthOpps = opportunities.filter(o => {
      const od = new Date(o.created_at)
      return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear()
    })
    return {
      month,
      opportunities: monthOpps.length,
      value: Math.round(monthOpps.reduce((s, o) => s + (o.value_max || 0), 0) / 1000),
    }
  })

  // Credit usage by feature
  const featureMap: Record<string, number> = {}
  transactions.forEach(t => {
    const f = t.feature || "other"
    featureMap[f] = (featureMap[f] || 0) + Math.abs(t.amount)
  })
  const featureData = Object.entries(featureMap).map(([name, value]) => ({
    name: name.replace(/_/g, " "),
    value,
  })).sort((a, b) => b.value - a.value).slice(0, 6)

  // KPIs
  const winRate = opportunities.filter(o => o.status === "won").length /
    Math.max(opportunities.filter(o => ["won", "lost"].includes(o.status)).length, 1) * 100
  const avgFitScore = opportunities.filter(o => o.fit_score).reduce((s, o) => s + (o.fit_score || 0), 0) /
    Math.max(opportunities.filter(o => o.fit_score).length, 1)
  const totalPipelineValue = opportunities.filter(o => !["lost", "passed"].includes(o.status)).reduce((s, o) => s + (o.value_max || 0), 0)

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-stone-900">Analytics</h1>
        <p className="text-sm text-stone-500 mt-0.5">Performance metrics and pipeline insights.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Opportunities", value: opportunities.length.toString() },
          { label: "Avg Fit Score", value: `${Math.round(avgFitScore)}%` },
          { label: "Win Rate", value: `${Math.round(winRate)}%` },
          { label: "Pipeline Value", value: totalPipelineValue >= 1000000 ? `$${(totalPipelineValue/1000000).toFixed(1)}M` : `$${(totalPipelineValue/1000).toFixed(0)}K` },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <div className="text-2xl font-semibold text-stone-900">{kpi.value}</div>
              <div className="text-xs text-stone-400 mt-1">{kpi.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly opportunities chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Monthly Opportunities Added</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="opportunities" fill="#78350f" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fit score distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fit Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={scoreRanges} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="range" type="category" tick={{ fontSize: 11 }} width={65} />
                <Tooltip />
                <Bar dataKey="count" fill="#b45309" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pipeline status pie */}
        {statusData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Pipeline Status</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" cx="50%" cy="50%" outerRadius={70}>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {statusData.slice(0, 6).map((s, i) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="capitalize text-stone-600">{s.name}</span>
                    </div>
                    <span className="font-medium text-stone-800">{s.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Credit usage by feature */}
        {featureData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Credit Usage by Feature</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={featureData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={110} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#d97706" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
