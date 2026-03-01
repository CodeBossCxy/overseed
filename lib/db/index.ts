/**
 * Database Utilities
 *
 * Re-exports all database helpers and types.
 * Import from '@/lib/db' for cleaner imports.
 */

// Translation utilities
export {
  // Configuration
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  TRANSLATABLE_FIELDS,
  // Type guards
  isSupportedLanguage,
  getLanguageFromHeader,
  getTranslatableFields,
  // Core functions
  addTranslation,
  addTranslations,
  getTranslations,
  getManyTranslations,
  deleteTranslations,
  // High-level helpers
  applyTranslations,
  applyManyTranslations,
  // Post-specific helpers
  createPostWithTranslations,
  getPostWithTranslation,
  getPostsWithTranslation,
} from './translations'

// Types
export type {
  SupportedLanguage,
  TranslatableEntity,
  TranslationMeta,
  WithTranslationMeta,
  AddTranslationParams,
  GetTranslationsParams,
  GetManyTranslationsParams,
} from './translations'

export type {
  PostWithTranslation,
  PostWithAuthor,
  CreatePostInput,
  CreatorProfileWithTranslation,
  CreateCreatorProfileInput,
  BrandProfileWithTranslation,
  CreateBrandProfileInput,
  TranslatedResponse,
  PaginationMeta,
  PaginatedTranslatedResponse,
} from './types'
