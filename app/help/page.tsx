'use client'

import MainLayout from '@/components/MainLayout'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Link from 'next/link'

const helpSections = [
  {
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    key: 'gettingStarted' as const,
  },
  {
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.193 23.193 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    key: 'campaigns' as const,
  },
  {
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    key: 'account' as const,
  },
  {
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    key: 'payments' as const,
  },
  {
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    key: 'messaging' as const,
  },
  {
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    key: 'safety' as const,
  },
]

export default function HelpCenterPage() {
  const { t } = useLanguage()

  return (
    <MainLayout>
      <div className="relative min-h-screen">
        <div className="fixed inset-0 bg-cover bg-center opacity-30 pointer-events-none" style={{ backgroundImage: "url('/background_2.jpg')" }} />
        <div className="fixed inset-0 bg-[#020a18]/60 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-noto-sans-sc), system-ui, sans-serif', fontWeight: 900 }}>
              {t.help.title}
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              {t.help.subtitle}
            </p>
          </div>

          {/* Topic cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {helpSections.map((section) => {
              const sectionData = t.help.sections[section.key]
              return (
                <div
                  key={section.key}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 hover:bg-white/[0.08] transition"
                >
                  <div className="w-12 h-12 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center mb-4">
                    {section.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{sectionData.title}</h3>
                  <p className="text-white/60 text-sm mb-4">{sectionData.desc}</p>
                  <ul className="space-y-2">
                    {sectionData.items.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/50">
                        <span className="text-[#ff769f] mt-0.5">&#8250;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          {/* Contact CTA */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 text-center">
            <h2 className="text-xl font-semibold text-white mb-3">{t.help.ctaTitle}</h2>
            <p className="text-white/60 mb-6">{t.help.ctaDesc}</p>
            <Link
              href="/contact"
              className="inline-block px-6 py-3 bg-white text-gray-900 rounded-full hover:bg-white/90 transition font-semibold"
            >
              {t.help.ctaButton}
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
