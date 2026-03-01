'use client'

interface CampaignStatsProps {
  applications: number
  spotsLeft: number
  totalSlots: number
  viewCount: number
}

export default function CampaignStats({
  applications,
  spotsLeft,
  totalSlots,
  viewCount,
}: CampaignStatsProps) {
  const filledPercentage = ((totalSlots - spotsLeft) / totalSlots) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Applications</span>
        <span className="font-semibold">{applications}</span>
      </div>

      <div>
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Spots Filled</span>
          <span className="font-semibold">{totalSlots - spotsLeft} / {totalSlots}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all"
            style={{ width: `${filledPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} remaining
        </p>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Views</span>
        <span className="font-semibold">{viewCount.toLocaleString()}</span>
      </div>
    </div>
  )
}
