'use client'

import Link from 'next/link'
import ApplicationCard from '@/components/applications/ApplicationCard'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface SocialAccount {
  id: string
  followerCount: number
  platform: {
    name: string
  }
}

interface InfluencerProfile {
  id: string
  displayName: string | null
  bio: string | null
  socialAccounts: SocialAccount[]
}

interface Stats {
  totalApplications: number
  pendingApplications: number
  approvedApplications: number
  completedCampaigns: number
  savedCampaigns: number
}

interface InfluencerDashboardClientProps {
  stats: Stats
  recentApplications: any[]
  influencerProfile: InfluencerProfile
  totalFollowers: number
  userName: string
}

export default function InfluencerDashboardClient({
  stats,
  recentApplications,
  influencerProfile,
  totalFollowers,
  userName,
}: InfluencerDashboardClientProps) {
  const { t } = useLanguage()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t.influencer.dashboard.title}</h1>
        <p className="text-gray-600 mt-1">
          {t.influencer.dashboard.welcomeBack} {influencerProfile.displayName || userName}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-primary-600">{stats.totalApplications}</div>
          <div className="text-sm text-gray-500">{t.influencer.dashboard.totalApplications}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</div>
          <div className="text-sm text-gray-500">{t.influencer.dashboard.pending}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-green-600">{stats.approvedApplications}</div>
          <div className="text-sm text-gray-500">{t.influencer.dashboard.approved}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.completedCampaigns}</div>
          <div className="text-sm text-gray-500">{t.influencer.dashboard.completed}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-blue-600">{totalFollowers.toLocaleString()}</div>
          <div className="text-sm text-gray-500">{t.influencer.dashboard.totalFollowers}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applications */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t.influencer.dashboard.recentApplications}</h2>
            <Link href="/dashboard/influencer/applications" className="text-primary-600 hover:underline text-sm">
              {t.influencer.dashboard.viewAll}
            </Link>
          </div>
          {recentApplications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500 mb-4">{t.influencer.dashboard.noApplications}</p>
              <Link
                href="/browse"
                className="inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
              >
                {t.influencer.dashboard.browseCampaigns}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application as any}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold mb-4">{t.influencer.dashboard.quickLinks}</h3>
            <nav className="space-y-2">
              <Link
                href="/browse"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition"
              >
                <span>{t.influencer.dashboard.browseCampaigns}</span>
              </Link>
              <Link
                href="/dashboard/influencer/applications"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition"
              >
                <span>{t.influencer.dashboard.myApplications}</span>
              </Link>
              <Link
                href="/dashboard/influencer/saved"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition"
              >
                <span>{t.influencer.dashboard.savedCampaigns} ({stats.savedCampaigns})</span>
              </Link>
              <Link
                href="/dashboard/influencer/profile"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition"
              >
                <span>{t.influencer.dashboard.editProfile}</span>
              </Link>
              <Link
                href="/dashboard/influencer/accounts"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition"
              >
                <span>{t.influencer.dashboard.manageSocialAccounts} ({influencerProfile.socialAccounts.length})</span>
              </Link>
            </nav>
          </div>

          {/* Profile Completion */}
          {(!influencerProfile.bio || influencerProfile.socialAccounts.length === 0) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-800 mb-2">{t.influencer.dashboard.completeProfile}</h3>
              <p className="text-sm text-yellow-700 mb-4">
                {t.influencer.dashboard.completeProfileDesc}
              </p>
              <ul className="text-sm text-yellow-700 space-y-1">
                {!influencerProfile.bio && (
                  <li>{t.influencer.dashboard.addBio}</li>
                )}
                {influencerProfile.socialAccounts.length === 0 && (
                  <li>{t.influencer.dashboard.linkSocialAccounts}</li>
                )}
              </ul>
              <Link
                href="/dashboard/influencer/profile"
                className="inline-block mt-4 text-sm text-yellow-800 font-medium hover:underline"
              >
                {t.influencer.dashboard.completeProfileLink}
              </Link>
            </div>
          )}

          {/* Social Accounts */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{t.influencer.dashboard.connectedPlatforms}</h3>
              <Link href="/dashboard/influencer/accounts" className="text-primary-600 hover:underline text-sm">
                {t.influencer.dashboard.manage}
              </Link>
            </div>
            {influencerProfile.socialAccounts.length === 0 ? (
              <p className="text-sm text-gray-500">{t.influencer.dashboard.noAccountsLinked}</p>
            ) : (
              <div className="space-y-2">
                {influencerProfile.socialAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{account.platform.name}</span>
                    <span className="text-gray-500">{account.followerCount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
