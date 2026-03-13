import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import MainLayout from '@/components/MainLayout'
import SettingsClient from '@/components/settings/SettingsClient'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  const userId = (session.user as any).id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      preferredLanguage: true,
      subscriptionTier: true,
      userType: true,
      createdAt: true,
    },
  })

  if (!user) {
    redirect('/auth/signin')
  }

  return (
    <MainLayout>
      <SettingsClient
        user={{
          ...user,
          createdAt: user.createdAt.toISOString(),
        }}
      />
    </MainLayout>
  )
}
