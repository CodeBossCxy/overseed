'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { translations, Locale } from './translations'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (typeof translations)[Locale]
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const { data: session, status } = useSession()
  const hasFetchedRef = useRef(false)

  // Load locale from localStorage immediately, then override with DB value if logged in
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'zh')) {
      setLocaleState(savedLocale)
    }
  }, [])

  // When user is logged in, fetch their preferred language from the database
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user || hasFetchedRef.current) return
    hasFetchedRef.current = true

    fetch('/api/user/language')
      .then(res => res.json())
      .then(data => {
        if (data.language && (data.language === 'en' || data.language === 'zh')) {
          setLocaleState(data.language)
          localStorage.setItem('locale', data.language)
        }
      })
      .catch(() => {
        // Silently fall back to localStorage value
      })
  }, [status, session])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)

    // If logged in, persist to database
    fetch('/api/user/language', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: newLocale }),
    }).catch(() => {
      // Silently fail — localStorage is the fallback
    })
  }, [])

  const value = useMemo(() => ({
    locale,
    setLocale,
    t: translations[locale],
  }), [locale, setLocale])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
