'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ApplyButton({
  postId,
  hasApplied,
  isAuthenticated,
}: {
  postId: string
  hasApplied: boolean
  isAuthenticated: boolean
}) {
  const router = useRouter()
  const [isApplying, setIsApplying] = useState(false)
  const [applied, setApplied] = useState(hasApplied)

  const handleApply = async () => {
    if (!isAuthenticated) {
      router.push('/auth/signin')
      return
    }

    setIsApplying(true)

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      })

      if (response.ok) {
        setApplied(true)
        alert('Application submitted successfully!')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to apply')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <button
      onClick={handleApply}
      disabled={applied || isApplying}
      className={`w-full px-4 py-3 rounded-md font-medium transition ${
        applied
          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
          : 'bg-primary-600 text-white hover:bg-primary-700'
      }`}
    >
      {isApplying ? 'Applying...' : applied ? '✓ Applied' : 'Apply Now'}
    </button>
  )
}
