# Dapper Blokes Hair (EmDash + Astro + Cloudflare)

Production-ready EmDash project scaffolded in this workspace and customized for `dapperblokes.hair`.

## Stack

- Astro 6 server output
- EmDash CMS integration
- Cloudflare Workers runtime (`@astrojs/cloudflare`)
- Cloudflare D1 for content database
- Cloudflare R2 for media storage

## Business Features Added

- Hairstylist-focused homepage and visual system
- CMS collections for:
  - `services` (with duration, pricing, Square service variation id)
  - `products` (with pricing, stock, Square catalog id)
  - `posts`
  - `pages`
- Shop route at `/shop`
- Services route at `/services`
- Square catalog integration endpoint at `/api/square/catalog`

## Square Integration

This project includes a server endpoint:

- `src/pages/api/square/catalog.ts`

It calls Square's Catalog API through helper logic in:

- `src/lib/square.ts`

Set this Cloudflare Worker secret before deployment:

- `SQUARE_ACCESS_TOKEN`

Example:

```bash
wrangler secret put SQUARE_ACCESS_TOKEN
```

You can optionally map each CMS item to Square ids:

- `products.square_catalog_id`
- `services.square_service_variation_id`

## Local Setup

### Prerequisites

- Node.js 22.x
- npm
- Cloudflare account + Wrangler authenticated

### Install

```bash
npm install
```

If installation fails on Windows with `better-sqlite3` native build issues, use one of:

1. Install Windows SDK `10.0.22621.0` in Visual Studio Build Tools, then rerun `npm install`
2. Use WSL2/Linux for local development
3. Use Cloudflare deployment flow first and rely on remote runtime

### Bootstrap and dev server

```bash
npm run bootstrap
npm run dev
```

Admin UI:

- `http://localhost:4321/_emdash/admin`

## Cloudflare Setup

Update `wrangler.jsonc` values to your real resources:

- `d1_databases[0].database_id`
- `r2_buckets[0].bucket_name` (ensure bucket exists)

Current template names are set for this project:

- Worker name: `dapperblokes-hair`
- D1 name: `dapperblokes-hair`
- R2 bucket: `dapperblokes-hair-media`

## GitHub + Cloudflare Deployment

Repository target:

- `https://github.com/kymo42/dapperblokes`

Suggested steps:

```bash
git init
git add .
git commit -m "Initialize Dapper Blokes Hair EmDash site"
git branch -M main
git remote add origin https://github.com/kymo42/dapperblokes.git
git push -u origin main
```

Then in Cloudflare Dashboard:

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set deploy command: `npm run deploy` (or Wrangler-based workflow)
4. Configure env vars/secrets (including `SQUARE_ACCESS_TOKEN`)
5. Attach custom domain `dapperblokes.hair`

## Important Files

- `seed/seed.json`
- `src/layouts/Base.astro`
- `src/pages/index.astro`
- `src/pages/services.astro`
- `src/pages/shop.astro`
- `src/pages/api/square/catalog.ts`
- `src/lib/square.ts`
- `wrangler.jsonc`
