'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function RoleRedirector({ destination }: { destination: string }) {
  const { update } = useSession()
  const router = useRouter()
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    // Refresh the JWT cookie so it matches the DB (which was updated server-side)
    update().then(() => {
      router.replace(destination)
    })
  }, [destination, update, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Redirecting...</p>
    </div>
  )
}
