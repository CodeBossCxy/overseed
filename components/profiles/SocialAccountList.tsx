'use client'

interface SocialAccount {
  id: string
  platform: {
    name: string
    slug: string
  }
  username: string
  profileUrl?: string | null
  followerCount: number
  engagementRate?: number | string | null
  isVerified: boolean
}

interface SocialAccountListProps {
  accounts: SocialAccount[]
  isPublicView?: boolean
  onDelete?: (id: string) => void
}

export default function SocialAccountList({
  accounts,
  isPublicView = false,
  onDelete,
}: SocialAccountListProps) {
  const getPlatformIcon = (slug: string) => {
    const icons: Record<string, string> = {
      instagram: 'IG',
      tiktok: 'TT',
      youtube: 'YT',
      twitter: 'X',
      facebook: 'FB',
      pinterest: 'Pin',
      snapchat: 'Snap',
      linkedin: 'Li',
      blog: 'Blog',
    }
    return icons[slug] || slug.charAt(0).toUpperCase()
  }

  const getPlatformColor = (slug: string) => {
    const colors: Record<string, string> = {
      instagram: 'bg-gradient-to-br from-purple-500 to-pink-500',
      tiktok: 'bg-black',
      youtube: 'bg-red-600',
      twitter: 'bg-gray-900',
      facebook: 'bg-blue-600',
      pinterest: 'bg-red-500',
      snapchat: 'bg-yellow-400',
      linkedin: 'bg-blue-700',
      blog: 'bg-gray-600',
    }
    return colors[slug] || 'bg-gray-500'
  }

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No social accounts linked yet.</p>
        {!isPublicView && (
          <a
            href="/dashboard/influencer/accounts"
            className="text-primary-600 hover:underline mt-2 inline-block"
          >
            Add your first account
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {accounts.map((account) => (
        <div
          key={account.id}
          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
        >
          {/* Platform Icon */}
          <div
            className={`w-12 h-12 rounded-lg ${getPlatformColor(account.platform.slug)} flex items-center justify-center text-white font-bold`}
          >
            {getPlatformIcon(account.platform.slug)}
          </div>

          {/* Account Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium">{account.platform.name}</span>
              {account.isVerified && (
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            {account.profileUrl ? (
              <a
                href={account.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-primary-600"
              >
                @{account.username}
              </a>
            ) : (
              <span className="text-sm text-gray-600">@{account.username}</span>
            )}
          </div>

          {/* Stats */}
          <div className="text-right">
            <div className="font-semibold">{formatFollowers(account.followerCount)}</div>
            <div className="text-xs text-gray-500">followers</div>
          </div>

          {account.engagementRate && (
            <div className="text-right">
              <div className="font-semibold">{Number(account.engagementRate).toFixed(1)}%</div>
              <div className="text-xs text-gray-500">engagement</div>
            </div>
          )}

          {/* Delete Button (only in edit mode) */}
          {!isPublicView && onDelete && (
            <button
              onClick={() => onDelete(account.id)}
              className="p-2 text-gray-400 hover:text-red-600 transition"
              title="Remove account"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
