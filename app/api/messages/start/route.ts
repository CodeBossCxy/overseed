import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST: Start a conversation from an application
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { applicationId } = await req.json()

    if (!applicationId) {
      return NextResponse.json(
        { message: 'applicationId is required' },
        { status: 400 }
      )
    }

    // Fetch the application with related data
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        campaign: {
          include: {
            brand: { select: { userId: true } },
          },
        },
        influencer: { select: { userId: true } },
      },
    })

    if (!application) {
      return NextResponse.json(
        { message: 'Application not found' },
        { status: 404 }
      )
    }

    const brandUserId = application.campaign.brand.userId
    const influencerUserId = application.influencer.userId

    // Verify the current user is either the brand or the influencer
    if (userId !== brandUserId && userId !== influencerUserId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    // Check if conversation already exists
    const existing = await prisma.conversation.findUnique({
      where: { applicationId },
    })

    if (existing) {
      return NextResponse.json({ conversationId: existing.id })
    }

    // Create conversation with participants
    const conversation = await prisma.conversation.create({
      data: {
        applicationId,
        participants: {
          createMany: {
            data: [
              { userId: brandUserId },
              { userId: influencerUserId },
            ],
          },
        },
        messages: {
          create: {
            senderId: userId,
            content: 'Conversation started.',
            isSystemMessage: true,
          },
        },
      },
    })

    return NextResponse.json(
      { conversationId: conversation.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error starting conversation:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
