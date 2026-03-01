# Database Setup Guide

This guide covers setting up PostgreSQL for local development and switching to a cloud database for production.

---

## Part 1: Local PostgreSQL Setup (Development)

### Option A: Install PostgreSQL via Homebrew (Recommended for Mac)

```bash
# 1. Install PostgreSQL
brew install postgresql@16

# 2. Start PostgreSQL service
brew services start postgresql@16

# 3. Verify it's running
brew services list
# Should show: postgresql@16 started

# 4. Create the database
createdb overseeddb

# 5. Verify connection
psql -d overseeddb -c "SELECT version();"
```

Your connection URL will be:
```
DATABASE_URL="postgresql://YOUR_MAC_USERNAME@localhost:5432/overseeddb"
```

> **Note:** Replace `YOUR_MAC_USERNAME` with your Mac username (run `whoami` in terminal to find it).

### Option B: Install via Postgres.app (Easiest for Mac)

1. Download from https://postgresapp.com/
2. Move to Applications folder
3. Open Postgres.app
4. Click "Initialize" to create a default server
5. Click "Start" to run the server

Then in terminal:
```bash
# Create database
/Applications/Postgres.app/Contents/Versions/latest/bin/createdb overseeddb
```

### Option C: Use Docker (Cross-platform)

```bash
# 1. Run PostgreSQL container
docker run --name overseed-postgres \
  -e POSTGRES_PASSWORD=devpassword \
  -e POSTGRES_DB=overseeddb \
  -p 5432:5432 \
  -d postgres:16

# 2. Verify it's running
docker ps
```

Your connection URL will be:
```
DATABASE_URL="postgresql://postgres:devpassword@localhost:5432/overseeddb"
```

---

## Part 2: Configure Environment Variables

### Step 1: Update your `.env` file

```bash
# For local development (Homebrew install, no password)
DATABASE_URL="postgresql://YOUR_MAC_USERNAME@localhost:5432/overseeddb"

# OR for Docker (with password)
DATABASE_URL="postgresql://postgres:devpassword@localhost:5432/overseeddb"
```

### Step 2: Apply database schema

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (creates all tables)
npx prisma db push

# Or create a migration (recommended for tracking changes)
npx prisma migrate dev --name init
```

### Step 3: Verify setup

```bash
# Open Prisma Studio to view your database
npx prisma studio
```

This opens a browser at http://localhost:5555 where you can see all tables.

---

## Part 3: Switching to Production Database

When you're ready to deploy, you'll use a cloud PostgreSQL provider.

### Recommended Providers

| Provider | Free Tier | Best For |
|----------|-----------|----------|
| **Supabase** | 500MB, 2 projects | Best free option |
| **Neon** | 512MB, unlimited projects | Serverless, fast cold starts |
| **Vercel Postgres** | 256MB | If deploying on Vercel |
| **Railway** | $5 credit/month | Simple setup |
| **PlanetScale** | MySQL only | Not compatible (MySQL) |

### Setup with Supabase (Recommended)

1. Go to https://supabase.com and create account
2. Create new project
3. Go to **Settings** → **Database**
4. Copy the **Connection string** (URI format)
5. It looks like:
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### Setup with Neon

1. Go to https://neon.tech and create account
2. Create new project
3. Copy the connection string from dashboard
4. It looks like:
   ```
   postgresql://[USER]:[PASSWORD]@[HOST].neon.tech/neondb?sslmode=require
   ```

### Setup with Vercel Postgres

1. In Vercel dashboard, go to **Storage**
2. Create new Postgres database
3. Connect to your project
4. Environment variables are auto-added

---

## Part 4: Environment Strategy

### For Local Development

Use `.env` file (already gitignored):

```env
DATABASE_URL="postgresql://xinyi@localhost:5432/overseeddb"
```

### For Production

Set environment variables in your hosting platform:

**Vercel:**
1. Go to Project Settings → Environment Variables
2. Add `DATABASE_URL` with your production connection string
3. Set it for "Production" environment only

**Other platforms:**
- Railway: Auto-detected from linked database
- Render: Environment tab in dashboard
- Fly.io: `fly secrets set DATABASE_URL="..."`

### Using Different Databases per Environment

You can have separate `.env` files:

```
.env                 # Local development (gitignored)
.env.production      # Production values (gitignored)
```

Or use Vercel's environment-specific variables:
- `DATABASE_URL` for Production
- `DATABASE_URL` for Preview (optional, can use same as prod)
- `DATABASE_URL` for Development (your local)

---

## Part 5: Migrating Data to Production

### Option A: Fresh Start (Recommended for early development)

Just push the schema to production:

```bash
# Set production URL temporarily
export DATABASE_URL="postgresql://...production-url..."

# Push schema (creates tables, no data)
npx prisma db push
```

### Option B: Migrate with Data

```bash
# 1. Export from local
pg_dump -h localhost -U postgres -d overseeddb > backup.sql

# 2. Import to production (example with Supabase)
psql "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" < backup.sql
```

### Option C: Use Prisma Migrations (Best Practice)

```bash
# 1. Create migration locally
npx prisma migrate dev --name add_feature

# 2. Deploy to production
DATABASE_URL="production-url" npx prisma migrate deploy
```

---

## Quick Reference

### Common Commands

```bash
# Start local PostgreSQL (Homebrew)
brew services start postgresql@16

# Stop local PostgreSQL
brew services stop postgresql@16

# Connect to local database
psql -d overseeddb

# View tables
\dt

# Exit psql
\q

# Reset local database (delete all data)
npx prisma db push --force-reset

# View database in browser
npx prisma studio
```

### Troubleshooting

**"Connection refused" error:**
```bash
# Check if PostgreSQL is running
brew services list
# If not started:
brew services start postgresql@16
```

**"Database does not exist" error:**
```bash
createdb overseeddb
```

**"Role does not exist" error:**
```bash
# Create your user role
createuser -s $(whoami)
```

**"Permission denied" error:**
```bash
# Grant permissions (run in psql)
psql -d postgres
GRANT ALL PRIVILEGES ON DATABASE overseeddb TO your_username;
```

---

## Your Current Setup

Based on your `.env` file:

```
DATABASE_URL="postgresql://postgres@localhost:5432/overseeddb"
```

This assumes:
- PostgreSQL running on localhost:5432
- User: `postgres` (no password)
- Database: `overseeddb`

### Action Items for You:

1. **Ensure PostgreSQL is installed and running** (see Part 1)

2. **Create the database if it doesn't exist:**
   ```bash
   createdb overseeddb
   ```

3. **Apply the schema:**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Verify with Prisma Studio:**
   ```bash
   npx prisma studio
   ```
