import type { Metadata } from 'next'
import { DM_Serif_Display, Noto_Sans_SC } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SessionProvider from '@/components/SessionProvider'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'
import ThemeProvider from '@/components/ThemeProvider'

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
})
const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['300', '700', '900'],
  variable: '--font-noto-sans-sc',
})

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
      <body className={`${GeistSans.className} ${GeistMono.variable} ${dmSerifDisplay.variable} ${notoSansSC.variable}`}>
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
