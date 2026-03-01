import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST: Apply to a campaign (influencer only)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { message: 'Influencer profile required to apply' },
        { status: 403 }
      )
    }

    // Check if campaign exists and is active
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        followerRequirements: true,
      },
    })

    if (!campaign) {
      return NextResponse.json({ message: 'Campaign not found' }, { status: 404 })
    }

    if (campaign.status !== 'ACTIVE') {
      return NextResponse.json(
        { message: 'Campaign is not accepting applications' },
        { status: 400 }
      )
    }

    // Check if deadline has passed
    if (campaign.deadline && new Date(campaign.deadline) < new Date()) {
      return NextResponse.json(
        { message: 'Application deadline has passed' },
        { status: 400 }
      )
    }

    // Check if slots are full
    if (campaign.filledSlots >= campaign.totalSlots) {
      return NextResponse.json(
        { message: 'All slots have been filled' },
        { status: 400 }
      )
    }

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        campaignId_influencerId: {
          campaignId: params.id,
          influencerId: influencerProfile.id,
        },
      },
    })

    if (existingApplication) {
      return NextResponse.json(
        { message: 'You have already applied to this campaign' },
        { status: 400 }
      )
    }

    const data = await req.json()

    // Create application
    const application = await prisma.application.create({
      data: {
        campaignId: params.id,
        influencerId: influencerProfile.id,
        socialAccountId: data.socialAccountId,
        pitchMessage: data.pitchMessage,
        proposedRate: data.proposedRate,
        status: 'PENDING',
      },
      include: {
        campaign: {
          select: {
            title: true,
            brand: {
              select: {
                companyName: true,
              },
            },
          },
        },
        socialAccount: {
          include: {
            platform: true,
          },
        },
      },
    })

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
