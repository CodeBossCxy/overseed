import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: Get current user's profile
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const userType = (session.user as any).userType

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        influencerProfile: {
          include: {
            socialAccounts: {
              include: {
                platform: true,
              },
            },
          },
        },
        brandProfile: {
          include: {
            campaigns: {
              select: {
                id: true,
                title: true,
                status: true,
              },
              take: 5,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        agencyProfile: true,
      },
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH: Update current user's profile
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const userType = (session.user as any).userType
    const data = await req.json()

    // Update user basic info
    if (data.name !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: data.name },
      })
    }

    // Update influencer profile
    if (data.influencerProfile) {
      const profileData = data.influencerProfile
      await prisma.influencerProfile.upsert({
        where: { userId },
        update: {
          displayName: profileData.displayName,
          bio: profileData.bio,
          locationCity: profileData.locationCity,
          locationState: profileData.locationState,
          locationCountry: profileData.locationCountry,
          primaryNiche: profileData.primaryNiche,
          secondaryNiches: profileData.secondaryNiches,
          languages: profileData.languages,
        },
        create: {
          userId,
          displayName: profileData.displayName,
          bio: profileData.bio,
          locationCity: profileData.locationCity,
          locationState: profileData.locationState,
          locationCountry: profileData.locationCountry,
          primaryNiche: profileData.primaryNiche,
          secondaryNiches: profileData.secondaryNiches || [],
          languages: profileData.languages || [],
        },
      })
    }

    // Update brand profile
    if (data.brandProfile) {
      const profileData = data.brandProfile
      await prisma.brandProfile.upsert({
        where: { userId },
        update: {
          companyName: profileData.companyName,
          description: profileData.description,
          websiteUrl: profileData.websiteUrl,
          logoUrl: profileData.logoUrl,
          industry: profileData.industry,
          companySize: profileData.companySize,
          contactName: profileData.contactName,
          contactEmail: profileData.contactEmail,
          contactPhone: profileData.contactPhone,
        },
        create: {
          userId,
          companyName: profileData.companyName,
          description: profileData.description,
          websiteUrl: profileData.websiteUrl,
          logoUrl: profileData.logoUrl,
          industry: profileData.industry,
          companySize: profileData.companySize,
          contactName: profileData.contactName,
          contactEmail: profileData.contactEmail,
          contactPhone: profileData.contactPhone,
        },
      })
    }

    // Fetch updated user
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        influencerProfile: {
          include: {
            socialAccounts: {
              include: {
                platform: true,
              },
            },
          },
        },
        brandProfile: true,
        agencyProfile: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
