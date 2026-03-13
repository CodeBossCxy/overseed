'use client'

import { useLanguage } from '@/lib/i18n/LanguageContext'
import { formatDate, formatMonthYear, formatDateTime } from '@/lib/i18n/formatDate'

export function LocaleDate({ date, className }: { date: string | Date; className?: string }) {
  const { locale } = useLanguage()
  return <span className={className}>{formatDate(date, locale)}</span>
}

export function LocaleMonthYear({ date, className }: { date: string | Date; className?: string }) {
  const { locale } = useLanguage()
  return <span className={className}>{formatMonthYear(date, locale)}</span>
}

export function LocaleDateTime({ date, className }: { date: string | Date; className?: string }) {
  const { locale } = useLanguage()
  return <span className={className}>{formatDateTime(date, locale)}</span>
}
