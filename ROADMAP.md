# ShuktiFit Roadmap

> AI-Powered Personal Fitness Tracker PWA (originally spec'd as "FitAI")
> Original spec: `FitAI-Requirements-Spec_2.md` (v1.0, Feb 6 2026)
> Last updated: 2026-02-19

---

## Quick Reference

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.9 |
| Build | Vite 7.3 |
| Styling | Tailwind CSS 4 (dark theme, navy/orange) |
| Local DB | Dexie (IndexedDB) — 16 tables |
| State | Zustand (workout session, filters) |
| Charts | Recharts |
| AI | Claude Sonnet 4.5 via Vercel serverless |
| Health | Withings OAuth2 integration |
| PWA | vite-plugin-pwa (service worker, offline) |

### Key Commands
```bash
npm run dev        # Start dev server (includes API proxy)
npm run build      # TypeScript check + Vite build
npm run lint       # ESLint
npm run preview    # Preview production build
```

### Environment Variables (.env.local)
```
ANTHROPIC_API_KEY=sk-ant-...
WITHINGS_CLIENT_ID=...
WITHINGS_CLIENT_SECRET=...
WITHINGS_REDIRECT_URI=...
```

### Project Layout
```
src/
  components/       # UI organized by feature area
    ai/             # AI workout generator
    calendar/       # Monthly calendar view
    dashboard/      # Home screen widgets
    exercise/       # Exercise catalog & detail
    layout/         # AppShell, BottomTabBar, Header
    onboarding/     # 6-step setup wizard
    profile/        # User settings, Withings connection
    progress/       # Charts and body measurements
    ui/             # Reusable primitives (Button, Card, Modal, etc.)
    workout/        # Builder, player, list, templates, substitution
    chat/           # AI coaching chat panel + FAB
  db/               # Dexie schema (index.ts) + seed data (seed.ts)
  data/             # exercises.json (~3000), workoutTemplates.ts, trackerPresets.ts
  hooks/            # Dexie useLiveQuery wrappers
  services/         # Business logic (workoutEngine, ai, withings)
  stores/           # Zustand stores (workout session, filters)
  types/            # TypeScript interfaces (database.ts, ai.ts)
  utils/            # Helpers (dates, formatting, constants, PPL calc)
api/                # Vercel serverless functions (5 endpoints)
```

### Routes
| Path | Component | Description |
|------|-----------|-------------|
| `/` | DashboardPage | Home — greeting, PPL indicator, stats, trackers, weekly calendar |
| `/workouts` | WorkoutListPage | All workouts list |
| `/workouts/templates` | TemplateBrowserPage | Browse curated & user workout templates |
| `/workouts/new` | WorkoutBuilderPage | Create custom or AI workout |
| `/workouts/:id` | WorkoutDetailPage | View/edit workout before execution |
| `/workouts/:id/play` | WorkoutPlayerPage | Active workout — set logging, rest timer |
| `/progress` | ProgressPage | 6-tab analytics (strength, volume, weight, frequency, history, body) |
| `/exercises` | ExerciseCatalogPage | Browse/filter 3000+ exercises |
| `/exercises/:id` | ExerciseDetailPage | Instructions, images, muscles |
| `/profile` | ProfilePage | Settings, Withings connection |
| `/calendar` | CalendarPage | Monthly PPL schedule view with editable workout days |
| `/onboarding` | OnboardingFlow | First-run 6-step wizard (includes training day picker) |

### Database Tables (Dexie — ShuktiFitDB)
| Table | Status | Notes |
|-------|--------|-------|
| userProfile | Active | Single row, user settings + Withings tokens + workoutDays |
| exercises | Active | Seeded from exercises.json on first run |
| customExercises | Active | User-created exercises |
| exerciseExclusions | Active | Blacklisted exercises for AI |
| workouts | Active | Core workout records |
| workoutExercises | Active | Exercises within a workout |
| exerciseSets | Active | Individual sets with target/actual |
| exerciseHistory | Active | Per-exercise performance over time |
| bodyMeasurements | Active | Weight + body dimensions |
| withingsData | Active | Synced health metrics |
| workoutTemplates | Active | Curated + user-created workout templates |
| templateExercises | Active | Exercises within a template |
| customDataSeries | Active | Tracker definitions (water, sleep, calories, etc.) |
| customDataPoints | Active | Individual tracker data entries |
| bodyAnalyses | **Stub** | Schema only — no UI or services |
| badges | **Stub** | Schema only — no UI or services |
| streaks | **Broken** | Schema exists, StatsRibbon reads it, but nothing writes to it |
| dailyTodos | **Stub** | Schema only — no UI or services |

---

## Implementation Progress by Phase

The original spec defines 5 phases. Phases 1-3 are complete. Phase 4 is partial. Phase 5 has schema scaffolded but minimal implementation. Significant additional features have been built beyond the original spec.

### Phase 1 — Foundation / MVP [COMPLETE]
> Core workout logging and execution — usable without AI

- [x] PWA shell with service worker and installability
- [x] User profile / onboarding flow (6-step wizard with training day picker)
- [x] Exercise database (bundled free-exercise-db, ~3000 exercises)
- [x] Manual workout creation (WorkoutBuilderPage + ExercisePickerModal)
- [x] Set/rep/weight tracking with rest timer
- [x] Workout history and calendar
- [x] Local storage (IndexedDB via Dexie, 16 tables)
- [x] Basic dashboard (greeting, stats ribbon, week calendar strip, trackers)
- [x] Exercise catalog — searchable with filters (muscle, equipment, level, category)
- [x] Exercise detail pages — instructions, images, muscle groups
- [x] Dark theme with PPL color coding (red=push, blue=pull, green=legs)
- [x] Mobile-first responsive design with safe area support

### Phase 2 — Withings Integration [COMPLETE]
> Auto-sync body data

- [x] Vercel serverless backend (5 endpoints in `/api`)
- [x] Withings OAuth2 flow (auth → callback → token storage)
- [x] Weight, body composition, steps, heart rate, sleep data sync
- [x] Dashboard integration (WithingsWidget — latest weight, steps, HR)
- [x] Weight chart on Progress page (from Withings + manual entries)

### Phase 3 — AI Trainer [MOSTLY COMPLETE]
> AI-generated daily workouts and coaching

- [x] Claude API integration via Vercel serverless proxy
- [x] Workout generation with full context (profile, last 14 days, history, exclusions)
- [x] AI substitute exercise suggestions (2-3 alternatives with reasoning)
- [x] Progressive overload recommendations (AI uses history for weight suggestions)
- [x] Daily workout card on dashboard (PPL type indicator + start button)
- [x] AI reasoning displayed with generated workouts
- [x] AI coaching chat panel (floating chat FAB, contextual fitness Q&A)
- [ ] **AI coaching notes** — periodic insights surfaced proactively (spec 3.2.4)
  - e.g., "bench press plateaued 3 weeks — consider deload"
  - Chat panel partially covers this, but no proactive push
- [ ] **"Give me a different workout" regeneration** — spec mentions daily regeneration support
  - Partially covered by template browser + builder page, but no explicit "regenerate" action on the daily card

### Phase 4 — Body Analysis & Progress [PARTIAL]
> Full body composition tracking and AI analysis

- [x] Body measurement logging (manual entry — neck through calves)
- [x] Progress charts: Strength (1RM), Volume, Weight, Muscle Frequency, Exercise History
- [x] Custom data series — user-defined trackable metrics with charting
- [x] Overlay chart — compare any combination of data series on one chart
- [ ] **Progress photo capture** — guided pose overlay on camera screen (spec 3.3.1)
  - DB table `bodyAnalyses` exists with `photoFrontBlob` / `photoSideBlob` fields
  - No camera/upload UI, no photo storage logic
- [ ] **Photo gallery** — date-stamped history for visual before/after comparison
- [ ] **AI body composition analysis** — send photos to Claude Vision (spec 3.3.2)
  - Needs new API endpoint: `POST /api/ai/analyze-body`
  - Prompt template defined in spec (body fat %, muscle assessment, posture, recommendations)
  - Results stored in `bodyAnalyses` table, fed into workout generation context
- [ ] **AI progress reports** — on-demand or weekly AI-generated summary (spec 3.8.2)
  - Needs new API endpoint: `POST /api/ai/progress-report`
  - Strength gains, body comp trends, recommendations, motivational framing
- [ ] **Body measurements history charts** — per-measurement line charts (spec 3.3.3)
  - BodyMeasurementsForm exists for input, but no historical charting per measurement

### Phase 5 — Gamification & Polish [NOT STARTED]
> Motivation and long-term engagement

- [ ] **Streak system** — workout streak + logging streak with freeze logic (spec 3.9.1)
  - DB table `streaks` exists, StatsRibbon reads it, but **nothing writes to it** (bug B2)
  - Need: service to increment on workout complete, reset on missed days
  - Need: 1 free rest day pass per week (configurable)
- [ ] **Badge / achievement system** — trophy case on profile (spec 3.9.2)
  - DB table `badges` exists, type defined, no implementation
  - 10 badge types defined in spec (First Workout, Week Warrior, Month of Iron, Century Club, PR Crusher, Overload King, Transformation, Body Scan Pro, Consistent, Step Master)
  - Need: earning logic, celebration animation, badge display UI
- [ ] **Daily To-Do system** — auto-generated checklist on dashboard (spec 3.6.2)
  - DB table `dailyTodos` exists, type defined, no implementation
  - Items: workout, weight logging, progress photos (if due), body measurements (if due)
  - Auto-check when completed in-app, feeds into logging streak
- [ ] **PR celebration animation** — beyond the current toast notification (spec 3.4.2)
- [ ] **Push notifications** — workout reminders, streak warnings (spec mentions iOS 16.4+)
- [ ] **Superset execution mode** — back-to-back exercises, rest only after pair (spec 3.4.1 §4)
  - `supersetGroup` field exists on WorkoutExercise, but player doesn't handle superset flow
- [ ] **Offline AI request queueing** — queue when offline, process when reconnected (spec 9.2)
- [ ] **Performance optimization** — app load <2s on 4G, set logging <100ms (spec 9.1)

### Beyond Spec — Implemented Features
> Features built that extend the original spec

- [x] **Workout day scheduling** — specify which days of the week to train; PPL cycle advances only on training days; rest days shown in calendar and dashboard
- [x] **Smart off-day suggestions** — when opening a rest day, app suggests the PPL type with lowest muscle-overlap conflict relative to adjacent scheduled workouts
- [x] **Curated workout templates** — 35 pre-loaded templates (PPL-specific, full-body, supersets, circuits) browsable from `/workouts/templates`
  - Includes dumbbell + bodyweight-only templates, 20-30 minute circuits and supersets
  - Incremental seeding — existing users get new templates without duplicating old ones
- [x] **Dashboard trackers** — configurable tracker widgets (water, sleep, calories, steps, etc.) with quick-add, check-in, and daily goals
  - Custom data series with multiple tracker modes (cumulative, latest, check-in)
  - Preset trackers seeded on first run; users can create custom series
- [x] **Custom data series & charting** — create arbitrary trackable metrics with full history charts, data entry modal, and overlay comparisons
- [x] **Calendar editing** — tap any day to add/edit workouts; CalendarDayModal shows scheduled type, smart suggestions on rest days, and workout creation shortcuts
- [x] **Exercise swap/remove during workout** — SubstitutionPickerModal for mid-workout exercise substitution with AI-powered alternatives
- [x] **AI chat panel** — floating chat FAB with contextual fitness Q&A powered by Claude
- [x] **DayPicker component** — reusable 7-day toggle used in onboarding and calendar settings
- [x] **UTC date migration** — one-time migration to fix data points stored with UTC dates from timezone bug

---

## Future Backlog

These items come from the spec's "Post-MVP Backlog" (Section 10) plus ideas identified during development:

### Data & Export
- [ ] **Data export** — CSV/JSON export of all training data (spec 9.3)
- [ ] **Backup/restore** — IndexedDB backup to file
- [ ] **Cloud backup / sync across devices**

### Advanced Training
- [ ] **Deload week auto-detection** — AI suggests deload based on volume/plateau trends
- [ ] **Warm-up and cool-down routine generation**
- [ ] **Custom training splits** — support beyond PPL (upper/lower, bro split, full body)
- [ ] **Periodization** — mesocycle planning
- [ ] **Plate calculator** — visual barbell loading helper
- [ ] **Cardio workout support** — timed/distance-based workouts
- [x] ~~**Rest day active recovery suggestions**~~ — implemented via smart off-day suggestions

### UX Enhancements
- [ ] **Exercise search improvements** — fuzzy matching, recent/favorites
- [ ] **Body map visual selector** for muscle group filtering (spec 3.5.2)
- [x] ~~**Workout templates** — save and reuse workout structures~~ — 35 curated templates + template browser
- [ ] **Rest timer auto-start** — begin timer after logging a set
- [ ] **Undo set logging** — allow corrections during workout
- [ ] **"Last session" reference** on active exercise view (spec 3.4.2)
- [ ] **Vibration/sound alert** on rest timer completion (spec 3.4.1 §3)

### Integrations
- [ ] **Nutrition / calorie tracking integration**
- [ ] **Meal planning with AI**
- [ ] **Exercise demo videos** (YouTube integration)
- [ ] **Apple Health direct access** (if PWA APIs expand)
- [ ] **Wearable heart rate zone display** during workout
- [ ] **Voice control during workouts**
- [ ] **Intermittent fasting schedule integration**
- [ ] **Social sharing of achievements**

---

## Known Bugs

| ID | Severity | Description | Location |
|----|----------|-------------|----------|
| B1 | High | Withings sync returns `{ synced: true }` even after catching errors — masks failures | `src/services/withings.ts:203-205` |
| B2 | Medium | Streaks display in StatsRibbon but are never populated — always shows empty/zero | `src/components/dashboard/StatsRibbon.tsx` |
| B3 | Medium | AI service `.catch(() => ({}))` returns empty object on JSON parse failure — no error feedback to user | `src/services/ai.ts:18,33` |
| B4 | Medium | Withings token refresh failure is silently swallowed — subsequent API calls use expired credentials | `api/withings-data.ts:72-74` |
| B5 | Low | Vite dev server silently converts malformed JSON request bodies to `{}` | `vite.config.ts:40` |

---

## Dead Code / Stubs

**Phase 4/5 scaffolding (not dead — waiting for implementation):**
- `Badge` type, `badges` table — needed for Phase 5 badge system
- `DailyTodo` type, `dailyTodos` table — needed for Phase 5 daily to-do system
- `BodyAnalysis` type, `bodyAnalyses` table — needed for Phase 4 photo analysis
- `Streak` type, `streaks` table — needed for Phase 5 streak system

## Missing API Endpoints (from spec)

The spec defines 9 backend endpoints. 5 are implemented, 4 are missing:

| Endpoint | Status | Notes |
|----------|--------|-------|
| `POST /api/claude-workout` | Done | AI workout generation |
| `POST /api/claude-substitute` | Done | AI exercise substitution |
| `GET /api/withings-auth` | Done | OAuth2 initiation |
| `GET /api/withings-callback` | Done | OAuth2 token exchange |
| `POST /api/withings-data` | Done | Fetch weight/activity/sleep (combined endpoint) |
| `POST /api/ai/analyze-body` | **Missing** | Phase 4 — send photos to Claude Vision for body comp analysis |
| `POST /api/ai/progress-report` | **Missing** | Phase 4 — AI-generated weekly progress summary |
| `GET /api/withings/steps` | N/A | Covered by `/api/withings-data` with `dataType` param |
| `GET /api/withings/sleep` | N/A | Covered by `/api/withings-data` with `dataType` param |

---

## Architecture Decisions & Patterns

### Data Flow
```
User Action → Component → Service (workoutEngine/ai/withings)
                                ↓
                          Dexie (IndexedDB)
                                ↓
                    useLiveQuery (reactive) → Component re-renders
```

### AI Integration Pattern
```
Component → services/ai.ts → POST /api/claude-workout (Vercel serverless)
                                    ↓
                              Claude Sonnet 4.5
                                    ↓
                              JSON response → workoutEngine.createAIWorkout()
                                                    ↓
                                              Dexie (workouts + workoutExercises + exerciseSets)
```

### PPL Scheduling
- Start date stored in `userProfile.pplStartDate`
- Optional `userProfile.workoutDays` (0=Mon..6=Sun) — if set, PPL cycle advances only on those days; other days return `'rest'`
- O(1) counting algorithm: full weeks × workoutDays.length + remainder scan
- Utilities: `src/utils/pplUtils.ts` (getPPLTypeForDate, isWorkoutDay, countWorkoutDaysBetween)
- Higher-level scheduling: `src/services/pplScheduler.ts` (getTodayPPLType, getWeekSchedule, getMonthSchedule, suggestOffDayWorkout)

### PR Detection
- Uses Brzycki formula: `weight × (36 / (37 - reps))` for 1RM estimation
- Compared against `exerciseHistory` on each set log
- Flagged on `exerciseSets.isPR`

### State Management Split
- **Zustand** for ephemeral UI state (active workout session, filter selections)
- **Dexie useLiveQuery** for persistent data (all database reads are reactive)

---

## Learnings & Gotchas

### Development
- The Vite dev server has a custom plugin (`apiDevPlugin` in `vite.config.ts`) that proxies `/api/*` routes to the serverless functions locally — no need for a separate backend server during development.
- Exercise images come from a GitHub-hosted exercise database — see `src/utils/imageUrl.ts` for URL construction.
- The exercises.json seed file is large (~3000 entries). It's split into its own chunk (`exercise-data`) in the Vite build config to avoid bloating the main bundle.

### Database
- Dexie version is **16**. Schema changes require a version bump + migration.
- Startup chain in `main.tsx`: `seedExercises()` → `seedTemplates()` → `seedTrackerPresets()` → `migrateUTCDates()`
- `seedExercises()` only inserts if exercises table is empty; `seedTemplates()` uses name-based deduplication to add only new templates.
- All date fields use ISO date strings (`YYYY-MM-DD`), not Date objects.
- UTC timezone bug was fixed — a one-time `migrateUTCDates()` migration corrects data points that were stored with UTC dates instead of local dates.

### Deployment
- Deployed to Vercel. Serverless functions live in `/api` directory.
- `vercel.json` handles routing configuration.
- Environment variables must be set in Vercel dashboard for production.

### Withings Integration
- OAuth2 flow: `/api/withings-auth` → Withings → `/api/withings-callback` → redirect to `/profile` with tokens in URL params.
- Tokens stored in `userProfile` record (not a separate table).
- Token refresh is handled inline during data fetch — if 401, attempt refresh, then retry.

---

## Spec vs Implementation Gap Summary

Quick reference of what the original spec asks for that isn't built yet:

| Spec Section | Feature | Gap |
|--------------|---------|-----|
| 3.1 | Daily to-do checklist on dashboard | No implementation (Phase 5) |
| 3.1 | Step goal status from Withings on dashboard | WithingsWidget shows steps, but no goal tracking |
| 3.2.4 | AI coaching notes (proactive insights) | Chat panel exists but no proactive push |
| 3.3.1 | Progress photo capture with guided pose overlay | No camera UI |
| 3.3.2 | AI body composition analysis via Claude Vision | No endpoint or UI |
| 3.4.1 §4 | Superset execution mode in workout player | Field exists, player ignores it |
| 3.4.2 | "Last session" reference on active exercise view | Not shown during workout |
| 3.5.2 | Body map visual selector for muscle group filtering | Text-based filter only |
| 3.6.2 | Daily to-do auto-generation system | No implementation |
| 3.8.2 | AI progress reports (weekly summary) | No endpoint or UI |
| 3.9.1 | Streak system with freeze logic | Schema only, nothing writes |
| 3.9.2 | Badge/achievement system with trophy case | Schema only |
| 9.2 | Offline AI request queueing | Not implemented |
| 9.3 | Export functionality (JSON/CSV) | Not implemented |

---

## Session Log

| Date | Summary |
|------|---------|
| 2026-02-11 | Initial project audit. Documented architecture, identified stub features (badges, streaks, dailyTodos, bodyAnalyses), catalogued 5 bugs, found dead code (pplScheduler.ts). Created roadmap. Reviewed original spec — aligned phase structure, identified 14 spec-vs-implementation gaps, 2 missing API endpoints. |
| 2026-02-12 – 2026-02-18 | Major feature sprint: Dashboard trackers (water, sleep, calories with quick-add & daily goals), custom data series with charting & overlay, Withings dashboard widget, check-in banner, AI chat panel (floating FAB + contextual Q&A), workout templates (35 curated templates including dumbbell/bodyweight circuits & supersets), template browser page, calendar day modal with workout creation, exercise swap/remove during active workouts, UTC date migration fix. |
| 2026-02-19 | Workout day scheduling: users specify training days (Mon-Sun), PPL cycle advances only on those days with O(1) counting algorithm. Smart off-day suggestions with muscle-overlap conflict scoring. DayPicker component. 6-step onboarding with training day picker. Rest day styling across dashboard, calendar, and week strip. Added 14 new dumbbell+bodyweight templates (circuits & supersets). Fixed UTC date migration for tracker data. Updated roadmap. |
