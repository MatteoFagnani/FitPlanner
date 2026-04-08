# FitPlanner

FitPlanner is a Next.js app prepared for deployment on Vercel with a Supabase Postgres database through Prisma.

## Stack

- Next.js 16
- React 19
- Prisma ORM
- Supabase Postgres
- Vercel

## Local setup

1. Copy `.env.example` to `.env`.
2. Put your Supabase Postgres connection string into `DATABASE_URL`.
3. Install dependencies:

```bash
npm install
```

4. Apply the schema to your database:

```bash
npm run db:push
```

5. Start the app:

```bash
npm run dev
```

## Prisma commands

```bash
npm run db:generate
npm run db:push
npm run db:migrate -- --name init
npm run db:deploy
```

## Vercel + Supabase deployment

### 1. Create the database

Create a Supabase project and open:

- Project Settings
- Database
- Connection string

Use the URI / direct connection string for Prisma.

### 2. Add Vercel environment variables

In Vercel, add:

- `DATABASE_URL`

Use the same Postgres connection string from Supabase.

### 3. Deploy

This repo is configured so Vercel can:

- generate the Prisma client
- run Prisma migrations
- build the Next.js app

The production build command is:

```bash
npm run db:deploy && npm run build
```

If you prefer, you can set this same command in the Vercel project settings.

## Important note

The app is now prepared for Supabase Postgres, but the current UI still uses local Zustand mock data in several screens. The database layer is ready for deployment, but the app is not yet fully wired to persistent DB reads and writes everywhere.
