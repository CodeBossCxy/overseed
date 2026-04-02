'use client'

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { useViewMode } from '@/lib/hooks/useViewMode'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

export type ThemeMode = 'creator' | 'brand' | 'global'

interface ThemeContextType {
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
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
  const pathname = usePathname()
  const [themeMode, setThemeModeState] = useState<ThemeMode>('global')

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode)
  }, [])

  // Homepage → global (dark space theme)
  // Other pages → sync with user's view mode (creator pink / brand blue)
  useEffect(() => {
    const isHomePage = pathname === '/'

    if (isHomePage) {
      document.documentElement.setAttribute('data-theme', 'global')
      setThemeModeState('global')
    } else {
      const viewTheme = session && isBrand ? 'brand' : 'creator'
      document.documentElement.setAttribute('data-theme', viewTheme)
      setThemeModeState(viewTheme)
    }

    // Update favicon
    const iconHref = (!session || pathname === '/') ? '/icon-pink.png' : isBrand ? '/icon-blue.png' : '/icon-pink.png'
    let link = document.querySelector<HTMLLinkElement>('link[data-dynamic-icon]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      link.type = 'image/png'
      link.setAttribute('data-dynamic-icon', 'true')
      document.head.appendChild(link)
    }
    link.href = iconHref + '?v=' + (pathname === '/' ? 'global' : isBrand ? 'brand' : 'creator')
  }, [pathname, session, isBrand])

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
