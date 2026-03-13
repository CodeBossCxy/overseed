import type { Locale } from './translations'

/**
 * Format a date for display based on locale.
 * - English: "Mar 12, 2026"
 * - Chinese: "2026年3月12日"
 */
export function formatDate(date: string | Date | null | undefined, locale: Locale): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  if (locale === 'zh') {
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }

  // English: "Mar 12, 2026"
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

/**
 * Format a date showing only month and year.
 * - English: "Mar 2026"
 * - Chinese: "2026年3月"
 */
export function formatMonthYear(date: string | Date | null | undefined, locale: Locale): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  if (locale === 'zh') {
    return `${d.getFullYear()}年${d.getMonth() + 1}月`
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getFullYear()}`
}

/**
 * Format a date with time.
 * - English: "Mar 12, 2026 3:45 PM"
 * - Chinese: "2026年3月12日 15:45"
 */
export function formatDateTime(date: string | Date | null | undefined, locale: Locale): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const datePart = formatDate(date, locale)

  if (locale === 'zh') {
    const hours = d.getHours().toString().padStart(2, '0')
    const minutes = d.getMinutes().toString().padStart(2, '0')
    return `${datePart} ${hours}:${minutes}`
  }

  // English: 12-hour format
  let hours = d.getHours()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${datePart} ${hours}:${minutes} ${ampm}`
}
