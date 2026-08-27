"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, ChevronRight, Building2, User, Target } from "lucide-react"
import { slugify } from "@/lib/utils"

const INDUSTRIES = [
  "Technology & Software",
  "Construction & Infrastructure",
  "Healthcare & Medical",
  "Engineering & Technical Services",
  "Consulting & Advisory",
  "Facilities Management",
  "Environmental & Sustainability",
  "Education & Training",
  "Financial Services",
  "Marketing & Communications",
  "Supply Chain & Logistics",
  "Defense & Security",
  "Energy & Utilities",
  "Research & Development",
  "Legal Services",
  "Other Professional Services",
]

const TEAM_SIZES = [
  "1–10 employees",
  "11–50 employees",
  "51–200 employees",
  "201–500 employees",
  "501–1,000 employees",
  "1,000+ employees",
]

const ROLES = [
  "CEO / Founder",
  "COO / Operations",
  "Business Development",
  "Proposals / Bids Manager",
  "Sales Director",
  "Project Manager",
  "Finance / Commercial",
  "Other",
]

const USE_CASES = [
  "Government contracts & tenders",
  "Private sector RFPs",
  "Grants & funding",
  "NGO & development contracts",
  "Corporate procurement",
  "All of the above",
]

const STEPS = [
  { id: 1, title: "Your profile", icon: User },
  { id: 2, title: "Your company", icon: Building2 },
  { id: 3, title: "Your goals", icon: Target },
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [profile, setProfile] = useState({
    full_name: "",
    job_title: "",
    phone: "",
  })

  const [company, setCompany] = useState({
    name: "",
    industry: "",
    country: "",
    size: "",
    website: "",
    description: "",
  })

  const [goals, setGoals] = useState({
    use_case: "",
    primary_goal: "",
  })

  async function handleComplete() {
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/sign-in"); return }

    try {
      // Upsert profile
      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email!,
        full_name: profile.full_name,
        job_title: profile.job_title,
        phone: profile.phone || null,
        updated_at: new Date().toISOString(),
      })

      // Create organization
      const slug = slugify(company.name) + "-" + Math.random().toString(36).slice(2, 6)
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name: company.name,
          slug,
          industry: company.industry || null,
          country: company.country || null,
          size: company.size || null,
          website: company.website || null,
          description: company.description || null,
          owner_id: user.id,
          subscription_plan: "free",
          subscription_status: "active",
        })
        .select()
        .single()

      if (orgError) throw orgError

      // Add owner as member
      await supabase.from("organization_members").insert({
        organization_id: org.id,
        user_id: user.id,
        role: "owner",
        status: "active",
        joined_at: new Date().toISOString(),
      })

      // Initialize credits via API
      await fetch("/api/credits/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: org.id }),
      })

      router.push("/dashboard")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white px-6 py-4">
        <Logo size="sm" />
      </header>

      <div className="flex-1 flex items-start justify-center py-10 px-4">
        <div className="w-full max-w-xl">
          {/* Step indicators */}
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      step > s.id
                        ? "bg-amber-900 text-white"
                        : step === s.id
                        ? "bg-amber-900 text-white"
                        : "bg-stone-200 text-stone-500"
                    }`}
                  >
                    {step > s.id ? "✓" : s.id}
                  </div>
                  <span className={`text-sm hidden sm:block ${step === s.id ? "text-stone-900 font-medium" : "text-stone-400"}`}>
                    {s.title}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px flex-1 mx-3 ${step > s.id ? "bg-amber-900" : "bg-stone-200"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Profile */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-stone-900 mb-1">Tell us about yourself</h2>
              <p className="text-sm text-stone-500 mb-6">This helps us personalize your Propol AI experience.</p>

              <div className="space-y-4">
                <div>
                  <Label>Full name *</Label>
                  <Input
                    className="mt-1.5"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="Jane Smith"
                    autoFocus
                  />
                </div>
                <div>
                  <Label>Job title *</Label>
                  <Select value={profile.job_title} onValueChange={(v) => setProfile({ ...profile, job_title: v })}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Phone (optional)</Label>
                  <Input
                    className="mt-1.5"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+1 555 000 0000"
                    type="tel"
                  />
                </div>
              </div>

              <Button
                className="w-full mt-8"
                size="lg"
                onClick={() => setStep(2)}
                disabled={!profile.full_name || !profile.job_title}
              >
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 2: Company */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-stone-900 mb-1">Your company</h2>
              <p className="text-sm text-stone-500 mb-6">This becomes the foundation of your Business Memory.</p>

              <div className="space-y-4">
                <div>
                  <Label>Company name *</Label>
                  <Input
                    className="mt-1.5"
                    value={company.name}
                    onChange={(e) => setCompany({ ...company, name: e.target.value })}
                    placeholder="Acme Corporation"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Industry *</Label>
                    <Select value={company.industry} onValueChange={(v) => setCompany({ ...company, industry: v })}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Team size *</Label>
                    <Select value={company.size} onValueChange={(v) => setCompany({ ...company, size: v })}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEAM_SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Country *</Label>
                  <Input
                    className="mt-1.5"
                    value={company.country}
                    onChange={(e) => setCompany({ ...company, country: e.target.value })}
                    placeholder="United States"
                  />
                </div>
                <div>
                  <Label>Website (optional)</Label>
                  <Input
                    className="mt-1.5"
                    value={company.website}
                    onChange={(e) => setCompany({ ...company, website: e.target.value })}
                    placeholder="https://yourcompany.com"
                    type="url"
                  />
                </div>
                <div>
                  <Label>Brief company description (optional)</Label>
                  <Textarea
                    className="mt-1.5"
                    value={company.description}
                    onChange={(e) => setCompany({ ...company, description: e.target.value })}
                    placeholder="What does your company do? What are your key capabilities?"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={() => setStep(3)}
                  disabled={!company.name || !company.industry || !company.size || !company.country}
                >
                  Continue <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-stone-900 mb-1">What are you pursuing?</h2>
              <p className="text-sm text-stone-500 mb-6">We'll tailor your opportunity discovery to match.</p>

              <div className="space-y-4">
                <div>
                  <Label>Primary opportunity type *</Label>
                  <Select value={goals.use_case} onValueChange={(v) => setGoals({ ...goals, use_case: v })}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select your focus" />
                    </SelectTrigger>
                    <SelectContent>
                      {USE_CASES.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>What is your primary goal with Propol AI?</Label>
                  <Textarea
                    className="mt-1.5"
                    value={goals.primary_goal}
                    onChange={(e) => setGoals({ ...goals, primary_goal: e.target.value })}
                    placeholder="E.g. Find and win more government IT contracts in the $500K–$2M range..."
                    rows={3}
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-3 mt-8">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleComplete}
                  disabled={!goals.use_case || loading}
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Setting up…</>
                  ) : (
                    "Launch Propol AI"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
