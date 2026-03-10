import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'

const client = new OpenAI({ apiKey: process.env.CHAT_API })

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { text, targetLanguage } = await req.json()

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { message: 'text and targetLanguage are required' },
        { status: 400 }
      )
    }

    const langName = targetLanguage === 'zh' ? 'Chinese (Simplified)' : 'English'

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a translator. Translate the following message to ${langName}. Only return the translated text, nothing else. If the text is already in ${langName}, return it as-is.`,
        },
        { role: 'user', content: text },
      ],
      max_tokens: 1024,
    })

    const translated = completion.choices[0]?.message?.content || text

    return NextResponse.json({ translated })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { message: 'Translation failed' },
      { status: 500 }
    )
  }
}
