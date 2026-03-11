import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const MONTHLY_TOKEN_LIMIT = 150_000

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as any).id
  const subscriptionTier = (session.user as any).subscriptionTier || 'FREE'
  if (subscriptionTier !== 'PRO') {
    return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 })
  }

  // Check monthly token usage
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthlyUsage = await prisma.aiTokenUsage.aggregate({
    where: {
      userId,
      createdAt: { gte: startOfMonth },
    },
    _sum: { totalTokens: true },
  })

  const usedTokens = monthlyUsage._sum.totalTokens || 0
  if (usedTokens >= MONTHLY_TOKEN_LIMIT) {
    return NextResponse.json(
      { error: 'Monthly AI token limit reached (150k tokens). Resets next month.' },
      { status: 429 }
    )
  }

  const { messages } = await req.json()
  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'Messages are required' }, { status: 400 })
  }

  const client = new OpenAI({
    apiKey: process.env.CHAT_API,
  })

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful AI assistant for Overseed, a platform connecting brands with global creators and influencers. Help users with global expansion strategies, market insights, creator collaboration advice, and platform-related questions. Be concise, friendly, and professional.',
        },
        ...messages,
      ],
      max_tokens: 1024,
    })

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    // Log token usage
    const usage = completion.usage
    if (usage) {
      await prisma.aiTokenUsage.create({
        data: {
          userId,
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
          model: 'gpt-4o-mini',
        },
      })
    }

    return NextResponse.json({ content: reply })
  } catch (error: any) {
    console.error('AI Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
