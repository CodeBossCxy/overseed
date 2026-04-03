export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const userType = (session.user as any).userType

    if (userType !== 'INFLUENCER') {
      return NextResponse.json(
        { error: 'Only influencers can connect Stripe accounts' },
        { status: 403 },
      )
    }

    const influencer = await prisma.influencerProfile.findUnique({
      where: { userId },
      include: { user: { select: { email: true } } },
    })

    if (!influencer) {
      return NextResponse.json(
        { error: 'Influencer profile not found' },
        { status: 404 },
      )
    }

    // If already has a Connect account, check if onboarding is done
    if (influencer.stripeConnectId) {
      const account = await stripe.accounts.retrieve(influencer.stripeConnectId)

      if (account.charges_enabled) {
        // Onboarding complete — mark it and return a dashboard link
        await prisma.influencerProfile.update({
          where: { id: influencer.id },
          data: { stripeOnboardingComplete: true },
        })

        const loginLink = await stripe.accounts.createLoginLink(
          influencer.stripeConnectId,
        )

        return NextResponse.json({ url: loginLink.url })
      }

      // Onboarding not yet complete — generate a new account link
      const accountLink = await stripe.accountLinks.create({
        account: influencer.stripeConnectId,
        refresh_url: `${process.env.NEXTAUTH_URL}/dashboard/influencer?stripe=refresh`,
        return_url: `${process.env.NEXTAUTH_URL}/dashboard/influencer?stripe=complete`,
        type: 'account_onboarding',
      })

      return NextResponse.json({ url: accountLink.url })
    }

    // Create a new Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: 'express',
      email: influencer.user.email,
      metadata: { userId, influencerId: influencer.id },
    })

    // Save the Connect account ID
    await prisma.influencerProfile.update({
      where: { id: influencer.id },
      data: { stripeConnectId: account.id },
    })

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXTAUTH_URL}/dashboard/influencer?stripe=refresh`,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/influencer?stripe=complete`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error: any) {
    console.error('[Stripe Connect]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    )
  }
}
