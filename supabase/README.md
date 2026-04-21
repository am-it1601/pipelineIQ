# Supabase Migrations Guide

This project uses Supabase migrations to version control database schema changes.

## Setup

### 1. Install Supabase CLI

The Supabase CLI is already added to dev dependencies. Install it:

```bash
npm install
```

### 2. Link Project (One-time setup)

If you haven't already, link your Supabase project:

```bash
npx supabase link --project-id YOUR_PROJECT_ID
```

Get your `PROJECT_ID` from: https://app.supabase.com/projects

## Available Commands

### `npm run db:push`

Pushes local migrations to your Supabase project:

```bash
npm run db:push
```

### `npm run db:pull`

Pull latest schema changes from Supabase:

```bash
npm run db:pull
```

### `npm run db:reset`

Resets the local database to initial state (local development only):

```bash
npm run db:reset
```

### `npm run db:up`

Start local Supabase instance for development:

```bash
npm run db:up
```

## Creating New Migrations

### 1. Via Supabase Dashboard (Recommended for quick changes)

- Go to Supabase Dashboard → SQL Editor
- Create and test your SQL
- Pull the migration: `npm run db:pull`

### 2. Via CLI (Manual migration files)

- Create a new file in `supabase/migrations/` with format: `YYYYMMDD_description.sql`
- Example: `20260403_add_deleted_at_to_invitations.sql`
- Write your SQL migration
- Push the migration: `npm run db:push`

## Current Migrations

- **20260403_add_deleted_at_to_invitations.sql** - Adds soft-delete support to invitations table

## Important Notes

- ✅ Migration files are committed to Git - don't gitignore them
- ✅ Local Supabase state (`.supabase/`) is gitignored - regenerated locally
- ✅ Always test migrations locally before pushing to production
- ✅ Migrations are applied in filename order, so use timestamps

## Troubleshooting

**"Could not find the 'deleted_at' column"**

- Run `npm run db:push` to apply pending migrations
- Verify the migration file exists in `supabase/migrations/`

**Need to test migrations locally?**

- Run `npm run db:up` to start local Supabase
- Run `npm run db:push` to apply migrations locally
- Run `npm run db:reset` to start fresh

For more info: https://supabase.com/docs/guides/cli
