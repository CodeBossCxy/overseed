'use client'

import Link from 'next/link'
import CompensationBadge from './CompensationBadge'
import CampaignStats from './CampaignStats'

interface CampaignDetailProps {
  campaign: {
    id: string
    title: string
    description?: string | null
    compensationType: string
    paymentMin?: number | string | null
    paymentMax?: number | string | null
    giftDescription?: string | null
    giftValue?: number | string | null
    deadline?: string | null
    campaignStartDate?: string | null
    campaignEndDate?: string | null
    totalSlots: number
    filledSlots: number
    images: string[]
    isFeatured: boolean
    viewCount: number
    requiresProductPurchase: boolean
    productPurchaseAmount?: number | string | null
    isProductReimbursed: boolean
    contentType?: string | null
    contentGuidelines?: string | null
    wordCountMin?: number | null
    wordCountMax?: number | null
    hashtagsRequired?: string | null
    mentionsRequired?: string | null
    createdAt: string
    brand: {
      id: string
      userId: string
      companyName?: string | null
      logoUrl?: string | null
      websiteUrl?: string | null
      description?: string | null
      industry?: string | null
      isVerified: boolean
    }
    agency?: {
      id: string
      agencyName: string
      logoUrl?: string | null
    } | null
    categories: Array<{
      category: {
        id: number
        name: string
        slug: string
      }
    }>
    platforms: Array<{
      platform: {
        id: number
        name: string
        slug: string
      }
    }>
    followerRequirements: Array<{
      platform: { id: number; name: string }
      minFollowers: number
      maxFollowers?: number | null
      minEngagementRate?: number | string | null
    }>
    media: Array<{
      id: string
      mediaUrl: string
      mediaType: string
    }>
    _count: {
      applications: number
    }
  }
  isOwner?: boolean
  hasApplied?: boolean
  isSaved?: boolean
  isAuthenticated?: boolean
}

export default function CampaignDetail({
  campaign,
  isOwner = false,
  hasApplied = false,
  isSaved = false,
  isAuthenticated = false,
}: CampaignDetailProps) {
  const spotsLeft = campaign.totalSlots - campaign.filledSlots
  const isDeadlinePassed = campaign.deadline && new Date(campaign.deadline) < new Date()

  const getContentTypeLabel = (type: string | null | undefined) => {
    const types: Record<string, string> = {
      IMAGE_POST: 'Image Post',
      VIDEO: 'Video',
      STORY: 'Story',
      REEL: 'Reel',
      ANY: 'Any Format',
    }
    return type ? types[type] || type : 'Not specified'
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {campaign.categories.map(({ category }) => (
                    <span
                      key={category.id}
                      className="text-sm font-medium text-primary-600 bg-primary-100 px-3 py-1 rounded-full"
                    >
                      {category.name}
                    </span>
                  ))}
                  {campaign.isFeatured && (
                    <span className="text-sm font-medium text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{campaign.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span>{campaign.viewCount.toLocaleString()} views</span>
                  <span>Posted {new Date(campaign.createdAt).toLocaleDateString()}</span>
                  {campaign.deadline && (
                    <span className={isDeadlinePassed ? 'text-red-600' : 'text-orange-600'}>
                      {isDeadlinePassed ? 'Deadline passed' : `Deadline: ${new Date(campaign.deadline).toLocaleDateString()}`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          {(campaign.images.length > 0 || campaign.media.length > 0) && (
            <div className="p-6 border-b">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {campaign.images.map((image, index) => (
                  <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img src={image} alt={`Campaign image ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                {campaign.media.map((media) => (
                  <div key={media.id} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    {media.mediaType === 'video' ? (
                      <video src={media.mediaUrl} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={media.mediaUrl} alt="Campaign media" className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-4">About This Campaign</h2>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-gray-700">{campaign.description || 'No description provided.'}</p>
            </div>
          </div>

          {/* Requirements */}
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-4">Requirements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Platforms */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Platforms</h3>
                <div className="flex flex-wrap gap-2">
                  {campaign.platforms.map(({ platform }) => (
                    <span key={platform.id} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {platform.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Follower Requirements */}
              {campaign.followerRequirements.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Follower Requirements</h3>
                  <div className="space-y-1">
                    {campaign.followerRequirements.map((req, i) => (
                      <div key={i} className="text-sm">
                        <span className="font-medium">{req.platform.name}:</span>{' '}
                        {req.minFollowers.toLocaleString()}
                        {req.maxFollowers ? ` - ${req.maxFollowers.toLocaleString()}` : '+'} followers
                        {req.minEngagementRate && ` (min ${req.minEngagementRate}% engagement)`}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Type */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Content Type</h3>
                <p className="text-sm">{getContentTypeLabel(campaign.contentType)}</p>
              </div>

              {/* Slots */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Available Spots</h3>
                <p className="text-sm">
                  {spotsLeft} of {campaign.totalSlots} spots remaining
                </p>
              </div>
            </div>
          </div>

          {/* Content Guidelines */}
          {campaign.contentGuidelines && (
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold mb-4">Content Guidelines</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{campaign.contentGuidelines}</p>

              {(campaign.hashtagsRequired || campaign.mentionsRequired) && (
                <div className="mt-4 space-y-2">
                  {campaign.hashtagsRequired && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Required Hashtags: </span>
                      <span className="text-sm text-primary-600">{campaign.hashtagsRequired}</span>
                    </div>
                  )}
                  {campaign.mentionsRequired && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Required Mentions: </span>
                      <span className="text-sm text-primary-600">{campaign.mentionsRequired}</span>
                    </div>
                  )}
                </div>
              )}

              {(campaign.wordCountMin || campaign.wordCountMax) && (
                <div className="mt-2">
                  <span className="text-sm font-medium text-gray-500">Word Count: </span>
                  <span className="text-sm">
                    {campaign.wordCountMin && `Min ${campaign.wordCountMin}`}
                    {campaign.wordCountMin && campaign.wordCountMax && ' - '}
                    {campaign.wordCountMax && `Max ${campaign.wordCountMax}`}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Campaign Timeline */}
          {(campaign.campaignStartDate || campaign.campaignEndDate) && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Campaign Timeline</h2>
              <div className="flex flex-wrap gap-6">
                {campaign.campaignStartDate && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Start Date: </span>
                    <span className="text-sm">{new Date(campaign.campaignStartDate).toLocaleDateString()}</span>
                  </div>
                )}
                {campaign.campaignEndDate && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">End Date: </span>
                    <span className="text-sm">{new Date(campaign.campaignEndDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-md p-6 sticky top-20 space-y-6">
          {/* Compensation */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Compensation</h3>
            <CompensationBadge
              type={campaign.compensationType}
              paymentMin={campaign.paymentMin}
              paymentMax={campaign.paymentMax}
              giftDescription={campaign.giftDescription}
              size="lg"
            />
            {campaign.giftValue && (
              <p className="text-sm text-gray-500 mt-2">
                Gift value: ${Number(campaign.giftValue).toLocaleString()}
              </p>
            )}
            {campaign.requiresProductPurchase && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg text-sm">
                <p className="font-medium text-yellow-800">Requires Product Purchase</p>
                {campaign.productPurchaseAmount && (
                  <p className="text-yellow-700">
                    Amount: ${Number(campaign.productPurchaseAmount).toLocaleString()}
                    {campaign.isProductReimbursed && ' (Reimbursed)'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <CampaignStats
            applications={campaign._count.applications}
            spotsLeft={spotsLeft}
            totalSlots={campaign.totalSlots}
            viewCount={campaign.viewCount}
          />

          {/* Actions */}
          <div className="pt-4 border-t space-y-3">
            {isOwner ? (
              <>
                <Link
                  href={`/dashboard/brand/campaigns/${campaign.id}/applications`}
                  className="block w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-center font-medium"
                >
                  View Applications ({campaign._count.applications})
                </Link>
                <Link
                  href={`/dashboard/brand/campaigns/${campaign.id}/edit`}
                  className="block w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-center"
                >
                  Edit Campaign
                </Link>
              </>
            ) : (
              <>
                {!isDeadlinePassed && spotsLeft > 0 && (
                  hasApplied ? (
                    <button
                      disabled
                      className="w-full px-4 py-3 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed text-center font-medium"
                    >
                      Already Applied
                    </button>
                  ) : isAuthenticated ? (
                    <Link
                      href={`/campaign/${campaign.id}/apply`}
                      className="block w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-center font-medium"
                    >
                      Apply Now
                    </Link>
                  ) : (
                    <Link
                      href="/auth/signin"
                      className="block w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-center font-medium"
                    >
                      Sign In to Apply
                    </Link>
                  )
                )}
                {isDeadlinePassed && (
                  <div className="text-center text-red-600 font-medium">
                    Application deadline has passed
                  </div>
                )}
                {spotsLeft === 0 && !isDeadlinePassed && (
                  <div className="text-center text-orange-600 font-medium">
                    All spots have been filled
                  </div>
                )}
              </>
            )}
          </div>

          {/* Brand Info */}
          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">Posted by</h3>
            <Link href={`/brand/${campaign.brand.id}`} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg -mx-2">
              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                {campaign.brand.logoUrl ? (
                  <img src={campaign.brand.logoUrl} alt={campaign.brand.companyName || 'Brand'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-xl">
                    {campaign.brand.companyName?.charAt(0) || 'B'}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <p className="font-medium">{campaign.brand.companyName || 'Anonymous Brand'}</p>
                  {campaign.brand.isVerified && (
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                {campaign.brand.industry && (
                  <p className="text-sm text-gray-500">{campaign.brand.industry}</p>
                )}
              </div>
            </Link>
          </div>

          {/* Report */}
          <div className="pt-4 border-t">
            <button className="text-sm text-red-600 hover:underline">
              Report this campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
