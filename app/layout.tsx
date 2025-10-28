import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { AuthProvider } from "@/lib/auth"
import { ThemeProvider } from "@/components/theme-provider"
import { ConditionalLayout } from "@/components/conditional-layout"
import { ToastProvider } from "@/lib/toast-context"
import { Toaster } from "@/components/ui/sonner"
import { ErrorBoundary, setupGlobalErrorHandling } from "@/components/error-boundary"

import { Geist_Mono, Poppins as V0_Font_Poppins, Geist_Mono as V0_Font_Geist_Mono, Source_Serif_4 as V0_Font_Source_Serif_4 } from 'next/font/google'

// Initialize fonts
const geistMono = V0_Font_Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

const poppins = V0_Font_Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

const sourceSerif4 = V0_Font_Source_Serif_4({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-source-serif-4',
})

export const metadata: Metadata = {
  title: "Djurdjura Water Distribution System",
  description: "Advanced water distribution management system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Setup global error handling
  if (typeof window !== 'undefined') {
    setupGlobalErrorHandling()
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistMono.variable} ${poppins.variable} ${sourceSerif4.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ToastProvider>
                <ConditionalLayout>
                  {children}
                </ConditionalLayout>
                <Toaster />
              </ToastProvider>
            </ThemeProvider>
          </AuthProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}