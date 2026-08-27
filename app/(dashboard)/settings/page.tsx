import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SettingsClient } from "./settings-client"

export const metadata = { title: "Settings" }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const [profileRes, membershipRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("organization_members")
      .select("organization_id, role, organizations(*)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single(),
  ])

  return (
    <SettingsClient
      profile={profileRes.data}
      organization={(membershipRes.data?.organizations as unknown as Record<string, unknown>) || null}
      role={membershipRes.data?.role || "member"}
      userId={user.id}
      userEmail={user.email || ""}
    />
  )
}
