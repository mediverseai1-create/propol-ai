import Link from "next/link"
import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import {
  Search, FileText, Brain, GitBranch, Zap, CheckCircle,
  ArrowRight, Building2, Globe, Shield, BarChart3, Target
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-stone-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="md" />
          <div className="hidden md:flex items-center gap-7 text-sm text-stone-600">
            <a href="#how-it-works" className="hover:text-stone-900 transition-colors">How it works</a>
            <a href="#features" className="hover:text-stone-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-stone-900 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Start free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-xs text-amber-800 font-medium mb-8">
          <Zap className="h-3.5 w-3.5" />
          AI-powered opportunity intelligence for B2B companies
        </div>

        <h1 className="text-5xl md:text-6xl font-semibold text-stone-900 leading-tight text-balance max-w-4xl mx-auto">
          Find the right opportunities.<br />
          <span className="text-amber-800">Win more of what you pursue.</span>
        </h1>

        <p className="mt-6 text-lg text-stone-500 max-w-2xl mx-auto leading-relaxed text-balance">
          Propol AI discovers relevant government contracts, RFPs, tenders, and grants — then prepares everything your company needs to apply. From opportunity to submission-ready proposal.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
          <Link href="/sign-up">
            <Button size="xl" className="gap-2 shadow-sm">
              Start free — 200 credits included
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button size="xl" variant="outline">See how it works</Button>
          </Link>
        </div>

        <p className="mt-4 text-xs text-stone-400">No credit card required · Free plan available · Cancel anytime</p>
      </section>

      {/* Stats bar */}
      <section className="border-y border-stone-100 bg-stone-50">
        <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "89%", label: "Average fit score accuracy" },
            { value: "73%", label: "Time saved on proposals" },
            { value: "2.4×", label: "Win rate improvement" },
            { value: "48hr", label: "Average proposal turnaround" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-semibold text-amber-900">{s.value}</div>
              <div className="text-sm text-stone-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-semibold text-stone-900">From discovery to submission</h2>
          <p className="text-stone-500 mt-3 max-w-xl mx-auto">One intelligent platform handles everything between finding an opportunity and submitting a winning proposal.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              icon: Brain,
              title: "Build your Business Memory",
              desc: "Upload your company profile, previous proposals, certifications, and case studies. PROPOL builds an intelligent understanding of your capabilities.",
            },
            {
              step: "02",
              icon: Search,
              title: "Discover relevant opportunities",
              desc: "PROPOL searches connected sources and returns only opportunities that genuinely match your company — ranked by fit score. Ask for 10, 25, 50, or 100.",
            },
            {
              step: "03",
              icon: Target,
              title: "Evaluate fit instantly",
              desc: "Every opportunity gets an AI-powered fit score, eligibility assessment, and a clear pursue / review / pass recommendation.",
            },
            {
              step: "04",
              icon: FileText,
              title: "Prepare the complete proposal",
              desc: "PROPOL drafts every section: executive summary, methodology, implementation plan, team structure, risk management, cover letter, and more.",
            },
            {
              step: "05",
              icon: Zap,
              title: "Close the gaps automatically",
              desc: "Missing a document? PROPOL identifies what can be created from your Business Memory and only asks for what genuinely cannot be generated.",
            },
            {
              step: "06",
              icon: CheckCircle,
              title: "Score and review before submission",
              desc: "Get a full readiness report: eligibility, compliance, evidence strength, proposal quality — with specific items to fix before submitting.",
            },
          ].map((item) => (
            <div key={item.step} className="p-6 rounded-xl border border-stone-100 bg-white hover:border-amber-200 hover:shadow-sm transition-all">
              <div className="flex items-start gap-4">
                <div>
                  <div className="text-xs font-semibold text-amber-800/50 mb-2">{item.step}</div>
                  <item.icon className="h-6 w-6 text-amber-800" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-stone-900 mb-1.5">{item.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-stone-50 border-y border-stone-100">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-semibold text-stone-900">Built for professional teams</h2>
            <p className="text-stone-500 mt-3 max-w-xl mx-auto">Every feature is designed for business development, proposals, and procurement teams at serious companies.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: GitBranch,
                title: "Opportunity Pipeline",
                desc: "Manage dozens of opportunities simultaneously. Track every stage from discovery through submission to outcome.",
              },
              {
                icon: Brain,
                title: "Business Memory",
                desc: "Your company's intelligence layer. Previous projects, certifications, team expertise, policies — all used automatically in proposals.",
              },
              {
                icon: BarChart3,
                title: "Analytics & Reports",
                desc: "Track pipeline value, win rates, fit score distributions, and credit usage. Export reports for stakeholders.",
              },
              {
                icon: Shield,
                title: "Multi-tenant security",
                desc: "Organization-level data isolation. Role-based permissions: Owner, Admin, Manager, Member, Viewer. Row-level security at the database.",
              },
              {
                icon: Globe,
                title: "All opportunity types",
                desc: "Government contracts, private RFPs, RFQs, tenders, grants, NGO contracts, enterprise procurement, partnerships, and more.",
              },
              {
                icon: Building2,
                title: "Team collaboration",
                desc: "Invite your proposals team, business development managers, and subject matter experts. Work on opportunities together.",
              },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4 p-5 bg-white rounded-xl border border-stone-200">
                <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <f.icon className="h-5 w-5 text-amber-800" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-900">{f.title}</h3>
                  <p className="text-sm text-stone-500 mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-stone-900">Who uses Propol AI</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            "Technology Companies",
            "Engineering Firms",
            "Consulting Practices",
            "Construction Companies",
            "Healthcare Providers",
            "Environmental Services",
            "Management Consultants",
            "Professional Services",
            "NGOs & Non-profits",
            "Research Organizations",
          ].map((type) => (
            <div key={type} className="text-center p-4 rounded-lg border border-stone-100 bg-stone-50 text-sm text-stone-600 font-medium">
              {type}
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-stone-50 border-y border-stone-100">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-stone-900">Simple, credit-based pricing</h2>
            <p className="text-stone-500 mt-3 max-w-xl mx-auto">Your subscription provides a monthly credit allowance. Use credits for AI analysis, proposal drafting, and discovery. Credits reset every billing period.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                name: "Free",
                price: "$0",
                credits: "200",
                period: "forever",
                features: ["200 credits/month", "Opportunity discovery", "Basic analysis", "1 user", "Community support"],
                cta: "Start free",
                href: "/sign-up",
                highlight: false,
              },
              {
                name: "Starter",
                price: "$47",
                credits: "4,000",
                period: "/month",
                features: ["4,000 credits/month", "Full AI analysis", "Proposal drafting", "Business Memory", "Email support"],
                cta: "Get Starter",
                href: "/sign-up",
                highlight: false,
              },
              {
                name: "Pro",
                price: "$57",
                credits: "7,000",
                period: "/month",
                features: ["7,000 credits/month", "Everything in Starter", "Compliance checker", "Readiness scoring", "Priority support"],
                cta: "Get Pro",
                href: "/sign-up",
                highlight: true,
              },
              {
                name: "Scale",
                price: "$97",
                credits: "11,000",
                period: "/month",
                features: ["11,000 credits/month", "Everything in Pro", "Bulk pursuit", "Team collaboration", "Dedicated support"],
                cta: "Get Scale",
                href: "/sign-up",
                highlight: false,
              },
            ].map((plan) => (
              <div key={plan.name} className={`p-6 rounded-xl border ${plan.highlight ? "border-amber-800 shadow-md bg-white ring-1 ring-amber-800" : "border-stone-200 bg-white"}`}>
                {plan.highlight && (
                  <div className="text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full inline-block mb-3">Most Popular</div>
                )}
                <div className="text-lg font-semibold text-stone-900">{plan.name}</div>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-stone-900">{plan.price}</span>
                  <span className="text-stone-400 text-sm">{plan.period}</span>
                </div>
                <div className="text-sm text-amber-800 font-medium mt-1">{plan.credits} credits/month</div>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-stone-600">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className="block mt-5">
                  <Button className="w-full" variant={plan.highlight ? "default" : "outline"} size="sm">
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-semibold text-stone-900 text-center mb-12">Frequently asked questions</h2>
        <div className="space-y-6">
          {[
            {
              q: "What types of opportunities does Propol AI find?",
              a: "Propol AI discovers government contracts, public tenders, private RFPs, RFQs, grants, NGO contracts, enterprise procurement opportunities, innovation funding, and partnership opportunities — across any industry.",
            },
            {
              q: "How does the credit system work?",
              a: "Each subscription plan includes a monthly credit allowance. Different AI operations consume different amounts of credits: opportunity discovery, analysis, proposal section generation, readiness scoring, and more. Credits reset each billing period.",
            },
            {
              q: "Can Propol AI really write complete proposals?",
              a: "Yes. Using your Business Memory and the opportunity requirements, PROPOL drafts executive summaries, cover letters, technical proposals, methodologies, implementation plans, risk management sections, team profiles, timelines, and more. You review and refine the output.",
            },
            {
              q: "Does Propol AI fabricate credentials or certifications?",
              a: "Never. PROPOL only uses verified information from your Business Memory. If your company doesn't hold a required certification, it will clearly flag this as an external requirement rather than fabricate it.",
            },
            {
              q: "Is my company data secure?",
              a: "All data is isolated at the organization level using Supabase Row Level Security. Users can only access their own organization's data. All AI processing happens server-side — your API keys and sensitive data are never exposed.",
            },
          ].map((faq) => (
            <div key={faq.q} className="border-b border-stone-100 pb-6">
              <h3 className="text-base font-semibold text-stone-900 mb-2">{faq.q}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-amber-900 text-white">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-semibold mb-4">Ready to win more opportunities?</h2>
          <p className="text-amber-200 text-lg mb-8 max-w-xl mx-auto">
            Join companies using Propol AI to discover relevant opportunities and prepare winning proposals at scale.
          </p>
          <Link href="/sign-up">
            <Button size="xl" className="bg-white text-amber-900 hover:bg-amber-50 font-semibold">
              Start for free — 200 credits included
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-xs text-stone-400">© {new Date().getFullYear()} Propol AI. All rights reserved.</p>
          <div className="flex gap-5 text-xs text-stone-400">
            <a href="#" className="hover:text-stone-600">Privacy</a>
            <a href="#" className="hover:text-stone-600">Terms</a>
            <a href="#" className="hover:text-stone-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
