import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: View all applications for a campaign (brand only)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Check if campaign exists and user owns it
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        brand: true,
      },
    })

    if (!campaign) {
      return NextResponse.json({ message: 'Campaign not found' }, { status: 404 })
    }

    if (campaign.brand.userId !== userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: any = { campaignId: params.id }
    if (status) {
      where.status = status
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        influencer: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true,
              },
            },
            socialAccounts: {
              include: {
                platform: true,
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
      orderBy: {
        appliedAt: 'desc',
      },
    })

    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
