import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SessionProvider from '@/components/SessionProvider'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'
import ThemeProvider from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Overseed - Connect Brands with Creators',
    template: '%s | Overseed',
  },
  description: 'A global platform connecting brands with influencers and content creators for cross-border marketing collaborations.',
  keywords: 'influencer marketing, brand collaborations, content creators, influencers, cross-border marketing, KOL',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3333'),
  openGraph: {
    title: 'Overseed - Connect Brands with Creators',
    description: 'AI-powered cross-border creator collaboration platform. Launch campaigns, discover creators, manage partnerships.',
    type: 'website',
    siteName: 'Overseed',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Overseed - Connect Brands with Creators',
    description: 'AI-powered cross-border creator collaboration platform.',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" suppressHydrationWarning style={{ colorScheme: 'light' }}>
      <head>
        <link rel="icon" type="image/png" href="/icon-pink.png" />
      </head>
      <body className={inter.className}>
        <SessionProvider session={session}>
          <LanguageProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
