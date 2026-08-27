export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          job_title: string | null
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          job_title?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          job_title?: string | null
          avatar_url?: string | null
          phone?: string | null
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          industry: string | null
          country: string | null
          size: string | null
          website: string | null
          description: string | null
          logo_url: string | null
          owner_id: string
          subscription_plan: "free" | "starter" | "pro" | "scale"
          subscription_status: "active" | "inactive" | "cancelled" | "past_due"
          subscription_started_at: string | null
          billing_cycle_start: string | null
          billing_cycle_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          industry?: string | null
          country?: string | null
          size?: string | null
          website?: string | null
          description?: string | null
          logo_url?: string | null
          owner_id: string
          subscription_plan?: "free" | "starter" | "pro" | "scale"
          subscription_status?: "active" | "inactive" | "cancelled" | "past_due"
          subscription_started_at?: string | null
          billing_cycle_start?: string | null
          billing_cycle_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          industry?: string | null
          country?: string | null
          size?: string | null
          website?: string | null
          description?: string | null
          logo_url?: string | null
          subscription_plan?: "free" | "starter" | "pro" | "scale"
          subscription_status?: "active" | "inactive" | "cancelled" | "past_due"
          billing_cycle_start?: string | null
          billing_cycle_end?: string | null
          updated_at?: string
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: "owner" | "admin" | "manager" | "member" | "viewer"
          status: "active" | "invited" | "suspended"
          invited_email: string | null
          joined_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: "owner" | "admin" | "manager" | "member" | "viewer"
          status?: "active" | "invited" | "suspended"
          invited_email?: string | null
          joined_at?: string | null
          created_at?: string
        }
        Update: {
          role?: "owner" | "admin" | "manager" | "member" | "viewer"
          status?: "active" | "invited" | "suspended"
          joined_at?: string | null
        }
      }
      credit_balances: {
        Row: {
          id: string
          organization_id: string
          balance: number
          monthly_allowance: number
          used_this_period: number
          reset_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          balance?: number
          monthly_allowance?: number
          used_this_period?: number
          reset_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          balance?: number
          monthly_allowance?: number
          used_this_period?: number
          reset_date?: string
          updated_at?: string
        }
      }
      credit_transactions: {
        Row: {
          id: string
          organization_id: string
          user_id: string | null
          type: "allocation" | "consumption" | "adjustment" | "refund"
          amount: number
          balance_after: number
          description: string
          feature: string | null
          reference_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id?: string | null
          type: "allocation" | "consumption" | "adjustment" | "refund"
          amount: number
          balance_after: number
          description: string
          feature?: string | null
          reference_id?: string | null
          created_at?: string
        }
        Update: never
      }
      business_memory: {
        Row: {
          id: string
          organization_id: string
          section: string
          title: string
          content: string
          source_type: "manual" | "uploaded" | "extracted" | "generated"
          file_url: string | null
          metadata: Json | null
          is_verified: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          section: string
          title: string
          content: string
          source_type?: "manual" | "uploaded" | "extracted" | "generated"
          file_url?: string | null
          metadata?: Json | null
          is_verified?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          section?: string
          title?: string
          content?: string
          source_type?: "manual" | "uploaded" | "extracted" | "generated"
          file_url?: string | null
          metadata?: Json | null
          is_verified?: boolean
          updated_at?: string
        }
      }
      opportunities: {
        Row: {
          id: string
          organization_id: string
          title: string
          description: string | null
          buyer_name: string | null
          buyer_type: string | null
          opportunity_type: string | null
          value_min: number | null
          value_max: number | null
          currency: string | null
          deadline: string | null
          published_date: string | null
          location: string | null
          country: string | null
          industry: string | null
          source_url: string | null
          source_name: string | null
          raw_document_url: string | null
          fit_score: number | null
          eligibility_score: number | null
          recommendation: "pursue" | "review" | "pass" | null
          status: "discovered" | "qualified" | "recommended" | "preparing" | "needs_input" | "ready_for_review" | "ready_to_submit" | "submitted" | "won" | "lost" | "passed"
          ai_analysis: Json | null
          requirements: Json | null
          missing_requirements: Json | null
          credits_used: number | null
          analyzed_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          title: string
          description?: string | null
          buyer_name?: string | null
          buyer_type?: string | null
          opportunity_type?: string | null
          value_min?: number | null
          value_max?: number | null
          currency?: string | null
          deadline?: string | null
          published_date?: string | null
          location?: string | null
          country?: string | null
          industry?: string | null
          source_url?: string | null
          source_name?: string | null
          raw_document_url?: string | null
          fit_score?: number | null
          eligibility_score?: number | null
          recommendation?: "pursue" | "review" | "pass" | null
          status?: "discovered" | "qualified" | "recommended" | "preparing" | "needs_input" | "ready_for_review" | "ready_to_submit" | "submitted" | "won" | "lost" | "passed"
          ai_analysis?: Json | null
          requirements?: Json | null
          missing_requirements?: Json | null
          credits_used?: number | null
          analyzed_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          buyer_name?: string | null
          buyer_type?: string | null
          opportunity_type?: string | null
          value_min?: number | null
          value_max?: number | null
          currency?: string | null
          deadline?: string | null
          location?: string | null
          country?: string | null
          industry?: string | null
          source_url?: string | null
          source_name?: string | null
          fit_score?: number | null
          eligibility_score?: number | null
          recommendation?: "pursue" | "review" | "pass" | null
          status?: "discovered" | "qualified" | "recommended" | "preparing" | "needs_input" | "ready_for_review" | "ready_to_submit" | "submitted" | "won" | "lost" | "passed"
          ai_analysis?: Json | null
          requirements?: Json | null
          missing_requirements?: Json | null
          credits_used?: number | null
          analyzed_at?: string | null
          updated_at?: string
        }
      }
      proposals: {
        Row: {
          id: string
          organization_id: string
          opportunity_id: string
          title: string
          status: "drafting" | "in_review" | "needs_input" | "ready" | "submitted" | "won" | "lost"
          readiness_score: number | null
          eligibility_score: number | null
          requirements_score: number | null
          evidence_score: number | null
          quality_score: number | null
          compliance_score: number | null
          documents_score: number | null
          content: Json | null
          compliance_checklist: Json | null
          missing_items: Json | null
          strong_themes: Json | null
          strategy: string | null
          executive_summary: string | null
          cover_letter: string | null
          technical_proposal: string | null
          methodology: string | null
          implementation_plan: string | null
          risk_management: string | null
          team_structure: string | null
          timeline: string | null
          pricing_schedule: string | null
          credits_used: number | null
          submitted_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          opportunity_id: string
          title: string
          status?: "drafting" | "in_review" | "needs_input" | "ready" | "submitted" | "won" | "lost"
          readiness_score?: number | null
          content?: Json | null
          compliance_checklist?: Json | null
          missing_items?: Json | null
          credits_used?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          status?: "drafting" | "in_review" | "needs_input" | "ready" | "submitted" | "won" | "lost"
          readiness_score?: number | null
          eligibility_score?: number | null
          requirements_score?: number | null
          evidence_score?: number | null
          quality_score?: number | null
          compliance_score?: number | null
          documents_score?: number | null
          content?: Json | null
          compliance_checklist?: Json | null
          missing_items?: Json | null
          strong_themes?: Json | null
          strategy?: string | null
          executive_summary?: string | null
          cover_letter?: string | null
          technical_proposal?: string | null
          methodology?: string | null
          implementation_plan?: string | null
          risk_management?: string | null
          team_structure?: string | null
          timeline?: string | null
          pricing_schedule?: string | null
          credits_used?: number | null
          submitted_at?: string | null
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          organization_id: string
          user_id: string | null
          action: string
          entity_type: string | null
          entity_id: string | null
          description: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id?: string | null
          action: string
          entity_type?: string | null
          entity_id?: string | null
          description: string
          metadata?: Json | null
          created_at?: string
        }
        Update: never
      }
      notifications: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          type: string
          title: string
          message: string
          is_read: boolean
          action_url: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          type: string
          title: string
          message: string
          is_read?: boolean
          action_url?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          is_read?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
