import MainLayout from '@/components/MainLayout'
import CampaignDetailWrapper from '@/components/campaigns/CampaignDetailWrapper'
import CampaignCard from '@/components/campaigns/CampaignCard'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      brand: {
        select: {
          id: true,
          userId: true,
          companyName: true,
          logoUrl: true,
          websiteUrl: true,
          description: true,
          industry: true,
          isVerified: true,
        },
      },
      agency: {
        select: {
          id: true,
          agencyName: true,
          logoUrl: true,
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
      media: {
        orderBy: {
          displayOrder: 'asc',
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

  // Check ownership and application status
  let isOwner = false
  let hasApplied = false
  let isSaved = false

  if (session?.user) {
    const userId = (session.user as any).id

    // Check if owner
    isOwner = campaign.brand.userId === userId

    // Check if already applied
    const influencerProfile = await prisma.influencerProfile.findUnique({
      where: { userId },
    })

    if (influencerProfile) {
      const application = await prisma.application.findUnique({
        where: {
          campaignId_influencerId: {
            campaignId: id,
            influencerId: influencerProfile.id,
          },
        },
      })
      hasApplied = !!application

      // Check if saved
      const saved = await prisma.savedCampaign.findUnique({
        where: {
          influencerId_campaignId: {
            influencerId: influencerProfile.id,
            campaignId: id,
          },
        },
      })
      isSaved = !!saved
    }
  }

  // Increment view count
  await prisma.campaign.update({
    where: { id: id },
    data: { viewCount: { increment: 1 } },
  })

  // Get similar campaigns
  const categoryIds = campaign.categories.map((c) => c.categoryId)
  const similarCampaigns = await prisma.campaign.findMany({
    where: {
      status: 'ACTIVE',
      id: { not: id },
      categories: {
        some: {
          categoryId: { in: categoryIds },
        },
      },
    },
    include: {
      brand: {
        select: {
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
      _count: {
        select: {
          applications: true,
        },
      },
    },
    take: 3,
  })

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CampaignDetailWrapper
          initialCampaign={campaign as any}
          isOwner={isOwner}
          hasApplied={hasApplied}
          isSaved={isSaved}
          isAuthenticated={!!session}
          userType={session ? ((session.user as any).userType || 'INFLUENCER') : null}
        />

        {/* Similar Campaigns */}
        {similarCampaigns.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Similar Campaigns</h2>
            <div className="space-y-4">
              {similarCampaigns.map((c) => (
                <CampaignCard key={c.id} campaign={c as any} />
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
