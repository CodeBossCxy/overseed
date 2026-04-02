'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface Category {
  id: number
  name: string
  slug: string
}

interface Platform {
  id: number
  name: string
  slug: string
}

interface CampaignFiltersProps {
  categories?: Category[]
  platforms?: Platform[]
}

export default function CampaignFilters({ categories = [], platforms = [] }: CampaignFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const ft = t.campaignFilters

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    platform: searchParams.get('platform') || '',
    compensation: searchParams.get('compensation') || '',
    minFollowers: searchParams.get('minFollowers') || '',
  })

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (filters.category) params.set('category', filters.category)
    if (filters.platform) params.set('platform', filters.platform)
    if (filters.compensation) params.set('compensation', filters.compensation)
    if (filters.minFollowers) params.set('minFollowers', filters.minFollowers)

    router.push(`/browse?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      platform: '',
      compensation: '',
      minFollowers: '',
    })
    router.push('/browse')
  }

  const compensationTypes = [
    { value: 'PAID', label: ft.paid },
    { value: 'GIFTED', label: ft.gifted },
    { value: 'PAID_PLUS_GIFT', label: ft.paidPlusGift },
    { value: 'AFFILIATE', label: ft.affiliate },
    { value: 'NEGOTIABLE', label: ft.negotiable },
  ]

  const followerRanges = [
    { value: '', label: ft.any },
    { value: '1000', label: '1K+' },
    { value: '5000', label: '5K+' },
    { value: '10000', label: '10K+' },
    { value: '50000', label: '50K+' },
    { value: '100000', label: '100K+' },
    { value: '500000', label: '500K+' },
    { value: '1000000', label: '1M+' },
  ]

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">{ft.filters}</h2>
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 hover:underline"
          >
            {ft.clearAll}
          </button>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">{ft.category}</label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">{ft.allCategories}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {t.categoryNames[cat.name] || cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Platform Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">{ft.platform}</label>
          <select
            value={filters.platform}
            onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">{ft.allPlatforms}</option>
            {platforms.map((plat) => (
              <option key={plat.id} value={plat.slug}>
                {plat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Compensation Type Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">{ft.compensation}</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="compensation"
                value=""
                checked={filters.compensation === ''}
                onChange={(e) => setFilters({ ...filters, compensation: e.target.value })}
                className="mr-2 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm">{ft.allTypes}</span>
            </label>
            {compensationTypes.map((type) => (
              <label key={type.value} className="flex items-center">
                <input
                  type="radio"
                  name="compensation"
                  value={type.value}
                  checked={filters.compensation === type.value}
                  onChange={(e) => setFilters({ ...filters, compensation: e.target.value })}
                  className="mr-2 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Follower Range Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">{ft.minFollowersRequired}</label>
          <select
            value={filters.minFollowers}
            onChange={(e) => setFilters({ ...filters, minFollowers: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {followerRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Apply Button */}
        <button
          onClick={applyFilters}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
        >
          {ft.applyFilters}
        </button>

        {/* Save Search Button */}
        <button className="w-full mt-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition">
          {ft.saveSearch}
        </button>
      </div>
    </aside>
  )
}
