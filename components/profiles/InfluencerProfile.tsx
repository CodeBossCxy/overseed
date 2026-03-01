'use client'

import SocialAccountList from './SocialAccountList'

interface InfluencerProfileProps {
  influencer: {
    id: string
    displayName?: string | null
    avatarUrl?: string | null
    bio?: string | null
    primaryNiche?: string | null
    secondaryNiches: string[]
    languages: string[]
    locationCity?: string | null
    locationState?: string | null
    locationCountry?: string | null
    isVerified: boolean
    createdAt: string
    user: {
      name?: string | null
      image?: string | null
      createdAt: string
    }
    socialAccounts: Array<{
      id: string
      platform: {
        name: string
        slug: string
      }
      username: string
      profileUrl?: string | null
      followerCount: number
      engagementRate?: number | string | null
      isVerified: boolean
    }>
    completedCampaigns?: number
  }
}

export default function InfluencerProfile({ influencer }: InfluencerProfileProps) {
  const displayName = influencer.displayName || influencer.user.name || 'Unknown'
  const avatar = influencer.avatarUrl || influencer.user.image

  const location = [influencer.locationCity, influencer.locationState, influencer.locationCountry]
    .filter(Boolean)
    .join(', ')

  const allNiches = [influencer.primaryNiche, ...influencer.secondaryNiches].filter(Boolean)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Cover/Banner */}
        <div className="h-32 bg-gradient-to-r from-primary-400 to-primary-600" />

        {/* Profile Info */}
        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="relative -mt-16 mb-4">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg">
              {avatar ? (
                <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                  {displayName.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Name and Verification */}
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold">{displayName}</h1>
            {influencer.isVerified && (
              <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          {/* Location and Member Since */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
            {location && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {location}
              </span>
            )}
            <span>
              Member since {new Date(influencer.user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          </div>

          {/* Niches */}
          {allNiches.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {allNiches.map((niche, i) => (
                <span
                  key={i}
                  className={`px-3 py-1 rounded-full text-sm ${
                    i === 0 ? 'bg-primary-100 text-primary-700 font-medium' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {niche}
                </span>
              ))}
            </div>
          )}

          {/* Languages */}
          {influencer.languages.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <span className="font-medium">Languages:</span>
              <span>{influencer.languages.join(', ')}</span>
            </div>
          )}

          {/* Bio */}
          {influencer.bio && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">About</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{influencer.bio}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {influencer.socialAccounts.reduce((sum, acc) => sum + acc.followerCount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {influencer.socialAccounts.length}
              </div>
              <div className="text-sm text-gray-500">Platforms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {influencer.completedCampaigns || 0}
              </div>
              <div className="text-sm text-gray-500">Campaigns</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {influencer.isVerified ? 'Yes' : 'No'}
              </div>
              <div className="text-sm text-gray-500">Verified</div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Accounts */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Connected Platforms</h2>
        <SocialAccountList accounts={influencer.socialAccounts} isPublicView />
      </div>
    </div>
  )
}
