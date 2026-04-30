# Deploy to Vercel

## Why this is needed
Vercel's serverless functions have a read-only filesystem and ephemeral storage. SQLite cannot persist data there — it must be a hosted database (Postgres).

## One-time setup

### 1. Create a free Postgres database
Pick one:
- **Neon** → https://neon.tech (recommended for serverless)
- **Supabase** → https://supabase.com
- **Vercel Postgres** → Vercel dashboard → Storage tab → Create

Copy the connection string. It looks like:
```
postgresql://user:password@host:5432/dbname?sslmode=require
```

### 2. Update your local `.env`
Open `.env` and paste the connection string into `DATABASE_URL`.

### 3. Push schema and seed locally
```bash
npx prisma db push
npm run db:seed
```
This creates all tables and seeds the two default designations.

### 4. Set environment variables on Vercel
Vercel → your project → **Settings → Environment Variables**. Add for **Production, Preview, and Development**:

| Name | Value |
|---|---|
| `DATABASE_URL` | the same Postgres connection string |
| `ADMIN_USERNAME` | your username (e.g. `admin`) |
| `ADMIN_PASSWORD` | a strong password |
| `JWT_SECRET` | any long random string (try `openssl rand -hex 32`) |

### 5. Deploy
Push your code to GitHub and import into Vercel, or click **Redeploy** on the latest deployment.

## Local dev after this
```bash
npm run dev
```
Local dev will read from the same hosted Postgres, so what you see locally matches production.

## Schema changes later
When you change `prisma/schema.prisma`, push the changes:
```bash
npx prisma db push
```
Don't include `prisma db push` in your Vercel build script — it's slow and risky. Push manually from your machine.
