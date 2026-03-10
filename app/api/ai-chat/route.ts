import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const subscriptionTier = (session.user as any).subscriptionTier || 'FREE'
  if (subscriptionTier !== 'PRO') {
    return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 })
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
    return NextResponse.json({ content: reply })
  } catch (error: any) {
    console.error('AI Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
