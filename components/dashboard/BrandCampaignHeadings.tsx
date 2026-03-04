'use client'

import { useLanguage } from '@/lib/i18n/LanguageContext'

export function NewCampaignHeading() {
  const { t } = useLanguage()
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">{t.brand.campaignNew.title}</h1>
      <p className="text-gray-600 mt-1">{t.brand.campaignNew.subtitle}</p>
    </div>
  )
}

export function EditCampaignHeading() {
  const { t } = useLanguage()
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">{t.brand.campaignEdit.title}</h1>
      <p className="text-gray-600 mt-1">{t.brand.campaignEdit.subtitle}</p>
    </div>
  )
}
