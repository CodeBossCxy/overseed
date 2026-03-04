'use client'

import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function SimilarCampaignsHeading() {
  const { t } = useLanguage()
  return <h2 className="text-2xl font-bold mb-6">{t.campaign.similarCampaigns}</h2>
}
