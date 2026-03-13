import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as any).id
  if (!userId) {
    return NextResponse.json({ error: 'User ID not found' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferredLanguage: true },
  })

  return NextResponse.json({ language: user?.preferredLanguage || 'en' })
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as any).id
  if (!userId) {
    return NextResponse.json({ error: 'User ID not found' }, { status: 400 })
  }

  const body = await request.json()
  const { language } = body

  if (language !== 'en' && language !== 'zh') {
    return NextResponse.json(
      { error: 'Invalid language. Must be "en" or "zh"' },
      { status: 400 }
    )
  }

  await prisma.user.update({
    where: { id: userId },
    data: { preferredLanguage: language },
  })

  return NextResponse.json({ success: true, language })
}
