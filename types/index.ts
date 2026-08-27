export type SubscriptionPlan = "free" | "starter" | "pro" | "scale"

export const PLAN_CREDITS: Record<SubscriptionPlan, number> = {
  free: 200,
  starter: 4000,
  pro: 7000,
  scale: 11000,
}

export const PLAN_PRICES: Record<SubscriptionPlan, number> = {
  free: 0,
  starter: 47,
  pro: 57,
  scale: 97,
}

export const PLAN_NAMES: Record<SubscriptionPlan, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  scale: "Scale",
}

export const CREDIT_COSTS = {
  OPPORTUNITY_DISCOVERY: 5,
  OPPORTUNITY_ANALYSIS: 15,
  PROPOSAL_DRAFT: 50,
  PROPOSAL_SECTION: 10,
  COMPLIANCE_CHECK: 8,
  READINESS_SCORE: 5,
  GAP_ANALYSIS: 12,
  DOCUMENT_GENERATION: 20,
  PROPOSAL_REVIEW: 15,
  BUSINESS_MEMORY_EXTRACTION: 10,
} as const

export type OpportunityStatus =
  | "discovered"
  | "qualified"
  | "recommended"
  | "preparing"
  | "needs_input"
  | "ready_for_review"
  | "ready_to_submit"
  | "submitted"
  | "won"
  | "lost"
  | "passed"

export type OpportunityRecommendation = "pursue" | "review" | "pass"

export type ProposalStatus =
  | "drafting"
  | "in_review"
  | "needs_input"
  | "ready"
  | "submitted"
  | "won"
  | "lost"

export type MemberRole = "owner" | "admin" | "manager" | "member" | "viewer"

export interface CreditBalance {
  balance: number
  monthly_allowance: number
  used_this_period: number
  reset_date: string
}

export interface OpportunityRequirement {
  id: string
  title: string
  description: string
  type: "mandatory" | "preferred" | "informational"
  status: "available" | "can_create" | "needs_input" | "external" | "missing"
  evidence?: string
  notes?: string
}

export interface ProposalSection {
  id: string
  title: string
  content: string
  status: "complete" | "draft" | "needs_review" | "missing"
  word_count?: number
}

export interface AIAnalysis {
  fit_score: number
  eligibility_score: number
  recommendation: OpportunityRecommendation
  summary: string
  strengths: string[]
  weaknesses: string[]
  risks: string[]
  missing_requirements: OpportunityRequirement[]
  key_themes: string[]
  win_strategy: string
  disqualifiers: string[]
}

export interface ReadinessReport {
  overall_score: number
  eligibility_score: number
  requirements_score: number
  evidence_score: number
  quality_score: number
  compliance_score: number
  documents_score: number
  issues: ReadinessIssue[]
  recommendations: string[]
}

export interface ReadinessIssue {
  severity: "critical" | "major" | "minor"
  title: string
  description: string
  resolution?: string
}

export type LowCreditThreshold = "info" | "warning" | "critical" | "exhausted"

export function getCreditThreshold(
  used: number,
  total: number
): LowCreditThreshold {
  const pct = used / total
  if (pct >= 1) return "exhausted"
  if (pct >= 0.9) return "critical"
  if (pct >= 0.75) return "warning"
  if (pct >= 0.5) return "info"
  return "info"
}
