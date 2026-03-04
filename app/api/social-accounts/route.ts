import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST: Link a social account
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Check if user has an influencer profile
    const influencerProfile = await prisma.influencerProfile.findUnique({
      where: { userId },
    })

    if (!influencerProfile) {
      return NextResponse.json(
        { message: 'Influencer profile required to add social accounts' },
        { status: 403 }
      )
    }

    const data = await req.json()

    // Validate required fields
    if (!data.platformId || !data.username) {
      return NextResponse.json(
        { message: 'Platform and username are required' },
        { status: 400 }
      )
    }

    // Check if platform exists
    const platform = await prisma.platform.findUnique({
      where: { id: data.platformId },
    })

    if (!platform) {
      return NextResponse.json(
        { message: 'Invalid platform' },
        { status: 400 }
      )
    }

    // Check if already linked
    const existing = await prisma.influencerSocialAccount.findUnique({
      where: {
        influencerId_platformId: {
          influencerId: influencerProfile.id,
          platformId: data.platformId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { message: 'Platform already linked' },
        { status: 400 }
      )
    }

    // Determine verification status
    const verificationMethod = data.verificationMethod || 'manual'
    const isVerified = verificationMethod === 'url' || verificationMethod === 'screenshot'
    const verifiedAt = isVerified ? new Date() : null

    // Create social account
    const socialAccount = await prisma.influencerSocialAccount.create({
      data: {
        influencerId: influencerProfile.id,
        platformId: data.platformId,
        username: data.username,
        profileUrl: data.profileUrl,
        followerCount: data.followerCount || 0,
        likesCount: data.likesCount || null,
        engagementRate: data.engagementRate,
        isVerified,
        verificationMethod,
        screenshotUrl: data.screenshotUrl || null,
        verifiedAt,
      },
      include: {
        platform: true,
      },
    })

    return NextResponse.json(socialAccount, { status: 201 })
  } catch (error) {
    console.error('Error linking social account:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET: Get my social accounts
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const influencerProfile = await prisma.influencerProfile.findUnique({
      where: { userId },
    })

    if (!influencerProfile) {
      return NextResponse.json(
        { message: 'Influencer profile not found' },
        { status: 404 }
      )
    }

    const socialAccounts = await prisma.influencerSocialAccount.findMany({
      where: { influencerId: influencerProfile.id },
      include: {
        platform: true,
      },
      orderBy: {
        followerCount: 'desc',
      },
    })

    return NextResponse.json(socialAccounts)
  } catch (error) {
    console.error('Error fetching social accounts:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
