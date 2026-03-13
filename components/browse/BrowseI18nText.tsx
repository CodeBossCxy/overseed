'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import CampaignCard from '../campaigns/CampaignCard'

export function BrowseTitle() {
  const { t } = useLanguage()
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold mb-2">{t.browse.title}</h1>
      <p className="text-gray-600">{t.browse.subtitle}</p>
    </div>
  )
}

export function BrowseResultsCount({ count }: { count: number }) {
  const { t } = useLanguage()
  return (
    <div className="text-sm text-gray-600">
      {count} {t.browse.campaignsFound}
    </div>
  )
}

export function BrowseEmpty() {
  const { t } = useLanguage()
  return (
    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
      <p className="text-gray-500 text-lg mb-4">{t.browse.noResults}</p>
      <a href="/browse" className="text-primary-600 hover:underline">
        {t.browse.clearFilters}
      </a>
    </div>
  )
}

export function BrowseCampaignList({
  initialCampaigns,
  filters,
}: {
  initialCampaigns: any[]
  filters: { category?: string; platform?: string; compensation?: string; sort?: string }
}) {
  const { locale, t } = useLanguage()
  const [campaigns, setCampaigns] = useState<any[]>(initialCampaigns)
  const [isTranslated, setIsTranslated] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [originalCampaigns] = useState<any[]>(initialCampaigns)

  const handleTranslate = async () => {
    if (isTranslated) {
      setCampaigns(originalCampaigns)
      setIsTranslated(false)
      return
    }

    setIsTranslating(true)
    try {
      const params = new URLSearchParams()
      params.set('lang', locale)
      params.set('limit', '50')
      if (filters.category) params.set('category', filters.category)
      if (filters.platform) params.set('platform', filters.platform)
      if (filters.compensation) params.set('compensation', filters.compensation)
      if (filters.sort) params.set('sort', filters.sort)

      const res = await fetch(`/api/campaigns?${params.toString()}`)
      const result = await res.json()
      if (result.data) {
        setCampaigns(result.data)
        setIsTranslated(true)
      }
    } catch (error) {
      console.error('Translation failed:', error)
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <div>
      {/* Results header with translate button */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
        <BrowseResultsCount count={campaigns.length} />
        <button
          onClick={handleTranslate}
          disabled={isTranslating}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            isTranslated
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          } disabled:opacity-50`}
        >
          {isTranslating ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t.browse.translating}
            </>
          ) : isTranslated ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              {t.browse.showOriginal}
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              {t.browse.translatePreview}
            </>
          )}
        </button>
      </div>

      {/* Campaign cards */}
      {campaigns.length === 0 ? (
        <BrowseEmpty />
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign: any) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  )
}

export function BrowseProGate({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { t } = useLanguage()
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-2xl shadow-sm p-10">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{t.browsePro.title}</h2>
        <p className="text-gray-600 mb-6">{t.browsePro.description}</p>
        {!isLoggedIn ? (
          <Link
            href="/auth/signin"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
          >
            {t.browsePro.signIn}
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
          >
            {t.browsePro.upgradeToPro}
          </Link>
        )}
      </div>
    </div>
  )
}
