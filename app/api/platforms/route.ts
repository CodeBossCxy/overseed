import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: List all platforms
export async function GET(req: NextRequest) {
  try {
    const platforms = await prisma.platform.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
    })

    return NextResponse.json(platforms)
  } catch (error) {
    console.error('Error fetching platforms:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
