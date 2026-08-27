"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Brain, Plus, CheckCircle, Zap, Loader2, Edit, Trash2, Search } from "lucide-react"
import { timeAgo } from "@/lib/utils"

const MEMORY_SECTIONS = [
  "Company Overview",
  "Services & Capabilities",
  "Industries Served",
  "Key Projects & Case Studies",
  "Team & Expertise",
  "Certifications & Accreditations",
  "Geographic Presence",
  "Technology & Tools",
  "Pricing & Commercial",
  "References & Testimonials",
  "Previous Proposals",
  "Policies & Compliance",
  "Financial Capacity",
  "Partnerships & Alliances",
]

interface Memory {
  id: string
  section: string
  title: string
  content: string
  source_type: string
  is_verified: boolean
  created_at: string
  updated_at: string
}

interface Props {
  memories: Memory[]
  organizationId: string
  orgProfile: { name: string; industry: string | null; country: string | null; description: string | null } | null
  credits: { balance: number } | null
  userId: string
}

export function BusinessMemoryClient({ memories, organizationId, orgProfile, credits, userId }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    section: "",
    title: "",
    content: "",
    source_type: "manual" as "manual" | "uploaded" | "extracted",
  })

  const bySection = memories.reduce((acc, m) => {
    if (!acc[m.section]) acc[m.section] = []
    acc[m.section].push(m)
    return acc
  }, {} as Record<string, Memory[]>)

  const filtered = search
    ? memories.filter(m =>
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.content.toLowerCase().includes(search.toLowerCase()) ||
        m.section.toLowerCase().includes(search.toLowerCase())
      )
    : null

  const completionScore = Math.min(
    Math.round((Object.keys(bySection).length / MEMORY_SECTIONS.length) * 100),
    100
  )

  async function handleSave() {
    if (!form.section || !form.title || !form.content) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/business-memory/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, organizationId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setShowAdd(false)
      setForm({ section: "", title: "", content: "", source_type: "manual" })
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  async function handleExtract(content: string) {
    setExtracting(true)
    setError(null)
    try {
      const res = await fetch("/api/business-memory/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, content }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.refresh()
      setShowAdd(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Extraction failed")
    } finally {
      setExtracting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this memory entry?")) return
    await fetch(`/api/business-memory/${id}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Business Memory</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {memories.length} entries · {completionScore}% profile completeness
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" /> Add Information
        </Button>
      </div>

      {/* Completion bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-amber-800" />
              <span className="text-sm font-medium text-stone-700">Profile Completeness</span>
            </div>
            <span className={`text-sm font-semibold ${completionScore >= 80 ? "text-emerald-600" : completionScore >= 50 ? "text-amber-600" : "text-stone-600"}`}>
              {completionScore}%
            </span>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-800 rounded-full transition-all"
              style={{ width: `${completionScore}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {MEMORY_SECTIONS.map((sec) => (
              <span
                key={sec}
                className={`text-xs px-2 py-0.5 rounded-full border ${
                  bySection[sec]?.length > 0
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-stone-50 border-stone-200 text-stone-400"
                }`}
              >
                {bySection[sec]?.length > 0 && "✓ "}{sec}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <Input
          placeholder="Search memory…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Memory entries */}
      {memories.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center space-y-3">
            <Brain className="h-10 w-10 text-stone-200 mx-auto" />
            <p className="text-sm font-medium text-stone-700">Your Business Memory is empty</p>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              Add your company information, capabilities, projects, and documents. PROPOL uses this to evaluate opportunities and build proposals.
            </p>
            <Button size="sm" className="mt-2" onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4" /> Add First Entry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {(filtered ? [{ key: "Search Results", items: filtered }] : Object.entries(bySection).map(([key, items]) => ({ key, items }))).map(({ key, items }) => (
            <div key={key}>
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">{key} ({items.length})</h3>
              <div className="space-y-2">
                {items.map((mem) => (
                  <Card key={mem.id} className="group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-stone-800">{mem.title}</h4>
                            {mem.is_verified && (
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {mem.source_type}
                            </Badge>
                          </div>
                          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{mem.content}</p>
                          <p className="text-xs text-stone-300 mt-1.5">{timeAgo(mem.updated_at)}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => handleDelete(mem.id)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Memory Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add to Business Memory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block">Section *</Label>
                <Select value={form.section} onValueChange={(v) => setForm({ ...form, section: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEMORY_SECTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Source</Label>
                <Select value={form.source_type} onValueChange={(v: "manual" | "uploaded" | "extracted") => setForm({ ...form, source_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual entry</SelectItem>
                    <SelectItem value="uploaded">Uploaded document</SelectItem>
                    <SelectItem value="extracted">Extracted by AI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. ISO 9001:2015 Certification"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Content *</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Describe in detail. The more information you provide, the better PROPOL can use this in proposals."
                rows={5}
              />
            </div>

            {error && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2.5">{error}</div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={saving || !form.section || !form.title || !form.content}
              >
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : "Save Entry"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
