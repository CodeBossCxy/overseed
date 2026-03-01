import MainLayout from '@/components/MainLayout'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function CreatorCenterPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin?callbackUrl=/creator')
  }

  // Fetch user's applications
  const applications = await prisma.application.findMany({
    where: {
      applicantId: (session.user as any).id,
    },
    include: {
      post: {
        include: {
          author: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Fetch saved posts
  const savedPosts = await prisma.shortlist.findMany({
    where: {
      userId: (session.user as any).id,
    },
    include: {
      post: {
        include: {
          author: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const pendingApps = applications.filter((a) => a.status === 'PENDING')
  const acceptedApps = applications.filter((a) => a.status === 'ACCEPTED')
  const shortlistedApps = applications.filter((a) => a.status === 'SHORTLISTED')

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Creator Center</h1>
          <p className="text-gray-600">Track your applications and manage your profile</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-primary-600">{applications.length}</div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-yellow-600">{pendingApps.length}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-blue-600">{shortlistedApps.length}</div>
            <div className="text-sm text-gray-600">Shortlisted</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-green-600">{acceptedApps.length}</div>
            <div className="text-sm text-gray-600">Accepted</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <Link
              href="/browse"
              className="px-6 py-3 bg-white text-primary-600 rounded-md hover:bg-gray-100 transition font-medium"
            >
              🔍 Browse Opportunities
            </Link>
            <Link
              href="/creator/profile"
              className="px-6 py-3 bg-primary-700 text-white rounded-md hover:bg-primary-600 transition border border-white"
            >
              ✏️ Edit Profile
            </Link>
            <Link
              href="/alerts"
              className="px-6 py-3 bg-primary-700 text-white rounded-md hover:bg-primary-600 transition border border-white"
            >
              🔔 Manage Alerts
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Applications */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">My Applications</h2>
            </div>
            <div className="p-6">
              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't applied to any posts yet</p>
                  <Link
                    href="/browse"
                    className="inline-block px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
                  >
                    Browse Opportunities
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {applications.slice(0, 5).map((app) => (
                    <Link
                      key={app.id}
                      href={`/post/${app.post.id}`}
                      className="block border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold line-clamp-1">{app.post.title}</h3>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded flex-shrink-0 ml-2 ${
                            app.status === 'ACCEPTED'
                              ? 'bg-green-100 text-green-700'
                              : app.status === 'SHORTLISTED'
                              ? 'bg-blue-100 text-blue-700'
                              : app.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{app.post.author.name}</p>
                      <p className="text-xs text-gray-500">
                        Applied {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </Link>
                  ))}
                  {applications.length > 5 && (
                    <Link
                      href="/creator/applications"
                      className="block text-center text-primary-600 hover:underline text-sm mt-4"
                    >
                      View all applications →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Saved Posts */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Saved Posts</h2>
            </div>
            <div className="p-6">
              {savedPosts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No saved posts yet</p>
                  <Link
                    href="/browse"
                    className="inline-block px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
                  >
                    Browse Opportunities
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {savedPosts.slice(0, 5).map((saved) => (
                    <Link
                      key={saved.id}
                      href={`/post/${saved.post.id}`}
                      className="block border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition"
                    >
                      <h3 className="font-semibold mb-2 line-clamp-1">{saved.post.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{saved.post.author.name}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>📍 {saved.post.location || 'Remote'}</span>
                        {saved.post.budgetMin && saved.post.budgetMax && (
                          <span className="font-semibold text-primary-600">
                            ${saved.post.budgetMin} - ${saved.post.budgetMax}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                  {savedPosts.length > 5 && (
                    <Link
                      href="/creator/saved"
                      className="block text-center text-primary-600 hover:underline text-sm mt-4"
                    >
                      View all saved posts →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
