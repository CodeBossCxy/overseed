# Internationalization (i18n) Guide for Overseed

The Chinese language option is now fully functional! This guide explains how the i18n system works and how to add translations to other pages.

## How It Works

The i18n system uses:
- **LanguageContext**: A React context that manages the current language state
- **translations.ts**: Contains all translations for English and Chinese
- **useLanguage hook**: Provides access to translations and language switching

## Current Implementation

### ✅ Already Translated Pages/Components:
- **Header** - Navigation, auth buttons, language switcher
- **Footer** - All footer links and text
- **Home Page** - Hero section, search, filters, announcements, latest posts

### Language Switcher
The language switcher in the header allows users to toggle between English (EN) and Chinese (中文). The selected language is saved to localStorage and persists across sessions.

## How to Add Translations to Other Pages

### Step 1: Add Translations to translations.ts

Open `lib/i18n/translations.ts` and add your new keys:

```typescript
export const translations = {
  en: {
    // ... existing translations
    browse: {
      title: 'Browse Opportunities',
      subtitle: 'Find the perfect collaboration for you',
      noResults: 'No posts match your filters',
      clearFilters: 'Clear all filters',
      sortBy: 'Sort by:',
      opportunities: 'opportunities found',
    },
  },
  zh: {
    // ... existing translations
    browse: {
      title: '浏览机会',
      subtitle: '找到最适合你的合作',
      noResults: '没有符合条件的信息',
      clearFilters: '清除所有筛选',
      sortBy: '排序：',
      opportunities: '个机会',
    },
  },
}
```

### Step 2: Create a Client Component

Since the `useLanguage` hook requires a client component, create a client wrapper:

**Example: `components/BrowsePage.tsx`**

```typescript
'use client'

import { useLanguage } from '@/lib/i18n/LanguageContext'
import Link from 'next/link'

export default function BrowsePage({ posts }: { posts: any[] }) {
  const { t } = useLanguage()

  return (
    <div>
      <h1>{t.browse.title}</h1>
      <p>{t.browse.subtitle}</p>

      {posts.length === 0 ? (
        <p>{t.browse.noResults}</p>
      ) : (
        <div>
          {/* Render posts */}
        </div>
      )}
    </div>
  )
}
```

### Step 3: Update Your Page to Use the Client Component

**Example: `app/browse/page.tsx`**

```typescript
import MainLayout from '@/components/MainLayout'
import BrowsePage from '@/components/BrowsePage'
import { prisma } from '@/lib/prisma'

export default async function Page() {
  // Server-side data fetching
  const posts = await prisma.post.findMany({
    where: { status: 'APPROVED' },
  })

  return (
    <MainLayout>
      <BrowsePage posts={posts} />
    </MainLayout>
  )
}
```

## Translation Keys Structure

The translations are organized hierarchically:

```
translations
├── en (English)
│   ├── nav (Navigation)
│   ├── home (Home page)
│   ├── categories (Category names)
│   └── footer (Footer)
└── zh (Chinese)
    ├── nav (导航)
    ├── home (首页)
    ├── categories (分类)
    └── footer (页脚)
```

## Best Practices

### 1. Organize by Page/Section
Group related translations together:

```typescript
post: {
  details: {
    apply: 'Apply Now',
    save: 'Save to Shortlist',
    views: 'views',
    // ... more keys
  },
  create: {
    title: 'Create a New Post',
    submit: 'Create Post',
    // ... more keys
  },
}
```

### 2. Use Descriptive Keys
Use clear, descriptive key names:

✅ Good: `browse.sortBy.latest`
❌ Bad: `browse.sort1`

### 3. Keep Consistent Structure
Maintain the same structure in both `en` and `zh`:

```typescript
en: {
  post: {
    apply: 'Apply Now',
    save: 'Save',
  }
}
zh: {
  post: {
    apply: '立即申请',
    save: '保存',
  }
}
```

### 4. Handle Dynamic Content
For content with variables, use string interpolation:

```typescript
// In translations.ts
post: {
  applicationsCount: (count: number) => `${count} applications`,
}

// In component
<p>{t.post.applicationsCount(5)}</p>
```

Or keep it simple with template strings:

```typescript
<p>{post._count.applications} {t.post.applications}</p>
```

## Example: Translating the Browse Page

Here's a complete example:

### 1. Add to translations.ts

```typescript
export const translations = {
  en: {
    // ... existing
    browse: {
      title: 'Browse Opportunities',
      subtitle: 'Find the perfect collaboration for you',
      filters: {
        title: 'Filters',
        clearAll: 'Clear all',
        category: 'Category',
        location: 'Location',
        budgetType: 'Budget Type',
        allTypes: 'All Types',
        fixed: 'Fixed Payment',
        sample: 'Product Sample',
        commission: 'Commission',
        apply: 'Apply Filters',
        save: 'Save Search',
      },
      sort: {
        label: 'Sort by:',
        latest: 'Latest',
        deadline: 'Deadline Soon',
        budget: 'Highest Budget',
        applications: 'Fewest Applications',
      },
      results: {
        found: 'opportunities found',
        noResults: 'No posts match your filters',
        featured: 'Featured',
        applications: 'applications',
        remote: 'Remote',
      },
    },
  },
  zh: {
    // ... existing
    browse: {
      title: '浏览机会',
      subtitle: '找到最适合你的合作',
      filters: {
        title: '筛选',
        clearAll: '清除所有',
        category: '分类',
        location: '地区',
        budgetType: '预算类型',
        allTypes: '所有类型',
        fixed: '固定报酬',
        sample: '产品样品',
        commission: '佣金',
        apply: '应用筛选',
        save: '保存搜索',
      },
      sort: {
        label: '排序：',
        latest: '最新',
        deadline: '即将截止',
        budget: '预算最高',
        applications: '报名最少',
      },
      results: {
        found: '个机会',
        noResults: '没有符合条件的信息',
        featured: '精选',
        applications: '个申请',
        remote: '远程',
      },
    },
  },
}
```

### 2. Update FilterSidebar.tsx

```typescript
'use client'

import { useLanguage } from '@/lib/i18n/LanguageContext'
// ... other imports

export default function FilterSidebar() {
  const { t } = useLanguage()
  // ... existing code

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">{t.browse.filters.title}</h2>
          <button onClick={clearFilters} className="text-sm text-primary-600 hover:underline">
            {t.browse.filters.clearAll}
          </button>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            {t.browse.filters.category}
          </label>
          {/* ... rest of component */}
        </div>
      </div>
    </aside>
  )
}
```

## Testing Translations

1. **Run the dev server**: `npm run dev`
2. **Click the language switcher** in the header (中文/EN button)
3. **Verify all text changes** from English to Chinese
4. **Check localStorage**: Open DevTools → Application → Local Storage → should see "locale": "zh" or "en"

## Adding More Languages

To add Spanish, French, or other languages:

1. Update the Locale type in `translations.ts`:
```typescript
export type Locale = 'en' | 'zh' | 'es' | 'fr'
```

2. Add the new language object:
```typescript
export const translations = {
  en: { /* ... */ },
  zh: { /* ... */ },
  es: {
    nav: {
      home: 'Inicio',
      browse: 'Explorar',
      // ...
    },
    // ...
  },
}
```

3. Update the Header language switcher to show multiple options:
```typescript
<select onChange={(e) => setLocale(e.target.value as Locale)} value={locale}>
  <option value="en">EN</option>
  <option value="zh">中文</option>
  <option value="es">ES</option>
</select>
```

## Common Patterns

### Pattern 1: Simple Text Replacement
```typescript
const { t } = useLanguage()
<h1>{t.page.title}</h1>
```

### Pattern 2: Dynamic Category Names
```typescript
<span>{t.categories[post.category as keyof typeof t.categories] || post.category}</span>
```

### Pattern 3: Conditional Rendering with Translations
```typescript
{posts.length === 0 ? (
  <p>{t.browse.noResults}</p>
) : (
  <p>{posts.length} {t.browse.results.found}</p>
)}
```

### Pattern 4: Form Labels
```typescript
<label>{t.create.form.title}</label>
<input placeholder={t.create.form.titlePlaceholder} />
```

## Troubleshooting

### Error: "useLanguage must be used within a LanguageProvider"
**Solution**: Make sure the component is wrapped in `<LanguageProvider>` (already done in root layout)

### Translations not updating when switching languages
**Solution**: The component must be a client component (use `'use client'` at the top)

### Cannot access nested translation keys
**Solution**: Check the key path in `translations.ts` matches your usage:
```typescript
// If you have: translations.en.home.hero.title
// Use: t.home.hero.title
```

## Next Steps

To complete the translation for all pages:

1. **Browse Page** - Add browse-specific translations
2. **Post Detail Page** - Translate post details, buttons, and meta info
3. **Create Post Page** - Form labels, placeholders, validation messages
4. **Brand Center** - Dashboard, stats, and action buttons
5. **Creator Center** - Application tracking, saved posts
6. **Alerts Page** - Saved searches, email preferences
7. **Auth Pages** - Sign in/up forms and messages

Follow the pattern shown in this guide for each page!

## Summary

The Chinese language support is now working! Here's what you can do:

✅ Click the language switcher (中文/EN) in the header
✅ All header, footer, and home page content will switch languages
✅ The language preference is saved and persists across sessions
✅ Follow this guide to add translations to other pages

The system is fully extensible - you can easily add more languages following the same pattern!
