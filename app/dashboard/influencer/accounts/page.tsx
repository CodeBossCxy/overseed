'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/MainLayout'
import SocialAccountList from '@/components/profiles/SocialAccountList'
import SocialAccountForm from '@/components/profiles/SocialAccountForm'

interface SocialAccount {
  id: string
  platform: {
    id: number
    name: string
    slug: string
  }
  username: string
  profileUrl?: string | null
  followerCount: number
  engagementRate?: number | string | null
  isVerified: boolean
}

interface Platform {
  id: number
  name: string
  slug: string
}

export default function SocialAccountsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [accountsRes, platformsRes] = await Promise.all([
        fetch('/api/social-accounts'),
        fetch('/api/platforms'),
      ])

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json()
        setAccounts(accountsData)
      }

      if (platformsRes.ok) {
        const platformsData = await platformsRes.json()
        setPlatforms(platformsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this account?')) {
      return
    }

    try {
      const response = await fetch(`/api/social-accounts/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setAccounts((prev) => prev.filter((acc) => acc.id !== id))
      }
    } catch (error) {
      console.error('Error deleting account:', error)
    }
  }

  const handleAddSuccess = () => {
    setShowForm(false)
    fetchData()
  }

  const existingPlatformIds = accounts.map((acc) => acc.platform.id)

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading accounts...</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Social Accounts</h1>
            <p className="text-gray-600 mt-1">Manage your linked social media accounts</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
            >
              Add Account
            </button>
          )}
        </div>

        {showForm ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Link New Account</h2>
            <SocialAccountForm
              platforms={platforms}
              existingPlatformIds={existingPlatformIds}
              onSuccess={handleAddSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        ) : null}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Connected Accounts</h2>
          <SocialAccountList
            accounts={accounts as any}
            isPublicView={false}
            onDelete={handleDelete}
          />
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Why link your accounts?</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>Brands can see your reach and engagement</li>
            <li>Select which account to use for each campaign</li>
            <li>Build credibility with verified follower counts</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  )
}
