import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCredits(credits: number): string {
  return credits.toLocaleString()
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function timeAgo(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function getFitScoreColor(score: number): string {
  if (score >= 85) return "text-emerald-600"
  if (score >= 70) return "text-amber-600"
  return "text-red-500"
}

export function getFitScoreBg(score: number): string {
  if (score >= 85) return "bg-emerald-50 text-emerald-700 border-emerald-200"
  if (score >= 70) return "bg-amber-50 text-amber-700 border-amber-200"
  return "bg-red-50 text-red-700 border-red-200"
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    discovered: "bg-blue-50 text-blue-700 border-blue-200",
    qualified: "bg-purple-50 text-purple-700 border-purple-200",
    recommended: "bg-emerald-50 text-emerald-700 border-emerald-200",
    preparing: "bg-amber-50 text-amber-700 border-amber-200",
    needs_input: "bg-orange-50 text-orange-700 border-orange-200",
    ready_for_review: "bg-teal-50 text-teal-700 border-teal-200",
    ready_to_submit: "bg-green-50 text-green-700 border-green-200",
    submitted: "bg-indigo-50 text-indigo-700 border-indigo-200",
    won: "bg-emerald-50 text-emerald-700 border-emerald-200",
    lost: "bg-red-50 text-red-700 border-red-200",
    passed: "bg-stone-50 text-stone-600 border-stone-200",
  }
  return map[status] || "bg-stone-50 text-stone-600 border-stone-200"
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
