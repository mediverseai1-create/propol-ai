"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="h-12 w-12 text-emerald-600" />
        </div>
        <h2 className="text-xl font-semibold text-stone-900">Check your email</h2>
        <p className="text-sm text-stone-500 max-w-sm mx-auto">
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account and continue to onboarding.
        </p>
        <p className="text-xs text-stone-400">
          Did not receive it?{" "}
          <button
            onClick={handleSignUp}
            className="text-amber-800 hover:underline"
          >
            Resend email
          </button>
        </p>
      </div>
    )
  }

  const passwordStrength = password.length === 0 ? null : password.length < 8 ? "weak" : password.length < 12 ? "fair" : "strong"

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-900">Start your free account</h1>
        <p className="mt-1.5 text-sm text-stone-500">
          200 free credits included. No credit card required.
        </p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {passwordStrength && (
            <div className="flex items-center gap-1.5 mt-1">
              {["weak", "fair", "strong"].map((level, i) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i === 0 && passwordStrength ? "bg-red-400" :
                    i === 1 && (passwordStrength === "fair" || passwordStrength === "strong") ? "bg-amber-400" :
                    i === 2 && passwordStrength === "strong" ? "bg-emerald-500" :
                    "bg-stone-200"
                  }`}
                />
              ))}
              <span className="text-xs text-stone-400 ml-1 capitalize">{passwordStrength}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading} size="lg">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account…
            </>
          ) : (
            "Create free account"
          )}
        </Button>

        <p className="text-xs text-stone-400 text-center">
          By creating an account you agree to our{" "}
          <Link href="#" className="text-amber-800 hover:underline">Terms</Link> and{" "}
          <Link href="#" className="text-amber-800 hover:underline">Privacy Policy</Link>.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-amber-800 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
