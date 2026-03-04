'use client'

import { useLanguage } from '@/lib/i18n/LanguageContext'

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
