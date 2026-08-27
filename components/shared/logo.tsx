import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  iconOnly?: boolean
  light?: boolean
  size?: "sm" | "md" | "lg"
}

export function Logo({ className, iconOnly = false, light = false, size = "md" }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: "text-base" },
    md: { icon: 30, text: "text-xl" },
    lg: { icon: 40, text: "text-2xl" },
  }

  const s = sizes[size]
  const textColor = light ? "text-white" : "text-stone-900"
  const subColor = light ? "text-amber-200" : "text-amber-800"

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Propol Mark: a stylized "P" — minimal, corporate */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Background square with subtle rounding */}
        <rect width="40" height="40" rx="8" fill={light ? "rgba(255,255,255,0.15)" : "#78350f"} />
        {/* Vertical stroke */}
        <rect x="11" y="9" width="4" height="22" rx="1" fill="white" />
        {/* Horizontal top cap */}
        <rect x="11" y="9" width="16" height="4" rx="1" fill="white" />
        {/* Middle crossbar — shorter, defines the "P" */}
        <rect x="11" y="20" width="12" height="4" rx="1" fill="white" />
        {/* Curved end — right side of bowl (top arc) */}
        <rect x="23" y="9" width="4" height="8" rx="1" fill="white" />
        {/* Curved end — right side of bowl (bottom arc) */}
        <rect x="23" y="17" width="4" height="7" rx="1" fill="rgba(255,255,255,0.5)" />
      </svg>

      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <span className={cn("font-semibold tracking-tight", s.text, textColor)}>
            Propol
            <span className={cn("font-normal", subColor)}> AI</span>
          </span>
        </div>
      )}
    </div>
  )
}
