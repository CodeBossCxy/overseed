'use client'

import LegalPage from '@/components/LegalPage'

export default function GuidelinesPage() {
  return (
    <LegalPage
      enPath="/legal/community-guidelines.md"
      zhPath="/legal/zh/community-guidelines-zh.md"
      fallbackTitle="Community Guidelines"
    />
  )
}
