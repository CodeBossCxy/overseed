import MainLayout from '@/components/MainLayout'
import HomePage from '@/components/HomePage'
import { prisma } from '@/lib/prisma'

async function getLatestCampaigns() {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: {
        status: 'ACTIVE',
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
      orderBy: {
        createdAt: 'desc',
      },
      take: 12,
    })
    return JSON.parse(JSON.stringify(campaigns))
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return []
  }
}

export default async function Page() {
  const campaigns = await getLatestCampaigns()

  return (
    <MainLayout>
      <HomePage campaigns={campaigns as any} />
    </MainLayout>
  )
}
