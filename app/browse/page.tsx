import MainLayout from '@/components/MainLayout'
import CampaignCard from '@/components/campaigns/CampaignCard'
import CampaignFilters from '@/components/campaigns/CampaignFilters'
import { BrowseTitle, BrowseResultsCount, BrowseEmpty } from '@/components/browse/BrowseI18nText'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

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
                {campaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign as any} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
