import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import RoleRedirector from '@/components/RoleRedirector'

export default async function CreatorCenterPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  // Not logged in → send to signup with creator type pre-selected
  if (!userId) {
    redirect('/auth/signup?type=creator')
  }

  // Persist INFLUENCER role choice to DB
  await prisma.user.update({
    where: { id: userId },
    data: { userType: 'INFLUENCER' },
  })

  // Auto-create InfluencerProfile if it doesn't exist
  const existing = await prisma.influencerProfile.findUnique({
    where: { userId },
  })
  if (!existing) {
    await prisma.influencerProfile.create({
      data: { userId },
    })
  }

  // Render client component that syncs the JWT cookie, then redirects
  return <RoleRedirector destination="/dashboard/influencer" />
}
