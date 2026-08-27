import { Logo } from "@/components/shared/logo"
import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col bg-amber-900 p-10 relative overflow-hidden">
        {/* Subtle pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative z-10 flex flex-col h-full">
          <Link href="/">
            <Logo light size="md" />
          </Link>

          <div className="mt-auto">
            <blockquote className="space-y-4">
              <p className="text-amber-100 text-lg leading-relaxed font-light">
                "Propol AI identified 12 government contracts that matched our capabilities — and helped us submit three proposals we never would have found on our own."
              </p>
              <footer className="text-amber-300 text-sm">
                <div className="font-medium text-amber-200">Director of Business Development</div>
                <div>Technology Services Company</div>
              </footer>
            </blockquote>

            <div className="mt-8 pt-8 border-t border-amber-800 grid grid-cols-3 gap-4">
              {[
                { label: "Avg Fit Score", value: "89%" },
                { label: "Time Saved", value: "73%" },
                { label: "Win Rate Lift", value: "2.4×" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-xl font-semibold text-white">{stat.value}</div>
                  <div className="text-xs text-amber-300 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10">
        <div className="lg:hidden mb-8">
          <Link href="/">
            <Logo size="md" />
          </Link>
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
