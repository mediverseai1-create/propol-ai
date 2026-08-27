import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, UserPlus, Crown, Shield, User } from "lucide-react"
import { getInitials, formatDate } from "@/lib/utils"

export const metadata = { title: "Team" }

const ROLE_ICONS: Record<string, React.ElementType> = {
  owner: Crown,
  admin: Shield,
  manager: User,
  member: User,
  viewer: User,
}

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-amber-100 text-amber-800",
  admin: "bg-purple-100 text-purple-800",
  manager: "bg-blue-100 text-blue-800",
  member: "bg-stone-100 text-stone-700",
  viewer: "bg-stone-50 text-stone-500",
}

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(name, subscription_plan)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single()

  if (!membership) redirect("/onboarding")

  const { data: members } = await supabase
    .from("organization_members")
    .select("*, profiles(full_name, email, avatar_url, job_title)")
    .eq("organization_id", membership.organization_id)
    .eq("status", "active")
    .order("created_at", { ascending: true })

  const org = membership.organizations as unknown as { name: string; subscription_plan: string } | null
  const isOwnerOrAdmin = ["owner", "admin"].includes(membership.role)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Team</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {org?.name} · {members?.length || 0} member{(members?.length || 0) !== 1 ? "s" : ""}
          </p>
        </div>
        {isOwnerOrAdmin && (
          <Button size="sm">
            <UserPlus className="h-4 w-4" /> Invite Member
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-stone-500" /> Members
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-stone-100">
            {(members || []).map((member) => {
              const profile = member.profiles as { full_name: string | null; email: string | null; avatar_url: string | null; job_title: string | null } | null
              const displayName = profile?.full_name || profile?.email || member.invited_email || "Unknown"
              const RoleIcon = ROLE_ICONS[member.role] || User

              return (
                <div key={member.id} className="flex items-center gap-4 px-5 py-3.5">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-xs">{getInitials(displayName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-stone-900">{displayName}</span>
                      {member.user_id === user.id && (
                        <span className="text-xs text-stone-400">(you)</span>
                      )}
                    </div>
                    {profile?.job_title && (
                      <p className="text-xs text-stone-400 mt-0.5">{profile.job_title}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${ROLE_COLORS[member.role]}`}>
                      <RoleIcon className="h-3 w-3" />
                      {member.role}
                    </span>
                    {member.joined_at && (
                      <span className="text-xs text-stone-400 hidden sm:block">Joined {formatDate(member.joined_at)}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Role reference */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Role Permissions</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="py-2 pr-4 font-medium text-stone-500">Permission</th>
                  {["Owner", "Admin", "Manager", "Member", "Viewer"].map(r => (
                    <th key={r} className="py-2 px-3 font-medium text-stone-500 text-center">{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {[
                  { action: "View opportunities & proposals", roles: [true, true, true, true, true] },
                  { action: "Create & edit proposals", roles: [true, true, true, true, false] },
                  { action: "Run AI analysis", roles: [true, true, true, false, false] },
                  { action: "Manage Business Memory", roles: [true, true, true, false, false] },
                  { action: "Invite members", roles: [true, true, false, false, false] },
                  { action: "Manage subscription", roles: [true, false, false, false, false] },
                ].map((row) => (
                  <tr key={row.action}>
                    <td className="py-2 pr-4 text-stone-600">{row.action}</td>
                    {row.roles.map((can, i) => (
                      <td key={i} className="py-2 px-3 text-center">
                        {can ? <span className="text-emerald-600">✓</span> : <span className="text-stone-300">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
