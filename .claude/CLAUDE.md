# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Vite dev server with HMR
npm run build    # tsc -b (typecheck) then vite build
npm run lint     # ESLint over the repo
npm run preview  # Serve the production build
```

There is no test runner configured. Type-checking happens via `tsc -b` as part of `build`; run `npx tsc -b` to typecheck without bundling.

## Stack

React 19 + TypeScript + Vite, React Router v7 (`BrowserRouter`), Tailwind CSS v4 (via `@tailwindcss/vite`, no `tailwind.config` — configured in `src/index.css`). `lucide-react` for icons. The `@/*` path alias maps to `src/*` (set in both `vite.config.ts` and `tsconfig.app.json`).

The product (BookPool) is a Korean-language platform for book review/beta-reader recruitments. UI copy is in Korean.

## Architecture

### No backend — everything is mocked in the browser
There is no server. All "API" calls live in `src/lib/api/` (currently `auth.ts`) and persist to `localStorage` behind an artificial `delay()`. Recruitment listings come from `src/data/mockRecruitments.ts`, generated deterministically. Treat these modules as the seam where a real API would later plug in: components call the `lib/` hooks, not `localStorage` directly.

### State: hand-rolled external stores, not a state library
State that must persist or be shared across components uses `useSyncExternalStore` over a small store, **not** Context or Redux/Zustand. Two patterns coexist:

- **`lib/createStore.ts`** — generic factory with optional `localStorage` persistence and cross-tab `storage`-event sync. Used by `lib/auth.ts` (the `bookpool:auth-v2` key) and `lib/toast.ts`.
- **Per-user module-level stores** — `lib/recruitmentState.ts` (favorites, recently-viewed) and `lib/notifications.ts` hand-roll their own listener sets + cache keyed by the current user id (`bookpool:favorites:${userId}`, `bookpool:recent:${userId}`, etc.). A `syncXUser(userId)` function, called from a `useEffect` in the hook, reloads the cache when the logged-in user changes.

When adding shared state, follow the existing pattern (an external store exposed through a `useX()` hook) rather than introducing a state-management dependency. Always pass a stable `getServerSnapshot` (the `EMPTY_*` constants) to keep SSR/initial-render snapshots referentially stable.

### Auth
`lib/auth.ts` exposes `useAuth()` (login/signup/logout/updateProfile/changePassword). Mock auth in `lib/api/auth.ts` implements an email-verification flow: `sendVerificationCode` → `verifyCode` (stored in in-memory `Map`/`Set`, so codes do **not** survive reload) → `signup`/`resetPassword`. Errors are thrown as `AuthError` with a typed `code` (e.g. `EMAIL_EXISTS`, `CODE_EXPIRED`) — catch and branch on `.code`, surface `.message` (already Korean) to users. Registered users persist under `bookpool:mock-users`. Protected routes wrap elements in `<RequireAuth>` (`components/auth/RequireAuth.tsx`).

### Routing
All routes are declared in `src/App.tsx`. Public auth pages (`/login`, `/signup`, `/forgot-password`) render outside `<Layout>`; everything else renders inside `<Layout>` (`Header` + `<Outlet>`). `/mypage` is a nested layout route with `account` / `recruitments` / `notifications` children.

### Domain model
`types/recruitment.ts` is the core type. Key invariants:
- `RecruitmentType` is the union `'Reviewer' | 'Beta Reader'`; map to Korean labels via `RECRUITMENT_TYPE_LABELS` / `RECRUITMENT_TYPE_OPTIONS`, never hardcode the Korean strings.
- `CATEGORIES` is the canonical category list (`as const`).
- Filtering logic lives in `lib/recruitmentFilter.ts` (`filterRecruitments`, plus `validateQuery` which rejects `<>"'`;` chars and caps length). The board can sort/group by `lib/dateBasis.ts` (recruit-start vs recruit-end).

### Dates are deterministic by design
`lib/date.ts` defines a fixed demo "today" (`TODAY_ISO = '2026-05-23'`) so the calendar and mock data stay stable across runs. Use `TODAY_DATE` / `toIsoDate` / `formatMonthDay` / `getWeekdayKo` rather than `new Date()` directly when working with recruitment dates, or the deterministic UI will drift.

### Styling
Compose class names with `cn()` from `lib/cn.ts` (clsx + tailwind-merge). `components/ui/` holds the reusable primitives (`Button`, `Badge`, `Chip`, `Toast`, etc.); `components/{home,board,auth,layout}/` hold feature-specific components.

## Conventions

- Per user preference: cards stay visually simple (no thumbnails/progress bars). When showing PR or issue text, output it for the user to copy rather than invoking the `gh` CLI directly.
