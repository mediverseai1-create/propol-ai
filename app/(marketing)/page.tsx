import Link from "next/link"
import { Logo } from "@/components/shared/logo"

export const metadata = {
  title: "Propol AI — AI Proposal & Opportunity Intelligence",
  description: "Propol AI reads every tender, qualifies every opportunity, and builds submission-ready proposals — so your team focuses on winning, not searching.",
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-sans)" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(12,8,4,0.92)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo size="md" light />
          <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="hidden md:flex">
            {["How it works", "Features", "Pricing"].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`} style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}>
                {item}
              </a>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/sign-in" style={{
              fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.65)",
              textDecoration: "none", padding: "8px 16px", borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.12)", transition: "all 0.15s",
            }}>Sign in</Link>
            <Link href="/sign-up" style={{
              fontSize: 14, fontWeight: 600, color: "#0c0804",
              textDecoration: "none", padding: "9px 20px", borderRadius: 8,
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
              transition: "all 0.15s",
            }}>Get started</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        background: "linear-gradient(160deg, #0c0804 0%, #1a0f06 40%, #0f0c18 100%)",
        position: "relative", overflow: "hidden",
        padding: "120px 24px 100px",
      }}>
        {/* Glossy glow orbs */}
        <div style={{
          position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)",
          width: 900, height: 500,
          background: "radial-gradient(ellipse, rgba(217,119,6,0.18) 0%, rgba(37,99,235,0.08) 50%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: 60, right: -100,
          width: 500, height: 500,
          background: "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 60%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -60, left: -80,
          width: 400, height: 400,
          background: "radial-gradient(circle, rgba(217,119,6,0.1) 0%, transparent 60%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          {/* Platform label */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px", borderRadius: 100,
            border: "1px solid rgba(217,119,6,0.3)",
            background: "rgba(217,119,6,0.08)",
            marginBottom: 32,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#fbbf24", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              AI Proposal Intelligence
            </span>
          </div>

          {/* Main headline */}
          <h1 style={{
            fontSize: "clamp(42px, 6vw, 76px)", fontWeight: 800,
            lineHeight: 1.08, letterSpacing: "-0.03em",
            margin: "0 0 28px", color: "#ffffff",
          }}>
            The AI that reads every<br />
            <span style={{
              background: "linear-gradient(90deg, #f59e0b 0%, #fbbf24 40%, #60a5fa 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>tender, qualifies every bid,</span><br />
            and builds the proposal.
          </h1>

          <p style={{
            fontSize: 19, color: "rgba(255,255,255,0.5)", lineHeight: 1.7,
            maxWidth: 600, margin: "0 auto 48px",
          }}>
            Propol AI studies your company, scans the market for matching contracts, scores every opportunity against your capabilities, and drafts submission-ready proposals — section by section.
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            <Link href="/sign-up" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 32px", borderRadius: 10,
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              color: "#0c0804", fontSize: 15, fontWeight: 700, textDecoration: "none",
              boxShadow: "0 0 40px rgba(245,158,11,0.3), 0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
              transition: "all 0.2s",
            }}>
              Get started free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <Link href="/sign-in" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 32px", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.75)", fontSize: 15, fontWeight: 500, textDecoration: "none",
            }}>
              Sign in
            </Link>
          </div>

          <p style={{ marginTop: 24, fontSize: 13, color: "rgba(255,255,255,0.25)", letterSpacing: "0.04em" }}>
            Business Memory · Opportunity Discovery · Proposal Builder · Pipeline
          </p>
        </div>

        {/* Dashboard preview mockup */}
        <div style={{ maxWidth: 1000, margin: "72px auto 0", position: "relative", zIndex: 1 }}>
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
          }}>
            {/* Mock browser bar */}
            <div style={{
              padding: "12px 16px",
              background: "rgba(255,255,255,0.04)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["#ff5f57","#ffbd2e","#28c840"].map(c => (
                  <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                ))}
              </div>
              <div style={{
                flex: 1, maxWidth: 300, margin: "0 auto",
                background: "rgba(255,255,255,0.05)", borderRadius: 6, padding: "4px 12px",
                fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "center",
              }}>
                app.propolai.cloud/dashboard
              </div>
            </div>
            {/* Mock dashboard content */}
            <div style={{ padding: 24, display: "grid", gridTemplateColumns: "220px 1fr", gap: 20, minHeight: 280 }}>
              {/* Sidebar */}
              <div style={{ borderRight: "1px solid rgba(255,255,255,0.06)", paddingRight: 20 }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Navigation</div>
                {[
                  { label: "Dashboard", active: true },
                  { label: "Opportunities", active: false },
                  { label: "Proposals", active: false },
                  { label: "Pipeline", active: false },
                  { label: "Business Memory", active: false },
                  { label: "Analytics", active: false },
                ].map(item => (
                  <div key={item.label} style={{
                    padding: "8px 10px", borderRadius: 6, marginBottom: 2,
                    background: item.active ? "rgba(217,119,6,0.15)" : "transparent",
                    color: item.active ? "#fbbf24" : "rgba(255,255,255,0.35)",
                    fontSize: 13, display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: item.active ? "#f59e0b" : "rgba(255,255,255,0.15)" }} />
                    {item.label}
                  </div>
                ))}
              </div>
              {/* Main area */}
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "In Pipeline", value: "24", color: "#60a5fa" },
                    { label: "Active Proposals", value: "6", color: "#f59e0b" },
                    { label: "Submitted", value: "11", color: "#34d399" },
                    { label: "Won", value: "3", color: "#a78bfa" },
                  ].map(kpi => (
                    <div key={kpi.label} style={{
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 10, padding: "14px 16px",
                    }}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>{kpi.label}</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { title: "Infrastructure Modernization RFP", score: 87, status: "Preparing" },
                    { title: "Digital Services Framework", score: 73, status: "Analyzing" },
                    { title: "AI Consultancy Tender 2026", score: 91, status: "Recommended" },
                    { title: "Smart City Initiative", score: 65, status: "Discovered" },
                  ].map(opp => (
                    <div key={opp.title} style={{
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 8, padding: "12px 14px",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                          background: opp.score >= 80 ? "rgba(52,211,153,0.15)" : "rgba(251,191,36,0.15)",
                          color: opp.score >= 80 ? "#34d399" : "#fbbf24",
                        }}>{opp.score}% fit</span>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{opp.status}</span>
                      </div>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.4 }}>{opp.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Glow under the mockup */}
          <div style={{
            position: "absolute", bottom: -40, left: "50%", transform: "translateX(-50%)",
            width: "60%", height: 80,
            background: "radial-gradient(ellipse, rgba(217,119,6,0.2) 0%, transparent 70%)",
            filter: "blur(20px)", pointerEvents: "none",
          }} />
        </div>
      </section>

      {/* ── OPERATING LOOP ── */}
      <section id="how-it-works" style={{ background: "#fafaf9", padding: "100px 24px", borderTop: "1px solid #e7e5e4" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#d97706", marginBottom: 16 }}>
            THE PROPOL OPERATING LOOP
          </p>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, color: "#1c1917", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 16 }}>
            Discover. Qualify. Build. Win.
          </h2>
          <p style={{ fontSize: 17, color: "#78716c", maxWidth: 540, margin: "0 auto 56px", lineHeight: 1.65 }}>
            Every stage feeds the next automatically. A tender published today is qualified, prepared, and in your proposal editor before your team finishes coffee.
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 0, marginBottom: 64 }}>
            {["Discover", "Qualify", "Analyze", "Build", "Review", "Submit", "Win"].map((step, i, arr) => (
              <div key={step} style={{ display: "flex", alignItems: "center" }}>
                <div style={{
                  padding: "10px 20px", borderRadius: 100,
                  background: i === 3 ? "linear-gradient(135deg, #f59e0b, #d97706)" : i < 3 ? "#1c1917" : "white",
                  color: i === 3 ? "#0c0804" : i < 3 ? "white" : "#78716c",
                  border: i >= 3 && i !== 3 ? "1.5px solid #e7e5e4" : "none",
                  fontSize: 14, fontWeight: 600,
                  boxShadow: i === 3 ? "0 4px 20px rgba(245,158,11,0.35)" : "none",
                }}>
                  {step}
                </div>
                {i < arr.length - 1 && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: "#d6d3d1" }}>
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            ))}
          </div>

          {/* Three columns */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 2 }}>
            {[
              {
                icon: "🔍",
                title: "Business Memory learns your company",
                body: "It reads your past contracts, certifications, team structure, and capabilities. Every discovery decision is grounded in what your organisation can actually deliver.",
              },
              {
                icon: "⚡",
                title: "The AI scans and qualifies automatically",
                body: "Propol AI surfaces matching tenders, scores each against your profile, and flags what to pursue, what to pass, and why — with no manual sifting.",
              },
              {
                icon: "📄",
                title: "Proposals are drafted section by section",
                body: "Executive summary, technical approach, methodology, pricing — each section generated from your own company data and the opportunity's requirements.",
              },
            ].map((col, i) => (
              <div key={i} style={{
                padding: 32, textAlign: "left",
                borderRadius: i === 0 ? "12px 0 0 12px" : i === 2 ? "0 12px 12px 0" : 0,
                border: "1px solid #e7e5e4",
                background: "white",
                marginLeft: i > 0 ? -1 : 0,
              }}>
                <div style={{ fontSize: 28, marginBottom: 16 }}>{col.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1c1917", marginBottom: 10, lineHeight: 1.3 }}>{col.title}</h3>
                <p style={{ fontSize: 14, color: "#78716c", lineHeight: 1.65, margin: 0 }}>{col.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT PROPOL LOOKS FOR ── */}
      <section style={{ background: "#1c1917", padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#d97706", marginBottom: 16 }}>
              WHAT PROPOL AI READS
            </p>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, color: "#ffffff", lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
              Your pipeline is already full of signal.
            </h2>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 46px)", fontWeight: 800, color: "rgba(255,255,255,0.3)", lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 20px" }}>
              Most teams only see the deadline.
            </h2>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.45)", maxWidth: 560, margin: "0 auto", lineHeight: 1.65 }}>
              Propol AI reads every requirement, every evaluation criterion, and your entire company profile — then tells your team exactly what to pursue and how.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 1, background: "rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}>
            {[
              { title: "Fit scoring", body: "Every opportunity scored against your capabilities, certifications, past contracts, and target sectors — before you read a single page." },
              { title: "Eligibility gaps", body: "What you qualify for and what's missing. Requirements you meet, requirements you need to address, and which gaps are solvable." },
              { title: "High-value matches", body: "Opportunities in your sector, your price range, your geography — ranked by probability of a strong proposal, not just keyword overlap." },
              { title: "Deadline intelligence", body: "Which deadlines are actually achievable given current workload. Which proposals need to start today to be submission-ready on time." },
              { title: "Competitive framing", body: "How to position your company's strengths against the evaluation criteria, with section-level themes built from your own wins." },
              { title: "Readiness score", body: "Before submission, a proposal readiness check across all dimensions: completeness, compliance, evidence, quality, and eligibility." },
            ].map((item, i) => (
              <div key={i} style={{
                padding: "32px 28px", background: "#1c1917",
                transition: "background 0.2s",
              }}>
                <div style={{ width: 32, height: 2, background: "linear-gradient(90deg, #f59e0b, #3b82f6)", borderRadius: 1, marginBottom: 20 }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", marginBottom: 10 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, margin: 0 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ background: "white", padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#d97706", marginBottom: 16 }}>
              THE FIVE MODULES
            </p>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, color: "#1c1917", lineHeight: 1.1, letterSpacing: "-0.02em", margin: 0 }}>
              One system. Every stage of the bid.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
            {[
              {
                number: "01",
                title: "Business Memory",
                subtitle: "Your company, understood",
                body: "Propol AI reads your certifications, past contracts, team structure, financial standing, and capabilities — building a governed profile it uses in every analysis and every proposal section.",
                accent: "#f59e0b",
              },
              {
                number: "02",
                title: "PROPOL Discover",
                subtitle: "Opportunities, qualified before you see them",
                body: "It scans the market for government tenders, RFPs, grants, and private contracts that match your profile. Every result arrives with a fit score, eligibility check, and a pursue or pass recommendation.",
                accent: "#3b82f6",
              },
              {
                number: "03",
                title: "PROPOL Match",
                subtitle: "AI analysis of every opportunity",
                body: "For any opportunity you upload or discover, Propol AI produces a full analysis: requirements, evaluation criteria, your eligibility gaps, the competitive landscape, and an exact readiness plan.",
                accent: "#8b5cf6",
              },
              {
                number: "04",
                title: "PROPOL Build",
                subtitle: "Proposals drafted section by section",
                body: "Executive summary, technical approach, methodology, implementation plan, risk management, pricing schedule — each section generated from your Business Memory and the opportunity's own requirements.",
                accent: "#10b981",
              },
              {
                number: "05",
                title: "Gap Intelligence",
                subtitle: "Know what's missing before submission",
                body: "Propol AI checks your proposal against every stated requirement and scores readiness across six dimensions. It names exactly what to address before you click submit.",
                accent: "#f97316",
              },
              {
                number: "06",
                title: "Opportunity Pipeline",
                subtitle: "One view of everything in motion",
                body: "Every opportunity moves from Discovered to Won through a governed pipeline. Your team knows the status, the deadline, the fit score, and the next action — on every bid, at all times.",
                accent: "#ec4899",
              },
            ].map((feat, i) => (
              <div key={i} style={{
                padding: 32, borderRadius: 12,
                border: "1.5px solid #f5f5f4",
                background: "white",
                position: "relative", overflow: "hidden",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}>
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 3,
                  background: `linear-gradient(90deg, ${feat.accent}, transparent)`,
                }} />
                <div style={{
                  fontSize: 11, fontWeight: 800, letterSpacing: "0.08em",
                  color: feat.accent, marginBottom: 20,
                }}>
                  {feat.number}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#1c1917", marginBottom: 4, letterSpacing: "-0.01em" }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: 13, fontWeight: 600, color: feat.accent, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {feat.subtitle}
                </p>
                <p style={{ fontSize: 14, color: "#78716c", lineHeight: 1.7, margin: 0 }}>{feat.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section style={{ background: "#fafaf9", padding: "80px 24px", borderTop: "1px solid #e7e5e4", borderBottom: "1px solid #e7e5e4" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 1, background: "#e7e5e4", borderRadius: 12, overflow: "hidden" }}>
            {[
              { stat: "89%", label: "average opportunity fit accuracy" },
              { stat: "73%", label: "reduction in proposal preparation time" },
              { stat: "2.4×", label: "improvement in win rate" },
              { stat: "48 hr", label: "from discovery to draft proposal" },
            ].map((s, i) => (
              <div key={i} style={{ background: "white", padding: "40px 32px", textAlign: "center" }}>
                <div style={{ fontSize: 42, fontWeight: 800, color: "#1c1917", letterSpacing: "-0.03em", marginBottom: 8 }}>{s.stat}</div>
                <div style={{ fontSize: 13, color: "#a8a29e", lineHeight: 1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", fontSize: 11, color: "#a8a29e", marginTop: 16 }}>Illustrative metrics based on platform capabilities. Results vary by organization and use.</p>
        </div>
      </section>

      {/* ── WHO USES IT ── */}
      <section style={{ background: "white", padding: "100px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#d97706", marginBottom: 16 }}>
            BUILT FOR
          </p>
          <h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 800, color: "#1c1917", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 48 }}>
            Every organisation that competes for contracts
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            {[
              "Technology firms", "Engineering consultancies", "Construction companies",
              "Healthcare providers", "Environmental agencies", "Facilities management",
              "Nonprofits & NGOs", "Defence contractors", "Advisory firms", "Training providers",
            ].map(type => (
              <div key={type} style={{
                padding: "14px 16px", borderRadius: 8,
                border: "1.5px solid #f5f5f4", background: "#fafaf9",
                fontSize: 13, fontWeight: 600, color: "#44403c",
              }}>
                {type}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ background: "#1c1917", padding: "100px 24px" }}>
        <div style={{ maxWidth: 1050, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#d97706", marginBottom: 16 }}>
              PRICING
            </p>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, color: "#ffffff", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 16 }}>
              Every module. Every plan.
            </h2>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.4)", maxWidth: 480, margin: "0 auto" }}>
              Credits refresh every billing cycle. The only difference between plans is how many you get.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {[
              {
                name: "Free",
                price: "$0",
                period: "/ month",
                credits: "200 credits",
                desc: "Try Propol AI on a real opportunity. No credit card.",
                cta: "Get started",
                href: "/sign-up",
                featured: false,
                link: null,
              },
              {
                name: "Starter",
                price: "$47",
                period: "/ month",
                credits: "4,000 credits",
                desc: "For small teams actively pursuing 5–15 contracts per month.",
                cta: "Get started",
                href: process.env.NEXT_PUBLIC_STARTER_PAYMENT_LINK || "/sign-up",
                featured: false,
                link: null,
              },
              {
                name: "Pro",
                price: "$57",
                period: "/ month",
                credits: "7,000 credits",
                desc: "For growing teams running parallel proposals and deep AI analysis.",
                cta: "Get started",
                href: process.env.NEXT_PUBLIC_PRO_PAYMENT_LINK || "/sign-up",
                featured: true,
                link: null,
              },
              {
                name: "Scale",
                price: "$97",
                period: "/ month",
                credits: "11,000 credits",
                desc: "For high-volume teams and agencies managing dozens of bids.",
                cta: "Get started",
                href: process.env.NEXT_PUBLIC_SCALE_PAYMENT_LINK || "/sign-up",
                featured: false,
                link: null,
              },
            ].map((plan) => (
              <div key={plan.name} style={{
                padding: 28, borderRadius: 14,
                background: plan.featured
                  ? "linear-gradient(145deg, #1a0f00, #2d1a00)"
                  : "rgba(255,255,255,0.04)",
                border: plan.featured
                  ? "1.5px solid rgba(245,158,11,0.4)"
                  : "1.5px solid rgba(255,255,255,0.08)",
                position: "relative", overflow: "hidden",
                boxShadow: plan.featured ? "0 0 60px rgba(245,158,11,0.12)" : "none",
              }}>
                {plan.featured && (
                  <>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #f59e0b, #d97706)" }} />
                    <div style={{
                      position: "absolute", top: 14, right: 14,
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                      color: "#0c0804", background: "#f59e0b",
                      padding: "3px 8px", borderRadius: 4,
                    }}>POPULAR</div>
                  </>
                )}
                <div style={{ fontSize: 13, fontWeight: 700, color: plan.featured ? "#fbbf24" : "rgba(255,255,255,0.5)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.06em" }}>{plan.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: 38, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>{plan.period}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: plan.featured ? "#f59e0b" : "rgba(255,255,255,0.4)", marginBottom: 16 }}>{plan.credits}</div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 24 }}>{plan.desc}</p>
                <Link href={plan.href} style={{
                  display: "block", textAlign: "center",
                  padding: "11px 20px", borderRadius: 8,
                  background: plan.featured
                    ? "linear-gradient(135deg, #f59e0b, #d97706)"
                    : "rgba(255,255,255,0.08)",
                  color: plan.featured ? "#0c0804" : "rgba(255,255,255,0.8)",
                  fontSize: 14, fontWeight: 700, textDecoration: "none",
                  boxShadow: plan.featured ? "0 4px 16px rgba(245,158,11,0.3)" : "none",
                }}>
                  {plan.cta}
                </Link>
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  {["All 6 modules included", "Unlimited team members", "Business Memory", "Proposal Builder", "Pipeline tracking"].map(feat => (
                    <div key={feat} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke={plan.featured ? "#f59e0b" : "rgba(255,255,255,0.3)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GOVERNANCE ── */}
      <section style={{ background: "#fafaf9", padding: "80px 24px", borderBottom: "1px solid #e7e5e4" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#d97706", marginBottom: 16 }}>
                TRUST & GOVERNANCE
              </p>
              <h2 style={{ fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 800, color: "#1c1917", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 20 }}>
                Workspace isolation. Role-level control. Your data stays yours.
              </h2>
              <p style={{ fontSize: 15, color: "#78716c", lineHeight: 1.7, marginBottom: 24 }}>
                Every organisation runs in an isolated workspace with row-level security. Access control is enforced at the database level — not a front-end check. Your uploaded documents and Business Memory are used only in your workspace and never used to train shared models.
              </p>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {[
                { title: "Row-level security", body: "Every workspace is isolated at the database level. No cross-tenant data access is architecturally possible." },
                { title: "Role-based access", body: "Owners, admins, managers, members, and viewers — each with the right level of control." },
                { title: "Data privacy", body: "Your documents, tenders, and proposals are used only to run your workspace. Never for shared model training." },
                { title: "Audit logs", body: "Every action is logged. Your team's activity is traceable and reviewable at any time." },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", gap: 14, padding: "16px 18px", borderRadius: 10,
                  background: "white", border: "1.5px solid #f5f5f4",
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(217,119,6,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 3.5L12 5.2l-2.5 2.5.6 3.5L7 9.5l-3.1 1.7.6-3.5L2 5.2l3.5-.7L7 1z" fill="#d97706"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1c1917", marginBottom: 3 }}>{item.title}</div>
                    <div style={{ fontSize: 13, color: "#78716c", lineHeight: 1.5 }}>{item.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ── */}
      <section style={{
        background: "linear-gradient(160deg, #0c0804 0%, #1a0f06 50%, #0a0d1a 100%)",
        padding: "120px 24px", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: 800, height: 400,
          background: "radial-gradient(ellipse, rgba(217,119,6,0.15) 0%, rgba(37,99,235,0.06) 50%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 800, color: "#ffffff", lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: 24 }}>
            Build a pipeline that<br />
            <span style={{ background: "linear-gradient(90deg, #f59e0b, #fbbf24, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              never misses a bid.
            </span>
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.45)", marginBottom: 48, lineHeight: 1.65 }}>
            Start on the free plan. Add Business Memory. Discover your first matching opportunities. Your first proposal draft is ready in under an hour.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            <Link href="/sign-up" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "15px 36px", borderRadius: 10,
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              color: "#0c0804", fontSize: 15, fontWeight: 700, textDecoration: "none",
              boxShadow: "0 0 50px rgba(245,158,11,0.3), 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
            }}>
              Get started free
            </Link>
            <Link href="/sign-in" style={{
              display: "inline-flex", alignItems: "center",
              padding: "15px 36px", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 500, textDecoration: "none",
            }}>
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0c0804", padding: "48px 24px 32px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 32, marginBottom: 48 }}>
            <div>
              <Logo size="sm" light />
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 12, maxWidth: 240, lineHeight: 1.6 }}>
                AI proposal and opportunity intelligence for organisations that compete for contracts.
              </p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", marginTop: 8 }}>
                contact@propolai.cloud
              </p>
            </div>
            <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
              {[
                { heading: "Product", links: ["How it works", "Features", "Pricing"] },
                { heading: "Legal", links: ["Privacy", "Terms", "Security"] },
              ].map(col => (
                <div key={col.heading}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>{col.heading}</div>
                  {col.links.map(link => (
                    <div key={link} style={{ marginBottom: 10 }}>
                      <Link href={`/${link.toLowerCase()}`} style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
                        {link}
                      </Link>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", margin: 0 }}>
              © {new Date().getFullYear()} Propol AI. All rights reserved.
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.15)", margin: 0 }}>
              Workspace-level isolation · Row-level security · Data privacy by design
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
