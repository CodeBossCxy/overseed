import MainLayout from '@/components/MainLayout'
import Link from 'next/link'
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Brand Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {brandProfile.companyName || session.user?.name || 'Brand'}!
            </p>
          </div>
          <Link
            href="/dashboard/brand/campaigns/new"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
          >
            Create Campaign
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-primary-600">{stats.totalCampaigns}</div>
            <div className="text-sm text-gray-500">Total Campaigns</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-green-600">{stats.activeCampaigns}</div>
            <div className="text-sm text-gray-500">Active</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.draftCampaigns}</div>
            <div className="text-sm text-gray-500">Drafts</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalApplications}</div>
            <div className="text-sm text-gray-500">Applications</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</div>
            <div className="text-sm text-gray-500">Pending Review</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.completedCollaborations}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Campaigns */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Campaigns</h2>
              <Link href="/dashboard/brand/campaigns" className="text-primary-600 hover:underline text-sm">
                View all
              </Link>
            </div>
            {campaigns.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500 mb-4">No campaigns yet</p>
                <Link
                  href="/dashboard/brand/campaigns/new"
                  className="inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
                >
                  Create Your First Campaign
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm divide-y">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <Link
                          href={`/dashboard/brand/campaigns/${campaign.id}/edit`}
                          className="font-medium hover:text-primary-600"
                        >
                          {campaign.title}
                        </Link>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              campaign.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : campaign.status === 'DRAFT'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {campaign.status}
                          </span>
                          <span>{campaign._count.applications} applications</span>
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/brand/campaigns/${campaign.id}/applications`}
                        className="text-sm text-primary-600 hover:underline"
                      >
                        View Applications
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <nav className="space-y-2">
                <Link
                  href="/dashboard/brand/campaigns/new"
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition text-primary-600 font-medium"
                >
                  Create Campaign
                </Link>
                <Link
                  href="/dashboard/brand/campaigns"
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition"
                >
                  Manage Campaigns
                </Link>
                <Link
                  href="/dashboard/brand/profile"
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition"
                >
                  Company Profile
                </Link>
              </nav>
            </div>

            {/* Profile Completion */}
            {(!brandProfile.description || !brandProfile.logoUrl) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="font-semibold text-yellow-800 mb-2">Complete Your Profile</h3>
                <p className="text-sm text-yellow-700 mb-4">
                  A complete company profile builds trust with influencers.
                </p>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {!brandProfile.logoUrl && <li>Add a company logo</li>}
                  {!brandProfile.description && <li>Add a company description</li>}
                </ul>
                <Link
                  href="/dashboard/brand/profile"
                  className="inline-block mt-4 text-sm text-yellow-800 font-medium hover:underline"
                >
                  Complete Profile
                </Link>
              </div>
            )}

            {/* Pending Actions */}
            {stats.pendingApplications > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-800 mb-2">Pending Actions</h3>
                <p className="text-sm text-blue-700">
                  You have {stats.pendingApplications} applications waiting for review.
                </p>
                <Link
                  href="/dashboard/brand/campaigns"
                  className="inline-block mt-4 text-sm text-blue-800 font-medium hover:underline"
                >
                  Review Applications
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
