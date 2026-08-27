"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/shared/logo"
import {
  LayoutDashboard,
  Search,
  FileText,
  Brain,
  GitBranch,
  BarChart3,
  ClipboardList,
  Zap,
  Settings,
  Users,
  CreditCard,
} from "lucide-react"

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Opportunities",
    href: "/opportunities",
    icon: Search,
  },
  {
    label: "Proposals",
    href: "/proposals",
    icon: FileText,
  },
  {
    label: "Pipeline",
    href: "/pipeline",
    icon: GitBranch,
  },
  {
    label: "Business Memory",
    href: "/business-memory",
    icon: Brain,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: ClipboardList,
  },
]

const BOTTOM_ITEMS = [
  {
    label: "Credits & Usage",
    href: "/credits",
    icon: Zap,
  },
  {
    label: "Team",
    href: "/team",
    icon: Users,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
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

  return (
    <div className="flex flex-col h-full bg-white border-r border-stone-200 w-56 xl:w-60 shrink-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-stone-100">
        <Logo size="sm" />
        {orgName && (
          <div className="mt-2 px-1 text-xs text-stone-400 truncate">{orgName}</div>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "sidebar-item",
                isActive && "active"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Credit indicator */}
      {credits && (
        <div className="px-4 py-3 border-t border-stone-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-stone-500">Credits</span>
            <Link href="/credits" className="text-xs text-amber-800 hover:underline">
              {credits.balance.toLocaleString()} left
            </Link>
          </div>
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                usagePct >= 90 ? "bg-red-500" : usagePct >= 75 ? "bg-amber-500" : "bg-amber-800"
              )}
              style={{ width: `${Math.min(usagePct, 100)}%` }}
            />
          </div>
          <div className="text-xs text-stone-400 mt-1">{usagePct}% used this month</div>
        </div>
      )}

      {/* Bottom nav */}
      <div className="border-t border-stone-100 px-3 py-3 space-y-0.5">
        {BOTTOM_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("sidebar-item", isActive && "active")}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
