import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

const MONTHLY_TOKEN_LIMIT = 150_000

const SYSTEM_PROMPT =
  'You are a helpful AI assistant for Overseed, a platform connecting brands with global creators and influencers. Help users with global expansion strategies, market insights, creator collaboration advice, and platform-related questions. Be concise, friendly, and professional.'

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

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthlyUsage = await prisma.aiTokenUsage.aggregate({
    where: { userId, createdAt: { gte: startOfMonth } },
    _sum: { totalTokens: true },
  })

  const usedTokens = monthlyUsage._sum.totalTokens || 0
  if (usedTokens >= MONTHLY_TOKEN_LIMIT) {
    return NextResponse.json(
      { error: 'Monthly AI token limit reached (150k tokens). Resets next month.' },
      { status: 429 }
    )
  }

  const { messages, provider, chatId } = await req.json()
  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'Messages are required' }, { status: 400 })
  }

  const useProvider = provider === 'claude' ? 'claude' : 'openai'

  try {
    // Get or create chat for history
    let activeChatId = chatId
    if (!activeChatId) {
      const chat = await prisma.aiChat.create({
        data: { userId, provider: useProvider },
      })
      activeChatId = chat.id
    }

    // Save user message
    const lastUserMessage = messages[messages.length - 1]
    if (lastUserMessage?.role === 'user') {
      await prisma.aiChatMessage.create({
        data: { chatId: activeChatId, role: 'user', content: lastUserMessage.content },
      })
      if (messages.filter((m: any) => m.role === 'user').length === 1) {
        const title = lastUserMessage.content.slice(0, 80) + (lastUserMessage.content.length > 80 ? '...' : '')
        await prisma.aiChat.update({ where: { id: activeChatId }, data: { title } })
      }
    }

    // Stream response
    const encoder = new TextEncoder()
    let fullContent = ''
    let totalTokens = 0
    let promptTokens = 0
    let completionTokens = 0
    const model = useProvider === 'claude' ? 'claude-sonnet-4-6-20250620' : 'gpt-5.4'

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send chatId as first event
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'meta', chatId: activeChatId })}\n\n`))

          if (useProvider === 'claude') {
            const client = new Anthropic({ apiKey: process.env.CLAUDE_API })
            const response = await client.messages.create({
              model: 'claude-sonnet-4-6-20250620',
              max_tokens: 16384,
              system: SYSTEM_PROMPT,
              stream: true,
              messages: messages.map((m: any) => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
              })),
            })

            for await (const event of response) {
              if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                const text = event.delta.text
                fullContent += text
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', text })}\n\n`))
              }
              if (event.type === 'message_delta' && event.usage) {
                completionTokens = event.usage.output_tokens
              }
              if (event.type === 'message_start' && event.message.usage) {
                promptTokens = event.message.usage.input_tokens
              }
            }
            totalTokens = promptTokens + completionTokens
          } else {
            const client = new OpenAI({ apiKey: process.env.CHAT_API })
            const response = await client.chat.completions.create({
              model: 'gpt-5.4',
              messages: [
                { role: 'system' as const, content: SYSTEM_PROMPT },
                ...messages.map((m: any) => ({
                  role: m.role as 'user' | 'assistant',
                  content: m.content,
                })),
              ],
              max_tokens: 16384,
              stream: true,
              stream_options: { include_usage: true },
            })

            for await (const chunk of response) {
              const text = chunk.choices[0]?.delta?.content
              if (text) {
                fullContent += text
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', text })}\n\n`))
              }
              if (chunk.usage) {
                promptTokens = chunk.usage.prompt_tokens
                completionTokens = chunk.usage.completion_tokens
                totalTokens = chunk.usage.total_tokens
              }
            }
          }

          // Save assistant reply and update chat
          await prisma.aiChatMessage.create({
            data: { chatId: activeChatId, role: 'assistant', content: fullContent },
          })
          await prisma.aiChat.update({
            where: { id: activeChatId },
            data: { updatedAt: new Date() },
          })

          if (totalTokens > 0) {
            await prisma.aiTokenUsage.create({
              data: { userId, promptTokens, completionTokens, totalTokens, model },
            })
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
          controller.close()
        } catch (error: any) {
          console.error('AI stream error:', error?.message || error)
          const isAuthError = error?.message?.includes('authentication') || error?.message?.includes('apiKey') || error?.message?.includes('API key')
          const userMessage = isAuthError
            ? 'AI service is temporarily unavailable. Please try a different model or try again later.'
            : 'Something went wrong. Please try again.'
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: userMessage })}\n\n`)
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('AI Chat error:', error?.message || error)
    return NextResponse.json({ error: error?.message || 'Failed to generate response' }, { status: 500 })
  }
}
