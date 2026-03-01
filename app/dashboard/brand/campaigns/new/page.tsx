import MainLayout from '@/components/MainLayout'
import CampaignForm from '@/components/campaigns/CampaignForm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function NewCampaignPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  const userId = (session.user as any).id

  // Check if user has a brand profile
  const brandProfile = await prisma.brandProfile.findUnique({
    where: { userId },
  })

  if (!brandProfile) {
    redirect('/dashboard/brand')
  }

  const [categories, platforms] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.platform.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
    }),
  ])

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create Campaign</h1>
          <p className="text-gray-600 mt-1">Set up a new influencer collaboration campaign</p>
        </div>

        <CampaignForm categories={categories} platforms={platforms} />
      </div>
    </MainLayout>
  )
}
