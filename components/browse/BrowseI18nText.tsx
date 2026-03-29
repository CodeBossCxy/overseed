'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import CampaignCard from '../campaigns/CampaignCard'
import UGCTranslateToggle from '../UGCTranslateToggle'

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
  const { locale, isUGCTranslated } = useLanguage()
  const [campaigns, setCampaigns] = useState<any[]>(initialCampaigns)
  const [isTranslating, setIsTranslating] = useState(false)
  const originalCampaignsRef = useRef<any[]>(initialCampaigns)

  useEffect(() => {
    if (!isUGCTranslated) {
      setCampaigns(originalCampaignsRef.current)
      return
    }

    const fetchTranslated = async () => {
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
        }
      } catch (error) {
        console.error('Translation failed:', error)
      } finally {
        setIsTranslating(false)
      }
    }

    fetchTranslated()
  }, [isUGCTranslated, locale, filters.category, filters.platform, filters.compensation, filters.sort])

  return (
    <div>
      {/* Results header with translate toggle */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
        <BrowseResultsCount count={campaigns.length} />
        <UGCTranslateToggle isLoading={isTranslating} />
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
