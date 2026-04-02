import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const MONTHLY_TOKEN_LIMIT = 150_000

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as any).id
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const monthlyUsage = await prisma.aiTokenUsage.aggregate({
    where: { userId, createdAt: { gte: startOfMonth } },
    _sum: { totalTokens: true },
  })

  const used = monthlyUsage._sum.totalTokens || 0
  const limit = MONTHLY_TOKEN_LIMIT
  const percentage = Math.min(Math.round((used / limit) * 100), 100)

  return NextResponse.json({ used, limit, percentage })
}
