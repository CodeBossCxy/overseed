import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  let event: Stripe.Event

  try {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')

    if (!sig) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 },
      )
    }

    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (error: any) {
    console.error('[Stripe Webhook] Signature verification failed:', error.message)
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${error.message}` },
      { status: 400 },
    )
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const stripePaymentIntentId = paymentIntent.id

        // Only update if this is a campaign payment (not a subscription)
        const payment = await prisma.payment.findUnique({
          where: { stripePaymentIntentId },
        })

        if (payment) {
          await prisma.payment.update({
            where: { stripePaymentIntentId },
            data: {
              status: 'HELD',
              paidAt: new Date(),
            },
          })
          console.log(`[Stripe Webhook] Payment ${stripePaymentIntentId} marked as HELD`)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const stripePaymentIntentId = paymentIntent.id

        const failedPayment = await prisma.payment.findUnique({
          where: { stripePaymentIntentId },
        })

        if (failedPayment) {
          await prisma.payment.update({
            where: { stripePaymentIntentId },
            data: { status: 'FAILED' },
          })
          console.log(`[Stripe Webhook] Payment ${stripePaymentIntentId} marked as FAILED`)
        }
        break
      }

      case 'checkout.session.completed': {
        const checkoutSession = event.data.object as Stripe.Checkout.Session

        // Subscription upgrade — update user to PRO
        if (checkoutSession.mode === 'subscription' && checkoutSession.metadata?.userId) {
          await prisma.user.update({
            where: { id: checkoutSession.metadata.userId },
            data: { subscriptionTier: 'PRO' },
          })

          console.log(`[Stripe Webhook] User ${checkoutSession.metadata.userId} upgraded to PRO`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        // Subscription cancelled — downgrade to FREE
        const subscription = event.data.object as Stripe.Subscription
        const customer = await stripe.customers.retrieve(subscription.customer as string)
        const userId = (customer as Stripe.Customer).metadata?.userId

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: { subscriptionTier: 'FREE' },
          })

          console.log(`[Stripe Webhook] User ${userId} downgraded to FREE`)
        }
        break
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account

        if (account.charges_enabled) {
          await prisma.influencerProfile.updateMany({
            where: { stripeConnectId: account.id },
            data: { stripeOnboardingComplete: true },
          })

          console.log(`[Stripe Webhook] Account ${account.id} onboarding complete`)
        }
        break
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`)
    }
  } catch (error: any) {
    console.error(`[Stripe Webhook] Error handling ${event.type}:`, error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    )
  }

  return NextResponse.json({ received: true })
}
