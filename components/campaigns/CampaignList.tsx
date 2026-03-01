'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import CampaignCard from './CampaignCard'

interface Campaign {
  id: string
  title: string
  description: string | null
  compensationType: string
  paymentMin: number | null
  paymentMax: number | null
  giftDescription: string | null
  giftValue: number | null
  deadline: string | null
  totalSlots: number
  filledSlots: number
  status: string
  brand: {
    id: string
    companyName: string | null
    logoUrl: string | null
    isVerified: boolean
  }
  categories: Array<{
    category: {
      id: number
      name: string
      slug: string
    }
  }>
  platforms: Array<{
    platform: {
      id: number
      name: string
      slug: string
    }
  }>
  followerRequirements: Array<{
    platform: {
      id: number
      name: string
    }
    minFollowers: number
    maxFollowers: number | null
  }>
  _count: {
    applications: number
  }
}

interface CampaignListProps {
  initialCampaigns: Campaign[]
  filters: {
    category?: string
    platform?: string
    compensation?: string
    sort?: string
  }
}

export default function CampaignList({ initialCampaigns, filters }: CampaignListProps) {
  const { locale } = useLanguage()
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Fetch translated campaigns when language changes
    async function fetchTranslatedCampaigns() {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        params.set('lang', locale)
        if (filters.category) params.set('category', filters.category)
        if (filters.platform) params.set('platform', filters.platform)
        if (filters.compensation) params.set('compensation', filters.compensation)
        if (filters.sort) params.set('sort', filters.sort)

        const response = await fetch(`/api/campaigns?${params.toString()}`)
        const result = await response.json()
        setCampaigns(result.data || [])
      } catch (error) {
        console.error('Error fetching campaigns:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTranslatedCampaigns()
  }, [locale, filters.category, filters.platform, filters.compensation, filters.sort])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <p className="text-gray-500 text-lg mb-4">No campaigns match your filters</p>
        <a href="/browse" className="text-primary-600 hover:underline">
          Clear all filters
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign as any} />
      ))}
    </div>
  )
}
