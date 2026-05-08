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

This repo is configured for **PostgreSQL**: `schema.prisma` uses **`DATABASE_URL`** only, and **`npm run build`** runs **`prisma generate`**, **`prisma migrate deploy`**, then **`react-router build`** so each deploy applies migrations before the app build (Vercel’s default build is **`npm run build`** via `vercel.json`, matching **`custom-sticker-app(lastupdated)`**).

After the next successful deploy, you should see at least **`Session`** and **`_prisma_migrations`** when querying `information_schema.tables` (or in Prisma Studio).

### Comparing older `custom-sticker-designer` (SQLite) vs `custom-sticker-app(lastupdated)`

The **original** `custom-sticker-designer` folder used **SQLite** (`file:dev.sqlite`); sessions land in **`prisma/dev.sqlite`** on disk when you run dev from that repo. The **current** reference app in this workspace is **`custom-sticker-app(lastupdated)`**, which uses **PostgreSQL** and the same **`npm run build`** / **`DATABASE_URL`** pattern as this banner app.

**This app (`banner-design-preview`)** uses **PostgreSQL** and **`DATABASE_URL`**. Sessions always go to whatever database that URL points to (Neon branch, Vercel Postgres, Docker, etc.). If you still see **no rows in `Session`** after a successful install:

1. **Confirm the URL** — In the same environment where the app handled OAuth (local `.env` vs Vercel **Production** env), `echo`/log the DB host from `DATABASE_URL` (redact password) and query **that** database.
2. **Confirm migrations** — `Session` must exist (`npx prisma migrate deploy` in build or `shopify app dev` via `shopify.web.toml`).
3. **Confirm the OAuth callback hit this app** — `SHOPIFY_APP_URL` and Partners **App URL** / **redirect URLs** must match the host that runs this server; otherwise another deployment may be receiving OAuth.
4. **Row shape** — Offline tokens use ids like `offline_your-store.myshopify.com` (one row per shop for offline session).

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

`prisma/schema.prisma` uses PostgreSQL with **`DATABASE_URL`** only. If migrations fail through a pooler (PgBouncer / “prepared statement” errors), use a **non-pooling** URL as `DATABASE_URL` for the build, or add **`directUrl = env("DIRECT_URL")`** to the datasource and set **`DIRECT_URL`** to a direct connection — see [Prisma: external connection poolers](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections#external-connection-poolers).

### 3. Environment variables on Vercel

In the Vercel project → **Settings → Environment Variables**, set at least:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection string. Vercel Postgres: **`POSTGRES_PRISMA_URL`** (pooled, Prisma-friendly) usually works for **both** runtime and `prisma migrate deploy`. If migrate fails, try **`POSTGRES_URL_NON_POOLING`** for this variable on the build, or introduce `DIRECT_URL` as above. |
| `SHOPIFY_API_KEY` | From Shopify Partners. |
| `SHOPIFY_API_SECRET` | From Shopify Partners. |
| `SHOPIFY_APP_URL` | Your deployed app URL, e.g. `https://your-app.vercel.app` (no trailing slash). |
| `BANNER_PRICE_PER_3_5_SQFT` | Optional; draft-order pricing per 3.5 sq ft. |

Linking **Vercel Postgres** to the project can auto-inject `POSTGRES_*` variables; map one of them to **`DATABASE_URL`** if it is not set automatically.

### 4. Build command

**`npm run build`** (used by Vercel’s default build) already runs:

```bash
prisma generate && prisma migrate deploy && react-router build
```

(`vercel.json` uses **`npm run build`** only — same as **`custom-sticker-app(lastupdated)`**.) If you override the build command in the Vercel dashboard, keep **`prisma migrate deploy`** in the chain or tables will never be created on deploy.

Local **`shopify app dev`** runs **`predev`** (`prisma generate`) then **`npm exec react-router dev`** — it does **not** run migrations each time. Run **`npm run setup`** (or `npx prisma migrate deploy`) once after clone or when migrations change.

### 5. Local dev with Postgres

Copy **`.env.example`** to **`.env`** and set **`DATABASE_URL`**. Use a local Docker Postgres or a Neon **dev** branch so `shopify app dev` and `prisma migrate dev` keep working.

---

**References:** [Prisma + Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel), [Shopify app hosting](https://shopify.dev/docs/apps/launch/deployment).
