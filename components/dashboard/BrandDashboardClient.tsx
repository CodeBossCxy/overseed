'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface Stats {
  totalCampaigns: number
  activeCampaigns: number
  draftCampaigns: number
  totalApplications: number
  pendingApplications: number
  completedCollaborations: number
}

interface Campaign {
  id: string
  title: string
  status: string
  _count: {
    applications: number
  }
  [key: string]: unknown
}

interface BrandProfile {
  companyName: string | null
  description: string | null
  logoUrl: string | null
}

interface BrandDashboardClientProps {
  stats: Stats
  campaigns: Campaign[]
  brandProfile: BrandProfile
  userName: string
}

export default function BrandDashboardClient({
  stats,
  campaigns,
  brandProfile,
  userName,
}: BrandDashboardClientProps) {
  const { t } = useLanguage()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t.brand.dashboard.title}</h1>
          <p className="text-gray-600 mt-1">
            {t.brand.dashboard.welcomeBack} {brandProfile.companyName || userName}!
          </p>
        </div>
        <Link
          href="/dashboard/brand/campaigns/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
        >
          {t.brand.dashboard.createCampaign}
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-primary-600">{stats.totalCampaigns}</div>
          <div className="text-sm text-gray-500">{t.brand.dashboard.totalCampaigns}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-green-600">{stats.activeCampaigns}</div>
          <div className="text-sm text-gray-500">{t.brand.dashboard.active}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-gray-600">{stats.draftCampaigns}</div>
          <div className="text-sm text-gray-500">{t.brand.dashboard.drafts}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.totalApplications}</div>
          <div className="text-sm text-gray-500">{t.brand.dashboard.applications}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</div>
          <div className="text-sm text-gray-500">{t.brand.dashboard.pendingReview}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.completedCollaborations}</div>
          <div className="text-sm text-gray-500">{t.brand.dashboard.completed}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Campaigns */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t.brand.dashboard.recentCampaigns}</h2>
            <Link href="/dashboard/brand/campaigns" className="text-primary-600 hover:underline text-sm">
              {t.brand.dashboard.viewAll}
            </Link>
          </div>
          {campaigns.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500 mb-4">{t.brand.dashboard.noCampaigns}</p>
              <Link
                href="/dashboard/brand/campaigns/new"
                className="inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
              >
                {t.brand.dashboard.createFirst}
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm divide-y">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <Link
                        href={`/dashboard/brand/campaigns/${campaign.id}/edit`}
                        className="font-medium hover:text-primary-600"
                      >
                        {campaign.title}
                      </Link>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            campaign.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : campaign.status === 'DRAFT'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {campaign.status}
                        </span>
                        <span>{campaign._count.applications} {t.common.applications}</span>
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/brand/campaigns/${campaign.id}/applications`}
                      className="text-sm text-primary-600 hover:underline"
                    >
                      {t.brand.dashboard.viewApplications}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold mb-4">{t.brand.dashboard.quickLinks}</h3>
            <nav className="space-y-2">
              <Link
                href="/dashboard/brand/campaigns/new"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition text-primary-600 font-medium"
              >
                {t.brand.dashboard.createCampaign}
              </Link>
              <Link
                href="/dashboard/brand/campaigns"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition"
              >
                {t.brand.dashboard.manageCampaigns}
              </Link>
              <Link
                href="/dashboard/brand/profile"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition"
              >
                {t.brand.dashboard.companyProfile}
              </Link>
              <Link
                href="/ai-assistant"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition"
              >
                {t.brand.dashboard.aiAssistant}
              </Link>
            </nav>
          </div>

          {/* Profile Completion */}
          {(!brandProfile.description || !brandProfile.logoUrl) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-800 mb-2">{t.brand.dashboard.completeProfile}</h3>
              <p className="text-sm text-yellow-700 mb-4">
                {t.brand.dashboard.completeProfileDesc}
              </p>
              <ul className="text-sm text-yellow-700 space-y-1">
                {!brandProfile.logoUrl && <li>{t.brand.dashboard.addLogo}</li>}
                {!brandProfile.description && <li>{t.brand.dashboard.addDescription}</li>}
              </ul>
              <Link
                href="/dashboard/brand/profile"
                className="inline-block mt-4 text-sm text-yellow-800 font-medium hover:underline"
              >
                {t.brand.dashboard.completeProfile}
              </Link>
            </div>
          )}

          {/* Pending Actions */}
          {stats.pendingApplications > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-800 mb-2">{t.brand.dashboard.pendingActions}</h3>
              <p className="text-sm text-blue-700">
                {t.brand.dashboard.pendingActionsDesc.replace('{count}', String(stats.pendingApplications))}
              </p>
              <Link
                href="/dashboard/brand/campaigns"
                className="inline-block mt-4 text-sm text-blue-800 font-medium hover:underline"
              >
                {t.brand.dashboard.reviewApplications}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
