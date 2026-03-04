import { getOpenAIClient } from './openai'
import fs from 'fs'
import path from 'path'

export interface AnalysisResult {
  username?: string
  followerCount?: number
  followingCount?: number
  likesCount?: number
  postsCount?: number
  engagementRate?: number
  bio?: string
  platform?: string
  confidence: 'high' | 'medium' | 'low'
  rawText?: string
}

function parseHumanNumber(value: string | number | undefined | null): number | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'number') return value

  const str = String(value).trim().replace(/,/g, '')
  const match = str.match(/^([\d.]+)\s*([KkMmBb])?$/i)
  if (!match) return undefined

  const num = parseFloat(match[1])
  if (isNaN(num)) return undefined

  const suffix = (match[2] || '').toUpperCase()
  switch (suffix) {
    case 'K': return Math.round(num * 1_000)
    case 'M': return Math.round(num * 1_000_000)
    case 'B': return Math.round(num * 1_000_000_000)
    default: return Math.round(num)
  }
}

async function getImageContent(imageUrl: string): Promise<{
  type: 'image_url'
  image_url: { url: string }
}> {
  // Local file: read as base64
  if (imageUrl.startsWith('/uploads/')) {
    const filePath = path.join(process.cwd(), 'public', imageUrl)
    const buffer = fs.readFileSync(filePath)
    const ext = path.extname(filePath).slice(1).toLowerCase()
    const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`
    const base64 = buffer.toString('base64')
    return {
      type: 'image_url',
      image_url: { url: `data:${mimeType};base64,${base64}` },
    }
  }

  // S3 proxy URL: read via internal fetch or directly from S3
  if (imageUrl.startsWith('/api/s3-image/')) {
    const s3Key = imageUrl.replace('/api/s3-image/', '')
    const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3')
    const s3 = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
    const response = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: s3Key,
      })
    )
    const bodyBytes = await response.Body!.transformToByteArray()
    const base64 = Buffer.from(bodyBytes).toString('base64')
    const contentType = response.ContentType || 'image/jpeg'
    return {
      type: 'image_url',
      image_url: { url: `data:${contentType};base64,${base64}` },
    }
  }

  // External URL: pass directly
  return {
    type: 'image_url',
    image_url: { url: imageUrl },
  }
}

export async function analyzeScreenshot(
  imageUrl: string,
  platform: string
): Promise<AnalysisResult> {
  const openai = getOpenAIClient()
  const imageContent = await getImageContent(imageUrl)

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are analyzing a social media profile screenshot. Extract the following information:
- username (the handle/username visible on the profile)
- followerCount (number of followers, e.g., "12.5K" means 12500)
- followingCount (number following)
- likesCount (total likes if shown)
- postsCount (number of posts)
- engagementRate (if displayed, as a percentage number)
- bio (the bio/description text)
- platform (detected platform name)

Platform hint: ${platform}

Return ONLY valid JSON with these fields. Use null for fields you cannot determine.
For numeric values, return the raw string as shown (e.g., "12.5K", "1.2M") — they will be parsed separately.
Also include a "confidence" field: "high" if the screenshot clearly shows a profile page, "medium" if partially visible, "low" if unclear.
Include a "rawText" field with all visible text on the screenshot.`,
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Please analyze this social media profile screenshot and extract the profile data.' },
          imageContent,
        ],
      },
    ],
    max_tokens: 1000,
  })

  const content = response.choices[0]?.message?.content || '{}'

  // Extract JSON from the response (handle markdown code blocks)
  let jsonStr = content
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    jsonStr = jsonMatch[1]
  }

  let parsed: Record<string, any>
  try {
    parsed = JSON.parse(jsonStr.trim())
  } catch {
    return {
      confidence: 'low',
      rawText: content,
    }
  }

  return {
    username: parsed.username || undefined,
    followerCount: parseHumanNumber(parsed.followerCount),
    followingCount: parseHumanNumber(parsed.followingCount),
    likesCount: parseHumanNumber(parsed.likesCount),
    postsCount: parseHumanNumber(parsed.postsCount),
    engagementRate: parsed.engagementRate != null ? parseFloat(String(parsed.engagementRate)) || undefined : undefined,
    bio: parsed.bio || undefined,
    platform: parsed.platform || platform,
    confidence: (['high', 'medium', 'low'].includes(parsed.confidence) ? parsed.confidence : 'medium') as 'high' | 'medium' | 'low',
    rawText: parsed.rawText || undefined,
  }
}
