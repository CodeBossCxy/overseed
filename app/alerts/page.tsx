import MainLayout from '@/components/MainLayout'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AlertsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin?callbackUrl=/alerts')
  }

  const savedSearches = await prisma.savedSearch.findMany({
    where: {
      userId: (session.user as any).id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Saved Searches & Alerts</h1>
          <p className="text-gray-600">
            Get notified when new opportunities matching your criteria are posted
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            💡 How it works
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Save your search filters from the Browse page</li>
            <li>• Choose how often you want to receive notifications</li>
            <li>• Get email alerts when new posts match your criteria</li>
            <li>• Manage all your saved searches in one place</li>
          </ul>
        </div>

        {/* Saved Searches */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Saved Searches</h2>
              <Link
                href="/browse"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition text-sm"
              >
                + Create New Search
              </Link>
            </div>
          </div>

          <div className="p-6">
            {savedSearches.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-500 mb-4">You don't have any saved searches yet</p>
                <Link
                  href="/browse"
                  className="inline-block px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
                >
                  Browse Opportunities
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {savedSearches.map((search) => (
                  <div
                    key={search.id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-primary-300 transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{search.name}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {Object.entries(search.filters as any).map(([key, value]) => (
                            <span
                              key={key}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                            >
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">
                          Created {new Date(search.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={search.isActive}
                            className="sr-only peer"
                            readOnly
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Frequency */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4">
                        <label className="text-sm text-gray-600">Alert Frequency:</label>
                        <select
                          defaultValue={search.frequency}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="INSTANT">Instant</option>
                          <option value="DAILY">Daily</option>
                          <option value="WEEKLY">Weekly</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-md transition">
                          View Results
                        </button>
                        <button className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Email Preferences */}
        <div className="bg-white rounded-lg shadow-md mt-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Email Preferences</h2>
          </div>
          <div className="p-6 space-y-4">
            <label className="flex items-center">
              <input type="checkbox" className="mr-3" defaultChecked />
              <span className="text-sm">Email me when new posts match my saved searches</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-3" defaultChecked />
              <span className="text-sm">Email me when my application status changes</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-3" />
              <span className="text-sm">Email me weekly digest of new opportunities</span>
            </label>
            <button className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition">
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
