'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { formatDate, formatDateTime } from '@/lib/i18n/formatDate'

interface Overview {
  totalUsers: number
  proUsers: number
  freeUsers: number
  totalCampaigns: number
  totalApplications: number
  aiMonthlyTokens: number
  aiMonthlyRequests: number
}

interface UserData {
  id: string
  name: string | null
  email: string
  userType: string
  subscriptionTier: string
  isActive: boolean
  createdAt: string
  _count: { aiTokenUsage: number }
  aiUsage: {
    monthlyTokens: number
    monthlyPromptTokens: number
    monthlyCompletionTokens: number
    monthlyRequests: number
  }
}

interface AiLog {
  id: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  model: string
  createdAt: string
  user: { email: string; name: string | null }
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { locale } = useLanguage()
  const [overview, setOverview] = useState<Overview | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
  const [recentAiLogs, setRecentAiLogs] = useState<AiLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'ai-usage'>('overview')

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user || (session.user as any).userType !== 'ADMIN') {
      router.push('/')
      return
    }

    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/stats')
        if (res.ok) {
          const data = await res.json()
          setOverview(data.overview)
          setUsers(data.users)
          setRecentAiLogs(data.recentAiLogs)
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [session, status, router])

  if (status === 'loading' || isLoading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading admin dashboard...</p>
        </div>
      </MainLayout>
    )
  }

  if (!overview) return null

  const estimateCost = (tokens: number) => {
    // GPT-4o-mini rough average: ~$0.30 per 1M tokens
    return (tokens / 1_000_000 * 0.3).toFixed(4)
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mb-8">Platform overview and monitoring</p>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
          {(['overview', 'users', 'ai-usage'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'overview' ? 'Overview' : tab === 'users' ? 'Users' : 'AI Usage'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Users" value={overview.totalUsers} />
              <StatCard label="Pro Users" value={overview.proUsers} accent="text-green-600" />
              <StatCard label="Free Users" value={overview.freeUsers} />
              <StatCard label="Campaigns" value={overview.totalCampaigns} />
              <StatCard label="Applications" value={overview.totalApplications} />
              <StatCard
                label="AI Tokens (This Month)"
                value={overview.aiMonthlyTokens.toLocaleString()}
              />
              <StatCard label="AI Requests (This Month)" value={overview.aiMonthlyRequests} />
              <StatCard
                label="Est. AI Cost (This Month)"
                value={`$${estimateCost(overview.aiMonthlyTokens)}`}
                accent="text-orange-600"
              />
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-600">Email</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Type</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Tier</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Active</th>
                    <th className="px-4 py-3 font-medium text-gray-600">AI Requests (Month)</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Tokens (Month)</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{u.email}</td>
                      <td className="px-4 py-3">{u.name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          u.userType === 'ADMIN'
                            ? 'bg-red-100 text-red-700'
                            : u.userType === 'BRAND'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {u.userType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          u.subscriptionTier === 'PRO'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {u.subscriptionTier}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.isActive ? (
                          <span className="text-green-600">Yes</span>
                        ) : (
                          <span className="text-red-600">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">{u.aiUsage.monthlyRequests}</td>
                      <td className="px-4 py-3 text-right">
                        {u.aiUsage.monthlyTokens > 0 ? (
                          <span>
                            {u.aiUsage.monthlyTokens.toLocaleString()}
                            <span className="text-gray-400 ml-1 text-xs">
                              / 150k
                            </span>
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {formatDate(u.createdAt, locale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AI Usage Tab */}
        {activeTab === 'ai-usage' && (
          <div>
            {/* Monthly summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard
                label="Total Tokens"
                value={overview.aiMonthlyTokens.toLocaleString()}
              />
              <StatCard label="Total Requests" value={overview.aiMonthlyRequests} />
              <StatCard
                label="Est. Cost"
                value={`$${estimateCost(overview.aiMonthlyTokens)}`}
                accent="text-orange-600"
              />
              <StatCard
                label="Avg Tokens/Request"
                value={
                  overview.aiMonthlyRequests > 0
                    ? Math.round(overview.aiMonthlyTokens / overview.aiMonthlyRequests).toLocaleString()
                    : '0'
                }
              />
            </div>

            {/* Per-user usage this month */}
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Per-User Usage (This Month)</h3>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-600">User</th>
                    <th className="px-4 py-3 font-medium text-gray-600 text-right">Prompt</th>
                    <th className="px-4 py-3 font-medium text-gray-600 text-right">Completion</th>
                    <th className="px-4 py-3 font-medium text-gray-600 text-right">Total</th>
                    <th className="px-4 py-3 font-medium text-gray-600 text-right">Requests</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Usage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users
                    .filter((u) => u.aiUsage.monthlyTokens > 0)
                    .sort((a, b) => b.aiUsage.monthlyTokens - a.aiUsage.monthlyTokens)
                    .map((u) => {
                      const pct = Math.min((u.aiUsage.monthlyTokens / 150_000) * 100, 100)
                      return (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{u.name || u.email}</div>
                            <div className="text-xs text-gray-500">{u.email}</div>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs">
                            {u.aiUsage.monthlyPromptTokens.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs">
                            {u.aiUsage.monthlyCompletionTokens.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs font-medium">
                            {u.aiUsage.monthlyTokens.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right">{u.aiUsage.monthlyRequests}</td>
                          <td className="px-4 py-3 w-40">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 w-10 text-right">
                                {pct.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  {users.filter((u) => u.aiUsage.monthlyTokens > 0).length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                        No AI usage this month
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Recent logs */}
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Requests (Last 50)</h3>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-600">User</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Model</th>
                    <th className="px-4 py-3 font-medium text-gray-600 text-right">Prompt</th>
                    <th className="px-4 py-3 font-medium text-gray-600 text-right">Completion</th>
                    <th className="px-4 py-3 font-medium text-gray-600 text-right">Total</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentAiLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs">{log.user.name || log.user.email}</td>
                      <td className="px-4 py-3">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                          {log.model}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs">
                        {log.promptTokens.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs">
                        {log.completionTokens.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs font-medium">
                        {log.totalTokens.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {formatDateTime(log.createdAt, locale)}
                      </td>
                    </tr>
                  ))}
                  {recentAiLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                        No AI requests yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: string | number
  accent?: string
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-xl font-bold ${accent || 'text-gray-900'}`}>{value}</p>
    </div>
  )
}
