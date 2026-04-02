'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import ApplicationStatus from '@/components/applications/ApplicationStatus'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { formatDate } from '@/lib/i18n/formatDate'

interface ApplicationDetail {
  id: string
  status: string
  pitchMessage?: string | null
  proposedRate?: number | string | null
  brandNotes?: string | null
  rejectionReason?: string | null
  appliedAt: string
  reviewedAt?: string | null
  approvedAt?: string | null
  completedAt?: string | null
  campaign: {
    id: string
    title: string
    description?: string | null
    compensationType: string
    paymentMin?: number | string | null
    paymentMax?: number | string | null
    contentType?: string | null
    deadline?: string | null
    campaignStartDate?: string | null
    campaignEndDate?: string | null
    brand: {
      id: string
      companyName?: string | null
      logoUrl?: string | null
      isVerified: boolean
    }
    categories?: Array<{ category: { name: string } }>
    platforms?: Array<{ platform: { name: string } }>
  }
  socialAccount?: {
    platform: { name: string }
    username: string
    followerCount: number
  } | null
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const applicationId = params.id as string
  const { t, locale } = useLanguage()

  const [application, setApplication] = useState<ApplicationDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await fetch(`/api/applications/${applicationId}`)
        if (res.ok) {
          const data = await res.json()
          setApplication(data)
        } else if (res.status === 404) {
          setError('Application not found')
        } else {
          setError('Failed to load application')
        }
      } catch {
        setError('Failed to load application')
      } finally {
        setIsLoading(false)
      }
    }
    fetchApplication()
  }, [applicationId])

  const handleMessage = async () => {
    try {
      const res = await fetch('/api/messages/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId }),
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/dashboard/messages?conv=${data.conversationId}`)
      }
    } catch (error) {
      console.error('Error starting conversation:', error)
    }
  }

  const handleWithdraw = async () => {
    if (!confirm('Are you sure you want to withdraw this application?')) return
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setApplication((prev) => prev ? { ...prev, status: 'WITHDRAWN' } : null)
      }
    } catch (error) {
      console.error('Error withdrawing:', error)
    }
  }

  const formatCompensation = (app: ApplicationDetail) => {
    const type = app.campaign.compensationType
    const min = app.campaign.paymentMin ? Number(app.campaign.paymentMin) : null
    const max = app.campaign.paymentMax ? Number(app.campaign.paymentMax) : null

    if (type === 'PAID' || type === 'PAID_PLUS_GIFT') {
      if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
      if (max) return `Up to $${max.toLocaleString()}`
      if (min) return `From $${min.toLocaleString()}`
    }

    const labels: Record<string, string> = {
      PAID: 'Paid',
      GIFTED: 'Gifted',
      PAID_PLUS_GIFT: 'Paid + Gift',
      AFFILIATE: 'Affiliate',
      NEGOTIABLE: 'Negotiable',
    }
    return labels[type] || type
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-500">{t.common.loading}</p>
        </div>
      </MainLayout>
    )
  }

  if (error || !application) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500 text-lg">{error || 'Application not found'}</p>
          <Link
            href="/dashboard/influencer/applications"
            className="inline-block mt-4 text-primary-600 hover:underline"
          >
            ← Back to My Applications
          </Link>
        </div>
      </MainLayout>
    )
  }

  const canWithdraw = ['PENDING', 'UNDER_REVIEW'].includes(application.status)
  const canMessage = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'COMPLETED'].includes(application.status)

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          href="/dashboard/influencer/applications"
          className="text-primary-600 hover:underline text-sm mb-6 inline-block"
        >
          ← Back to My Applications
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start gap-4">
            {/* Brand logo */}
            <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
              {application.campaign.brand.logoUrl ? (
                <img
                  src={application.campaign.brand.logoUrl}
                  alt={application.campaign.brand.companyName || 'Brand'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
                  {application.campaign.brand.companyName?.charAt(0) || 'B'}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    href={`/campaign/${application.campaign.id}`}
                    className="text-xl font-bold text-gray-900 hover:text-primary-600"
                  >
                    {application.campaign.title}
                  </Link>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <span>{application.campaign.brand.companyName || 'Anonymous Brand'}</span>
                    {application.campaign.brand.isVerified && (
                      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <ApplicationStatus status={application.status} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Your Application */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Your Application</h2>

            {/* Applied date */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Applied</p>
              <p className="text-sm text-gray-800">
                {formatDate(application.appliedAt, locale)}
              </p>
            </div>

            {/* Social account used */}
            {application.socialAccount && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Account Used</p>
                <p className="text-sm text-gray-800">
                  {application.socialAccount.platform.name} — @{application.socialAccount.username}
                  <span className="text-gray-500 ml-1">
                    ({application.socialAccount.followerCount.toLocaleString()} followers)
                  </span>
                </p>
              </div>
            )}

            {/* Proposed rate */}
            {application.proposedRate && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Your Proposed Rate</p>
                <p className="text-lg font-semibold text-primary-600">
                  ${Number(application.proposedRate).toLocaleString()}
                </p>
              </div>
            )}

            {/* Pitch message */}
            {application.pitchMessage && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Your Pitch</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                  {application.pitchMessage}
                </p>
              </div>
            )}

            {/* Reviewed date */}
            {application.reviewedAt && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Reviewed</p>
                <p className="text-sm text-gray-800">
                  {formatDate(application.reviewedAt, locale)}
                </p>
              </div>
            )}

            {/* Rejection reason */}
            {application.rejectionReason && (
              <div className="mb-4 p-3 bg-red-50 rounded-lg">
                <p className="text-xs text-red-600 uppercase tracking-wide mb-1">Rejection Reason</p>
                <p className="text-sm text-red-700">{application.rejectionReason}</p>
              </div>
            )}

            {/* Brand notes */}
            {application.brandNotes && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">Brand Notes</p>
                <p className="text-sm text-blue-700">{application.brandNotes}</p>
              </div>
            )}
          </div>

          {/* Campaign Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Campaign Details</h2>

            {/* Compensation */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Compensation</p>
              <p className="text-sm font-medium text-gray-800">{formatCompensation(application)}</p>
            </div>

            {/* Content type */}
            {application.campaign.contentType && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Content Type</p>
                <p className="text-sm text-gray-800">
                  {application.campaign.contentType.replace('_', ' ')}
                </p>
              </div>
            )}

            {/* Platforms */}
            {application.campaign.platforms && application.campaign.platforms.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Platforms</p>
                <div className="flex flex-wrap gap-1.5">
                  {application.campaign.platforms.map((p, i) => (
                    <span
                      key={i}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {p.platform.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {application.campaign.categories && application.campaign.categories.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Categories</p>
                <div className="flex flex-wrap gap-1.5">
                  {application.campaign.categories.map((c, i) => (
                    <span
                      key={i}
                      className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded"
                    >
                      {t.categoryNames[c.category.name] || c.category.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Deadline */}
            {application.campaign.deadline && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Application Deadline</p>
                <p className="text-sm text-gray-800">
                  {formatDate(application.campaign.deadline, locale)}
                </p>
              </div>
            )}

            {/* Campaign period */}
            {(application.campaign.campaignStartDate || application.campaign.campaignEndDate) && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Campaign Period</p>
                <p className="text-sm text-gray-800">
                  {application.campaign.campaignStartDate &&
                    formatDate(application.campaign.campaignStartDate, locale)}
                  {application.campaign.campaignStartDate && application.campaign.campaignEndDate && ' — '}
                  {application.campaign.campaignEndDate &&
                    formatDate(application.campaign.campaignEndDate, locale)}
                </p>
              </div>
            )}

            <Link
              href={`/campaign/${application.campaign.id}`}
              className="text-sm text-primary-600 hover:underline"
            >
              View Full Campaign →
            </Link>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6 flex items-center gap-4">
          {canMessage && (
            <button
              onClick={handleMessage}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Message Brand
            </button>
          )}
          {canWithdraw && (
            <button
              onClick={handleWithdraw}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm"
            >
              Withdraw Application
            </button>
          )}
          <Link
            href={`/campaign/${application.campaign.id}`}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            View Campaign
          </Link>
        </div>
      </div>
    </MainLayout>
  )
}
