'use client'

import { useLanguage } from '@/lib/i18n/LanguageContext'
import { formatDate } from '@/lib/i18n/formatDate'
import Link from 'next/link'

interface SavedSearch {
  id: string
  name: string
  filters: any
  isActive: boolean
  frequency: string
  createdAt: string
}

export default function AlertsPageClient({ savedSearches }: { savedSearches: SavedSearch[] }) {
  const { t, locale } = useLanguage()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t.alerts.title}</h1>
        <p className="text-gray-600">{t.alerts.subtitle}</p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          💡 {t.alerts.howItWorks.title}
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• {t.alerts.howItWorks.step1}</li>
          <li>• {t.alerts.howItWorks.step2}</li>
          <li>• {t.alerts.howItWorks.step3}</li>
          <li>• {t.alerts.howItWorks.step4}</li>
        </ul>
      </div>

      {/* Saved Searches */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t.alerts.savedSearches}</h2>
            <Link
              href="/browse"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition text-sm"
            >
              {t.alerts.createNew}
            </Link>
          </div>
        </div>

        <div className="p-6">
          {savedSearches.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 mb-4">{t.alerts.empty}</p>
              <Link
                href="/browse"
                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
              >
                {t.alerts.browseOpportunities}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {savedSearches.map((search) => (
                <div
                  key={search.id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-primary-300 transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{search.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {Object.entries(search.filters as any).map(([key, value]) => (
                          <span
                            key={key}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">
                        {t.alerts.created} {formatDate(search.createdAt, locale)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={search.isActive}
                          className="sr-only peer"
                          readOnly
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Frequency */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <label className="text-sm text-gray-600">{t.alerts.frequency}</label>
                      <select
                        defaultValue={search.frequency}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="INSTANT">{t.alerts.instant}</option>
                        <option value="DAILY">{t.alerts.daily}</option>
                        <option value="WEEKLY">{t.alerts.weekly}</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-md transition">
                        {t.alerts.viewResults}
                      </button>
                      <button className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition">
                        {t.alerts.delete}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Email Preferences */}
      <div className="bg-white rounded-lg shadow-md mt-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">{t.alerts.emailPreferences}</h2>
        </div>
        <div className="p-6 space-y-4">
          <label className="flex items-center">
            <input type="checkbox" className="mr-3" defaultChecked />
            <span className="text-sm">{t.alerts.emailMatchingSaved}</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-3" defaultChecked />
            <span className="text-sm">{t.alerts.emailStatusChange}</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-3" />
            <span className="text-sm">{t.alerts.emailWeeklyDigest}</span>
          </label>
          <button className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition">
            {t.alerts.savePreferences}
          </button>
        </div>
      </div>
    </div>
  )
}
