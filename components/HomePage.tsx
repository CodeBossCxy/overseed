'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useViewMode } from '@/lib/hooks/useViewMode'
import { useTheme } from './ThemeProvider'

export default function HomePage() {
  const { data: session } = useSession()
  const { t } = useLanguage()
  const { isBrand, switchView } = useViewMode()
  const router = useRouter()
  const { themeMode, setThemeMode } = useTheme()

  const showBrandView = themeMode === 'brand'
  const signupLink = showBrandView ? '/auth/signup?type=brand' : '/auth/signup?type=influencer'

  const handleGetStarted = async () => {
    if (session) {
      if (showBrandView !== isBrand) {
        // switchView already navigates to the correct dashboard
        await switchView(showBrandView ? 'BRAND' : 'INFLUENCER')
      } else {
        router.push(showBrandView ? '/dashboard/brand' : '/dashboard/influencer')
      }
    } else {
      router.push(signupLink)
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        {/* Subtle background accents */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-white to-white" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary-100/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-primary-50/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 border border-primary-100 text-primary-700 rounded-full text-sm font-medium mb-8">
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
                {t.home.hero.badge}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.08] tracking-tight mb-6">
                {t.home.hero.title}
              </h1>

              {/* Description */}
              <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-lg">
                {t.home.hero.description}
              </p>

              {/* Checklist */}
              <div className="space-y-3 mb-10">
                {[t.home.hero.check1, t.home.hero.check2, t.home.hero.check3].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-gray-700 text-sm md:text-base">{text}</span>
                  </div>
                ))}
              </div>

              {/* Toggle */}
              <div className="inline-flex rounded-full bg-gray-100 p-1 mb-6">
                <button
                  onClick={() => setThemeMode('creator')}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    !showBrandView
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.home.toggle.creator}
                </button>
                <button
                  onClick={() => setThemeMode('brand')}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    showBrandView
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.home.toggle.brand}
                </button>
              </div>

              {/* CTA Buttons */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-3.5 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary-600/20"
                >
                  {t.home.hero.getStarted}
                </button>
                <Link
                  href="/contact"
                  className="px-6 py-3.5 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition"
                >
                  {t.home.hero.requestDemo}
                </Link>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Decorative cards / mockup area */}
                <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-3xl p-8 aspect-square flex items-center justify-center">
                  {/* Globe / map visual */}
                  <div className="relative w-full h-full">
                    {/* Center globe - colorful cartoon style */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-52 h-52 drop-shadow-lg" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Ocean base */}
                        <circle cx="100" cy="100" r="90" fill="#4AADE8" />
                        {/* Highlight gradient */}
                        <circle cx="100" cy="100" r="90" fill="url(#globeGrad)" />
                        {/* Continents */}
                        <path d="M70 45c-5 3-12 8-15 18s-2 22 3 28c4 5 10 4 14 8s6 14 2 22c-3 6-8 10-6 16s10 12 18 14c6 2 14 0 20-4s10-12 16-14c8-2 16 2 22-2s10-14 8-24c-2-8-8-14-6-22s10-14 8-22c-2-6-8-8-14-10s-14-2-18-6c-6-6-4-16-10-20s-16-2-22 2c-6 4-10 10-16 12s-10 0-4-2" fill="#6DC44F" />
                        <path d="M35 90c-2 8 0 18 6 24s16 8 20 14c3 5 2 12-2 16s-10 6-10 12c0 4 4 8 8 10" fill="#6DC44F" />
                        <path d="M130 35c4-2 10-4 16-2s10 8 12 14c2 5 0 10-3 14" fill="#6DC44F" />
                        {/* Continent darker patches for depth */}
                        <path d="M75 55c-3 4-6 10-4 16s8 10 12 8 6-8 4-14-6-12-12-10z" fill="#5AB840" opacity="0.6" />
                        <path d="M100 80c-2 6 0 14 6 18s14 4 18-2 2-16-6-20-14-4-18 4z" fill="#5AB840" opacity="0.5" />
                        {/* Dark outline */}
                        <circle cx="100" cy="100" r="90" stroke="#1B3A5C" strokeWidth="4" />
                        {/* Continent outlines */}
                        <path d="M70 45c-5 3-12 8-15 18s-2 22 3 28c4 5 10 4 14 8s6 14 2 22c-3 6-8 10-6 16s10 12 18 14c6 2 14 0 20-4s10-12 16-14c8-2 16 2 22-2s10-14 8-24c-2-8-8-14-6-22s10-14 8-22c-2-6-8-8-14-10s-14-2-18-6c-6-6-4-16-10-20s-16-2-22 2c-6 4-10 10-16 12s-10 0-4-2" stroke="#1B3A5C" strokeWidth="2.5" strokeLinejoin="round" />
                        <path d="M35 90c-2 8 0 18 6 24s16 8 20 14c3 5 2 12-2 16s-10 6-10 12c0 4 4 8 8 10" stroke="#1B3A5C" strokeWidth="2.5" strokeLinejoin="round" />
                        <path d="M130 35c4-2 10-4 16-2s10 8 12 14c2 5 0 10-3 14" stroke="#1B3A5C" strokeWidth="2.5" strokeLinejoin="round" />
                        {/* Shine highlight */}
                        <ellipse cx="72" cy="58" rx="18" ry="28" fill="white" opacity="0.15" transform="rotate(-20 72 58)" />
                        <defs>
                          <radialGradient id="globeGrad" cx="0.35" cy="0.3" r="0.65">
                            <stop offset="0%" stopColor="white" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#1B3A5C" stopOpacity="0.15" />
                          </radialGradient>
                        </defs>
                      </svg>
                    </div>

                    {/* Floating cards */}
                    <div className="absolute top-6 left-6 bg-white rounded-xl shadow-lg p-4 w-44">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-800">Creator</div>
                          <div className="text-[10px] text-gray-500">Beauty & Lifestyle</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <span className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded text-[10px]">50K+</span>
                        <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-[10px]">4.8%</span>
                      </div>
                    </div>

                    <div className="absolute bottom-8 right-6 bg-white rounded-xl shadow-lg p-4 w-48">
                      <div className="text-xs font-semibold text-gray-800 mb-1">Campaign Live</div>
                      <div className="text-[10px] text-gray-500 mb-2">Summer Beauty Collection</div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-primary-500 h-1.5 rounded-full w-3/4" />
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">12/16 creators matched</div>
                    </div>

                    <div className="absolute top-1/2 right-4 -translate-y-1/2 bg-white rounded-xl shadow-lg p-3 w-36">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <span className="text-[10px] font-medium text-gray-700">30+ Markets</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary-400 rounded-full" />
                        <span className="text-[10px] font-medium text-gray-700">AI Matching</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar - hidden for now
      <section className="border-t border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-center text-sm text-gray-500 mb-8 font-medium uppercase tracking-wider">
            {t.home.social.trusted}
          </p>
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{t.home.social.creators.split(' ')[0]}</div>
              <div className="text-sm text-gray-500 mt-1">{t.home.social.creators.split(' ').slice(1).join(' ')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{t.home.social.markets.split(' ')[0]}</div>
              <div className="text-sm text-gray-500 mt-1">{t.home.social.markets.split(' ').slice(1).join(' ')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{t.home.social.campaigns.split(' ')[0]}</div>
              <div className="text-sm text-gray-500 mt-1">{t.home.social.campaigns.split(' ').slice(1).join(' ')}</div>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* Platform Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5">
              {t.home.platform.title}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
              {t.home.platform.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-200 transition-colors">
                <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t.home.platform.card1Title}</h3>
              <p className="text-gray-500 leading-relaxed">{t.home.platform.card1Desc}</p>
            </div>

            <div className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-200 transition-colors">
                <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t.home.platform.card2Title}</h3>
              <p className="text-gray-500 leading-relaxed">{t.home.platform.card2Desc}</p>
            </div>

            <div className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-200 transition-colors">
                <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t.home.platform.card3Title}</h3>
              <p className="text-gray-500 leading-relaxed">{t.home.platform.card3Desc}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
