# Multilingual Database Architecture

This document explains how to manage multilingual content in the Overseed database.

## Overview

Overseed supports multiple languages (currently English `en` and Chinese `zh`). User-generated content like posts, profiles, and descriptions need to be available in multiple languages.

### Design Principles

1. **Separation of concerns**: Translatable text is stored separately from non-translatable data
2. **Original language preserved**: The original content is stored in the main table with `originalLanguage` field
3. **Scalable**: Adding new languages requires no schema changes
4. **Queryable**: Translations can be efficiently queried by language code
5. **Flexible**: Each translatable field can have its own translation

---

## Architecture

### The Translation Table Pattern

Instead of adding columns like `titleEn`, `titleCn`, we use a separate `Translation` table:

```
┌─────────────────┐         ┌─────────────────────────┐
│     Post        │         │     Translation         │
├─────────────────┤         ├─────────────────────────┤
│ id              │◄────────│ entityId                │
│ title           │         │ entityType ("Post")     │
│ description     │         │ fieldName ("title")     │
│ originalLanguage│         │ languageCode ("en")     │
│ ...             │         │ content (translated)    │
└─────────────────┘         └─────────────────────────┘
```

### Supported Languages

| Code | Language | Description |
|------|----------|-------------|
| `en` | English  | Primary language for US/EU markets |
| `zh` | Chinese  | Primary language for China market |

To add a new language, simply use a new language code (e.g., `es`, `ja`, `ko`).

---

## Database Schema

### Translation Model

```prisma
model Translation {
  id           String   @id @default(cuid())
  entityType   String   // "Post", "CreatorProfile", "BrandProfile", etc.
  entityId     String   // ID of the translated entity
  fieldName    String   // "title", "description", "bio", etc.
  languageCode String   // "en", "zh", "es", etc.
  content      String   @db.Text
  isAutoTranslated Boolean @default(false) // True if machine-translated
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([entityType, entityId, fieldName, languageCode])
  @@index([entityType, entityId])
  @@index([languageCode])
}
```

### Translatable Fields by Entity

| Entity | Translatable Fields |
|--------|---------------------|
| `Post` | `title`, `description`, `deliverables` |
| `CreatorProfile` | `bio`, `preferences` |
| `BrandProfile` | `description` |

---

## Usage Guide

### Creating Content with Translation

When a user creates content:

```typescript
import { createWithTranslation } from '@/lib/db/translations'

// Chinese company creates a post in Chinese
const post = await createWithTranslation({
  model: 'post',
  data: {
    title: '寻找美妆博主合作',
    description: '我们是一家中国美妆品牌...',
    category: 'beauty',
    budgetType: 'FIXED',
    // ... other fields
  },
  originalLanguage: 'zh',
  translatableFields: ['title', 'description', 'deliverables'],
})
```

### Adding Translations

```typescript
import { addTranslation } from '@/lib/db/translations'

// Add English translation (manual or auto-translated)
await addTranslation({
  entityType: 'Post',
  entityId: post.id,
  fieldName: 'title',
  languageCode: 'en',
  content: 'Looking for Beauty Influencer Collaboration',
  isAutoTranslated: false, // true if machine-translated
})
```

### Fetching Content with Translation

```typescript
import { getWithTranslation } from '@/lib/db/translations'

// US influencer views post in English
const post = await getWithTranslation({
  model: 'post',
  id: postId,
  language: 'en', // Requested language
  translatableFields: ['title', 'description', 'deliverables'],
})

// Result includes translated fields:
// {
//   id: '...',
//   title: 'Looking for Beauty Influencer Collaboration', // English
//   description: 'We are a Chinese beauty brand...', // English
//   _originalLanguage: 'zh',
//   _translatedFields: ['title', 'description'],
// }
```

### Fetching Multiple Items

```typescript
import { getManyWithTranslation } from '@/lib/db/translations'

const posts = await getManyWithTranslation({
  model: 'post',
  where: { status: 'APPROVED' },
  language: 'en',
  translatableFields: ['title', 'description'],
})
```

---

## Translation Workflow

### Option 1: Auto-Translation (Recommended for MVP)

1. User creates content in their language
2. System auto-translates to other languages via API (Google Translate, DeepL)
3. Translations marked as `isAutoTranslated: true`
4. Users can later edit/improve translations

```typescript
import { autoTranslate } from '@/lib/db/translations'

// After post creation, auto-translate to all supported languages
await autoTranslate({
  entityType: 'Post',
  entityId: post.id,
  fields: ['title', 'description'],
  fromLanguage: 'zh',
  toLanguages: ['en'],
})
```

### Option 2: Manual Translation

1. User provides translations during content creation
2. Or translations are added later by translators

### Option 3: Hybrid

1. Auto-translate initially
2. Allow users to review and edit translations
3. Mark edited translations as `isAutoTranslated: false`

---

## API Conventions

### Language Header

Clients should send the preferred language in requests:

```
Accept-Language: en
// or
Accept-Language: zh
```

### API Response Format

Responses include translation metadata:

```json
{
  "id": "clx123",
  "title": "Looking for Beauty Influencer",
  "description": "We are a Chinese beauty brand...",
  "_meta": {
    "originalLanguage": "zh",
    "requestedLanguage": "en",
    "translatedFields": ["title", "description"],
    "autoTranslatedFields": ["description"]
  }
}
```

---

## Best Practices

### 1. Always Store Original Language

```typescript
// Good
const post = await prisma.post.create({
  data: {
    title: userInput.title,
    description: userInput.description,
    originalLanguage: userLocale, // 'zh' or 'en'
  }
})

// Bad - no original language tracked
const post = await prisma.post.create({
  data: {
    title: userInput.title,
    description: userInput.description,
  }
})
```

### 2. Use Helper Functions

Always use the translation helper functions instead of raw Prisma queries for translatable content:

```typescript
// Good
import { getWithTranslation } from '@/lib/db/translations'
const post = await getWithTranslation({ model: 'post', id, language: 'en' })

// Avoid for translatable content
const post = await prisma.post.findUnique({ where: { id } })
```

### 3. Handle Missing Translations Gracefully

The helper functions automatically fall back to original content if translation is missing:

```typescript
// If no English translation exists, returns Chinese original
const post = await getWithTranslation({ model: 'post', id, language: 'en' })
// post.title = '寻找美妆博主合作' (original Chinese, with _translatedFields = [])
```

### 4. Indicate Translation Status in UI

Show users when content is auto-translated:

```tsx
{post._meta?.autoTranslatedFields?.includes('description') && (
  <span className="text-sm text-gray-500">
    (Auto-translated)
  </span>
)}
```

---

## Adding New Translatable Fields

1. Add the field to the main model in `schema.prisma`
2. Update the `TRANSLATABLE_FIELDS` config in `lib/db/translations.ts`
3. Run migration: `npx prisma migrate dev`
4. Update API endpoints to handle the new field

```typescript
// lib/db/translations.ts
export const TRANSLATABLE_FIELDS = {
  Post: ['title', 'description', 'deliverables', 'newField'], // Add here
  CreatorProfile: ['bio', 'preferences'],
  BrandProfile: ['description'],
}
```

---

## Adding New Languages

No schema changes needed! Simply:

1. Add the language to `SUPPORTED_LANGUAGES` in `lib/db/translations.ts`
2. Add UI translations in `lib/i18n/translations.ts`
3. Start creating/translating content with the new language code

```typescript
// lib/db/translations.ts
export const SUPPORTED_LANGUAGES = ['en', 'zh', 'es'] as const // Add 'es'
```

---

## Migration from Column-per-Language

If you have existing data with `titleEn`, `titleCn` columns:

```typescript
// Migration script (run once)
import { prisma } from '@/lib/prisma'

async function migrateTranslations() {
  const posts = await prisma.post.findMany()

  for (const post of posts) {
    // Migrate English translations
    if (post.titleEn) {
      await prisma.translation.create({
        data: {
          entityType: 'Post',
          entityId: post.id,
          fieldName: 'title',
          languageCode: 'en',
          content: post.titleEn,
        }
      })
    }
    // ... repeat for other fields
  }
}
```

After migration, you can remove the old columns from the schema.

---

## Performance Considerations

1. **Indexes**: The Translation table has indexes on `(entityType, entityId)` and `languageCode` for fast lookups

2. **Batch Loading**: When fetching multiple items, translations are loaded in a single query:
   ```sql
   SELECT * FROM translations
   WHERE entity_type = 'Post'
   AND entity_id IN ('id1', 'id2', 'id3')
   AND language_code = 'en'
   ```

3. **Caching**: Consider caching frequently accessed translations (Redis, in-memory)

4. **Original Content**: Keeping original content in the main table means no join needed when displaying in original language
