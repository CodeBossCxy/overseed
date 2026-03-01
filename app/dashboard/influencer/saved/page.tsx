import MainLayout from '@/components/MainLayout'
import CampaignCard from '@/components/campaigns/CampaignCard'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function SavedCampaignsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  const userId = (session.user as any).id

  const influencerProfile = await prisma.influencerProfile.findUnique({
    where: { userId },
  })

  if (!influencerProfile) {
    redirect('/dashboard/influencer')
  }

  const savedCampaigns = await prisma.savedCampaign.findMany({
    where: { influencerId: influencerProfile.id },
    include: {
      campaign: {
        include: {
          brand: {
            select: {
              id: true,
              companyName: true,
              logoUrl: true,
              isVerified: true,
            },
          },
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
      },
    },
    orderBy: { savedAt: 'desc' },
  })

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Saved Campaigns</h1>
            <p className="text-gray-600 mt-1">Campaigns you've bookmarked for later</p>
          </div>
          <Link
            href="/browse"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
          >
            Browse More
          </Link>
        </div>

        {/* Campaigns List */}
        {savedCampaigns.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">No saved campaigns yet</p>
            <p className="text-gray-400 mb-6">
              Save campaigns you're interested in to review them later
            </p>
            <Link
              href="/browse"
              className="inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
            >
              Browse Campaigns
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {savedCampaigns.map(({ campaign }) => (
              <CampaignCard key={campaign.id} campaign={campaign as any} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
