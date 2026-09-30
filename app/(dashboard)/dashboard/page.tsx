import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { formatCredits, formatDate, timeAgo, getFitScoreBg, getStatusColor } from "@/lib/utils"
import Link from "next/link"

export const metadata = { title: "Dashboard — Propol AI" }

const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  discovered:         { label: "Discovered",         color: "#6b7280", bg: "rgba(107,114,128,0.1)",  dot: "#9ca3af" },
  analyzing:          { label: "Analyzing",          color: "#2563eb", bg: "rgba(37,99,235,0.1)",    dot: "#60a5fa" },
  needs_input:        { label: "Needs Input",        color: "#d97706", bg: "rgba(217,119,6,0.12)",   dot: "#f59e0b" },
  preparing:          { label: "Preparing",          color: "#7c3aed", bg: "rgba(124,58,237,0.1)",   dot: "#a78bfa" },
  ready_for_review:   { label: "Ready for Review",   color: "#0891b2", bg: "rgba(8,145,178,0.1)",    dot: "#22d3ee" },
  ready_to_submit:    { label: "Ready to Submit",    color: "#059669", bg: "rgba(5,150,105,0.12)",   dot: "#34d399" },
  submitted:          { label: "Submitted",          color: "#0284c7", bg: "rgba(2,132,199,0.1)",    dot: "#38bdf8" },
  won:                { label: "Won",                color: "#16a34a", bg: "rgba(22,163,74,0.12)",   dot: "#4ade80" },
  lost:               { label: "Lost",               color: "#dc2626", bg: "rgba(220,38,38,0.1)",    dot: "#f87171" },
  archived:           { label: "Archived",           color: "#6b7280", bg: "rgba(107,114,128,0.08)", dot: "#9ca3af" },
}

function StatusPill({ status }: { status: string }) {
  const m = STATUS_META[status] || { label: status, color: "#6b7280", bg: "rgba(107,114,128,0.1)", dot: "#9ca3af" }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
      padding: "3px 8px", borderRadius: 20,
      color: m.color, background: m.bg,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: m.dot, display: "inline-block" }} />
      {m.label}
    </span>
  )
}

function FitBadge({ score }: { score: number }) {
  const color = score >= 80 ? "#16a34a" : score >= 65 ? "#d97706" : "#dc2626"
  const bg    = score >= 80 ? "rgba(22,163,74,0.1)" : score >= 65 ? "rgba(217,119,6,0.1)" : "rgba(220,38,38,0.1)"
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
      color, background: bg,
    }}>{score}%</span>
  )
}

function ReadinessBar({ value }: { value: number }) {
  const color = value >= 80 ? "#16a34a" : value >= 60 ? "#d97706" : "#dc2626"
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 100 }}>
      <div style={{ flex: 1, height: 4, background: "rgba(0,0,0,0.06)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.4s ease" }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 26, textAlign: "right" }}>{value}%</span>
    </div>
  )
}

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

  const [creditsRes, opportunitiesRes, proposalsRes, activityRes, pipelineRes] = await Promise.all([
    supabase.from("credit_balances").select("*").eq("organization_id", orgId).single(),
    supabase.from("opportunities")
      .select("id, title, fit_score, status, deadline, buyer_name, value_max, currency, recommendation")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("proposals")
      .select("id, title, status, readiness_score, updated_at, opportunities(title)")
      .eq("organization_id", orgId)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase.from("activity_logs")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("opportunities").select("status").eq("organization_id", orgId),
  ])

  const credits = creditsRes.data
  const opportunities = opportunitiesRes.data || []
  const proposals = proposalsRes.data || []
  const activity = activityRes.data || []
  const allOpps = pipelineRes.data || []

  const counts = {
    total:     allOpps.length,
    active:    allOpps.filter(o => ["preparing","needs_input","ready_for_review","ready_to_submit"].includes(o.status)).length,
    submitted: allOpps.filter(o => o.status === "submitted").length,
    won:       allOpps.filter(o => o.status === "won").length,
    analyzing: allOpps.filter(o => o.status === "analyzing").length,
  }

  const usagePct = credits
    ? Math.round(((credits.monthly_allowance - credits.balance) / credits.monthly_allowance) * 100)
    : 0

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })

  const needsInput = opportunities.filter(o => o.status === "needs_input")
  const urgentDeadlines = opportunities.filter(o => {
    if (!o.deadline) return false
    const diff = (new Date(o.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    return diff <= 7 && diff >= 0
  })

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1280, margin: "0 auto", background: "#f9f8f7", minHeight: "100%" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1c1917", margin: 0, letterSpacing: "-0.01em" }}>
            Command Center
          </h1>
          <p style={{ fontSize: 12, color: "#a8a29e", margin: "4px 0 0", fontWeight: 400 }}>
            {org?.name} &nbsp;·&nbsp; {today}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/opportunities?action=discover" style={{ textDecoration: "none" }}>
            <button style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "8px 16px", borderRadius: 8, border: "1px solid #e7e5e4",
              background: "#ffffff", color: "#44403c", fontSize: 13, fontWeight: 500,
              cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              Discover Opportunities
            </button>
          </Link>
          <Link href="/opportunities/upload" style={{ textDecoration: "none" }}>
            <button style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "8px 16px", borderRadius: 8, border: "none",
              background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
              color: "#ffffff", fontSize: 13, fontWeight: 600,
              cursor: "pointer", boxShadow: "0 2px 8px rgba(180,83,9,0.35)",
            }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              I Have an RFP
            </button>
          </Link>
        </div>
      </div>

      {/* ── AI Insights Bar ── */}
      {(needsInput.length > 0 || urgentDeadlines.length > 0) && (
        <div style={{
          background: "linear-gradient(135deg, rgba(180,83,9,0.07) 0%, rgba(124,58,237,0.05) 100%)",
          border: "1px solid rgba(217,119,6,0.2)",
          borderRadius: 12, padding: "14px 20px", marginBottom: 24,
          display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, background: "rgba(217,119,6,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}>Propol AI · Attention Required</span>
          </div>
          <div style={{ display: "flex", gap: 10, flex: 1, flexWrap: "wrap" }}>
            {needsInput.length > 0 && (
              <Link href="/opportunities?filter=needs_input" style={{ textDecoration: "none" }}>
                <span style={{
                  fontSize: 12, padding: "4px 12px", borderRadius: 20, fontWeight: 500,
                  background: "rgba(217,119,6,0.12)", color: "#b45309",
                  border: "1px solid rgba(217,119,6,0.2)", cursor: "pointer",
                }}>
                  {needsInput.length} opportunit{needsInput.length > 1 ? "ies" : "y"} need your input →
                </span>
              </Link>
            )}
            {urgentDeadlines.length > 0 && (
              <Link href="/opportunities?filter=deadline" style={{ textDecoration: "none" }}>
                <span style={{
                  fontSize: 12, padding: "4px 12px", borderRadius: 20, fontWeight: 500,
                  background: "rgba(220,38,38,0.08)", color: "#b91c1c",
                  border: "1px solid rgba(220,38,38,0.15)", cursor: "pointer",
                }}>
                  {urgentDeadlines.length} deadline{urgentDeadlines.length > 1 ? "s" : ""} within 7 days →
                </span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── KPI Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          {
            label: "Pipeline",
            value: counts.total,
            sub: `${counts.analyzing} analyzing`,
            accent: "#3b82f6",
            icon: (
              <svg width="16" height="16" fill="none" stroke="#3b82f6" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M18 20V10M12 20V4M6 20v-6"/>
              </svg>
            ),
          },
          {
            label: "Active Work",
            value: counts.active,
            sub: "proposals in progress",
            accent: "#d97706",
            icon: (
              <svg width="16" height="16" fill="none" stroke="#d97706" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
            ),
          },
          {
            label: "Submitted",
            value: counts.submitted,
            sub: "awaiting decision",
            accent: "#0891b2",
            icon: (
              <svg width="16" height="16" fill="none" stroke="#0891b2" strokeWidth="1.8" viewBox="0 0 24 24">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            ),
          },
          {
            label: "Won",
            value: counts.won,
            sub: "contracts secured",
            accent: "#16a34a",
            icon: (
              <svg width="16" height="16" fill="none" stroke="#16a34a" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ),
          },
        ].map((kpi) => (
          <div key={kpi.label} style={{
            background: "#ffffff", border: "1px solid #e7e5e4", borderRadius: 12,
            padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#a8a29e", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {kpi.label}
              </span>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: `rgba(${kpi.accent === "#3b82f6" ? "59,130,246" : kpi.accent === "#d97706" ? "217,119,6" : kpi.accent === "#0891b2" ? "8,145,178" : "22,163,74"},0.1)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {kpi.icon}
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#1c1917", lineHeight: 1, marginBottom: 6, fontVariantNumeric: "tabular-nums" }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: 11, color: "#a8a29e" }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>

        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Pipeline Status Strip */}
          <div style={{ background: "#ffffff", border: "1px solid #e7e5e4", borderRadius: 12, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: "#1c1917", margin: 0 }}>Pipeline Status</h2>
              <Link href="/pipeline" style={{ textDecoration: "none", fontSize: 12, color: "#d97706", fontWeight: 500 }}>
                View full pipeline →
              </Link>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { key: "analyzing",        label: "Analyzing",       color: "#3b82f6" },
                { key: "needs_input",       label: "Needs Input",     color: "#d97706" },
                { key: "preparing",         label: "Preparing",       color: "#7c3aed" },
                { key: "ready_to_submit",   label: "Ready to Submit", color: "#059669" },
                { key: "submitted",         label: "Submitted",       color: "#0891b2" },
                { key: "won",               label: "Won",             color: "#16a34a" },
              ].map(stage => {
                const n = allOpps.filter(o => o.status === stage.key).length
                return (
                  <Link key={stage.key} href={`/pipeline?stage=${stage.key}`} style={{ textDecoration: "none", flex: "1 1 auto", minWidth: 80 }}>
                    <div style={{
                      padding: "12px 14px", borderRadius: 8, border: "1px solid #f0ece8",
                      background: n > 0 ? `rgba(${stage.color === "#3b82f6" ? "59,130,246" : stage.color === "#d97706" ? "217,119,6" : stage.color === "#7c3aed" ? "124,58,237" : stage.color === "#059669" ? "5,150,105" : stage.color === "#0891b2" ? "8,145,178" : "22,163,74"},0.05)` : "#fafaf9",
                      cursor: "pointer", textAlign: "center",
                    }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: n > 0 ? stage.color : "#d6d3d1", fontVariantNumeric: "tabular-nums" }}>{n}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: n > 0 ? stage.color : "#d6d3d1", marginTop: 3, letterSpacing: "0.02em" }}>{stage.label}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Opportunities Table */}
          <div style={{ background: "#ffffff", border: "1px solid #e7e5e4", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ padding: "18px 24px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f0ece8" }}>
              <div>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: "#1c1917", margin: 0 }}>Recent Opportunities</h2>
                <p style={{ fontSize: 11, color: "#a8a29e", margin: "3px 0 0" }}>AI-analyzed · ranked by fit score</p>
              </div>
              <Link href="/opportunities" style={{ textDecoration: "none", fontSize: 12, color: "#d97706", fontWeight: 500 }}>
                View all →
              </Link>
            </div>

            {opportunities.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f5f5f4", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" fill="none" stroke="#a8a29e" strokeWidth="1.5" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#44403c", margin: "0 0 6px" }}>No opportunities yet</p>
                <p style={{ fontSize: 12, color: "#a8a29e", margin: "0 0 16px" }}>Let Propol AI discover relevant opportunities for your business.</p>
                <Link href="/opportunities?action=discover" style={{ textDecoration: "none" }}>
                  <button style={{ padding: "8px 20px", borderRadius: 8, background: "#d97706", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    Start Discovering
                  </button>
                </Link>
              </div>
            ) : (
              <div>
                {/* Table header */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 130px 80px 100px", padding: "8px 24px", borderBottom: "1px solid #f5f5f4" }}>
                  {["Opportunity", "Buyer", "Status", "Fit", "Deadline"].map(h => (
                    <span key={h} style={{ fontSize: 10, fontWeight: 700, color: "#c4bfbb", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
                  ))}
                </div>
                {opportunities.map((opp, i) => (
                  <Link key={opp.id} href={`/opportunities/${opp.id}`} style={{ textDecoration: "none" }}>
                    <div style={{
                      display: "grid", gridTemplateColumns: "1fr 110px 130px 80px 100px",
                      padding: "13px 24px", alignItems: "center",
                      borderBottom: i < opportunities.length - 1 ? "1px solid #fafaf9" : "none",
                      transition: "background 0.12s",
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fafaf9" }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                    >
                      <div style={{ minWidth: 0, paddingRight: 12 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#1c1917", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {opp.title}
                        </p>
                        {opp.value_max && (
                          <p style={{ fontSize: 11, color: "#a8a29e", margin: "2px 0 0" }}>
                            {opp.currency || "$"}{(opp.value_max / 1000).toFixed(0)}K contract value
                          </p>
                        )}
                      </div>
                      <span style={{ fontSize: 12, color: "#78716c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {opp.buyer_name || "—"}
                      </span>
                      <div>
                        <StatusPill status={opp.status} />
                      </div>
                      <div>
                        {opp.fit_score ? <FitBadge score={opp.fit_score} /> : <span style={{ color: "#d6d3d1", fontSize: 12 }}>—</span>}
                      </div>
                      <span style={{ fontSize: 11, color: opp.deadline && (new Date(opp.deadline).getTime() - Date.now()) < 7 * 86400000 ? "#dc2626" : "#a8a29e" }}>
                        {opp.deadline ? formatDate(opp.deadline) : "—"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Active Proposals */}
          {proposals.length > 0 && (
            <div style={{ background: "#ffffff", border: "1px solid #e7e5e4", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ padding: "18px 24px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f0ece8" }}>
                <div>
                  <h2 style={{ fontSize: 13, fontWeight: 700, color: "#1c1917", margin: 0 }}>Active Proposals</h2>
                  <p style={{ fontSize: 11, color: "#a8a29e", margin: "3px 0 0" }}>AI readiness scoring</p>
                </div>
                <Link href="/proposals" style={{ textDecoration: "none", fontSize: 12, color: "#d97706", fontWeight: 500 }}>
                  View all →
                </Link>
              </div>
              <div>
                {proposals.map((prop, i) => {
                  const opp = prop.opportunities as unknown as { title: string } | null
                  return (
                    <Link key={prop.id} href={`/proposals/${prop.id}`} style={{ textDecoration: "none" }}>
                      <div style={{
                        display: "grid", gridTemplateColumns: "1fr 180px 80px",
                        padding: "14px 24px", alignItems: "center",
                        borderBottom: i < proposals.length - 1 ? "1px solid #fafaf9" : "none",
                        transition: "background 0.12s",
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fafaf9" }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                      >
                        <div style={{ minWidth: 0, paddingRight: 12 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#1c1917", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {prop.title}
                          </p>
                          {opp && (
                            <p style={{ fontSize: 11, color: "#a8a29e", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {opp.title}
                            </p>
                          )}
                        </div>
                        <div style={{ paddingRight: 8 }}>
                          {prop.readiness_score !== null ? (
                            <ReadinessBar value={prop.readiness_score} />
                          ) : (
                            <span style={{ fontSize: 11, color: "#d6d3d1" }}>Not scored</span>
                          )}
                        </div>
                        <span style={{ fontSize: 11, color: "#c4bfbb", textAlign: "right" }}>
                          {timeAgo(prop.updated_at)}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Quick Actions */}
          <div style={{ background: "#ffffff", border: "1px solid #e7e5e4", borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, color: "#a8a29e", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px" }}>
              AI Actions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "Discover new opportunities", href: "/opportunities?action=discover", accent: "#3b82f6",
                  icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> },
                { label: "Upload & analyze an RFP", href: "/opportunities/upload", accent: "#7c3aed",
                  icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> },
                { label: "Generate a proposal", href: "/proposals/new", accent: "#d97706",
                  icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> },
                { label: "View pipeline board", href: "/pipeline", accent: "#0891b2",
                  icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg> },
                { label: "Update business memory", href: "/business-memory", accent: "#059669",
                  icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg> },
              ].map(action => (
                <Link key={action.href} href={action.href} style={{ textDecoration: "none" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8,
                    border: "1px solid #f0ece8", cursor: "pointer", transition: "all 0.12s",
                    color: "#44403c",
                  }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = action.accent
                      el.style.background = `rgba(${action.accent === "#3b82f6" ? "59,130,246" : action.accent === "#7c3aed" ? "124,58,237" : action.accent === "#d97706" ? "217,119,6" : action.accent === "#0891b2" ? "8,145,178" : "5,150,105"},0.05)`
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = "#f0ece8"
                      el.style.background = "transparent"
                    }}
                  >
                    <div style={{ width: 26, height: 26, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: `rgba(${action.accent === "#3b82f6" ? "59,130,246" : action.accent === "#7c3aed" ? "124,58,237" : action.accent === "#d97706" ? "217,119,6" : action.accent === "#0891b2" ? "8,145,178" : "5,150,105"},0.12)`, color: action.accent, flexShrink: 0 }}>
                      {action.icon}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{action.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Credits Widget */}
          <div style={{ background: "#ffffff", border: "1px solid #e7e5e4", borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 12, fontWeight: 700, color: "#a8a29e", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
                Credits & Usage
              </h2>
              <Link href="/credits" style={{ textDecoration: "none", fontSize: 11, color: "#d97706", fontWeight: 500 }}>Details</Link>
            </div>

            {credits ? (
              <>
                {/* Circular-style usage indicator */}
                <div style={{ textAlign: "center", marginBottom: 14 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#1c1917", fontVariantNumeric: "tabular-nums" }}>
                    {formatCredits(credits.balance)}
                  </div>
                  <div style={{ fontSize: 11, color: "#a8a29e", marginTop: 2 }}>credits remaining</div>
                </div>

                {/* Usage bar */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 10, color: "#c4bfbb", fontWeight: 600, letterSpacing: "0.04em" }}>USAGE</span>
                    <span style={{ fontSize: 10, color: usagePct > 75 ? "#dc2626" : "#a8a29e", fontWeight: 600 }}>{usagePct}%</span>
                  </div>
                  <div style={{ height: 6, background: "#f0ece8", borderRadius: 6, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 6, transition: "width 0.4s ease",
                      width: `${usagePct}%`,
                      background: usagePct > 75 ? "linear-gradient(90deg,#f59e0b,#dc2626)" : "linear-gradient(90deg,#d97706,#f59e0b)",
                    }} />
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                  {[
                    { label: "Used", value: formatCredits(credits.used_this_period) },
                    { label: "Monthly", value: formatCredits(credits.monthly_allowance) },
                  ].map(stat => (
                    <div key={stat.label} style={{ background: "#fafaf9", borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1c1917" }}>{stat.value}</div>
                      <div style={{ fontSize: 10, color: "#c4bfbb", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 2 }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 10, color: "#c4bfbb", marginBottom: 12, textAlign: "center" }}>
                  Resets {formatDate(credits.reset_date)}
                </div>

                {usagePct >= 70 && (
                  <Link href="/credits" style={{ textDecoration: "none" }}>
                    <button style={{
                      width: "100%", padding: "9px", borderRadius: 8, border: "none",
                      background: "linear-gradient(135deg, #d97706, #b45309)", color: "#fff",
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(180,83,9,0.3)",
                    }}>
                      Upgrade Plan →
                    </button>
                  </Link>
                )}
              </>
            ) : (
              <div style={{ padding: "12px 0", textAlign: "center", fontSize: 12, color: "#a8a29e" }}>Loading…</div>
            )}
          </div>

          {/* Activity Feed */}
          <div style={{ background: "#ffffff", border: "1px solid #e7e5e4", borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, color: "#a8a29e", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 14px" }}>
              Activity
            </h2>
            {activity.length === 0 ? (
              <p style={{ fontSize: 12, color: "#c4bfbb", textAlign: "center", padding: "16px 0" }}>No activity yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {activity.map((item, i) => (
                  <div key={item.id} style={{ display: "flex", gap: 12, paddingBottom: i < activity.length - 1 ? 12 : 0, marginBottom: i < activity.length - 1 ? 12 : 0, borderBottom: i < activity.length - 1 ? "1px solid #f5f5f4" : "none" }}>
                    <div style={{ flexShrink: 0, width: 6, paddingTop: 6, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fde68a", border: "2px solid #d97706", flexShrink: 0 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, color: "#57534e", margin: 0, lineHeight: 1.5 }}>{item.description}</p>
                      <p style={{ fontSize: 10, color: "#c4bfbb", margin: "3px 0 0" }}>{timeAgo(item.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
