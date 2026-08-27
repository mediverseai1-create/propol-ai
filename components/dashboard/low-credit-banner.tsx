"use client"

import Link from "next/link"
import { Zap, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface LowCreditBannerProps {
  balance: number
  monthly: number
  usagePct: number
}

export function LowCreditBanner({ balance, monthly, usagePct }: LowCreditBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const isExhausted = balance === 0
  const isCritical = usagePct >= 90
  const isWarning = usagePct >= 75

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 text-sm border-b",
        isExhausted
          ? "bg-red-50 border-red-200 text-red-800"
          : isCritical
          ? "bg-orange-50 border-orange-200 text-orange-800"
          : "bg-amber-50 border-amber-200 text-amber-800"
      )}
    >
      <Zap className="h-4 w-4 shrink-0" />
      <span className="flex-1">
        {isExhausted
          ? "Your monthly credits are exhausted. Upgrade your plan or wait for the next billing cycle."
          : isCritical
          ? `Only ${balance.toLocaleString()} credits remaining this month (${Math.round(usagePct)}% used).`
          : `You've used ${Math.round(usagePct)}% of your monthly credits. ${balance.toLocaleString()} remaining.`}
        {" "}
        <Link
          href="/credits"
          className="font-semibold underline underline-offset-2 hover:no-underline"
        >
          {isExhausted ? "View options" : "Upgrade plan"}
        </Link>
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="text-current opacity-60 hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
