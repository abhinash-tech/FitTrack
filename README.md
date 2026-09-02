# FitTrack

> Your personal fitness and wellness companion — web and mobile, one backend.

FitTrack is a cross-platform fitness and wellness tracking platform designed for users who want to build consistent healthy habits through manual-first tracking without requiring a smartwatch.

---

## Features

- 💧 **Hydration Tracking** — Daily goal, quick-add buttons, progress ring, smart reminders
- 🏋️ **Fitness** — Home workouts, walking, running, exercise library
- 🍽️ **Nutrition + AI** — Photo food logging with South Indian food intelligence, voice input, macro tracking
- 😴 **Sleep** — Manual sleep log with quality rating and weekly trends
- ⚖️ **Progress** — Weight tracking, body measurements, trend charts
- 🎯 **Goals** — Custom goals with progress tracking
- 🏆 **Achievements** — Streak-based gamification system
- 📊 **Analytics** — Historical charts across all health metrics
- 🌟 **Daily Wellness Score** — Transparent scoring with breakdown explanation
- 💡 **AI Health Insights** — Personalized daily observations

---

## Tech Stack

| Layer | Web | Mobile |
|---|---|---|
| Framework | Next.js 15 (App Router) | Expo SDK 53 |
| Language | TypeScript | TypeScript |
| Styling | Tailwind CSS v4 | NativeWind |
| State | Zustand + TanStack Query | Zustand + TanStack Query |
| Backend | Supabase | Supabase |
| Database | PostgreSQL (Supabase) | PostgreSQL (Supabase) |
| Auth | Supabase Auth | Supabase Auth |
| AI | Gemini Vision (Edge Function) | Same |

---

## Monorepo Structure

```
fittrack/
├── apps/
│   ├── web/        Next.js web app
│   └── mobile/     Expo mobile app
├── packages/
│   ├── config/     Design tokens, constants
│   ├── types/      Shared TypeScript types
│   ├── validation/ Shared Zod schemas
│   ├── utils/      Shared utility functions
│   ├── business-logic/  Wellness score, streaks, reminders
│   ├── supabase/   DB client + query helpers
│   └── ui/         Component contracts
└── supabase/
    ├── migrations/ SQL schema
    └── functions/  Edge Functions (AI)
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Supabase account (free tier works)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

**Web** (`apps/web/.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Mobile** (`apps/mobile/.env.local`):
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Supabase Edge Functions** (set in Supabase dashboard → Settings → Edge Functions):
```
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Set up the database

In the Supabase SQL editor, run:
```sql
-- Copy and execute: supabase/migrations/001_initial_schema.sql
-- Then seed data: supabase/seed.sql
```

### 4. Start development

```bash
# Web
pnpm dev:web

# Mobile
pnpm dev:mobile
```

---

## Documentation

- [Architecture](./docs/architecture.md)
- [Database Schema](./docs/database.md)
- [AI Nutrition System](./docs/ai-nutrition.md)
- [Design System](./docs/design-system.md)
- [Developer Guide](./CLAUDE.md)

---

## Deployment

**Web** → Vercel (zero config, add env vars in Vercel dashboard)

**Mobile** → EAS Build:
```bash
npx eas build --platform all
```

---

## License

Private — All rights reserved.
