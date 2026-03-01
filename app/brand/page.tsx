import MainLayout from '@/components/MainLayout'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function BrandCenterPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin?callbackUrl=/brand')
  }

  // Fetch user's posts
  const posts = await prisma.post.findMany({
    where: {
      authorId: (session.user as any).id,
    },
    include: {
      _count: {
        select: {
          applications: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const pendingPosts = posts.filter((p) => p.status === 'PENDING')
  const approvedPosts = posts.filter((p) => p.status === 'APPROVED')
  const rejectedPosts = posts.filter((p) => p.status === 'REJECTED')

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Brand Center</h1>
          <p className="text-gray-600">Manage your posts and applications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-primary-600">{posts.length}</div>
            <div className="text-sm text-gray-600">Total Posts</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-green-600">{approvedPosts.length}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-yellow-600">{pendingPosts.length}</div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-blue-600">
              {posts.reduce((acc, p) => acc + p._count.applications, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <Link
              href="/create"
              className="px-6 py-3 bg-white text-primary-600 rounded-md hover:bg-gray-100 transition font-medium"
            >
              + Create New Post
            </Link>
            <Link
              href="/alerts"
              className="px-6 py-3 bg-primary-700 text-white rounded-md hover:bg-primary-600 transition border border-white"
            >
              Manage Alerts
            </Link>
          </div>
        </div>

        {/* Posts Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button className="px-6 py-4 border-b-2 border-primary-600 text-primary-600 font-medium">
                All Posts ({posts.length})
              </button>
              <button className="px-6 py-4 text-gray-600 hover:text-gray-900">
                Approved ({approvedPosts.length})
              </button>
              <button className="px-6 py-4 text-gray-600 hover:text-gray-900">
                Pending ({pendingPosts.length})
              </button>
              <button className="px-6 py-4 text-gray-600 hover:text-gray-900">
                Rejected ({rejectedPosts.length})
              </button>
            </nav>
          </div>

          {/* Posts List */}
          <div className="p-6">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">You haven't created any posts yet</p>
                <Link
                  href="/create"
                  className="inline-block px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
                >
                  Create Your First Post
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${
                              post.status === 'APPROVED'
                                ? 'bg-green-100 text-green-700'
                                : post.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {post.status}
                          </span>
                          <span className="text-xs text-gray-500">{post.category}</span>
                        </div>
                        <Link
                          href={`/post/${post.id}`}
                          className="text-lg font-semibold hover:text-primary-600 transition"
                        >
                          {post.title}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {post.description}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span>📍 {post.location || 'Remote'}</span>
                          <span>📅 {new Date(post.createdAt).toLocaleDateString()}</span>
                          <span>👥 {post._count.applications} applications</span>
                          {post.deadline && (
                            <span className="text-orange-600">
                              ⏰ {new Date(post.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Link
                          href={`/post/${post.id}`}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition text-sm"
                        >
                          View
                        </Link>
                        {post._count.applications > 0 && (
                          <Link
                            href={`/brand/applications/${post.id}`}
                            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition text-sm"
                          >
                            Applications ({post._count.applications})
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
