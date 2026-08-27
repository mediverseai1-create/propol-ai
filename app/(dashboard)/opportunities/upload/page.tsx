"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Upload, Link2, FileText, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function UploadOpportunityPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState<"paste" | "url" | null>(null)
  const [content, setContent] = useState("")
  const [url, setUrl] = useState("")
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!title) { setError("Please provide a title"); return }
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/sign-in"); return }

    const { data: membership } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (!membership) { setError("Organization not found"); setLoading(false); return }

    try {
      const res = await fetch("/api/opportunities/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: membership.organization_id,
          title,
          content: mode === "paste" ? content : undefined,
          url: mode === "url" ? url : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/opportunities/${data.opportunityId}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed")
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/opportunities" className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
        <h1 className="text-xl font-semibold text-stone-900">I Already Have an Opportunity</h1>
        <p className="text-sm text-stone-500 mt-1">Paste content, provide a URL, or describe the opportunity. PROPOL will analyze it immediately.</p>
      </div>

      <div>
        <Label className="mb-2 block">Opportunity title *</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. City of Austin IT Services RFP 2024-087"
        />
      </div>

      {!mode && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button onClick={() => setMode("paste")} className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-stone-300 rounded-lg hover:border-amber-400 hover:bg-amber-50/50 transition-colors text-center group">
            <FileText className="h-8 w-8 text-stone-400 group-hover:text-amber-700" />
            <div>
              <p className="text-sm font-medium text-stone-700">Paste Content</p>
              <p className="text-xs text-stone-400 mt-0.5">Paste RFP text, description, or email content</p>
            </div>
          </button>
          <button onClick={() => setMode("url")} className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-stone-300 rounded-lg hover:border-amber-400 hover:bg-amber-50/50 transition-colors text-center group">
            <Link2 className="h-8 w-8 text-stone-400 group-hover:text-amber-700" />
            <div>
              <p className="text-sm font-medium text-stone-700">Provide URL</p>
              <p className="text-xs text-stone-400 mt-0.5">Link to an RFP, tender notice, or opportunity page</p>
            </div>
          </button>
        </div>
      )}

      {mode === "paste" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Opportunity content *</Label>
            <button onClick={() => setMode(null)} className="text-xs text-stone-400 hover:text-stone-600">Change method</button>
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste the RFP text, tender description, grant requirements, or any opportunity details here…"
            rows={12}
          />
          <p className="text-xs text-stone-400">The more detail you provide, the better PROPOL can analyze the opportunity.</p>
        </div>
      )}

      {mode === "url" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Opportunity URL *</Label>
            <button onClick={() => setMode(null)} className="text-xs text-stone-400 hover:text-stone-600">Change method</button>
          </div>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://government.gov/rfp/2024-087"
            type="url"
          />
        </div>
      )}

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>
      )}

      {mode && (
        <Button
          onClick={handleSubmit}
          disabled={loading || !title || (mode === "paste" && !content) || (mode === "url" && !url)}
          className="w-full"
          size="lg"
        >
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Processing…</> : <><Upload className="h-4 w-4" />Add & Analyze Opportunity</>}
        </Button>
      )}
    </div>
  )
}
