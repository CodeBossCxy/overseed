'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/MainLayout'
import ApplicationCard from '@/components/applications/ApplicationCard'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function InfluencerApplicationsPage() {
  const { t } = useLanguage()
  const [applications, setApplications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')

  useEffect(() => {
    fetchApplications()
  }, [filter])

  const fetchApplications = async () => {
    setIsLoading(true)
    try {
      const url = filter
        ? `/api/applications?status=${filter}`
        : '/api/applications'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWithdraw = async (applicationId: string) => {
    if (!confirm('Are you sure you want to withdraw this application?')) {
      return
    }

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId ? { ...app, status: 'WITHDRAWN' } : app
          )
        )
      }
    } catch (error) {
      console.error('Error withdrawing application:', error)
    }
  }

  const statusFilters = [
    { value: '', label: t.influencer.applications.all },
    { value: 'PENDING', label: t.influencer.applications.pending },
    { value: 'UNDER_REVIEW', label: t.influencer.applications.underReview },
    { value: 'APPROVED', label: t.influencer.applications.approved },
    { value: 'REJECTED', label: t.influencer.applications.rejected },
    { value: 'COMPLETED', label: t.influencer.applications.completed },
  ]

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t.influencer.applications.title}</h1>
            <p className="text-gray-600 mt-1">{t.influencer.applications.subtitle}</p>
          </div>
          <Link
            href="/browse"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
          >
            {t.influencer.applications.browseCampaigns}
          </Link>
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

        {/* Applications List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-500">{t.influencer.applications.loading}</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">
              {filter ? `No ${filter.toLowerCase().replace('_', ' ')} applications` : t.influencer.applications.noApplications}
            </p>
            <Link
              href="/browse"
              className="inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
            >
              {t.influencer.applications.findCampaigns}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                showActions={true}
                onWithdraw={() => handleWithdraw(application.id)}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
