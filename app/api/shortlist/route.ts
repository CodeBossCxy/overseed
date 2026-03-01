import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = await req.json()

    if (!postId) {
      return NextResponse.json({ message: 'Post ID is required' }, { status: 400 })
    }

    // Create shortlist entry
    const shortlist = await prisma.shortlist.create({
      data: {
        userId: (session.user as any).id,
        postId,
      },
    })

    return NextResponse.json(shortlist, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Post already saved' },
        { status: 400 }
      )
    }
    console.error('Error creating shortlist:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = await req.json()

    if (!postId) {
      return NextResponse.json({ message: 'Post ID is required' }, { status: 400 })
    }

    // Delete shortlist entry
    await prisma.shortlist.delete({
      where: {
        userId_postId: {
          userId: (session.user as any).id,
          postId,
        },
      },
    })

    return NextResponse.json({ message: 'Removed from shortlist' })
  } catch (error) {
    console.error('Error deleting shortlist:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const shortlists = await prisma.shortlist.findMany({
      where: {
        userId: (session.user as any).id,
      },
      include: {
        post: {
          include: {
            author: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(shortlists)
  } catch (error) {
    console.error('Error fetching shortlist:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
