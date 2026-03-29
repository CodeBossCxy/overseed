'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useViewMode } from '@/lib/hooks/useViewMode'
import { useTheme } from './ThemeProvider'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

interface DropdownItem {
  label: string
  href: string
}

function NavDropdown({ label, items }: { label: string; items: DropdownItem[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-gray-700 hover:text-primary-600 transition text-sm font-medium"
      >
        {label}
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function MessageBadge() {
  const [unread, setUnread] = useState(0)
  const { data: session } = useSession()
  const badgeUserId = (session?.user as any)?.id

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/messages/unread')
        if (res.ok) {
          const data = await res.json()
          setUnread(data.totalUnread)
        }
      } catch {}
    }
    fetchUnread()

    // Use Pusher for real-time badge updates
    let cleanup: (() => void) | undefined
    import('@/lib/pusher-client').then(({ getPusherClient }) => {
      const pusher = getPusherClient()
      if (pusher && badgeUserId) {
        const channel = pusher.subscribe(`user-${badgeUserId}`)
        channel.bind('conversation-updated', () => {
          fetchUnread()
        })
        cleanup = () => {
          channel.unbind_all()
          pusher.unsubscribe(`user-${badgeUserId}`)
        }
      }
    })

    // Fallback polling
    const interval = setInterval(fetchUnread, 30000)
    return () => {
      clearInterval(interval)
      cleanup?.()
    }
  }, [badgeUserId])

  return (
    <Link
      href="/dashboard/messages"
      className="relative text-gray-700 hover:text-primary-600 transition"
      title="Messages"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      {unread > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  )
}

export default function Header() {
  const { data: session } = useSession()
  const { locale, setLocale, t } = useLanguage()
  const { currentMode, isBrand, switchView, isSwitching } = useViewMode()
  const { themeMode } = useTheme()
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)

  const toggleLanguage = () => {
    const newLang = locale === 'en' ? 'zh' : 'en'
    setLocale(newLang)
  }

  const dashboardLink = isBrand ? '/dashboard/brand' : '/dashboard/influencer'

  const navMenus = [
    {
      key: 'campaigns',
      label: t.nav.campaigns,
      items: [
        { label: t.nav.campaignBoard, href: '/browse' },
        { label: t.nav.featuredCampaigns, href: '/browse?sort=featured' },
      ],
    },
    {
      key: 'globalization',
      label: t.nav.brandGlobalization,
      items: [
        { label: t.nav.aiAssistant, href: '/ai-assistant' },
        { label: t.nav.marketInsights, href: '/market-insights' },
        { label: t.nav.growthServices, href: '/growth-services' },
      ],
    },
    {
      key: 'pricing',
      label: t.nav.pricing,
      items: [
        { label: t.nav.brandPricing, href: '/pricing/brand' },
        { label: t.nav.creatorPricing, href: '/pricing/creator' },
      ],
    },
    {
      key: 'contact',
      label: t.nav.contact,
      items: [
        { label: t.nav.contactUs, href: '/contact' },
        { label: t.nav.businessEnquiry, href: '/contact/business' },
        { label: t.nav.creatorCommunity, href: '/community/creator' },
        { label: t.nav.brandCommunity, href: '/community/brand' },
      ],
    },
  ]

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={themeMode === 'brand' ? "/Overseed-blue.PNG" : "/Overseed.PNG"} alt="Overseed" className="h-10 w-auto" />
            <span className="text-2xl font-bold text-primary-600">OVERSEED</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-400 text-amber-900 rounded uppercase tracking-wider">Beta</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navMenus.map((menu) => (
              <NavDropdown key={menu.key} label={menu.label} items={menu.items} />
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50 transition text-sm"
            >
              {locale === 'en' ? '中文' : 'EN'}
            </button>

            {/* Auth buttons */}
            {session ? (
              <div className="hidden lg:flex items-center space-x-4">
                {/* View Switcher — hidden on home page (has its own toggle) */}
                {!isHomePage && (
                  <button
                    onClick={() => switchView()}
                    disabled={isSwitching}
                    className="px-3 py-1 rounded-md border border-primary-300 text-primary-600 hover:bg-primary-50 transition text-sm disabled:opacity-50"
                  >
                    {isSwitching
                      ? t.nav.switching
                      : isBrand
                        ? t.nav.switchToCreator
                        : t.nav.switchToBrand}
                  </button>
                )}
                <MessageBadge />
                <Link
                  href={dashboardLink}
                  className="text-gray-700 hover:text-primary-600 text-sm font-medium"
                >
                  {t.nav.myCenter}
                </Link>
                <Link
                  href="/settings"
                  className="relative text-gray-700 hover:text-primary-600 transition"
                  title={t.nav.settings}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition text-sm"
                >
                  {t.nav.logout}
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-2">
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition text-sm"
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition text-sm"
                >
                  {t.nav.signup}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t">
            <nav className="flex flex-col space-y-1">
              {navMenus.map((menu) => (
                <div key={menu.key}>
                  <button
                    onClick={() => setMobileExpanded(mobileExpanded === menu.key ? null : menu.key)}
                    className="flex items-center justify-between w-full py-2 text-gray-700 hover:text-primary-600 transition font-medium"
                  >
                    {menu.label}
                    <svg className={`w-4 h-4 transition-transform ${mobileExpanded === menu.key ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {mobileExpanded === menu.key && (
                    <div className="pl-4 space-y-1">
                      {menu.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block py-2 text-sm text-gray-600 hover:text-primary-600 transition"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="border-t pt-3 mt-2 space-y-3">
                {session ? (
                  <>
                    {!isHomePage && (
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false)
                          switchView()
                        }}
                        disabled={isSwitching}
                        className="text-left text-primary-600 hover:text-primary-700 transition disabled:opacity-50"
                      >
                        {isSwitching
                          ? t.nav.switching
                          : isBrand
                            ? t.nav.switchToCreator
                            : t.nav.switchToBrand}
                      </button>
                    )}
                    <Link
                      href="/dashboard/messages"
                      className="block text-gray-700 hover:text-primary-600 transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t.messages?.title || 'Messages'}
                    </Link>
                    <Link
                      href={dashboardLink}
                      className="block text-gray-700 hover:text-primary-600 transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t.nav.myCenter}
                    </Link>
                    <Link
                      href="/settings"
                      className="block text-gray-700 hover:text-primary-600 transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t.nav.settings}
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false)
                        signOut()
                      }}
                      className="text-left text-gray-700 hover:text-primary-600 transition"
                    >
                      {t.nav.logout}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/signin"
                      className="block text-gray-700 hover:text-primary-600 transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t.nav.login}
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="block text-primary-600 font-medium hover:text-primary-700 transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t.nav.signup}
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
