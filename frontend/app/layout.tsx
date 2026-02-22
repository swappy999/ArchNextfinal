import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import RouteGuard from '@/components/auth/RouteGuard'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#0B0F1A',
  colorScheme: 'dark',
}

export const metadata: Metadata = {
  title: 'ArchNext — Future City OS',
  description: 'AI-powered urban intelligence and real estate investment platform.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${mono.variable} font-sans bg-[var(--background)] text-[var(--foreground)] antialiased selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden`}>
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0B0F1A] to-[#0B0F1A]"></div>
        <RouteGuard>
          {children}
        </RouteGuard>
      </body>
    </html>
  )
}
