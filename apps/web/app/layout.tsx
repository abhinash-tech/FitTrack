import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "sonner"
import { QueryProvider } from "@/components/providers/query-provider"
import "./globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "FitTrack — Your Personal Wellness Hub",
    template: "%s | FitTrack",
  },
  description: "Track hydration, nutrition, sleep, fitness, and wellness goals in one beautiful dashboard.",
  keywords: ["fitness", "health", "wellness", "hydration", "tracker", "nutrition", "AI Coach"],
  authors: [{ name: "FitTrack" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "FitTrack — Your Personal Wellness Hub",
    description: "Track your health metrics seamlessly with our AI-powered web and mobile app.",
    url: "https://fittrack.example.com",
    siteName: "FitTrack",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FitTrack",
    description: "Your unified dashboard for health and fitness.",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#06D6A0",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "hsl(222 44% 11%)",
              border: "1px solid hsl(217 32% 17%)",
              color: "hsl(210 40% 98%)",
            },
          }}
        />
      </body>
    </html>
  )
}
