# Overseed

A global platform connecting brands with influencers and content creators for marketing collaborations.

## Features

- **Dual User System**: Separate interfaces for Brands and Creators
- **Multi-language Support**: English and Chinese (scalable to more languages)
- **Post Management**: Create, browse, and apply to collaboration opportunities
- **Application System**: Seamless application and shortlisting workflow
- **Saved Searches & Alerts**: Get notified when new opportunities match your criteria
- **Authentication**: Google and Facebook OAuth integration
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Internationalization**: next-i18next

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Overseed
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Required environment variables:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/overseed"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   FACEBOOK_CLIENT_ID="your-facebook-client-id"
   FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"
   ```

4. **Set up the database**
   ```bash
   # Push database schema
   npx prisma db push

   # Generate Prisma Client
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Management

**Full setup guide:** See [`docs/DATABASE_SETUP.md`](docs/DATABASE_SETUP.md)

### Quick Commands
```bash
# View database in browser
npx prisma studio

# Apply schema changes
npx prisma migrate dev --name your_migration_name

# Reset database (deletes all data)
npx prisma db push --force-reset

# Generate Prisma client after schema changes
npx prisma generate
```

### Local vs Production
- **Local:** PostgreSQL on localhost (see setup guide)
- **Production:** Supabase, Neon, or Vercel Postgres (configured via environment variables)

## Project Structure

```
Overseed/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── brand/             # Brand center pages
│   ├── creator/           # Creator center pages
│   ├── browse/            # Browse page
│   ├── create/            # Create post page
│   ├── post/              # Post detail pages
│   ├── alerts/            # Saved searches & alerts
│   └── page.tsx           # Home page
├── components/            # React components
├── docs/                  # Documentation
│   ├── DATABASE_SETUP.md         # Local/production DB setup guide
│   └── DATABASE_MULTILINGUAL.md  # Multilingual DB guide
├── lib/                   # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   ├── db/               # Database utilities
│   │   ├── index.ts      # Re-exports all DB utilities
│   │   ├── translations.ts  # Multilingual content helpers
│   │   └── types.ts      # Database TypeScript types
│   └── i18n/             # UI internationalization
│       ├── LanguageContext.tsx
│       └── translations.ts
├── prisma/               # Database schema
│   └── schema.prisma
├── public/               # Static files
│   └── locales/         # Translation files
│       ├── en/          # English translations
│       └── zh/          # Chinese translations
└── README.md
```

## Key Pages

### Public Pages
- `/` - Home page with dual CTAs for brands and creators
- `/browse` - Browse all collaboration opportunities with filters
- `/post/[id]` - Individual post details
- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page

### Authenticated Pages
- `/create` - Create a new post (brands)
- `/brand` - Brand center dashboard
- `/creator` - Creator center dashboard
- `/alerts` - Saved searches and email alerts

## Features Breakdown

### For Brands
1. Create collaboration posts with detailed requirements
2. Manage applications from creators
3. View analytics and metrics
4. Shortlist and accept creators

### For Creators
1. Browse opportunities with advanced filters
2. Apply to collaborations
3. Save posts to shortlist
4. Track application status
5. Set up email alerts for matching opportunities

## OAuth Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env`

### Facebook OAuth
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth redirect URI: `http://localhost:3000/api/auth/callback/facebook`
5. Copy App ID and Secret to `.env`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Database Hosting

- **Vercel Postgres**: Integrated with Vercel
- **Supabase**: Free PostgreSQL hosting
- **Railway**: Simple deployment with database
- **Neon**: Serverless PostgreSQL

## Internationalization

The app supports multiple languages at two levels:

### 1. UI Translations (Static Content)
For static UI text (buttons, labels, navigation):

1. Add locale to `next-i18next.config.js`:
   ```js
   locales: ['en', 'zh', 'es'], // Add 'es' for Spanish
   ```

2. Create translation files:
   ```
   public/locales/es/common.json
   public/locales/es/home.json
   ```

3. Add translations following the existing structure in `lib/i18n/translations.ts`

### 2. Database Content Translations (User-Generated Content)
For user-generated content like posts, profiles, and descriptions, we use a **Translation Table Pattern**.

**Full documentation:** See [`docs/DATABASE_MULTILINGUAL.md`](docs/DATABASE_MULTILINGUAL.md)

**Quick example:**
```typescript
import { createPostWithTranslations, getPostWithTranslation } from '@/lib/db'

// Chinese company creates a post
const post = await createPostWithTranslations({
  title: '寻找美妆博主合作',
  description: '我们是一家中国美妆品牌...',
  originalLanguage: 'zh',
  // ... other fields
}, [
  { languageCode: 'en', title: 'Looking for Beauty Influencer', description: '...' }
])

// US influencer views in English
const postInEnglish = await getPostWithTranslation(postId, 'en')
```

**Key files:**
- `lib/db/translations.ts` - Translation helper functions
- `lib/db/types.ts` - TypeScript types
- `prisma/schema.prisma` - Translation table schema

## Admin SQL Queries (Neon SQL Editor)

### AI Token Usage — Per user this month
```sql
SELECT u.email, u.name,
  SUM(a."promptTokens") as prompt_tokens,
  SUM(a."completionTokens") as completion_tokens,
  SUM(a."totalTokens") as total_tokens,
  COUNT(*) as total_requests
FROM ai_token_usage a
JOIN users u ON u.id = a."userId"
WHERE a."createdAt" >= date_trunc('month', NOW())
GROUP BY u.email, u.name
ORDER BY total_tokens DESC;
```

### AI Token Usage — All time per user
```sql
SELECT u.email, u.name,
  SUM(a."totalTokens") as total_tokens,
  COUNT(*) as requests
FROM ai_token_usage a
JOIN users u ON u.id = a."userId"
GROUP BY u.email, u.name
ORDER BY total_tokens DESC;
```

### AI Token Usage — Detailed log (last 50 requests)
```sql
SELECT u.email, a."promptTokens", a."completionTokens",
  a."totalTokens", a.model, a."createdAt"
FROM ai_token_usage a
JOIN users u ON u.id = a."userId"
ORDER BY a."createdAt" DESC
LIMIT 50;
```

### All users overview
```sql
SELECT email, name, "userType", "subscriptionTier", "isActive", "createdAt"
FROM users
ORDER BY "createdAt" DESC;
```

## Development Tips

- Run `npm run lint` to check for code issues
- Use Prisma Studio (`npx prisma studio`) to view and edit database
- Check Next.js docs for routing and API routes
- Tailwind CSS is configured for utility-first styling

## Future Enhancements

- [ ] AI-powered post translation
- [ ] Advanced creator matching algorithm
- [ ] In-app messaging system
- [ ] Payment integration
- [ ] Mobile apps (React Native)
- [ ] Analytics dashboard
- [ ] Review and rating system
- [ ] Contract templates

## Support

For issues and questions:
- Check existing issues on GitHub
- Create a new issue with detailed description
- Contact: support@overseed.net

## License

Copyright © 2024 Overseed. All rights reserved.
