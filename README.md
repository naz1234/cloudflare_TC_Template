# L3 TC Template — Cloudflare Pages Version

This repo is a clean TC starter template converted for Cloudflare Pages.

## Current app layout

- Main header title: `L3 TC Template`
- Existing Riyadh Metro logo remains in the main header.
- Main page content is blank and ready for TC-specific modules.
- Removed old DC/depot pages from routing: Train Req, Train Movement, PST / Train Prep, Insertion, Train Washing, ODO Reading, and Possession.

## Cloudflare Pages build settings

Use these settings in Cloudflare Pages:

```txt
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Node version: 20 or later
```

## D1 setup

Create a new D1 database for this TC template, then add a Pages binding:

```txt
Binding name: DB
Recommended database name: l3-tc-template-db
```

The Pages Function will automatically create the required TC template table when the app opens or when you visit `/api/health`.

Included migration:

```txt
migrations/0001_tc_template_records.sql
```

Healthy `/api/health` response should show:

```json
{
  "ok": true,
  "databaseBinding": "DB",
  "tableReady": true,
  "tableName": "tc_template_records"
}
```

## Optional local Wrangler setup

Wrangler files included:

```txt
wrangler.toml
wrangler.example.toml
```

Current D1 Database ID:

```txt
ef7b3bd7-d44f-4c9f-924c-e84a2951fe02
```

Run the migration manually if needed.

## Install and run locally

```bash
npm install
npm run dev
```
