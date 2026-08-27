"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2, User, Building2, Shield, Bell } from "lucide-react"
import { getInitials } from "@/lib/utils"

interface Props {
  profile: Record<string, unknown> | null
  organization: Record<string, unknown> | null
  role: string
  userId: string
  userEmail: string
}

export function SettingsClient({ profile, organization, role, userId, userEmail }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [profileForm, setProfileForm] = useState({
    full_name: (profile?.full_name as string) || "",
    job_title: (profile?.job_title as string) || "",
    phone: (profile?.phone as string) || "",
  })

  const [orgForm, setOrgForm] = useState({
    name: (organization?.name as string) || "",
    website: (organization?.website as string) || "",
    description: (organization?.description as string) || "",
    country: (organization?.country as string) || "",
  })

  const isOwnerOrAdmin = ["owner", "admin"].includes(role)

  async function saveProfile() {
    setSaving(true)
    setSaved(false)
    setError(null)
    const { error } = await supabase.from("profiles").update({
      ...profileForm,
      updated_at: new Date().toISOString(),
    }).eq("id", userId)

    if (error) setError(error.message)
    else setSaved(true)
    setSaving(false)
  }

  async function saveOrg() {
    if (!isOwnerOrAdmin || !organization) return
    setSaving(true)
    setSaved(false)
    setError(null)
    const { error } = await supabase.from("organizations").update({
      ...orgForm,
      updated_at: new Date().toISOString(),
    }).eq("id", organization.id as string)

    if (error) setError(error.message)
    else { setSaved(true); router.refresh() }
    setSaving(false)
  }

  const displayName = profileForm.full_name || userEmail

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <h1 className="text-xl font-semibold text-stone-900">Settings</h1>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>
      )}
      {saved && (
        <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">Changes saved successfully.</div>
      )}

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile"><User className="h-3.5 w-3.5 mr-1.5" />Profile</TabsTrigger>
          {isOwnerOrAdmin && <TabsTrigger value="organization"><Building2 className="h-3.5 w-3.5 mr-1.5" />Organization</TabsTrigger>}
          <TabsTrigger value="security"><Shield className="h-3.5 w-3.5 mr-1.5" />Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="text-lg">{getInitials(displayName)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{displayName}</CardTitle>
                  <p className="text-sm text-stone-400">{userEmail}</p>
                  <p className="text-xs text-stone-400 mt-0.5 capitalize">{role}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block">Full name</Label>
                  <Input
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block">Job title</Label>
                  <Input
                    value={profileForm.job_title}
                    onChange={(e) => setProfileForm({ ...profileForm, job_title: e.target.value })}
                    placeholder="CEO / Founder"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block">Phone</Label>
                  <Input
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+1 555 000 0000"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block">Email</Label>
                  <Input value={userEmail} disabled className="bg-stone-50" />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={saveProfile} disabled={saving} size="sm">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : "Save Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isOwnerOrAdmin && (
          <TabsContent value="organization" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Organization Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-1.5 block">Organization name</Label>
                  <Input value={orgForm.name} onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1.5 block">Website</Label>
                    <Input value={orgForm.website} onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })} placeholder="https://" />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Country</Label>
                    <Input value={orgForm.country} onChange={(e) => setOrgForm({ ...orgForm, country: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label className="mb-1.5 block">Description</Label>
                  <Textarea value={orgForm.description} onChange={(e) => setOrgForm({ ...orgForm, description: e.target.value })} rows={3} />
                </div>
                <div className="flex justify-end">
                  <Button onClick={saveOrg} disabled={saving || !isOwnerOrAdmin} size="sm">
                    {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : "Save Organization"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Security Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Password</Label>
                <p className="text-xs text-stone-400 mt-0.5">Change your account password.</p>
              </div>
              <div className="flex items-center justify-between py-3 border-t border-stone-100">
                <div>
                  <p className="text-sm font-medium text-stone-800">Change password</p>
                  <p className="text-xs text-stone-400">Send a reset link to {userEmail}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const supabaseClient = createClient()
                    await supabaseClient.auth.resetPasswordForEmail(userEmail, {
                      redirectTo: `${window.location.origin}/reset-password`,
                    })
                    setSaved(true)
                  }}
                >
                  Send Reset Link
                </Button>
              </div>
              <div className="flex items-center justify-between py-3 border-t border-stone-100">
                <div>
                  <p className="text-sm font-medium text-stone-800">Account email</p>
                  <p className="text-xs text-stone-400">{userEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
