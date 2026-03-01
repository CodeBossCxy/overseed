'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import CampaignCard from './campaigns/CampaignCard'

interface Campaign {
  id: string
  title: string
  description?: string | null
  compensationType: string
  paymentMin?: number | string | null
  paymentMax?: number | string | null
  giftDescription?: string | null
  deadline?: string | null
  totalSlots: number
  filledSlots: number
  images: string[]
  isFeatured: boolean
  viewCount: number
  brand: {
    companyName?: string | null
    logoUrl?: string | null
    isVerified: boolean
  }
  categories: Array<{
    category: {
      name: string
      slug: string
    }
  }>
  platforms: Array<{
    platform: {
      name: string
      slug: string
    }
  }>
  _count?: {
    applications: number
  }
}

export default function HomePage({ campaigns: initialCampaigns }: { campaigns: Campaign[] }) {
  const { t, locale } = useLanguage()
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch translated campaigns when language changes
  useEffect(() => {
    async function fetchTranslatedCampaigns() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/campaigns?lang=${locale}&limit=12`)
        const result = await response.json()
        setCampaigns(result.data || [])
      } catch (error) {
        console.error('Error fetching campaigns:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTranslatedCampaigns()
  }, [locale])

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t.home.hero.title}
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-primary-100">
            {t.home.hero.subtitle}
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth/signup?type=brand"
              className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition w-full sm:w-auto"
            >
              {t.home.hero.brandCTA}
            </Link>
            <Link
              href="/auth/signup?type=influencer"
              className="px-8 py-4 bg-primary-700 text-white rounded-lg font-semibold text-lg hover:bg-primary-600 transition border-2 border-white w-full sm:w-auto"
            >
              {t.home.hero.creatorCTA}
            </Link>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder={t.home.search.placeholder}
                className="col-span-2 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <select className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500">
                <option>{t.home.search.location}</option>
                <option>United States</option>
                <option>China</option>
                <option>United Kingdom</option>
                <option>Japan</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500">
                <option>{t.home.search.allCategories}</option>
                <option>{t.categories.fashion}</option>
                <option>{t.categories.beauty}</option>
                <option>{t.categories.tech}</option>
                <option>{t.categories.food}</option>
                <option>{t.categories.travel}</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Categories */}
      <section className="py-6 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            <Link href="/browse" className="px-4 py-2 bg-primary-600 text-white rounded-full text-sm font-medium hover:bg-primary-700 transition">
              {t.home.filters.all}
            </Link>
            <Link href="/browse?compensation=PAID" className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium hover:bg-green-200 transition">
              Paid Campaigns
            </Link>
            <Link href="/browse?compensation=GIFTED" className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition">
              Gifted Only
            </Link>
            <Link href="/browse?sort=deadline" className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition">
              {t.home.filters.urgent}
            </Link>
          </div>
        </div>
      </section>

      {/* Announcement Banner */}
      <section className="py-4 bg-yellow-50 border-b border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <span className="text-yellow-800 font-semibold mr-2">New</span>
            <p className="text-yellow-800">{t.home.announcement.welcome}</p>
          </div>
        </div>
      </section>

      {/* Latest Campaigns */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">{t.home.latest.title}</h2>
            <Link
              href="/browse"
              className="text-primary-600 hover:underline font-medium"
            >
              View all
            </Link>
          </div>

          {campaigns.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 text-lg mb-4">{t.home.latest.noResults}</p>
              <Link href="/dashboard/brand/campaigns/new" className="inline-block px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition">
                {t.home.latest.createPost}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.slice(0, 6).map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}

          {campaigns.length > 6 && (
            <div className="text-center mt-8">
              <Link
                href="/browse"
                className="inline-block px-8 py-3 border-2 border-primary-600 text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition"
              >
                View More Campaigns
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">{t.home.howItWorks.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t.home.howItWorks.step1Title}</h3>
              <p className="text-gray-600">{t.home.howItWorks.step1Desc}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t.home.howItWorks.step2Title}</h3>
              <p className="text-gray-600">{t.home.howItWorks.step2Desc}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t.home.howItWorks.step3Title}</h3>
              <p className="text-gray-600">{t.home.howItWorks.step3Desc}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
