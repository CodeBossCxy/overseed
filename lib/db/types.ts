/**
 * Database Type Definitions
 *
 * Centralized types for database operations, especially multilingual content.
 */

import type { Campaign, InfluencerProfile, BrandProfile, Application } from '@prisma/client'
import type { SupportedLanguage, TranslationMeta } from './translations'

// ===========================================
// CAMPAIGN TYPES
// ===========================================

/**
 * Campaign with translation metadata
 */
export type CampaignWithTranslation = Campaign & {
  _meta?: TranslationMeta
}

/**
 * Campaign with brand info and translation metadata
 */
export type CampaignWithBrand = Campaign & {
  brand: {
    id: string
    companyName: string | null
    logoUrl: string | null
    isVerified: boolean
  }
  categories?: Array<{
    category: {
      id: number
      name: string
      slug: string
    }
  }>
  platforms?: Array<{
    platform: {
      id: number
      name: string
      slug: string
    }
  }>
  _count?: {
    applications: number
  }
  _meta?: TranslationMeta
}

/**
 * Input for creating a campaign with translations
 */
export interface CreateCampaignInput {
  brandId: string
  originalLanguage: SupportedLanguage
  title: string
  description?: string
  compensationType: 'PAID' | 'GIFTED' | 'PAID_PLUS_GIFT' | 'AFFILIATE' | 'NEGOTIABLE'
  paymentMin?: number
  paymentMax?: number
  giftDescription?: string
  giftValue?: number
  totalSlots?: number
  deadline?: Date
  campaignStartDate?: Date
  campaignEndDate?: Date
  contentType?: 'IMAGE_POST' | 'VIDEO' | 'STORY' | 'REEL' | 'ANY'
  contentGuidelines?: string
  hashtagsRequired?: string
  mentionsRequired?: string
  categoryIds?: number[]
  platformIds?: number[]
  followerRequirements?: Array<{
    platformId: number
    minFollowers: number
    maxFollowers?: number
    minEngagementRate?: number
  }>
  images?: string[]
  // Optional translations
  translations?: {
    languageCode: SupportedLanguage
    title?: string
    description?: string
    contentGuidelines?: string
  }[]
}

// ===========================================
// INFLUENCER PROFILE TYPES
// ===========================================

/**
 * Influencer profile with translation metadata
 */
export type InfluencerProfileWithTranslation = InfluencerProfile & {
  _meta?: TranslationMeta
}

/**
 * Influencer profile with social accounts
 */
export type InfluencerProfileWithAccounts = InfluencerProfile & {
  user: {
    name: string | null
    image: string | null
  }
  socialAccounts: Array<{
    id: string
    platform: {
      name: string
      slug: string
    }
    username: string
    followerCount: number
    engagementRate: number | null
  }>
  _meta?: TranslationMeta
}

/**
 * Input for creating/updating influencer profile with translations
 */
export interface CreateInfluencerProfileInput {
  userId: string
  originalLanguage: SupportedLanguage
  displayName?: string
  bio?: string
  locationCity?: string
  locationState?: string
  locationCountry?: string
  primaryNiche?: string
  secondaryNiches?: string[]
  languages?: string[]
  // Optional translations
  translations?: {
    languageCode: SupportedLanguage
    bio?: string
  }[]
}

// ===========================================
// BRAND PROFILE TYPES
// ===========================================

/**
 * Brand profile with translation metadata
 */
export type BrandProfileWithTranslation = BrandProfile & {
  _meta?: TranslationMeta
}

/**
 * Brand profile with campaigns
 */
export type BrandProfileWithCampaigns = BrandProfile & {
  campaigns: Array<{
    id: string
    title: string
    status: string
    _count: {
      applications: number
    }
  }>
  _count: {
    campaigns: number
  }
  _meta?: TranslationMeta
}

/**
 * Input for creating/updating brand profile with translations
 */
export interface CreateBrandProfileInput {
  userId: string
  originalLanguage: SupportedLanguage
  companyName?: string
  websiteUrl?: string
  description?: string
  logoUrl?: string
  industry?: string
  companySize?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  // Optional translations
  translations?: {
    languageCode: SupportedLanguage
    description?: string
  }[]
}

// ===========================================
// APPLICATION TYPES
// ===========================================

/**
 * Application with campaign and influencer info
 */
export type ApplicationWithDetails = Application & {
  campaign: CampaignWithBrand
  influencer: InfluencerProfileWithAccounts
  socialAccount?: {
    id: string
    platform: {
      name: string
    }
    username: string
    followerCount: number
  } | null
}

// ===========================================
// API REQUEST/RESPONSE TYPES
// ===========================================

/**
 * Standard API response with translation info
 */
export interface TranslatedResponse<T> {
  data: T
  meta: {
    originalLanguage: string
    requestedLanguage: string
    translatedFields: string[]
    autoTranslatedFields: string[]
  }
}

/**
 * Pagination info for list endpoints
 */
export interface PaginationMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Paginated response with translation info
 */
export interface PaginatedTranslatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
  meta: {
    requestedLanguage: string
  }
}

// ===========================================
// FILTER TYPES
// ===========================================

export interface CampaignFilters {
  category?: string
  platform?: string
  compensationType?: string
  minFollowers?: number
  maxFollowers?: number
  status?: string
}

export interface ApplicationFilters {
  status?: string
  campaignId?: string
  influencerId?: string
}
