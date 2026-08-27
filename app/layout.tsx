import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Propol AI — AI Proposal & Opportunity Intelligence",
    template: "%s | Propol AI",
  },
  description:
    "Find opportunities your business can win. Propol AI discovers relevant tenders, RFPs, grants, and contracts — then prepares everything required to apply.",
  keywords: [
    "proposal AI",
    "tender management",
    "RFP software",
    "government contracts",
    "bid management",
    "opportunity discovery",
    "procurement software",
    "B2B SaaS",
  ],
  authors: [{ name: "Propol AI" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://propolai.cloud",
    title: "Propol AI — AI Proposal & Opportunity Intelligence",
    description:
      "Find opportunities your business can win. AI-powered discovery, analysis, and proposal preparation.",
    siteName: "Propol AI",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
