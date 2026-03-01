'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SaveButton({
  postId,
  isSaved,
  isAuthenticated,
}: {
  postId: string
  isSaved: boolean
  isAuthenticated: boolean
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(isSaved)

  const handleSave = async () => {
    if (!isAuthenticated) {
      router.push('/auth/signin')
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/shortlist', {
        method: saved ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      })

      if (response.ok) {
        setSaved(!saved)
      } else {
        alert('Failed to save')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <button
      onClick={handleSave}
      disabled={saving}
      className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
    >
      {saving ? 'Saving...' : saved ? '💾 Saved' : '💾 Save to Shortlist'}
    </button>
  )
}
