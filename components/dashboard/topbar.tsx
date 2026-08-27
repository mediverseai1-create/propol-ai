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

export function Topbar({ userName, userEmail, avatarUrl, title }: TopbarProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <header className="h-14 bg-white border-b border-stone-200 flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-3">
        {title && (
          <h1 className="text-sm font-semibold text-stone-800">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="h-8 w-8 flex items-center justify-center rounded text-stone-500 hover:bg-stone-100 hover:text-stone-700 relative">
          <Bell className="h-4 w-4" />
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded px-2 py-1 hover:bg-stone-100 transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-xs">
                  {getInitials(userName || userEmail || "U")}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-stone-700 hidden sm:block max-w-[120px] truncate">
                {userName || userEmail}
              </span>
              <ChevronDown className="h-3 w-3 text-stone-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-0.5">
                <span className="text-sm font-medium text-stone-900">{userName}</span>
                <span className="text-xs text-stone-500">{userEmail}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/credits" className="cursor-pointer">
                <Zap className="mr-2 h-4 w-4" />
                Credits & Usage
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-red-600 focus:text-red-600 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
