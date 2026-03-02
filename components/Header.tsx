'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useViewMode } from '@/lib/hooks/useViewMode'
import { useState } from 'react'

export default function Header() {
  const { data: session } = useSession()
  const { locale, setLocale, t } = useLanguage()
  const { currentMode, isBrand, switchView, isSwitching } = useViewMode()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleLanguage = () => {
    const newLang = locale === 'en' ? 'zh' : 'en'
    setLocale(newLang)
  }

  const dashboardLink = isBrand ? '/dashboard/brand' : '/dashboard/influencer'

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">Overseed</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-primary-600 transition">
              {t.nav.home}
            </Link>
            <Link href="/browse" className="text-gray-700 hover:text-primary-600 transition">
              {t.nav.browse}
            </Link>
            {session && isBrand && (
              <Link href="/dashboard/brand/campaigns/new" className="text-gray-700 hover:text-primary-600 transition">
                Create Campaign
              </Link>
            )}
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
              <div className="hidden md:flex items-center space-x-4">
                {/* View Switcher */}
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
                <Link
                  href={dashboardLink}
                  className="text-gray-700 hover:text-primary-600"
                >
                  {t.nav.myCenter}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition text-sm"
                >
                  {t.nav.logout}
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition"
                >
                  {t.nav.signup}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
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
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/"
                className="text-gray-700 hover:text-primary-600 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.home}
              </Link>
              <Link
                href="/browse"
                className="text-gray-700 hover:text-primary-600 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.browse}
              </Link>
              {session ? (
                <>
                  {/* Mobile View Switcher */}
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
                  <Link
                    href={dashboardLink}
                    className="text-gray-700 hover:text-primary-600 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t.nav.myCenter}
                  </Link>
                  {isBrand && (
                    <Link
                      href="/dashboard/brand/campaigns/new"
                      className="text-gray-700 hover:text-primary-600 transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Create Campaign
                    </Link>
                  )}
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
                    className="text-gray-700 hover:text-primary-600 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t.nav.login}
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="text-primary-600 font-medium hover:text-primary-700 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t.nav.signup}
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
