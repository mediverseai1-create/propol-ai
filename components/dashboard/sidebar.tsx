"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo } from "@/components/shared/logo"
import {
  LayoutDashboard, Search, FileText, Brain,
  GitBranch, BarChart3, ClipboardList, Zap,
  Settings, Users,
} from "lucide-react"

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Opportunities", href: "/opportunities", icon: Search },
  { label: "Proposals", href: "/proposals", icon: FileText },
  { label: "Pipeline", href: "/pipeline", icon: GitBranch },
  { label: "Business Memory", href: "/business-memory", icon: Brain },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Reports", href: "/reports", icon: ClipboardList },
]

const BOTTOM_ITEMS = [
  { label: "Credits & Usage", href: "/credits", icon: Zap },
  { label: "Team", href: "/team", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
]

interface SidebarProps {
  credits?: { balance: number; monthly_allowance: number } | null
  orgName?: string
}

export function Sidebar({ credits, orgName }: SidebarProps) {
  const pathname = usePathname()

  const usagePct = credits
    ? Math.round(((credits.monthly_allowance - credits.balance) / credits.monthly_allowance) * 100)
    : 0

  const barColor = usagePct >= 90 ? "#ef4444" : usagePct >= 75 ? "#f59e0b" : "#d97706"

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      width: 232, flexShrink: 0,
      background: "#0f0b08",
      borderRight: "1px solid rgba(255,255,255,0.06)",
    }}>
      {/* Logo + org */}
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Logo size="sm" light />
        {orgName && (
          <div style={{
            marginTop: 10, padding: "5px 8px", borderRadius: 6,
            background: "rgba(255,255,255,0.04)",
            fontSize: 11, color: "rgba(255,255,255,0.3)",
            fontWeight: 600, letterSpacing: "0.02em",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {orgName}
          </div>
        )}
      </div>

      {/* Main nav */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", padding: "4px 8px", marginBottom: 6 }}>
          Workspace
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: 9,
              padding: "8px 10px", borderRadius: 7, marginBottom: 1,
              fontSize: 13, fontWeight: isActive ? 600 : 400,
              color: isActive ? "#fbbf24" : "rgba(255,255,255,0.45)",
              background: isActive ? "rgba(245,158,11,0.12)" : "transparent",
              textDecoration: "none", transition: "all 0.15s",
              borderLeft: isActive ? "2px solid #f59e0b" : "2px solid transparent",
            }}>
              <item.icon style={{ width: 15, height: 15, flexShrink: 0, opacity: isActive ? 1 : 0.6 }} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Credit bar */}
      {credits && (
        <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Credits</span>
            <Link href="/credits" style={{ fontSize: 11, color: "#f59e0b", textDecoration: "none", fontWeight: 600 }}>
              {credits.balance.toLocaleString()}
            </Link>
          </div>
          <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 2, width: `${Math.min(usagePct, 100)}%`, background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`, transition: "width 0.3s" }} />
          </div>
          <div style={{ marginTop: 6, fontSize: 10, color: "rgba(255,255,255,0.2)" }}>{usagePct}% of monthly allowance used</div>
        </div>
      )}

      {/* Bottom nav */}
      <div style={{ padding: "10px 10px 16px" }}>
        {BOTTOM_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: 9,
              padding: "8px 10px", borderRadius: 7, marginBottom: 1,
              fontSize: 13, fontWeight: isActive ? 600 : 400,
              color: isActive ? "#fbbf24" : "rgba(255,255,255,0.3)",
              background: isActive ? "rgba(245,158,11,0.12)" : "transparent",
              textDecoration: "none", transition: "all 0.15s",
              borderLeft: isActive ? "2px solid #f59e0b" : "2px solid transparent",
            }}>
              <item.icon style={{ width: 15, height: 15, flexShrink: 0 }} />
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
