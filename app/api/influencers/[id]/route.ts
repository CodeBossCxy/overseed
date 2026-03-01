import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Public influencer profile
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const influencer = await prisma.influencerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            createdAt: true,
          },
        },
        socialAccounts: {
          include: {
            platform: true,
          },
        },
        _count: {
          select: {
            applications: {
              where: { status: 'COMPLETED' },
            },
          },
        },
      },
    })

    if (!influencer) {
      return NextResponse.json({ message: 'Influencer not found' }, { status: 404 })
    }

    // Get completed campaigns count
    const completedCount = await prisma.application.count({
      where: {
        influencerId: id,
        status: 'COMPLETED',
      },
    })

    return NextResponse.json({
      ...influencer,
      completedCampaigns: completedCount,
    })
  } catch (error) {
    console.error('Error fetching influencer profile:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
