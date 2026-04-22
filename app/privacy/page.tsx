'use client'

import LegalPage from '@/components/LegalPage'

export default function PrivacyPage() {
  return (
    <LegalPage
      enPath="/legal/privacy-policy.md"
      zhPath="/legal/zh/privacy-policy-zh.md"
      fallbackTitle="Privacy Policy"
    />
  )
}
