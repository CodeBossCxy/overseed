'use client'

import LegalPage from '@/components/LegalPage'

export default function TermsPage() {
  return (
    <LegalPage
      enPath="/legal/terms-of-service.md"
      zhPath="/legal/zh/terms-of-service-zh.md"
      fallbackTitle="Terms of Service"
    />
  )
}
