'use client'

import { useLanguage } from '@/lib/i18n/LanguageContext'
import CampaignCard from '@/components/campaigns/CampaignCard'
import Link from 'next/link'

interface InfluencerSavedClientProps {
  savedCampaigns: any[]
}

export default function InfluencerSavedClient({ savedCampaigns }: InfluencerSavedClientProps) {
  const { t } = useLanguage()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t.influencer.saved.title}</h1>
          <p className="text-gray-600 mt-1">{t.influencer.saved.subtitle}</p>
        </div>
        <Link
          href="/browse"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
        >
          {t.influencer.saved.browseMore}
        </Link>
      </div>

      {/* Campaigns List */}
      {savedCampaigns.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">{t.influencer.saved.empty}</p>
          <p className="text-gray-400 mb-6">{t.influencer.saved.emptyDesc}</p>
          <Link
            href="/browse"
            className="inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
          >
            {t.influencer.saved.browseCampaigns}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {savedCampaigns.map((item: any) => (
            <CampaignCard key={item.campaign.id} campaign={item.campaign} />
          ))}
        </div>
      )}
    </div>
  )
}
