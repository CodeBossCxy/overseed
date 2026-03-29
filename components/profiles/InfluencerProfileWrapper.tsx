'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import InfluencerProfile from './InfluencerProfile'
import UGCTranslateToggle from '../UGCTranslateToggle'

interface InfluencerProfileWrapperProps {
  initialInfluencer: any
}

export default function InfluencerProfileWrapper({
  initialInfluencer,
}: InfluencerProfileWrapperProps) {
  const { locale, isUGCTranslated } = useLanguage()
  const [influencer, setInfluencer] = useState(initialInfluencer)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isUGCTranslated) {
      setInfluencer(initialInfluencer)
      return
    }

    async function fetchTranslated() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/influencers/${initialInfluencer.id}?lang=${locale}`)
        const data = await response.json()
        if (data && !data.message) {
          setInfluencer(data)
        }
      } catch (error) {
        console.error('Error fetching influencer:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTranslated()
  }, [locale, isUGCTranslated, initialInfluencer])

  return (
    <div>
      <div className="flex justify-end mb-4">
        <UGCTranslateToggle isLoading={isLoading} />
      </div>
      <InfluencerProfile influencer={influencer} />
    </div>
  )
}
