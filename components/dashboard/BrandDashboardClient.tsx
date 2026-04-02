'use client'

import { useState, useEffect } from 'react'
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
  brandVerificationStatus?: string | null
  rejectionReason?: string | null
}

interface PlanUsageItem {
  key: string
  used: number | null
  limit: number | null
  enabled?: boolean
}

interface BrandDashboardClientProps {
  stats: Stats
  campaigns: Campaign[]
  brandProfile: BrandProfile
  userName: string
  subscriptionTier: string
}

export default function BrandDashboardClient({
  stats,
  campaigns,
  brandProfile,
  userName,
  subscriptionTier,
}: BrandDashboardClientProps) {
  const { t } = useLanguage()
  const [planUsage, setPlanUsage] = useState<PlanUsageItem[] | null>(null)

  useEffect(() => {
    fetch('/api/plan/usage')
      .then((res) => res.json())
      .then((data) => setPlanUsage(data.items))
      .catch(() => {})
  }, [])

  const isApproved = brandProfile.brandVerificationStatus === 'APPROVED'
  const isPending = brandProfile.brandVerificationStatus === 'PENDING'
  const isRejected = brandProfile.brandVerificationStatus === 'REJECTED'

  const planLabels: Record<string, string> = {
    translation: t.brand.dashboard.plan.translation,
    campaignsPerDay: t.brand.dashboard.plan.campaignsPerDay,
    activeCampaigns: t.brand.dashboard.plan.activeCampaigns,
    conversationsPerDay: t.brand.dashboard.plan.conversationsPerDay,
    teamSeats: t.brand.dashboard.plan.teamSeats,
    aiChat: t.brand.dashboard.plan.aiChat,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Verification Status Banners */}
      {isPending && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-amber-800">Verification Under Review</h3>
            <p className="text-sm text-amber-700 mt-0.5">Your brand verification is being reviewed by our team. You can browse the platform, but creating campaigns and messaging creators will be available once approved.</p>
          </div>
        </div>
      )}
      {isRejected && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 className="font-semibold text-red-800">Verification Not Approved</h3>
            {brandProfile.rejectionReason && (
              <p className="text-sm text-red-700 mt-0.5"><strong>Reason:</strong> {brandProfile.rejectionReason}</p>
            )}
            <p className="text-sm text-red-700 mt-1">Please update your business information from your <Link href="/dashboard/brand/profile" className="underline font-medium">profile page</Link> and contact support for re-review.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t.brand.dashboard.welcomeBack} {brandProfile.companyName || userName}!</h1>
          <p className="text-gray-500 mt-1 text-sm">{t.brand.dashboard.title}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:justify-end">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
            subscriptionTier === 'PRO'
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {subscriptionTier === 'PRO' ? t.brand.dashboard.plan.pro : t.brand.dashboard.plan.free}
          </span>
          {isApproved ? (
            <Link
              href="/dashboard/brand/campaigns/new"
              className="px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition text-sm font-medium inline-flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t.brand.dashboard.createCampaign}
            </Link>
          ) : (
            <span className="px-4 py-2.5 bg-gray-200 text-gray-500 rounded-xl cursor-not-allowed text-sm">
              {isPending ? 'Verification Pending' : 'Verification Required'}
            </span>
          )}
        </div>
      </div>

      {/* Stats — grouped: campaigns vs pipeline */}
      <section className="mb-8 rounded-2xl border border-gray-100 bg-white shadow-sm p-4 sm:p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-4">{t.brand.dashboard.overview}</h2>
        <div className="grid gap-4 sm:gap-5">
          <div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2.5">{t.brand.dashboard.statGroupCampaigns}</p>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[
                { value: stats.totalCampaigns, label: t.brand.dashboard.totalCampaigns, color: 'text-primary-600', bg: 'bg-primary-50', ring: 'ring-primary-100/80' },
                { value: stats.activeCampaigns, label: t.brand.dashboard.active, color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100/80' },
                { value: stats.draftCampaigns, label: t.brand.dashboard.drafts, color: 'text-gray-700', bg: 'bg-gray-50', ring: 'ring-gray-100' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`${stat.bg} ring-1 ${stat.ring} rounded-xl p-4 text-center`}
                >
                  <div className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-gray-600 mt-1 leading-snug">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2.5">{t.brand.dashboard.statGroupCreators}</p>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[
                { value: stats.totalApplications, label: t.brand.dashboard.applications, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-100/80' },
                { value: stats.pendingApplications, label: t.brand.dashboard.pendingReview, color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-100/80' },
                { value: stats.completedCollaborations, label: t.brand.dashboard.completed, color: 'text-purple-600', bg: 'bg-purple-50', ring: 'ring-purple-100/80' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`${stat.bg} ring-1 ${stat.ring} rounded-xl p-4 text-center`}
                >
                  <div className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-gray-600 mt-1 leading-snug">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Profile Completion + Pending Actions alerts */}
      {((!brandProfile.description || !brandProfile.logoUrl) || stats.pendingApplications > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {(!brandProfile.description || !brandProfile.logoUrl) && (
            <Link href="/dashboard/brand/profile" className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl hover:bg-yellow-100/70 transition group">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-yellow-800">{t.brand.dashboard.completeProfile}</p>
                <p className="text-xs text-yellow-700 mt-0.5">{t.brand.dashboard.completeProfileDesc}</p>
              </div>
              <svg className="w-4 h-4 text-yellow-400 group-hover:text-yellow-600 transition flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
          {stats.pendingApplications > 0 && (
            <Link href="/dashboard/brand/campaigns" className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100/70 transition group">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-blue-800">{t.brand.dashboard.pendingActions}</p>
                <p className="text-xs text-blue-700 mt-0.5">{t.brand.dashboard.pendingActionsDesc.replace('{count}', String(stats.pendingApplications))}</p>
              </div>
              <svg className="w-4 h-4 text-blue-400 group-hover:text-blue-600 transition flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      )}

      {/* Main: campaigns (primary) + sidebar (shortcuts + plan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Recent Campaigns */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/40">
              <h2 className="font-semibold text-gray-900">{t.brand.dashboard.recentCampaigns}</h2>
              <Link href="/dashboard/brand/campaigns" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                {t.brand.dashboard.viewAll}
              </Link>
            </div>
            {campaigns.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm mb-4">{t.brand.dashboard.noCampaigns}</p>
                <Link
                  href="/dashboard/brand/campaigns/new"
                  className="inline-block px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
                >
                  {t.brand.dashboard.createFirst}
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="px-5 py-3.5 hover:bg-gray-50/50 transition">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <Link
                          href={`/dashboard/brand/campaigns/${campaign.id}/edit`}
                          className="font-medium text-sm hover:text-primary-600 transition"
                        >
                          {campaign.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              campaign.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-700'
                                : campaign.status === 'DRAFT'
                                  ? 'bg-gray-100 text-gray-600'
                                  : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {campaign.status}
                          </span>
                          <span className="text-xs text-gray-400">{campaign._count.applications} {t.common.applications}</span>
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/brand/campaigns/${campaign.id}/applications`}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium flex-shrink-0 ml-4"
                      >
                        {t.brand.dashboard.viewApplications}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-8 lg:self-start">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/40">
              <h2 className="text-sm font-semibold text-gray-900">{t.brand.dashboard.shortcuts}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{t.brand.dashboard.shortcutsHint}</p>
            </div>
            <nav className="p-2">
              {[
                { href: '/dashboard/brand/campaigns/new', label: t.brand.dashboard.createCampaign, icon: 'M12 4v16m8-8H4', primary: true },
                { href: '/dashboard/brand/campaigns', label: t.brand.dashboard.manageCampaigns, icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
                { href: '/dashboard/brand/profile', label: t.brand.dashboard.companyProfile, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                { href: '/dashboard/messages', label: t.messages?.title || 'Messages', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
                { href: '/ai-assistant', label: t.brand.dashboard.aiAssistant, icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    link.primary
                      ? 'bg-primary-50 text-primary-800 hover:bg-primary-100/90 mb-1'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                    link.primary ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
                    </svg>
                  </span>
                  <span className="min-w-0 flex-1 leading-snug">{link.label}</span>
                  <svg className="h-4 w-4 flex-shrink-0 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </nav>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/40 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">{t.brand.dashboard.plan.title}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                subscriptionTier === 'PRO'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}>
                {subscriptionTier === 'PRO' ? t.brand.dashboard.plan.pro : t.brand.dashboard.plan.free}
              </span>
            </div>
            {planUsage ? (
              <div className="p-5 space-y-4">
                {planUsage.map((item) => {
                  const label = planLabels[item.key] || item.key

                  // Unlimited items (translation)
                  if (item.limit === null && item.key !== 'aiChat') {
                    return (
                      <div key={item.key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{label}</span>
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">{t.brand.dashboard.plan.unlimited}</span>
                      </div>
                    )
                  }

                  // AI Chat
                  if (item.key === 'aiChat') {
                    if (!item.enabled) {
                      return (
                        <div key={item.key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{label}</span>
                          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{t.brand.dashboard.plan.notAvailable}</span>
                        </div>
                      )
                    }
                    const used = item.used || 0
                    const limit = item.limit || 1
                    const pct = Math.min(Math.round((used / limit) * 100), 100)
                    return (
                      <div key={item.key}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-gray-600">{label}</span>
                          <span className="text-xs text-gray-500 font-medium">{pct}% {t.brand.dashboard.plan.used}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-400' : 'bg-primary-500'
                            }`}
                            style={{ width: `${Math.max(pct, 2)}%` }}
                          />
                        </div>
                      </div>
                    )
                  }

                  // Counted items — mini progress bar style
                  const used = item.used || 0
                  const limit = item.limit || 0
                  const remaining = Math.max(limit - used, 0)
                  const pct = limit > 0 ? Math.round((used / limit) * 100) : 0

                  return (
                    <div key={item.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-gray-600">{label}</span>
                        <span className="text-xs text-gray-500">
                          <span className={`font-semibold ${remaining === 0 ? 'text-red-500' : 'text-gray-800'}`}>{remaining}</span>
                          <span className="text-gray-400"> {t.brand.dashboard.plan.of} {limit} {t.brand.dashboard.plan.remaining}</span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct >= 90 ? 'bg-red-400' : pct >= 70 ? 'bg-amber-400' : 'bg-primary-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-5 w-5 border-2 border-primary-600 border-t-transparent rounded-full" />
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
