import MainLayout from '@/components/MainLayout'
import BrandDashboardClient from '@/components/dashboard/BrandDashboardClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function BrandDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  const userId = (session.user as any).id

  // Read userType from DB (not JWT session) to avoid stale-token redirects
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { userType: true },
  })
  const userType = dbUser?.userType || 'INFLUENCER'

  if (userType === 'INFLUENCER') {
    redirect('/dashboard/influencer')
  }

  // Get or create brand profile
  let brandProfile = await prisma.brandProfile.findUnique({
    where: { userId },
  })

  if (!brandProfile) {
    brandProfile = await prisma.brandProfile.create({
      data: {
        userId,
        companyName: session.user.name,
      },
    })
  }

  // Get campaigns
  const campaigns = await prisma.campaign.findMany({
    where: { brandId: brandProfile.id },
    include: {
      categories: {
        include: { category: true },
      },
      _count: {
        select: { applications: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  // Get stats
  const stats = {
    totalCampaigns: await prisma.campaign.count({
      where: { brandId: brandProfile.id },
    }),
    activeCampaigns: await prisma.campaign.count({
      where: { brandId: brandProfile.id, status: 'ACTIVE' },
    }),
    draftCampaigns: await prisma.campaign.count({
      where: { brandId: brandProfile.id, status: 'DRAFT' },
    }),
    totalApplications: await prisma.application.count({
      where: { campaign: { brandId: brandProfile.id } },
    }),
    pendingApplications: await prisma.application.count({
      where: { campaign: { brandId: brandProfile.id }, status: 'PENDING' },
    }),
    completedCollaborations: await prisma.application.count({
      where: { campaign: { brandId: brandProfile.id }, status: 'COMPLETED' },
    }),
  }

  return (
    <MainLayout>
      <BrandDashboardClient
        stats={stats}
        campaigns={JSON.parse(JSON.stringify(campaigns))}
        brandProfile={{ companyName: brandProfile.companyName, description: brandProfile.description, logoUrl: brandProfile.logoUrl }}
        userName={session.user?.name || 'Brand'}
      />
    </MainLayout>
  )
}
