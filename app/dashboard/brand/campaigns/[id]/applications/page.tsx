'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import ApplicationStatus from '@/components/applications/ApplicationStatus'
import ApplicationActions from '@/components/applications/ApplicationActions'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface Application {
  id: string
  status: string
  pitchMessage?: string | null
  proposedRate?: number | string | null
  brandNotes?: string | null
  rejectionReason?: string | null
  appliedAt: string
  reviewedAt?: string | null
  influencer: {
    id: string
    displayName?: string | null
    avatarUrl?: string | null
    bio?: string | null
    primaryNiche?: string | null
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
    }
    socialAccounts: Array<{
      platform: { name: string }
      username: string
      followerCount: number
    }>
  }
  socialAccount?: {
    platform: { name: string }
    username: string
    followerCount: number
  } | null
}

export default function CampaignApplicationsPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string
  const { t } = useLanguage()

  const [campaign, setCampaign] = useState<any>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)

  useEffect(() => {
    fetchData()
  }, [campaignId, filter])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Fetch campaign details
      const campaignRes = await fetch(`/api/campaigns/${campaignId}`)
      if (campaignRes.ok) {
        const campaignData = await campaignRes.json()
        setCampaign(campaignData)
      }

      // Fetch applications
      const url = filter
        ? `/api/campaigns/${campaignId}/applications?status=${filter}`
        : `/api/campaigns/${campaignId}/applications`
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = (applicationId: string, newStatus: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      )
    )
    if (selectedApplication?.id === applicationId) {
      setSelectedApplication((prev) => prev ? { ...prev, status: newStatus } : null)
    }
  }

  const statusFilters = [
    { value: '', label: t.brand.applications.all },
    { value: 'PENDING', label: t.brand.applications.pending },
    { value: 'UNDER_REVIEW', label: t.brand.applications.underReview },
    { value: 'APPROVED', label: t.brand.applications.approved },
    { value: 'REJECTED', label: t.brand.applications.rejected },
    { value: 'COMPLETED', label: t.brand.applications.completed },
  ]

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-500">{t.brand.applications.loading}</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/brand/campaigns" className="text-primary-600 hover:underline text-sm mb-2 inline-block">
            {t.brand.applications.backToCampaigns}
          </Link>
          <h1 className="text-3xl font-bold">{t.brand.applications.title}</h1>
          {campaign && (
            <p className="text-gray-600 mt-1">
              {t.brand.applications.forCampaign} {campaign.title} ({applications.length} {t.brand.applications.applicationsCount})
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === f.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications List */}
          <div className="lg:col-span-1">
            {applications.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500">
                  {filter ? `No ${filter.toLowerCase().replace('_', ' ')} applications` : t.brand.applications.noApplications}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm divide-y max-h-[70vh] overflow-y-auto">
                {applications.map((application) => (
                  <div
                    key={application.id}
                    onClick={() => setSelectedApplication(application)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                      selectedApplication?.id === application.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        {application.influencer.avatarUrl || application.influencer.user.image ? (
                          <img
                            src={application.influencer.avatarUrl || application.influencer.user.image!}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            {(application.influencer.displayName || application.influencer.user.name || 'U').charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {application.influencer.displayName || application.influencer.user.name || 'Unknown'}
                        </p>
                        <div className="flex items-center gap-2">
                          <ApplicationStatus status={application.status} size="sm" />
                          {application.socialAccount && (
                            <span className="text-xs text-gray-500">
                              {application.socialAccount.followerCount.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Application Details */}
          <div className="lg:col-span-2">
            {selectedApplication ? (
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
                {/* Influencer Info */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    {selectedApplication.influencer.avatarUrl || selectedApplication.influencer.user.image ? (
                      <img
                        src={selectedApplication.influencer.avatarUrl || selectedApplication.influencer.user.image!}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                        {(selectedApplication.influencer.displayName || selectedApplication.influencer.user.name || 'U').charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {selectedApplication.influencer.displayName || selectedApplication.influencer.user.name || 'Unknown'}
                    </h2>
                    {selectedApplication.influencer.primaryNiche && (
                      <span className="inline-block mt-1 text-sm text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                        {selectedApplication.influencer.primaryNiche}
                      </span>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <ApplicationStatus status={selectedApplication.status} />
                    </div>
                  </div>
                </div>

                {/* Social Accounts */}
                {selectedApplication.influencer.socialAccounts.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">{t.brand.applications.socialPlatforms}</h3>
                    <div className="space-y-2">
                      {selectedApplication.influencer.socialAccounts.map((account, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span>
                            {account.platform.name} (@{account.username})
                          </span>
                          <span className="font-medium">{account.followerCount.toLocaleString()} {t.brand.applications.followers}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Account for Campaign */}
                {selectedApplication.socialAccount && (
                  <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-800 mb-1">{t.brand.applications.accountForCampaign}</h3>
                    <p className="text-sm text-blue-700">
                      {selectedApplication.socialAccount.platform.name} - @{selectedApplication.socialAccount.username}
                      ({selectedApplication.socialAccount.followerCount.toLocaleString()} followers)
                    </p>
                  </div>
                )}

                {/* Pitch Message */}
                {selectedApplication.pitchMessage && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">{t.brand.applications.pitchMessage}</h3>
                    <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {selectedApplication.pitchMessage}
                    </p>
                  </div>
                )}

                {/* Proposed Rate */}
                {selectedApplication.proposedRate && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">{t.brand.applications.proposedRate}</h3>
                    <p className="text-lg font-semibold text-primary-600">
                      ${Number(selectedApplication.proposedRate).toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Applied Date */}
                <div className="mb-6 text-sm text-gray-500">
                  {t.brand.applications.appliedOn} {new Date(selectedApplication.appliedAt).toLocaleDateString()}
                  {selectedApplication.reviewedAt && (
                    <span> &bull; {t.brand.applications.reviewedOn} {new Date(selectedApplication.reviewedAt).toLocaleDateString()}</span>
                  )}
                </div>

                {/* View Profile Link */}
                <div className="flex items-center gap-4 mb-6">
                  <Link
                    href={`/influencer/${selectedApplication.influencer.id}`}
                    className="text-primary-600 hover:underline text-sm"
                    target="_blank"
                  >
                    {t.brand.applications.viewFullProfile} →
                  </Link>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/messages/start', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ applicationId: selectedApplication.id }),
                        })
                        if (res.ok) {
                          const data = await res.json()
                          router.push(`/dashboard/messages?conv=${data.conversationId}`)
                        }
                      } catch (error) {
                        console.error('Error starting conversation:', error)
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {t.messages?.messageButton || 'Message'}
                  </button>
                </div>

                {/* Actions */}
                <div className="pt-6 border-t">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">{t.brand.applications.actions}</h3>
                  <ApplicationActions
                    applicationId={selectedApplication.id}
                    currentStatus={selectedApplication.status}
                    onStatusChange={(newStatus) => handleStatusChange(selectedApplication.id, newStatus)}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-500">{t.brand.applications.selectApplication}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
