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

  const isGlobal = themeMode === 'global'
  const showBrandView = themeMode === 'brand'
  const signupLink = showBrandView ? '/auth/signup?type=brand' : '/auth/signup?type=influencer'

  const handleGetStarted = async () => {
    if (session) {
      if (showBrandView !== isBrand) {
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
      <section className={`relative overflow-hidden ${isGlobal ? 'bg-transparent' : 'bg-white'}`}>
        {isGlobal ? (
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1527]/40 via-[#081120]/20 to-transparent" />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-white to-white" />
            <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary-100/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-primary-50/30 rounded-full blur-3xl" />
          </>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8 ${isGlobal ? 'bg-[#ff769f]/10 border border-[#ff769f]/25 text-[#ff769f] backdrop-blur-sm' : 'bg-primary-50 border border-primary-100 text-primary-700'}`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isGlobal ? 'bg-[#ff769f]' : 'bg-primary-500'}`} />
                {t.home.hero.badge}
              </div>

              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight mb-6 ${isGlobal ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]' : 'text-gray-900'}`}>
                {t.home.hero.title}
              </h1>

              <p className={`text-lg leading-relaxed mb-8 max-w-lg ${isGlobal ? 'text-gray-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]' : 'text-gray-600'}`}>
                {t.home.hero.description}
              </p>

              <div className="space-y-3 mb-10">
                {[t.home.hero.check1, t.home.hero.check2, t.home.hero.check3].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isGlobal ? 'bg-[#ff769f]/25' : 'bg-primary-100'}`}>
                      <svg className={`w-3 h-3 ${isGlobal ? 'text-[#ff769f]' : 'text-primary-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className={`text-sm md:text-base ${isGlobal ? 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]' : 'text-gray-700'}`}>{text}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-3.5 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary-600/20"
                >
                  {t.home.hero.getStarted}
                </button>
                <Link
                  href="/contact"
                  className={`px-6 py-3.5 border rounded-full font-medium transition ${isGlobal ? 'border-[#d4e0fd]/15 text-gray-200 hover:bg-[#0a1527]/45' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  {t.home.hero.requestDemo}
                </Link>
              </div>
            </div>

            <div className={`hidden ${isGlobal ? '' : 'lg:block'}`}>
              <div className="relative">
                <div className={`rounded-3xl p-8 aspect-square flex items-center justify-center ${isGlobal ? 'bg-white/5 backdrop-blur-sm border border-white/10' : 'bg-gradient-to-br from-primary-50 to-primary-100/50'}`}>
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-52 h-52 drop-shadow-lg" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="100" cy="100" r="90" fill="#4AADE8" />
                        <circle cx="100" cy="100" r="90" fill="url(#globeGrad)" />
                        <path d="M70 45c-5 3-12 8-15 18s-2 22 3 28c4 5 10 4 14 8s6 14 2 22c-3 6-8 10-6 16s10 12 18 14c6 2 14 0 20-4s10-12 16-14c8-2 16 2 22-2s10-14 8-24c-2-8-8-14-6-22s10-14 8-22c-2-6-8-8-14-10s-14-2-18-6c-6-6-4-16-10-20s-16-2-22 2c-6 4-10 10-16 12s-10 0-4-2" fill="#6DC44F" />
                        <path d="M35 90c-2 8 0 18 6 24s16 8 20 14c3 5 2 12-2 16s-10 6-10 12c0 4 4 8 8 10" fill="#6DC44F" />
                        <path d="M130 35c4-2 10-4 16-2s10 8 12 14c2 5 0 10-3 14" fill="#6DC44F" />
                        <path d="M75 55c-3 4-6 10-4 16s8 10 12 8 6-8 4-14-6-12-12-10z" fill="#5AB840" opacity="0.6" />
                        <path d="M100 80c-2 6 0 14 6 18s14 4 18-2 2-16-6-20-14-4-18 4z" fill="#5AB840" opacity="0.5" />
                        <circle cx="100" cy="100" r="90" stroke="#1B3A5C" strokeWidth="4" />
                        <path d="M70 45c-5 3-12 8-15 18s-2 22 3 28c4 5 10 4 14 8s6 14 2 22c-3 6-8 10-6 16s10 12 18 14c6 2 14 0 20-4s10-12 16-14c8-2 16 2 22-2s10-14 8-24c-2-8-8-14-6-22s10-14 8-22c-2-6-8-8-14-10s-14-2-18-6c-6-6-4-16-10-20s-16-2-22 2c-6 4-10 10-16 12s-10 0-4-2" stroke="#1B3A5C" strokeWidth="2.5" strokeLinejoin="round" />
                        <path d="M35 90c-2 8 0 18 6 24s16 8 20 14c3 5 2 12-2 16s-10 6-10 12c0 4 4 8 8 10" stroke="#1B3A5C" strokeWidth="2.5" strokeLinejoin="round" />
                        <path d="M130 35c4-2 10-4 16-2s10 8 12 14c2 5 0 10-3 14" stroke="#1B3A5C" strokeWidth="2.5" strokeLinejoin="round" />
                        <ellipse cx="72" cy="58" rx="18" ry="28" fill="white" opacity="0.15" transform="rotate(-20 72 58)" />
                        <defs>
                          <radialGradient id="globeGrad" cx="0.35" cy="0.3" r="0.65">
                            <stop offset="0%" stopColor="white" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#1B3A5C" stopOpacity="0.15" />
                          </radialGradient>
                        </defs>
                      </svg>
                    </div>

                    <div className="absolute top-6 left-6 bg-white rounded-xl shadow-lg p-4 w-44">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-800">{t.home.hero.cardCreator}</div>
                          <div className="text-[10px] text-gray-500">{t.home.hero.cardCreatorNiche}</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <span className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded text-[10px]">50K+</span>
                        <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-[10px]">4.8%</span>
                      </div>
                    </div>

                    <div className="absolute bottom-8 right-6 bg-white rounded-xl shadow-lg p-4 w-48">
                      <div className="text-xs font-semibold text-gray-800 mb-1">{t.home.hero.cardCampaignLive}</div>
                      <div className="text-[10px] text-gray-500 mb-2">{t.home.hero.cardCampaignName}</div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-primary-500 h-1.5 rounded-full w-3/4" />
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">{t.home.hero.cardCreatorsMatched}</div>
                    </div>

                    <div className="absolute top-1/2 right-4 -translate-y-1/2 bg-white rounded-xl shadow-lg p-3 w-36">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <span className="text-[10px] font-medium text-gray-700">{t.home.hero.cardMarkets}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary-400 rounded-full" />
                        <span className="text-[10px] font-medium text-gray-700">{t.home.hero.cardAiMatching}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section className={`py-24 ${isGlobal ? 'bg-[#081120]/20 backdrop-blur-[2px]' : 'bg-white'}`}>
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
            {[
              { title: t.home.platform.card1Title, desc: t.home.platform.card1Desc, icon: (
                <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )},
              { title: t.home.platform.card2Title, desc: t.home.platform.card2Desc, icon: (
                <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              )},
              { title: t.home.platform.card3Title, desc: t.home.platform.card3Desc, icon: (
                <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )},
            ].map((card, i) => (
              <div key={i} className={`group rounded-2xl p-8 border transition-all duration-300 ${isGlobal ? 'bg-[#0a1527]/30 backdrop-blur-[2px] border-[#d4e0fd]/10 hover:border-[#456fa3]/50 hover:bg-[#0a1527]/45' : 'bg-white border-gray-100 hover:border-primary-200 hover:shadow-lg'}`}>
                <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-200 transition-colors">
                  {card.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{card.title}</h3>
                <p className="text-gray-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Value Section - Blue */}
      <section className="relative py-24 overflow-hidden">
        {isGlobal ? (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1527]/30 via-[#081120]/15 to-transparent" />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-blue-50/40 to-white" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/20 rounded-full blur-3xl -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50/30 rounded-full blur-3xl translate-y-1/3" />
          </>
        )}

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left: Text content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-full text-xs font-medium mb-6 uppercase tracking-wider">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {t.home.toggle.brand}
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5">
                {t.home.brandValue.title}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {t.home.brandValue.description}
              </p>

              <p className="text-gray-700 font-medium mb-4">{t.home.brandValue.hereYouCan}</p>
              <ul className="space-y-3 mb-8">
                {[t.home.brandValue.bullet1, t.home.brandValue.bullet2, t.home.brandValue.bullet3, t.home.brandValue.bullet4].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-gray-600">{text}</span>
                  </li>
                ))}
              </ul>

              {/* AI Assistant callout */}
              <div className={`rounded-2xl p-6 border shadow-sm ${isGlobal ? 'bg-[#0a1527]/30 backdrop-blur-[2px] border-[#d4e0fd]/10' : 'bg-white border-blue-100'}`}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 mb-1">{t.home.brandValue.aiTitle}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{t.home.brandValue.aiDesc}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Highlight cards */}
            <div className="space-y-5 lg:pt-12">
              {[
                { title: t.home.brandValue.highlight1Title, desc: t.home.brandValue.highlight1Desc, icon: (
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )},
                { title: t.home.brandValue.highlight2Title, desc: t.home.brandValue.highlight2Desc, icon: (
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )},
                { title: t.home.brandValue.highlight3Title, desc: t.home.brandValue.highlight3Desc, icon: (
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )},
              ].map((card, i) => (
                <div key={i} className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50 hover:border-blue-200 hover:shadow-md transition-all duration-300 flex items-start gap-5">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1.5">{card.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Creator Value Section - Pink */}
      <section className="relative py-24 overflow-hidden">
        {isGlobal ? (
          <div className="absolute inset-0 bg-gradient-to-bl from-[#0a1527]/30 via-[#081120]/15 to-transparent" />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-bl from-pink-50/80 via-rose-50/40 to-white" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-100/20 rounded-full blur-3xl translate-y-1/3" />
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-50/30 rounded-full blur-3xl -translate-y-1/3" />
          </>
        )}

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left: Highlight cards (reversed layout from brand section) */}
            <div className="space-y-5 lg:pt-12 order-2 lg:order-1">
              {[
                { title: t.home.creatorValue.highlight1Title, desc: t.home.creatorValue.highlight1Desc, icon: (
                  <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                )},
                { title: t.home.creatorValue.highlight2Title, desc: t.home.creatorValue.highlight2Desc, icon: (
                  <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                  </svg>
                )},
                { title: t.home.creatorValue.highlight3Title, desc: t.home.creatorValue.highlight3Desc, icon: (
                  <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                )},
              ].map((card, i) => (
                <div key={i} className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-pink-100/50 hover:border-pink-200 hover:shadow-md transition-all duration-300 flex items-start gap-5">
                  <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-pink-100 transition-colors">
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1.5">{card.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Text content */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-50 border border-pink-100 text-pink-700 rounded-full text-xs font-medium mb-6 uppercase tracking-wider">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {t.home.toggle.creator}
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5">
                {t.home.creatorValue.title}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {t.home.creatorValue.description}
              </p>

              <p className="text-gray-700 font-medium mb-4">{t.home.creatorValue.hereYouCan}</p>
              <ul className="space-y-3">
                {[t.home.creatorValue.bullet1, t.home.creatorValue.bullet2, t.home.creatorValue.bullet3, t.home.creatorValue.bullet4, t.home.creatorValue.bullet5].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-gray-600">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Flow */}
      <section className={`py-24 ${isGlobal ? 'bg-[#081120]/20 backdrop-blur-[2px]' : 'bg-gray-50'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {t.home.howItWorksFlow.title}
            </h2>
            <p className="text-gray-600 text-lg">{t.home.howItWorksFlow.subtitle}</p>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-8 left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-0.5 bg-gradient-to-r from-primary-200 via-primary-300 to-primary-200" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6">
              {[
                { title: t.home.howItWorksFlow.step1Title, desc: t.home.howItWorksFlow.step1Desc, icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                )},
                { title: t.home.howItWorksFlow.step2Title, desc: t.home.howItWorksFlow.step2Desc, icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )},
                { title: t.home.howItWorksFlow.step3Title, desc: t.home.howItWorksFlow.step3Desc, icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                )},
                { title: t.home.howItWorksFlow.step4Title, desc: t.home.howItWorksFlow.step4Desc, icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )},
              ].map((step, i) => (
                <div key={i} className="text-center relative">
                  <div className={`w-16 h-16 border-2 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-5 relative z-10 shadow-sm ${isGlobal ? 'bg-[#0a1527]/35 backdrop-blur-[2px] border-[#456fa3]/40' : 'bg-white border-primary-200'}`}>
                    {step.icon}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className={`py-24 ${isGlobal ? 'bg-transparent' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5">
              {t.home.features.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: t.home.features.feature1Title, subtitle: t.home.features.feature1Subtitle, desc: t.home.features.feature1Desc, icon: (
                <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364V3M3 11.25h4.5m0 0a2.25 2.25 0 014.5 0m-4.5 0v4.5m4.5-4.5v4.5m0-4.5h6" />
                </svg>
              )},
              { title: t.home.features.feature2Title, subtitle: t.home.features.feature2Subtitle, desc: t.home.features.feature2Desc, icon: (
                <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
              )},
              { title: t.home.features.feature3Title, subtitle: t.home.features.feature3Subtitle, desc: t.home.features.feature3Desc, icon: (
                <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
              )},
            ].map((feature, i) => (
              <div key={i} className={`group rounded-2xl p-8 border transition-all duration-300 ${isGlobal ? 'bg-[#0a1527]/30 backdrop-blur-[2px] border-[#d4e0fd]/10 hover:bg-[#0a1527]/45 hover:border-[#456fa3]/50' : 'bg-gray-50 hover:bg-white hover:shadow-lg hover:border-primary-100 border-transparent'}`}>
                <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-200 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-primary-600/80 font-medium mb-3">{feature.subtitle}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-10">{t.home.features.moreFeatures}</p>
        </div>
      </section>

      {/* Early Access */}
      <section className="relative py-24 overflow-hidden">
        {isGlobal ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a1527]/25 to-[#081120]/15" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_center,_var(--tw-gradient-stops))] from-amber-600/50 via-amber-700/20 to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-500/20 via-transparent to-transparent" />
            <div className="absolute top-0 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 bg-primary-400/10 rounded-full blur-3xl" />
          </>
        )}

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
            {t.home.earlyAccess.title}
          </h2>
          <p className="text-primary-100 text-lg leading-relaxed max-w-2xl mx-auto mb-12">
            {t.home.earlyAccess.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            {[
              [t.home.earlyAccess.benefit1, t.home.earlyAccess.benefit2],
              [t.home.earlyAccess.benefit3, t.home.earlyAccess.benefit4],
              [t.home.earlyAccess.benefit5, t.home.earlyAccess.benefit6],
            ].map((pair, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-left">
                <div className="flex items-start gap-3 mb-2">
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-white font-medium text-sm">{pair[0]}</span>
                </div>
                <p className="text-primary-200 text-sm pl-8">{pair[1]}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleGetStarted}
            className="px-10 py-4 bg-white text-primary-700 rounded-full font-semibold text-lg hover:bg-primary-50 transition shadow-xl shadow-black/10"
          >
            {t.home.earlyAccess.ctaSignup}
          </button>
        </div>
      </section>

      {/* Final CTA */}
      <section className={`py-24 ${isGlobal ? 'bg-[#081120]/20 backdrop-blur-[2px]' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-snug">
            {t.home.finalCta.title}
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            {t.home.finalCta.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup?type=brand"
              className="px-8 py-3.5 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary-600/20 min-w-[160px]"
            >
              {t.home.finalCta.ctaBrand}
            </Link>
            <Link
              href="/auth/signup?type=influencer"
              className={`px-8 py-3.5 border rounded-full font-semibold transition min-w-[160px] ${isGlobal ? 'border-[#d4e0fd]/15 text-gray-200 hover:bg-[#0a1527]/45' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              {t.home.finalCta.ctaCreator}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
