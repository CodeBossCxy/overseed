'use client'

import { useLanguage } from '@/lib/i18n/LanguageContext'

interface CompensationBadgeProps {
  type: string
  paymentMin?: number | string | null
  paymentMax?: number | string | null
  giftDescription?: string | null
  size?: 'sm' | 'md' | 'lg'
}

export default function CompensationBadge({
  type,
  paymentMin,
  paymentMax,
  giftDescription,
  size = 'md',
}: CompensationBadgeProps) {
  const { t } = useLanguage()

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  }

  const formatAmount = (amount: number | string | null | undefined) => {
    if (amount === null || amount === undefined) return null
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  const getCompensationDisplay = () => {
    switch (type) {
      case 'PAID':
        return {
          label: t.campaign.paid,
          color: 'bg-green-100 text-green-800',
          amount: paymentMin && paymentMax
            ? `${formatAmount(paymentMin)} - ${formatAmount(paymentMax)}`
            : paymentMin || paymentMax
              ? formatAmount(paymentMin || paymentMax)
              : null,
        }
      case 'GIFTED':
        return {
          label: t.campaign.gifted,
          color: 'bg-purple-100 text-purple-800',
          amount: giftDescription || t.campaign.productGifted,
        }
      case 'PAID_PLUS_GIFT':
        return {
          label: t.campaign.paidPlusGift,
          color: 'bg-blue-100 text-blue-800',
          amount: paymentMin || paymentMax
            ? formatAmount(paymentMax || paymentMin)
            : null,
        }
      case 'AFFILIATE':
        return {
          label: t.campaign.affiliate,
          color: 'bg-orange-100 text-orange-800',
          amount: t.campaign.commissionBased,
        }
      case 'NEGOTIABLE':
        return {
          label: t.campaign.negotiable,
          color: 'bg-gray-100 text-gray-800',
          amount: paymentMin || paymentMax
            ? `${t.campaign.upTo} ${formatAmount(paymentMax || paymentMin)}`
            : t.campaign.rateNegotiable,
        }
      default:
        return {
          label: type,
          color: 'bg-gray-100 text-gray-800',
          amount: null,
        }
    }
  }

  const display = getCompensationDisplay()

  return (
    <div className="flex flex-col items-end gap-1">
      <span className={`${sizeClasses[size]} ${display.color} rounded-full font-medium`}>
        {display.label}
      </span>
      {display.amount && (
        <span className={`font-semibold text-primary-600 ${size === 'lg' ? 'text-xl' : size === 'md' ? 'text-lg' : 'text-sm'}`}>
          {display.amount}
        </span>
      )}
    </div>
  )
}
