'use client'

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { useViewMode } from '@/lib/hooks/useViewMode'
import { useSession } from 'next-auth/react'

interface ThemeContextType {
  themeMode: 'creator' | 'brand'
  setThemeMode: (mode: 'creator' | 'brand') => void
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'creator',
  setThemeMode: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const { isBrand } = useViewMode()
  const [themeMode, setThemeModeState] = useState<'creator' | 'brand'>('creator')

  const setThemeMode = useCallback((mode: 'creator' | 'brand') => {
    setThemeModeState(mode)
  }, [])

  // Sync with session-based view mode when logged in
  useEffect(() => {
    if (session) {
      setThemeModeState(isBrand ? 'brand' : 'creator')
    }
  }, [session, isBrand])

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode)

    // Update favicon — find existing or create once, then just update href
    const iconHref = themeMode === 'brand' ? '/icon-blue.png' : '/icon-pink.png'
    let link = document.querySelector<HTMLLinkElement>('link[data-dynamic-icon]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      link.type = 'image/png'
      link.setAttribute('data-dynamic-icon', 'true')
      document.head.appendChild(link)
    }
    link.href = iconHref + '?v=' + themeMode
  }, [themeMode])

  const value = useMemo(() => ({
    themeMode,
    setThemeMode,
  }), [themeMode, setThemeMode])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
