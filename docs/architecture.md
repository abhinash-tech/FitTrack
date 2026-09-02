# FitTrack — Architecture

## Overview

FitTrack is a cross-platform fitness and wellness platform with:
- A **Next.js 15** web application (`apps/web`)
- An **Expo SDK 53** mobile application (`apps/mobile`)
- A **single Supabase backend** shared by both

## Key Principle: One Backend, Two Clients

Both clients connect to the SAME Supabase project.
No data duplication. No separate APIs.
Real-time sync via Supabase Realtime.

## Monorepo

Managed by **pnpm workspaces** + **Turborepo**.

### Shared Packages

| Package | Purpose |
|---|---|
| `@fittrack/config` | Design tokens, constants, achievement slugs |
| `@fittrack/types` | TypeScript types mirroring the DB schema |
| `@fittrack/validation` | Zod schemas — used by both web and mobile forms |
| `@fittrack/utils` | Pure utility functions (formatters, calculators) |
| `@fittrack/business-logic` | Wellness score, streaks, reminders, achievements, insights |
| `@fittrack/supabase` | Supabase client factory + typed query helpers |
| `@fittrack/ui` | Shared component type contracts |

### Package Dependency Graph

```
apps/web        → all packages
apps/mobile     → all packages (except @fittrack/ui web-specific)
@fittrack/business-logic → @fittrack/types, utils, validation
@fittrack/supabase → @fittrack/types, utils
@fittrack/validation → @fittrack/types
@fittrack/utils → @fittrack/types
@fittrack/ui → @fittrack/config
```

## Synchronization

```
User logs water on mobile
  ↓ INSERT hydration_entries (optimistic, UUID client-generated)
  ↓ Supabase stores record
  ↓ Supabase Realtime broadcasts change to all subscribers
  ↓ Web client (subscribed via useEffect) receives event
  ↓ TanStack Query invalidates hydration cache
  ↓ Dashboard refetches and updates
```

### Offline Handling (Mobile)

1. TanStack Query caches responses in AsyncStorage
2. Failed mutations stored in Zustand `pendingSync[]`
3. On reconnect: flush queue in chronological order
4. Idempotent: client-side UUIDs prevent duplicate inserts

## Security Model

- All user data protected by PostgreSQL RLS: `USING (user_id = auth.uid())`
- Anon key used in clients — safe because RLS blocks cross-user access
- Service role key used ONLY in Edge Functions and server-side Next.js
- AI API keys (Gemini) stored in Supabase Edge Function secrets only
- No secrets in client bundles

## Authentication Flow

```
User signs up/logs in via Supabase Auth
  ↓ JWT stored in secure storage (AsyncStorage on mobile, httpOnly cookie on web)
  ↓ auto-refresh enabled
  ↓ Trigger creates profiles row automatically
  ↓ onboarding_done = false → show onboarding wizard
  ↓ User completes onboarding → onboarding_done = true → dashboard
```
