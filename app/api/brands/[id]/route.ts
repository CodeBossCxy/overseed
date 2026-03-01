import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Public brand profile
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const brand = await prisma.brandProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            createdAt: true,
          },
        },
        campaigns: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            categories: {
              include: {
                category: true,
              },
            },
            platforms: {
              include: {
                platform: true,
              },
            },
            _count: {
              select: {
                applications: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            campaigns: true,
          },
        },
      },
    })

    if (!brand) {
      return NextResponse.json({ message: 'Brand not found' }, { status: 404 })
    }

    // Get total completed collaborations
    const completedCollaborations = await prisma.application.count({
      where: {
        campaign: {
          brandId: id,
        },
        status: 'COMPLETED',
      },
    })

    return NextResponse.json({
      ...brand,
      completedCollaborations,
    })
  } catch (error) {
    console.error('Error fetching brand profile:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
