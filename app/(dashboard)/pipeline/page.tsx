import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

export const metadata = { title: "Pipeline — Propol AI" }

const STAGES = [
  { key: "discovered",       label: "Discovered",       accent: "#6b7280", bg: "#f9fafb" },
  { key: "analyzing",        label: "Analyzing",        accent: "#3b82f6", bg: "#eff6ff" },
  { key: "needs_input",      label: "Needs Input",      accent: "#d97706", bg: "#fffbeb" },
  { key: "preparing",        label: "Preparing",        accent: "#7c3aed", bg: "#f5f3ff" },
  { key: "ready_for_review", label: "For Review",       accent: "#0891b2", bg: "#ecfeff" },
  { key: "ready_to_submit",  label: "Ready to Submit",  accent: "#059669", bg: "#ecfdf5" },
  { key: "submitted",        label: "Submitted",        accent: "#0284c7", bg: "#e0f2fe" },
  { key: "won",              label: "Won",              accent: "#16a34a", bg: "#f0fdf4" },
]

function FitChip({ score }: { score: number }) {
  const color = score >= 80 ? "#16a34a" : score >= 65 ? "#d97706" : "#dc2626"
  const bg    = score >= 80 ? "rgba(22,163,74,0.1)" : score >= 65 ? "rgba(217,119,6,0.1)" : "rgba(220,38,38,0.08)"
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10, color, background: bg }}>
      {score}%
    </span>
  )
}

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
    .not("status", "in", '("lost","passed","archived")')
    .order("fit_score", { ascending: false })

  const items = opportunities || []

  const byStage = STAGES.reduce((acc, stage) => {
    acc[stage.key] = items.filter(o => o.status === stage.key)
    return acc
  }, {} as Record<string, typeof items>)

  const totalValue = items.reduce((sum, o) => sum + (o.value_max || 0), 0)
  const fmtValue = (v: number) => v >= 1_000_000 ? `$${(v/1_000_000).toFixed(1)}M` : `$${(v/1_000).toFixed(0)}K`

  return (
    <div style={{ padding: "28px 32px", background: "#f9f8f7", minHeight: "100%" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1c1917", margin: 0, letterSpacing: "-0.01em" }}>
            Opportunity Pipeline
          </h1>
          <p style={{ fontSize: 12, color: "#a8a29e", margin: "5px 0 0" }}>
            {items.length} active &nbsp;·&nbsp; {fmtValue(totalValue)} total pipeline value
          </p>
        </div>
        <Link href="/opportunities?action=discover" style={{ textDecoration: "none" }}>
          <button style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "8px 16px", borderRadius: 8, border: "none",
            background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
            color: "#fff", fontSize: 13, fontWeight: 600,
            cursor: "pointer", boxShadow: "0 2px 8px rgba(180,83,9,0.3)",
          }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            Add Opportunity
          </button>
        </Link>
      </div>

      {/* Stage summary strip */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, overflowX: "auto", paddingBottom: 2 }}>
        {STAGES.map(stage => {
          const n = byStage[stage.key]?.length || 0
          const v = byStage[stage.key]?.reduce((s, o) => s + (o.value_max || 0), 0) || 0
          return (
            <div key={stage.key} style={{
              flexShrink: 0, background: "#fff", border: "1px solid #e7e5e4",
              borderRadius: 10, padding: "10px 14px", minWidth: 100, textAlign: "center",
              boxShadow: n > 0 ? `0 0 0 1px ${stage.accent}20` : "none",
              borderColor: n > 0 ? `${stage.accent}30` : "#e7e5e4",
            }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: n > 0 ? stage.accent : "#d6d3d1", fontVariantNumeric: "tabular-nums" }}>{n}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: n > 0 ? stage.accent : "#d6d3d1", letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 2 }}>{stage.label}</div>
              {v > 0 && <div style={{ fontSize: 10, color: "#a8a29e", marginTop: 3 }}>{fmtValue(v)}</div>}
            </div>
          )
        })}
      </div>

      {/* Kanban board */}
      <div style={{ overflowX: "auto", paddingBottom: 16 }}>
        <div style={{ display: "flex", gap: 14, minWidth: "max-content" }}>
          {STAGES.map(stage => {
            const stageItems = byStage[stage.key] || []
            return (
              <div key={stage.key} style={{ width: 248, flexShrink: 0 }}>
                {/* Column header */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginBottom: 10, padding: "0 2px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: stage.accent }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: stage.accent, letterSpacing: "0.03em" }}>
                      {stage.label}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10,
                    background: `${stage.accent}15`, color: stage.accent,
                  }}>{stageItems.length}</span>
                </div>

                {/* Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {stageItems.length === 0 ? (
                    <div style={{
                      height: 72, border: "1.5px dashed #e7e5e4", borderRadius: 10,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontSize: 11, color: "#d6d3d1" }}>Empty</span>
                    </div>
                  ) : (
                    stageItems.map(opp => {
                      const isUrgent = opp.deadline && (new Date(opp.deadline).getTime() - Date.now()) < 7 * 86400000
                      return (
                        <Link key={opp.id} href={`/opportunities/${opp.id}`} style={{ textDecoration: "none" }}>
                          <div style={{
                            background: "#ffffff", borderRadius: 10,
                            border: `1px solid ${isUrgent ? "#fde68a" : "#e7e5e4"}`,
                            padding: "12px 14px", cursor: "pointer",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                            transition: "all 0.15s",
                          }}
                            onMouseEnter={e => {
                              const el = e.currentTarget as HTMLElement
                              el.style.borderColor = stage.accent
                              el.style.boxShadow = `0 0 0 2px ${stage.accent}20`
                            }}
                            onMouseLeave={e => {
                              const el = e.currentTarget as HTMLElement
                              el.style.borderColor = isUrgent ? "#fde68a" : "#e7e5e4"
                              el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"
                            }}
                          >
                            {/* Top row */}
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6, marginBottom: 8 }}>
                              {opp.fit_score !== null && <FitChip score={opp.fit_score} />}
                              {isUrgent && (
                                <span style={{ fontSize: 9, fontWeight: 700, color: "#dc2626", background: "rgba(220,38,38,0.08)", padding: "2px 7px", borderRadius: 10, letterSpacing: "0.03em" }}>
                                  URGENT
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <p style={{
                              fontSize: 12, fontWeight: 600, color: "#1c1917",
                              margin: "0 0 6px", lineHeight: 1.4,
                              overflow: "hidden", display: "-webkit-box",
                              WebkitBoxOrient: "vertical", WebkitLineClamp: 2,
                            }}>
                              {opp.title}
                            </p>

                            {opp.buyer_name && (
                              <p style={{ fontSize: 10, color: "#a8a29e", margin: "0 0 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {opp.buyer_name}
                              </p>
                            )}

                            {/* Bottom row */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              {opp.value_max ? (
                                <span style={{ fontSize: 11, fontWeight: 700, color: "#44403c" }}>
                                  {fmtValue(opp.value_max)}
                                </span>
                              ) : <span />}
                              {opp.deadline && (
                                <span style={{ fontSize: 10, color: isUrgent ? "#dc2626" : "#a8a29e", display: "flex", alignItems: "center", gap: 4 }}>
                                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                  </svg>
                                  {formatDate(opp.deadline)}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
