'use client'

interface PaymentStatusProps {
  status: string
  amount?: number
  creatorPayout?: number
  paidAt?: string | null
  releasedAt?: string | null
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Payment Pending', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
  HELD: { label: 'Funds Held', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  RELEASED: { label: 'Payment Released', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  REFUNDED: { label: 'Refunded', color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' },
  FAILED: { label: 'Payment Failed', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
}

export default function PaymentStatusBadge({ status, amount, creatorPayout, paidAt, releasedAt }: PaymentStatusProps) {
  const config = statusConfig[status] || statusConfig.PENDING

  return (
    <div className={`rounded-lg border p-3 ${config.bg}`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
        {amount && <span className="text-sm font-bold">${amount.toFixed(2)}</span>}
      </div>
      {status === 'HELD' && creatorPayout && (
        <p className="text-xs text-gray-500 mt-1">
          ${creatorPayout.toFixed(2)} will go to the creator upon release
        </p>
      )}
      {status === 'RELEASED' && releasedAt && (
        <p className="text-xs text-gray-500 mt-1">
          Released on {new Date(releasedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  )
}
