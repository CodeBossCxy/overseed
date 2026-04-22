'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useViewMode } from '@/lib/hooks/useViewMode'
import { useTheme } from './ThemeProvider'

const FloatingLines = dynamic(() => import('@/components/backgrounds/FloatingLines'), { ssr: false })

/* ── Intersection Observer hook for slide-in sections ── */
function useSectionReveal() {
  const refs = useRef<(HTMLElement | null)[]>([])
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('hp-visible')
            observer.unobserve(e.target)
          }
        })
      },
      { threshold: 0.05 }
    )
    refs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])
  const setRef = (i: number) => (el: HTMLElement | null) => { refs.current[i] = el }
  return setRef
}

/* ── Font helpers ── */
const fontDisplay = 'var(--font-noto-sans-sc), system-ui, sans-serif'   /* 思源黑体 Heavy — headlines */
const fontSans = 'var(--font-noto-sans-sc), system-ui, sans-serif'      /* 思源黑体 — body/UI */

export default function HomePage() {
  const { data: session } = useSession()
  const { t } = useLanguage()
  const { isBrand, switchView } = useViewMode()
  const router = useRouter()
  const { themeMode, setThemeMode } = useTheme()

  const isGlobal = themeMode === 'global'
  const showBrandView = themeMode === 'brand'
  const signupLink = showBrandView ? '/auth/signup?type=brand' : '/auth/signup?type=influencer'

  const setRef = useSectionReveal()

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

  /* Split hero title into words for staggered animation.
     Chinese has no spaces, so split by character for CJK text. */
  const titleText = t.home.hero.title as string
  const hasCJK = /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(titleText)
  const titleWords = hasCJK ? titleText.split('') : titleText.split(' ')

  return (
    <div className="relative">
      {/* Global background image */}
      <div
        className="fixed inset-0 bg-cover bg-center opacity-30 pointer-events-none"
        style={{ backgroundImage: "url('/background_2.jpg')" }}
      />
      <div className="fixed inset-0 bg-[#020a18]/60 pointer-events-none" />

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0">
          <FloatingLines
            linesGradient={['#A855F7', '#3B82F6']}
            enabledWaves={['top', 'middle', 'bottom']}
            lineCount={[6]}
            lineDistance={[5]}
            animationSpeed={1}
            interactive={true}
            bendRadius={5.0}
            bendStrength={-0.5}
            mouseDamping={0.05}
            parallax={true}
            parallaxStrength={0.2}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#020a18]/30 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 pointer-events-none">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8 bg-white/10 border border-white/20 text-white/90 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-gradient-to-r from-[#A855F7] to-[#3B82F6]" />
              {t.home.hero.badge}
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl leading-[1.08] tracking-wide mb-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
              style={{ fontFamily: fontDisplay, fontWeight: 900 }}
            >
              {titleWords.map((word, i) => (
                <span
                  key={i}
                  className="hp-title-word"
                  style={{ animationDelay: `${0.1 + i * (hasCJK ? 0.06 : 0.12)}s` }}
                >
                  {word}{!hasCJK && i < titleWords.length - 1 ? '\u00A0' : ''}
                </span>
              ))}
            </h1>

            <p
              className="text-lg leading-relaxed mb-8 max-w-2xl mx-auto text-white/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
              style={{ fontFamily: fontSans, fontWeight: 300 }}
            >
              {t.home.hero.description}
            </p>

            <div className="inline-flex flex-col space-y-3 mb-10">
              {[t.home.hero.check1, t.home.hero.check2, t.home.hero.check3].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-r from-[#A855F7]/25 to-[#3B82F6]/25">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-sm md:text-base text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]" style={{ fontFamily: fontSans, fontWeight: 300 }}>{text}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 pointer-events-auto">
              {/* Frosted glass button */}
              <button
                onClick={handleGetStarted}
                className="px-6 py-3.5 border border-white/20 text-white rounded-full font-medium transition hover:bg-white/10 backdrop-blur-md bg-white/5"
                style={{ fontFamily: fontSans, fontWeight: 700 }}
              >
                {t.home.hero.getStarted}
              </button>
              {/* Frosted glass button */}
              <Link
                href="/contact"
                className="px-6 py-3.5 border border-white/20 text-white rounded-full font-medium transition hover:bg-white/10 backdrop-blur-md bg-white/5"
                style={{ fontFamily: fontSans, fontWeight: 700 }}
              >
                {t.home.hero.requestDemo}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section ref={setRef(0)} className="hp-section relative min-h-screen flex items-center py-24 overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl text-white mb-5" style={{ fontFamily: fontDisplay, fontWeight: 900 }}>
              {t.home.platform.title}
            </h2>
            <p className="text-white/60 text-lg leading-relaxed max-w-2xl mx-auto" style={{ fontFamily: fontSans, fontWeight: 300 }}>
              {t.home.platform.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: t.home.platform.card1Title, desc: t.home.platform.card1Desc, icon: (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )},
              { title: t.home.platform.card2Title, desc: t.home.platform.card2Desc, icon: (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              )},
              { title: t.home.platform.card3Title, desc: t.home.platform.card3Desc, icon: (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )},
            ].map((card, i) => (
              <div key={i} className="hp-card group rounded-2xl p-8 border border-white/10 bg-white/5">
                <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110">
                  {card.icon}
                </div>
                <h3 className="text-xl text-white mb-3" style={{ fontFamily: fontSans, fontWeight: 700 }}>{card.title}</h3>
                <p className="text-white/60 leading-relaxed" style={{ fontFamily: fontSans, fontWeight: 300 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Value Section */}
      <section ref={setRef(1)} className="hp-section relative min-h-screen flex items-center py-24 overflow-hidden bg-[#040e1f]/40">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/15 text-white/80 rounded-full text-xs font-medium mb-6 uppercase tracking-wider">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {t.home.toggle.brand}
              </div>

              <h2 className="text-3xl md:text-4xl text-white mb-5" style={{ fontFamily: fontDisplay, fontWeight: 900 }}>
                {t.home.brandValue.title}
              </h2>
              <p className="text-white/60 text-lg leading-relaxed mb-8" style={{ fontFamily: fontSans, fontWeight: 300 }}>
                {t.home.brandValue.description}
              </p>

              <p className="text-white font-medium mb-4" style={{ fontFamily: fontSans, fontWeight: 700 }}>{t.home.brandValue.hereYouCan}</p>
              <ul className="space-y-3 mb-8">
                {[t.home.brandValue.bullet1, t.home.brandValue.bullet2, t.home.brandValue.bullet3, t.home.brandValue.bullet4].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-white/80" style={{ fontFamily: fontSans, fontWeight: 300 }}>{text}</span>
                  </li>
                ))}
              </ul>

              <div className="hp-card rounded-2xl p-6 border border-white/10 bg-white/5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base text-white mb-1" style={{ fontFamily: fontSans, fontWeight: 700 }}>{t.home.brandValue.aiTitle}</h4>
                    <p className="text-white/60 text-sm leading-relaxed" style={{ fontFamily: fontSans, fontWeight: 300 }}>{t.home.brandValue.aiDesc}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5 lg:pt-12">
              {[
                { title: t.home.brandValue.highlight1Title, desc: t.home.brandValue.highlight1Desc, icon: (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )},
                { title: t.home.brandValue.highlight2Title, desc: t.home.brandValue.highlight2Desc, icon: (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )},
                { title: t.home.brandValue.highlight3Title, desc: t.home.brandValue.highlight3Desc, icon: (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )},
              ].map((card, i) => (
                <div key={i} className="hp-card group rounded-2xl p-6 border border-white/10 bg-white/5 flex items-start gap-5">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-lg text-white mb-1.5" style={{ fontFamily: fontSans, fontWeight: 700 }}>{card.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed" style={{ fontFamily: fontSans, fontWeight: 300 }}>{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Creator Value Section */}
      <section ref={setRef(2)} className="hp-section min-h-screen flex items-center py-24 bg-[#020a18]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-5 lg:pt-12 order-2 lg:order-1">
              {[
                { title: t.home.creatorValue.highlight1Title, desc: t.home.creatorValue.highlight1Desc, icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z' },
                { title: t.home.creatorValue.highlight2Title, desc: t.home.creatorValue.highlight2Desc, icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z' },
                { title: t.home.creatorValue.highlight3Title, desc: t.home.creatorValue.highlight3Desc, icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
              ].map((card, i) => (
                <div key={i} className="hp-card group rounded-2xl p-6 border border-white/10 bg-white/5 flex items-start gap-5">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg text-white mb-1.5" style={{ fontFamily: fontSans, fontWeight: 700 }}>{card.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed" style={{ fontFamily: fontSans, fontWeight: 300 }}>{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/15 text-white/80 rounded-full text-xs font-medium mb-6 uppercase tracking-wider">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {t.home.toggle.creator}
              </div>

              <h2 className="text-3xl md:text-4xl text-white mb-5" style={{ fontFamily: fontDisplay, fontWeight: 900 }}>
                {t.home.creatorValue.title}
              </h2>
              <p className="text-white/60 text-lg leading-relaxed mb-8" style={{ fontFamily: fontSans, fontWeight: 300 }}>
                {t.home.creatorValue.description}
              </p>

              <p className="text-white font-medium mb-4" style={{ fontFamily: fontSans, fontWeight: 700 }}>{t.home.creatorValue.hereYouCan}</p>
              <ul className="space-y-3">
                {[t.home.creatorValue.bullet1, t.home.creatorValue.bullet2, t.home.creatorValue.bullet3, t.home.creatorValue.bullet4, t.home.creatorValue.bullet5].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-white/80" style={{ fontFamily: fontSans, fontWeight: 300 }}>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Flow */}
      <section ref={setRef(3)} className="hp-section min-h-screen flex items-center py-24 bg-[#040e1f]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl text-white mb-3" style={{ fontFamily: fontDisplay, fontWeight: 900 }}>
              {t.home.howItWorksFlow.title}
            </h2>
            <p className="text-white/60 text-lg" style={{ fontFamily: fontSans, fontWeight: 300 }}>{t.home.howItWorksFlow.subtitle}</p>
          </div>

          <div className="relative">
            {/* Connection line with gradient */}
            <div className="hidden md:block absolute top-8 left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-0.5 bg-gradient-to-r from-[#A855F7]/20 via-[#3B82F6]/30 to-[#A855F7]/20" />

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
                  <div className="w-16 h-16 border border-white/20 text-white bg-black rounded-2xl flex items-center justify-center mx-auto mb-5 relative z-10">
                    {step.icon}
                  </div>
                  <h3 className="text-base text-white mb-2" style={{ fontFamily: fontSans, fontWeight: 700 }}>{step.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed" style={{ fontFamily: fontSans, fontWeight: 300 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section ref={setRef(4)} className="hp-section min-h-screen flex items-center py-24 bg-[#020a18]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl text-white mb-5" style={{ fontFamily: fontDisplay, fontWeight: 900 }}>
              {t.home.features.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: t.home.features.feature1Title, subtitle: t.home.features.feature1Subtitle, desc: t.home.features.feature1Desc, icon: (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.6 9h16.8M3.6 15h16.8" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 01-4-9 15.3 15.3 0 014-9z" />
                </svg>
              )},
              { title: t.home.features.feature2Title, subtitle: t.home.features.feature2Subtitle, desc: t.home.features.feature2Desc, icon: (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
              )},
              { title: t.home.features.feature3Title, subtitle: t.home.features.feature3Subtitle, desc: t.home.features.feature3Desc, icon: (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
              )},
            ].map((feature, i) => (
              <div key={i} className="hp-card group rounded-2xl p-8 border border-white/10 bg-white/5">
                <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110">
                  {feature.icon}
                </div>
                <h3 className="text-xl text-white mb-2" style={{ fontFamily: fontSans, fontWeight: 700 }}>{feature.title}</h3>
                <p className="text-sm text-white/70 font-medium mb-3">{feature.subtitle}</p>
                <p className="text-white/60 text-sm leading-relaxed" style={{ fontFamily: fontSans, fontWeight: 300 }}>{feature.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-white/40 mt-10" style={{ fontFamily: fontSans, fontWeight: 300 }}>{t.home.features.moreFeatures}</p>
        </div>
      </section>

      {/* Early Access */}
      <section ref={setRef(5)} className="hp-section relative min-h-screen flex items-center py-24 overflow-hidden bg-[#040e1f]/40">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          <h2 className="text-3xl md:text-4xl text-white mb-5" style={{ fontFamily: fontDisplay, fontWeight: 900 }}>
            {t.home.earlyAccess.title}
          </h2>
          <p className="text-white/60 text-lg leading-relaxed max-w-2xl mx-auto mb-12" style={{ fontFamily: fontSans, fontWeight: 300 }}>
            {t.home.earlyAccess.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            {[
              [t.home.earlyAccess.benefit1, t.home.earlyAccess.benefit2],
              [t.home.earlyAccess.benefit3, t.home.earlyAccess.benefit4],
              [t.home.earlyAccess.benefit5, t.home.earlyAccess.benefit6],
            ].map((pair, i) => (
              <div key={i} className="hp-card bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-left">
                <div className="flex items-start gap-3 mb-2">
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-white font-medium text-sm" style={{ fontFamily: fontSans, fontWeight: 700 }}>{pair[0]}</span>
                </div>
                <p className="text-white/60 text-sm pl-8" style={{ fontFamily: fontSans, fontWeight: 300 }}>{pair[1]}</p>
              </div>
            ))}
          </div>

          {/* Frosted glass CTA button */}
          <button
            onClick={handleGetStarted}
            className="px-10 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full text-lg hover:bg-white/15 transition shadow-xl shadow-[#A855F7]/10"
            style={{ fontFamily: fontSans, fontWeight: 700 }}
          >
            {t.home.earlyAccess.ctaSignup}
          </button>
        </div>
      </section>

      {/* Final CTA */}
      <section ref={setRef(6)} className="hp-section min-h-screen flex items-center py-24 bg-[#020a18]/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          <h2 className="text-3xl md:text-4xl text-white mb-6 leading-snug" style={{ fontFamily: fontDisplay, fontWeight: 900 }}>
            {t.home.finalCta.title}
          </h2>
          <p className="text-white/60 text-lg leading-relaxed max-w-2xl mx-auto mb-10" style={{ fontFamily: fontSans, fontWeight: 300 }}>
            {t.home.finalCta.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* White solid button */}
            <Link
              href="/auth/signup?type=brand"
              className="px-8 py-3.5 bg-white text-gray-900 rounded-full hover:bg-white/90 transition shadow-lg shadow-[#A855F7]/15 min-w-[160px]"
              style={{ fontFamily: fontSans, fontWeight: 700 }}
            >
              {t.home.finalCta.ctaBrand}
            </Link>
            {/* Frosted glass button */}
            <Link
              href="/auth/signup?type=influencer"
              className="px-8 py-3.5 border border-white/20 text-white rounded-full transition min-w-[160px] hover:bg-white/10 backdrop-blur-md bg-white/5"
              style={{ fontFamily: fontSans, fontWeight: 700 }}
            >
              {t.home.finalCta.ctaCreator}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
