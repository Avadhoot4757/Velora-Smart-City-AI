import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { GoogleMapsProvider } from "@/components/GoogleMapsProvider";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Agentic City AI Dashboard",
  description: "AI-powered city insights and traffic management",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <GoogleMapsProvider>{children}</GoogleMapsProvider>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
