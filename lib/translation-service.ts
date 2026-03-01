/**
 * Translation Service
 *
 * Provides automatic translation for database content.
 * Uses Google Translate API or falls back to simple dictionary-based translation.
 */

import { prisma } from './prisma'
import {
  SupportedLanguage,
  TRANSLATABLE_FIELDS,
  TranslatableEntity,
  addTranslation
} from './db/translations'

// ===========================================
// TRANSLATION API
// ===========================================

/**
 * Translate text using Google Cloud Translation API
 * Set GOOGLE_TRANSLATE_API_KEY in your .env file
 */
async function googleTranslate(
  text: string,
  targetLang: string,
  sourceLang: string = 'en'
): Promise<string> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY

  if (!apiKey) {
    // Fall back to simple translation if no API key
    return simpleTranslate(text, targetLang, sourceLang)
  }

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
          format: 'text',
        }),
      }
    )

    const data = await response.json()

    if (data.data?.translations?.[0]?.translatedText) {
      return data.data.translations[0].translatedText
    }

    return text
  } catch (error) {
    console.error('Google Translate error:', error)
    return simpleTranslate(text, targetLang, sourceLang)
  }
}

/**
 * Simple dictionary-based translation for common terms
 * Used as fallback when API is not available
 */
const TRANSLATION_DICTIONARY: Record<string, Record<string, string>> = {
  // Campaign-related terms
  'Looking for': { zh: '正在寻找' },
  'influencers': { zh: '网红' },
  'creators': { zh: '创作者' },
  'to promote': { zh: '来推广' },
  'our': { zh: '我们的' },
  'products': { zh: '产品' },
  'brand': { zh: '品牌' },
  'campaign': { zh: '活动' },
  'collaboration': { zh: '合作' },
  'partnership': { zh: '合作伙伴关系' },
  'sponsored': { zh: '赞助' },
  'content': { zh: '内容' },
  'post': { zh: '帖子' },
  'video': { zh: '视频' },
  'story': { zh: '故事' },
  'reel': { zh: '短视频' },
  'beauty': { zh: '美妆' },
  'skincare': { zh: '护肤' },
  'fashion': { zh: '时尚' },
  'lifestyle': { zh: '生活方式' },
  'food': { zh: '美食' },
  'travel': { zh: '旅行' },
  'fitness': { zh: '健身' },
  'tech': { zh: '科技' },
  'gaming': { zh: '游戏' },
  'paid': { zh: '付费' },
  'gifted': { zh: '赠品' },
  'free': { zh: '免费' },
  'followers': { zh: '粉丝' },
  'engagement': { zh: '互动率' },
  'rate': { zh: '费率' },
  'compensation': { zh: '报酬' },
  'requirements': { zh: '要求' },
  'guidelines': { zh: '指南' },
  'deadline': { zh: '截止日期' },
  'apply': { zh: '申请' },
  'application': { zh: '申请' },
  'approved': { zh: '已批准' },
  'pending': { zh: '待处理' },
  'rejected': { zh: '已拒绝' },
  // Common phrases
  'We are looking for': { zh: '我们正在寻找' },
  'Join us': { zh: '加入我们' },
  'Share your': { zh: '分享您的' },
  'Create content': { zh: '创建内容' },
  'Must have': { zh: '必须有' },
  'at least': { zh: '至少' },
  'Instagram': { zh: 'Instagram' },
  'TikTok': { zh: 'TikTok' },
  'YouTube': { zh: 'YouTube' },
  'Twitter': { zh: 'Twitter' },
  'Facebook': { zh: 'Facebook' },
}

function simpleTranslate(
  text: string,
  targetLang: string,
  _sourceLang: string = 'en'
): string {
  if (targetLang === 'en' || !text) return text

  let result = text

  // Sort by length (longest first) to avoid partial replacements
  const sortedTerms = Object.keys(TRANSLATION_DICTIONARY).sort(
    (a, b) => b.length - a.length
  )

  for (const term of sortedTerms) {
    const translation = TRANSLATION_DICTIONARY[term][targetLang]
    if (translation) {
      // Case-insensitive replacement
      const regex = new RegExp(term, 'gi')
      result = result.replace(regex, translation)
    }
  }

  return result
}

// ===========================================
// MAIN TRANSLATION FUNCTION
// ===========================================

/**
 * Translate text to target language
 */
export async function translateText(
  text: string,
  targetLang: SupportedLanguage,
  sourceLang: SupportedLanguage = 'en'
): Promise<string> {
  if (!text || targetLang === sourceLang) return text
  return googleTranslate(text, targetLang, sourceLang)
}

/**
 * Translate multiple texts at once
 */
export async function translateTexts(
  texts: string[],
  targetLang: SupportedLanguage,
  sourceLang: SupportedLanguage = 'en'
): Promise<string[]> {
  if (targetLang === sourceLang) return texts

  return Promise.all(
    texts.map((text) => translateText(text, targetLang, sourceLang))
  )
}

// ===========================================
// AUTO-TRANSLATE AND STORE
// ===========================================

/**
 * Auto-translate an entity's fields and store in database
 */
export async function autoTranslateEntity(
  entityType: TranslatableEntity,
  entityId: string,
  originalData: Record<string, unknown>,
  originalLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): Promise<void> {
  if (originalLanguage === targetLanguage) return

  const fields = TRANSLATABLE_FIELDS[entityType]

  for (const field of fields) {
    const originalText = originalData[field]
    if (typeof originalText === 'string' && originalText.trim()) {
      // Check if translation already exists
      const existing = await prisma.translation.findUnique({
        where: {
          entityType_entityId_fieldName_languageCode: {
            entityType,
            entityId,
            fieldName: field,
            languageCode: targetLanguage,
          },
        },
      })

      if (!existing) {
        const translatedText = await translateText(
          originalText,
          targetLanguage,
          originalLanguage
        )

        await addTranslation({
          entityType,
          entityId,
          fieldName: field,
          languageCode: targetLanguage,
          content: translatedText,
          isAutoTranslated: true,
        })
      }
    }
  }
}

/**
 * Auto-translate multiple entities
 */
export async function autoTranslateEntities(
  entityType: TranslatableEntity,
  entities: Array<{ id: string; originalLanguage?: string } & Record<string, unknown>>,
  targetLanguage: SupportedLanguage
): Promise<void> {
  for (const entity of entities) {
    const originalLang = (entity.originalLanguage || 'en') as SupportedLanguage
    await autoTranslateEntity(
      entityType,
      entity.id,
      entity,
      originalLang,
      targetLanguage
    )
  }
}

// ===========================================
// GET TRANSLATED CONTENT
// ===========================================

/**
 * Get entity with translations, auto-translating if needed
 */
export async function getTranslatedEntity<T extends { id: string; originalLanguage?: string }>(
  entityType: TranslatableEntity,
  entity: T,
  targetLanguage: SupportedLanguage
): Promise<T> {
  const originalLang = (entity.originalLanguage || 'en') as SupportedLanguage

  if (originalLang === targetLanguage) {
    return entity
  }

  const fields = TRANSLATABLE_FIELDS[entityType]

  // Get existing translations
  const translations = await prisma.translation.findMany({
    where: {
      entityType,
      entityId: entity.id,
      languageCode: targetLanguage,
      fieldName: { in: [...fields] },
    },
  })

  const translationMap = new Map(
    translations.map((t) => [t.fieldName, t.content])
  )

  // Check which fields need auto-translation
  const missingFields: string[] = []
  for (const field of fields) {
    if (!translationMap.has(field) && (entity as Record<string, unknown>)[field]) {
      missingFields.push(field)
    }
  }

  // Auto-translate missing fields
  if (missingFields.length > 0) {
    for (const field of missingFields) {
      const originalText = (entity as Record<string, unknown>)[field]
      if (typeof originalText === 'string' && originalText.trim()) {
        const translatedText = await translateText(
          originalText,
          targetLanguage,
          originalLang
        )

        await addTranslation({
          entityType,
          entityId: entity.id,
          fieldName: field,
          languageCode: targetLanguage,
          content: translatedText,
          isAutoTranslated: true,
        })

        translationMap.set(field, translatedText)
      }
    }
  }

  // Apply translations to entity
  const result = { ...entity }
  for (const [field, content] of translationMap) {
    if (field in result) {
      (result as Record<string, unknown>)[field] = content
    }
  }

  return result
}

/**
 * Get multiple entities with translations
 */
export async function getTranslatedEntities<T extends { id: string; originalLanguage?: string }>(
  entityType: TranslatableEntity,
  entities: T[],
  targetLanguage: SupportedLanguage
): Promise<T[]> {
  if (entities.length === 0) return []

  // Batch get all existing translations
  const entityIds = entities.map((e) => e.id)
  const fields = TRANSLATABLE_FIELDS[entityType]

  const allTranslations = await prisma.translation.findMany({
    where: {
      entityType,
      entityId: { in: entityIds },
      languageCode: targetLanguage,
      fieldName: { in: [...fields] },
    },
  })

  // Group translations by entity ID
  const translationsByEntity = new Map<string, Map<string, string>>()
  for (const t of allTranslations) {
    if (!translationsByEntity.has(t.entityId)) {
      translationsByEntity.set(t.entityId, new Map())
    }
    translationsByEntity.get(t.entityId)!.set(t.fieldName, t.content)
  }

  // Process each entity
  const results: T[] = []

  for (const entity of entities) {
    const originalLang = (entity.originalLanguage || 'en') as SupportedLanguage

    if (originalLang === targetLanguage) {
      results.push(entity)
      continue
    }

    const entityTranslations = translationsByEntity.get(entity.id) || new Map()

    // Check for missing translations and auto-translate
    for (const field of fields) {
      const originalText = (entity as Record<string, unknown>)[field]
      if (
        typeof originalText === 'string' &&
        originalText.trim() &&
        !entityTranslations.has(field)
      ) {
        const translatedText = await translateText(
          originalText,
          targetLanguage,
          originalLang
        )

        await addTranslation({
          entityType,
          entityId: entity.id,
          fieldName: field,
          languageCode: targetLanguage,
          content: translatedText,
          isAutoTranslated: true,
        })

        entityTranslations.set(field, translatedText)
      }
    }

    // Apply translations
    const result = { ...entity }
    for (const [field, content] of entityTranslations) {
      if (field in result) {
        (result as Record<string, unknown>)[field] = content
      }
    }

    results.push(result)
  }

  return results
}
