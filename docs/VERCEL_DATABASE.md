# Database on Vercel (Banner Design Preview)

## What is checked in today’s migrations?

- `prisma/migrations/20240530213853_create_session_table/migration.sql` — creates the Shopify **`Session`** table (offline access tokens, shop, etc.). This matches `schema.prisma` **before** any sticker-only extras.
- `prisma/migrations/20260206120000_drop_shop_billing_if_present/migration.sql` — drops **`ShopBilling`** if it exists (that model was copied from the sticker app but is not used here). Safe on a fresh DB.

`schema.prisma` now only defines **`Session`** so it stays aligned with migrations.

## Why SQLite on Vercel is a bad fit

The default template uses **SQLite** (`file:dev.sqlite`). That is fine for **local `shopify app dev`**. On **Vercel**, serverless functions have an **ephemeral filesystem**: the DB file is not durable between invocations, and concurrent writes are unreliable. For production on Vercel, use **PostgreSQL** (or another hosted SQL database).

## Connect PostgreSQL on Vercel

### 1. Create a database

- **Vercel Postgres**: [Vercel Storage → Postgres](https://vercel.com/docs/storage/vercel-postgres) — create a database and copy the connection string (often exposed as `POSTGRES_URL` or `PRISMA_DATABASE_URL`).
- **Neon / Supabase / PlanetScale (Postgres)** — any Postgres URL works as long as it is reachable from Vercel’s build and runtime.

### 2. Point Prisma at Postgres

In `prisma/schema.prisma`, change the datasource to PostgreSQL and use an environment variable:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Remove the old `provider = "sqlite"` / `file:dev.sqlite` block when you switch.

### 3. Regenerate migrations for Postgres (one-time)

SQLite migration history does not run cleanly on Postgres. Typical approach:

1. **Backup** anything you need from local `prisma/dev.sqlite`.
2. Delete the `prisma/migrations` folder (or move it aside).
3. With `DATABASE_URL` set to your **Postgres** URL (local or Neon):

   ```bash
   npx prisma migrate dev --name init_session_postgres
   ```

4. Commit the new `prisma/migrations` folder.

The generated migration should create the same `Session` model Prisma expects.

### 4. Environment variables on Vercel

In the Vercel project → **Settings → Environment Variables**, set at least:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection string (pooler URL is OK for the app). |
| `SHOPIFY_API_KEY` | From Shopify Partners. |
| `SHOPIFY_API_SECRET` | From Shopify Partners. |
| `SHOPIFY_APP_URL` | Your deployed app URL, e.g. `https://your-app.vercel.app` (no trailing slash). |
| `BANNER_PRICE_PER_3_5_SQFT` | Optional; draft-order pricing per 3.5 sq ft. |

If your host uses a **connection pooler** (e.g. PgBouncer in transaction mode), Prisma recommends a **direct** URL for migrations; add `directUrl` in `schema.prisma` and set `DIRECT_URL` in Vercel for `prisma migrate deploy`. See [Prisma: connection pool](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management).

### 5. Build command

This repo’s `vercel.json` runs **`npx prisma generate && npm run build`** so the Prisma client is always generated.

After you switch **`schema.prisma`** to **PostgreSQL** and set **`DATABASE_URL`** on Vercel, extend the build command to apply migrations (so tables exist before traffic hits the app):

```bash
npx prisma generate && npx prisma migrate deploy && npm run build
```

Set that as the **Build Command** in Vercel → Project → Settings → General → Build & Development Settings (or override `buildCommand` in `vercel.json`).

### 6. Local dev after switching to Postgres

Use the same `DATABASE_URL` in `.env` pointing at a local Docker Postgres or a Neon **dev** branch so `shopify app dev` and `prisma migrate dev` keep working.

---

**References:** [Prisma + Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel), [Shopify app hosting](https://shopify.dev/docs/apps/launch/deployment).
