import MainLayout from '@/components/MainLayout'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import CompensationBadge from '@/components/campaigns/CompensationBadge'

export default async function BrandCampaignDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  const userId = (session.user as any).id

  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: {
      brand: true,
      categories: {
        include: {
          category: true,
        },
      },
      platforms: {
        include: {
          platform: true,
        },
      },
      followerRequirements: {
        include: {
          platform: true,
        },
      },
      _count: {
        select: {
          applications: true,
        },
      },
    },
  })

  if (!campaign) {
    notFound()
  }

  // Check if user owns this campaign
  if (campaign.brand.userId !== userId) {
    redirect('/dashboard/brand')
  }

  // Get application stats
  const applicationStats = await prisma.application.groupBy({
    by: ['status'],
    where: { campaignId: params.id },
    _count: true,
  })

  const stats = {
    total: campaign._count.applications,
    pending: applicationStats.find(s => s.status === 'PENDING')?._count || 0,
    approved: applicationStats.find(s => s.status === 'APPROVED')?._count || 0,
    rejected: applicationStats.find(s => s.status === 'REJECTED')?._count || 0,
    underReview: applicationStats.find(s => s.status === 'UNDER_REVIEW')?._count || 0,
  }

  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-800',
    PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
    ACTIVE: 'bg-green-100 text-green-800',
    PAUSED: 'bg-orange-100 text-orange-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not set'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/dashboard/brand/campaigns" className="text-gray-500 hover:text-gray-700">
                ← Back to Campaigns
              </Link>
            </div>
            <h1 className="text-3xl font-bold">{campaign.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[campaign.status]}`}>
                {campaign.status.replace('_', ' ')}
              </span>
              <CompensationBadge type={campaign.compensationType} />
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/dashboard/brand/campaigns/${campaign.id}/edit`}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
            >
              Edit
            </Link>
            <Link
              href={`/dashboard/brand/campaigns/${campaign.id}/applications`}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
            >
              View Applications ({stats.total})
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold">{campaign.viewCount}</div>
            <div className="text-sm text-gray-500">Views</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-500">Applications</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-500">Approved</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold">{campaign.filledSlots}/{campaign.totalSlots}</div>
            <div className="text-sm text-gray-500">Slots Filled</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Description</h2>
              {campaign.description ? (
                <div className="prose max-w-none whitespace-pre-wrap text-gray-700">
                  {campaign.description}
                </div>
              ) : (
                <p className="text-gray-500 italic">No description provided</p>
              )}
            </div>

            {/* Content Guidelines */}
            {campaign.contentGuidelines && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Content Guidelines</h2>
                <div className="prose max-w-none whitespace-pre-wrap text-gray-700">
                  {campaign.contentGuidelines}
                </div>
              </div>
            )}

            {/* Requirements */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Requirements</h2>

              {campaign.followerRequirements.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Follower Requirements</h3>
                  <div className="space-y-2">
                    {campaign.followerRequirements.map((req) => (
                      <div key={req.id} className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{req.platform.name}:</span>
                        <span>
                          {req.minFollowers.toLocaleString()}
                          {req.maxFollowers ? ` - ${req.maxFollowers.toLocaleString()}` : '+'} followers
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {campaign.hashtagsRequired && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Required Hashtags</h3>
                  <p className="text-sm">{campaign.hashtagsRequired}</p>
                </div>
              )}

              {campaign.mentionsRequired && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Required Mentions</h3>
                  <p className="text-sm">{campaign.mentionsRequired}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Campaign Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Campaign Details</h2>

              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">Compensation</span>
                  <div className="font-medium">
                    {campaign.compensationType === 'PAID' && campaign.paymentMin && (
                      <span>${Number(campaign.paymentMin).toLocaleString()} - ${Number(campaign.paymentMax || campaign.paymentMin).toLocaleString()}</span>
                    )}
                    {campaign.compensationType === 'GIFTED' && campaign.giftDescription && (
                      <span>{campaign.giftDescription}</span>
                    )}
                    {campaign.compensationType === 'PAID_PLUS_GIFT' && (
                      <div>
                        {campaign.paymentMin && <div>${Number(campaign.paymentMin).toLocaleString()} - ${Number(campaign.paymentMax || campaign.paymentMin).toLocaleString()}</div>}
                        {campaign.giftDescription && <div className="text-sm text-gray-600">+ {campaign.giftDescription}</div>}
                      </div>
                    )}
                    {campaign.compensationType === 'AFFILIATE' && <span>Commission-based</span>}
                    {campaign.compensationType === 'NEGOTIABLE' && <span>Negotiable</span>}
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Content Type</span>
                  <div className="font-medium">{campaign.contentType || 'Any'}</div>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Application Deadline</span>
                  <div className="font-medium">{formatDate(campaign.deadline)}</div>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Campaign Period</span>
                  <div className="font-medium">
                    {campaign.campaignStartDate || campaign.campaignEndDate ? (
                      <>
                        {formatDate(campaign.campaignStartDate)} - {formatDate(campaign.campaignEndDate)}
                      </>
                    ) : (
                      'Not set'
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Created</span>
                  <div className="font-medium">{formatDate(campaign.createdAt)}</div>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Categories</h2>
              <div className="flex flex-wrap gap-2">
                {campaign.categories.map((c) => (
                  <span key={c.categoryId} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {c.category.name}
                  </span>
                ))}
                {campaign.categories.length === 0 && (
                  <span className="text-gray-500 text-sm">No categories selected</span>
                )}
              </div>
            </div>

            {/* Platforms */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Target Platforms</h2>
              <div className="flex flex-wrap gap-2">
                {campaign.platforms.map((p) => (
                  <span key={p.platformId} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    {p.platform.name}
                  </span>
                ))}
                {campaign.platforms.length === 0 && (
                  <span className="text-gray-500 text-sm">No platforms selected</span>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Actions</h2>
              <div className="space-y-2">
                {campaign.status === 'DRAFT' && (
                  <Link
                    href={`/dashboard/brand/campaigns/${campaign.id}/edit`}
                    className="block w-full px-4 py-2 text-center bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
                  >
                    Continue Editing
                  </Link>
                )}
                <Link
                  href={`/campaign/${campaign.id}`}
                  className="block w-full px-4 py-2 text-center border border-gray-300 rounded-md hover:bg-gray-50 transition"
                >
                  View Public Page
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
