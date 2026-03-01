'use client'

import { useState } from 'react'

interface Platform {
  id: number
  name: string
  slug: string
}

interface SocialAccountFormProps {
  platforms: Platform[]
  existingPlatformIds: number[]
  onSuccess: () => void
  onCancel: () => void
}

export default function SocialAccountForm({
  platforms,
  existingPlatformIds,
  onSuccess,
  onCancel,
}: SocialAccountFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    platformId: '',
    username: '',
    profileUrl: '',
    followerCount: '',
    engagementRate: '',
  })

  const availablePlatforms = platforms.filter(
    (p) => !existingPlatformIds.includes(p.id)
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/social-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformId: parseInt(formData.platformId),
          username: formData.username,
          profileUrl: formData.profileUrl || null,
          followerCount: formData.followerCount ? parseInt(formData.followerCount) : 0,
          engagementRate: formData.engagementRate ? parseFloat(formData.engagementRate) : null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to add social account')
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (availablePlatforms.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600">You've already linked all available platforms!</p>
        <button
          onClick={onCancel}
          className="mt-4 text-primary-600 hover:underline"
        >
          Go back
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Platform *</label>
        <select
          required
          value={formData.platformId}
          onChange={(e) => setFormData({ ...formData, platformId: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Select a platform</option>
          {availablePlatforms.map((platform) => (
            <option key={platform.id} value={platform.id}>
              {platform.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Username *</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
          <input
            type="text"
            required
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="yourusername"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Profile URL</label>
        <input
          type="url"
          value={formData.profileUrl}
          onChange={(e) => setFormData({ ...formData, profileUrl: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Follower Count</label>
          <input
            type="number"
            min="0"
            value={formData.followerCount}
            onChange={(e) => setFormData({ ...formData, followerCount: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Engagement Rate (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={formData.engagementRate}
            onChange={(e) => setFormData({ ...formData, engagementRate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="0.0"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition disabled:opacity-50"
        >
          {isSubmitting ? 'Adding...' : 'Add Account'}
        </button>
      </div>
    </form>
  )
}
