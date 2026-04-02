'use client'

import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function CategoryName({ name }: { name: string }) {
  const { t } = useLanguage()
  return <>{t.categoryNames[name] || name}</>
}
