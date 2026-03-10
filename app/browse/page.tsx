import MainLayout from '@/components/MainLayout'
import CampaignCard from '@/components/campaigns/CampaignCard'
import CampaignFilters from '@/components/campaigns/CampaignFilters'
import { BrowseTitle, BrowseResultsCount, BrowseEmpty } from '@/components/browse/BrowseI18nText'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

interface SearchParams {
  category?: string
  platform?: string
  compensation?: string
  sort?: string
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await getServerSession(authOptions)
  const subscriptionTier = (session?.user as any)?.subscriptionTier || 'FREE'
  const isPro = subscriptionTier === 'PRO'

  // If user is not logged in or not PRO, show upgrade prompt
  if (!session?.user || !isPro) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-sm p-10">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Pro Feature</h2>
            <p className="text-gray-600 mb-6">
              Browse and discover campaign opportunities is available exclusively for Pro members.
              Upgrade your account to access all campaigns and start applying.
            </p>
            {!session?.user ? (
              <Link
                href="/auth/signin"
                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
              >
                Sign In
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
              >
                Upgrade to Pro
              </Link>
            )}
          </div>
        </div>
      </MainLayout>
    )
  }

  const params = await searchParams
  const category = params.category
  const platform = params.platform
  const compensation = params.compensation
  const sort = params.sort || 'latest'

  // Build filter query
  const where: Prisma.CampaignWhereInput = { status: 'ACTIVE' }

  if (category && category !== 'all') {
    where.categories = {
      some: {
        category: { slug: category },
      },
    }
  }

  if (platform && platform !== 'all') {
    where.platforms = {
      some: {
        platform: { slug: platform },
      },
    }
  }

  if (compensation) {
    where.compensationType = compensation as Prisma.EnumCompensationTypeFilter
  }

  // Build sort query
  let orderBy: Prisma.CampaignOrderByWithRelationInput = {}
  if (sort === 'latest') orderBy = { createdAt: 'desc' }
  else if (sort === 'deadline') orderBy = { deadline: 'asc' }
  else if (sort === 'payment') orderBy = { paymentMax: 'desc' }

  const [campaigns, categories, platforms] = await Promise.all([
    prisma.campaign.findMany({
      where,
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
      orderBy,
      take: 50,
    }),
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BrowseTitle />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <CampaignFilters categories={categories} platforms={platforms} />

          {/* Main Content */}
          <div className="flex-1">
            {/* Results count */}
            <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
              <BrowseResultsCount count={campaigns.length} />
            </div>

            {/* Campaigns List */}
            {campaigns.length === 0 ? (
              <BrowseEmpty />
            ) : (
              <div className="space-y-4">
                {JSON.parse(JSON.stringify(campaigns)).map((campaign: any) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
