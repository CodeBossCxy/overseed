import MainLayout from '@/components/MainLayout'
import InfluencerProfile from '@/components/profiles/InfluencerProfile'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function InfluencerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const influencer = await prisma.influencerProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          image: true,
          createdAt: true,
        },
      },
      socialAccounts: {
        include: {
          platform: true,
        },
        orderBy: {
          followerCount: 'desc',
        },
      },
    },
  })

  if (!influencer) {
    notFound()
  }

  // Get completed campaigns count
  const completedCampaigns = await prisma.application.count({
    where: {
      influencerId: id,
      status: 'COMPLETED',
    },
  })

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InfluencerProfile
          influencer={{
            ...influencer,
            completedCampaigns,
          } as any}
        />
      </div>
    </MainLayout>
  )
}
