'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import CampaignCard from './CampaignCard'
import SimilarCampaignsHeading from './SimilarCampaignsHeading'

interface SimilarCampaignsProps {
  campaignId: string
  initialCampaigns: any[]
}

export default function SimilarCampaigns({ campaignId, initialCampaigns }: SimilarCampaignsProps) {
  const { locale } = useLanguage()
  const [campaigns, setCampaigns] = useState(initialCampaigns)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchTranslated() {
      setIsLoading(true)
      try {
        // Fetch translated versions of each similar campaign
        const translated = await Promise.all(
          initialCampaigns.map(async (c) => {
            const res = await fetch(`/api/campaigns/${c.id}?lang=${locale}`)
            const data = await res.json()
            if (data && !data.message) {
              // Merge translated fields back, keeping original structure for card display
              return { ...c, title: data.title, description: data.description }
            }
            return c
          })
        )
        setCampaigns(translated)
      } catch (error) {
        console.error('Error fetching translated campaigns:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTranslated()
  }, [locale, initialCampaigns])

  if (campaigns.length === 0) return null

  return (
    <div className="mt-12">
      <SimilarCampaignsHeading />
      <div className="space-y-4">
        {campaigns.map((c) => (
          <CampaignCard key={c.id} campaign={c as any} />
        ))}
      </div>
    </div>
  )
}
