# FitTrack — CLAUDE.md

This file documents project conventions, architecture decisions, and critical rules
to maintain consistency across all development sessions.

---

## Project Overview

FitTrack is a cross-platform fitness and wellness tracking platform.
- **Web**: Next.js 15 (App Router) at `apps/web/`
- **Mobile**: Expo SDK 53 (Expo Router v4) at `apps/mobile/`
- **Backend**: Single Supabase project (PostgreSQL + Auth + Realtime + Edge Functions)
- **Monorepo**: pnpm workspaces + Turborepo at root

One backend. Two clients. One user experience.

---

## Repository Structure

```
fittrack/
├── apps/
│   ├── web/        Next.js 15 web application
│   └── mobile/     Expo React Native mobile application
├── packages/
│   ├── config/     Design tokens, constants, achievement slugs
│   ├── types/      All TypeScript types (mirrors DB schema)
│   ├── validation/ Zod schemas — shared between web & mobile
│   ├── utils/      Pure utility functions (formatters, calculators)
│   ├── business-logic/ Wellness score, streaks, reminders, achievements, insights
│   ├── supabase/   Supabase client factories + typed query helpers
│   └── ui/         Component type contracts
├── supabase/
│   ├── migrations/ SQL migration files
│   ├── seed.sql    Seed data (exercise library + Indian food database)
│   └── functions/  Edge Functions (AI food analysis — server-side only)
└── docs/           Architecture and database documentation
```

---

## Critical Rules

### 1. Never duplicate business logic
- Formatters, calculators, wellness score → `packages/utils`
- Streak engine, reminder scheduling → `packages/business-logic`
- Zod schemas → `packages/validation`
- DB types → `packages/types`
- Never re-implement these in apps/

### 2. Never expose secret keys to the client
- `SUPABASE_SERVICE_ROLE_KEY` → server-side only (Next.js API routes, Edge Functions)
- `GEMINI_API_KEY` → Supabase Edge Functions only
- Web client uses only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Mobile uses only `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### 3. Always use RLS
- Every user-owned table has `user_id = auth.uid()` policy
- Never use the service role key on the client for data access
- Test RLS policies before deploying

### 4. Offline-first IDs
- All `id` fields are UUID v4 generated client-side using `generateId()` from `@fittrack/utils`
- This allows optimistic inserts without waiting for the server
- Supabase's `ON CONFLICT` (where applicable) makes inserts idempotent

### 5. Date handling
- `date` fields are always `YYYY-MM-DD` in the user's **local** timezone
- Always use `todayDate()` from `@fittrack/utils` (not `new Date().toISOString()`)
- Timestamps (`logged_at`, `created_at`) are always UTC

### 6. AI calls must be server-side
- Never call Gemini/OpenAI directly from the client
- All AI calls go through `supabase/functions/analyze-food/`
- Client calls: `supabase.functions.invoke('analyze-food', { body: { type, payload } })`

### 7. Query patterns
- Use typed query helpers from `@fittrack/supabase` — don't write raw Supabase queries in components
- Web: TanStack Query (`useQuery`, `useMutation`) wraps the query helpers
- Mobile: Same TanStack Query pattern with AsyncStorage persistence

---

## Environment Variables

### Web (`apps/web/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Mobile (`apps/mobile/.env.local`)
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

### Supabase Edge Functions (set in Supabase dashboard)
```
GEMINI_API_KEY=
```

---

## Design System

Colors, spacing, border radius, typography, and shadows are defined in
`packages/config/src/index.ts` as the single source of truth.

Web: CSS custom properties in `apps/web/app/globals.css`
Mobile: `nativewind` + StyleSheet using tokens from `@fittrack/config`

Primary accent: `#06D6A0` (electric teal)
Background: `#0A0F1E` (deep navy)

---

## Indian Food System

The `foods` table is seeded with ~500 South Indian and Indian foods.
Food search prioritizes `is_indian = true` and `verified = true` records.
AI food analysis (Gemini Vision) runs in the Edge Function with the curated system prompt
in `packages/business-logic/src/nutrition-ai/provider.interface.ts`.

---

## Adding a New Feature

1. Add DB types to `packages/types/src/index.ts`
2. Add Zod schema to `packages/validation/src/index.ts`
3. Add SQL migration to `supabase/migrations/`
4. Add query helper to `packages/supabase/src/queries/`
5. Add business logic to `packages/business-logic/` if needed
6. Implement UI in `apps/web/` and `apps/mobile/`
7. Never skip step 3 (RLS policy required on every new table)

---

## Running Locally

```bash
# Install all dependencies
pnpm install

# Start web dev server
pnpm dev:web

# Start mobile (Expo)
pnpm dev:mobile

# Type check all packages
pnpm typecheck

# Build all
pnpm build
```

---

## Database

Run migrations in Supabase SQL editor or via:
```bash
npx supabase db push
```

Seed data:
```bash
# Copy supabase/seed.sql content into Supabase SQL editor
```
