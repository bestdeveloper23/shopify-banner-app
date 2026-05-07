# Database on Vercel (Banner Design Preview)

## “This domain is for use in documentation examples…” after install

That page is **`https://example.com`** (IANA’s reserved documentation domain). It means the app is loading a **placeholder URL**, almost always because **`SHOPIFY_APP_URL`** in **`.env`** (local) or **Vercel → Environment Variables** is still `https://example.com`, while `shopify.app.toml` may already list your real host.

**Fix:** Set `SHOPIFY_APP_URL` to the **exact same origin** as `application_url` in `shopify.app.toml` (e.g. `https://shopify-banner-app-alpha.vercel.app`), redeploy / restart `shopify app dev`, then reinstall or reopen the app. In **Shopify Partners → your app → Configuration**, confirm **App URL** and **Allowed redirection URL(s)** match that host too.

---


## “I don’t see any tables / schema in the Vercel database”

Common reasons:

1. **Vercel’s UI is not a SQL client.** Storage → Postgres shows the store and connection strings, not a full table browser. After migrations succeed, inspect data with **Neon’s SQL Editor** (if Vercel Postgres is backed by Neon), **Prisma Studio** (`npx prisma studio` with `DATABASE_URL` set), or any Postgres client.
2. **Migrations never ran on that database.** If `schema.prisma` was still **SQLite** or the Vercel **build command** did not run `prisma migrate deploy`, nothing creates `Session` (or `_prisma_migrations`) on Postgres.
3. **Wrong project or env.** The database you opened in the dashboard must be the one linked to this Vercel project, and **Production** vs **Preview** env vars can point at different URLs.

This repo is configured for **PostgreSQL**: `schema.prisma` uses `DATABASE_URL` and `DIRECT_URL`, and **`vercel.json`** runs **`npx prisma generate && npx prisma migrate deploy && npm run build`** so each deploy applies migrations before the app build.

After the next successful deploy, you should see at least **`Session`** and **`_prisma_migrations`** when querying `information_schema.tables` (or in Prisma Studio).

---

## What is checked in today’s migrations?

- `prisma/migrations/20240530213853_create_session_table/migration.sql` — creates the Shopify **`Session`** table (offline access tokens, shop, etc.) for **PostgreSQL**.
- `prisma/migrations/20260206120000_drop_shop_billing_if_present/migration.sql` — drops **`ShopBilling`** if it exists (sticker billing leftover). Safe on a fresh DB.

`schema.prisma` only defines **`Session`**, aligned with these migrations.

## Why SQLite on Vercel is a bad fit

**SQLite** (`file:…`) uses the server filesystem. On **Vercel**, serverless instances are **ephemeral**: the file is not a durable production database. This app targets **hosted PostgreSQL** (Vercel Postgres, Neon, Supabase, etc.).

## Connect PostgreSQL on Vercel

### 1. Create a database

- **Vercel Postgres**: [Vercel Storage → Postgres](https://vercel.com/docs/storage/vercel-postgres) — create a database. The project usually gets **`POSTGRES_URL`**, **`POSTGRES_PRISMA_URL`** (pooled, Prisma-friendly), **`POSTGRES_URL_NON_POOLING`** (direct), and similar names.
- **Neon / Supabase** — any Postgres URL reachable from Vercel **build** and **runtime**.

### 2. Prisma datasource (already in this repo)

`prisma/schema.prisma` uses PostgreSQL with **`DATABASE_URL`** (queries) and **`DIRECT_URL`** (migrations). See [Prisma: connection pool](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management).

### 3. Environment variables on Vercel

In the Vercel project → **Settings → Environment Variables**, set at least:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Pooled Postgres URL (e.g. Vercel **`POSTGRES_PRISMA_URL`** or **`POSTGRES_URL`** — use what Prisma/Vercel docs recommend for your store). |
| `DIRECT_URL` | **Non-pooling** URL for `prisma migrate deploy` (e.g. **`POSTGRES_URL_NON_POOLING`**). If you only have one URL (local Docker), set both to the same string. |
| `SHOPIFY_API_KEY` | From Shopify Partners. |
| `SHOPIFY_API_SECRET` | From Shopify Partners. |
| `SHOPIFY_APP_URL` | Your deployed app URL, e.g. `https://your-app.vercel.app` (no trailing slash). |
| `BANNER_PRICE_PER_3_5_SQFT` | Optional; draft-order pricing per 3.5 sq ft. |

Linking **Vercel Postgres** to the project can auto-inject these; still confirm both **`DATABASE_URL`** and **`DIRECT_URL`** exist (or map them from the injected names above).

### 4. Build command

**`vercel.json`** already sets:

```bash
npx prisma generate && npx prisma migrate deploy && npm run build
```

If you override the build command in the Vercel dashboard, keep **`prisma migrate deploy`** in the chain or tables will never be created on deploy.

### 5. Local dev with Postgres

Copy **`.env.example`** to **`.env`** and set **`DATABASE_URL`** and **`DIRECT_URL`** (same value is fine for a local Postgres without a pooler). Use a local Docker Postgres or a Neon **dev** branch so `shopify app dev` and `prisma migrate dev` keep working.

---

**References:** [Prisma + Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel), [Shopify app hosting](https://shopify.dev/docs/apps/launch/deployment).
