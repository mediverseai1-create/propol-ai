"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, ChevronDown, LogOut, Settings, User, Zap } from "lucide-react"
import { getInitials } from "@/lib/utils"

interface TopbarProps {
  userName?: string
  userEmail?: string
  avatarUrl?: string
  title?: string
}

export function Topbar({ userName, userEmail, avatarUrl }: TopbarProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <header style={{
      height: 52, flexShrink: 0,
      background: "#0f0b08",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 20px",
    }}>
      {/* Left — breadcrumb placeholder */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontWeight: 500, letterSpacing: "0.04em" }}>
          Propol AI
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Notifications */}
        <button style={{
          width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 7, background: "transparent", border: "none", cursor: "pointer",
          color: "rgba(255,255,255,0.3)", transition: "all 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)" }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.3)" }}>
          <Bell style={{ width: 15, height: 15 }} />
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "5px 10px", borderRadius: 8,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer", transition: "all 0.15s",
            }}>
              <Avatar style={{ width: 24, height: 24 }}>
                <AvatarImage src={avatarUrl} />
                <AvatarFallback style={{ fontSize: 10, background: "#d97706", color: "#0c0804", fontWeight: 700 }}>
                  {getInitials(userName || userEmail || "U")}
                </AvatarFallback>
              </Avatar>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {userName || userEmail}
              </span>
              <ChevronDown style={{ width: 12, height: 12, color: "rgba(255,255,255,0.3)" }} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52" style={{ background: "#1c1917", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }}>
            <DropdownMenuLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#ffffff" }}>{userName}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{userEmail}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator style={{ background: "rgba(255,255,255,0.06)" }} />
            <DropdownMenuItem asChild>
              <Link href="/settings" style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer" }}>
                <User style={{ width: 14, height: 14 }} /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/credits" style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer" }}>
                <Zap style={{ width: 14, height: 14 }} /> Credits & Usage
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer" }}>
                <Settings style={{ width: 14, height: 14 }} /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator style={{ background: "rgba(255,255,255,0.06)" }} />
            <DropdownMenuItem onClick={handleSignOut} style={{ display: "flex", alignItems: "center", gap: 8, color: "#f87171", fontSize: 13, cursor: "pointer" }}>
              <LogOut style={{ width: 14, height: 14 }} /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
