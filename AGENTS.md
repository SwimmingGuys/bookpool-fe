# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Vite dev server with HMR (프록시로 /api → 백엔드)
npm run build    # tsc -b (typecheck) then vite build
npm run lint     # ESLint over the repo
npm run preview  # Serve the production build
```

There is no test runner configured. Type-checking happens via `tsc -b` as part of `build`; run `npx tsc -b` to typecheck without bundling. `npm run lint` must pass — `eslint-plugin-react-hooks` v7 is on, and its `set-state-in-effect` / `refs` rules are **errors**, not warnings.

## Stack

React 19 + TypeScript + Vite, React Router v7 (`BrowserRouter`), Tailwind CSS v4 (via `@tailwindcss/vite`, no `tailwind.config` — configured in `src/index.css`). `lucide-react` for icons. The `@/*` path alias maps to `src/*` (set in both `vite.config.ts` and `tsconfig.app.json`).

The product (BookPool) is a Korean-language platform for book review/beta-reader recruitments. UI copy is in Korean.

## Architecture

### Backend-connected — one HTTP client, one error type
The frontend talks to a Spring backend. **All requests go through `lib/api/client.ts`**; there is no second client.

- `BASE_URL` defaults to `/api` (same origin). `vite.config.ts` proxies `/api` to `VITE_API_PROXY_TARGET` in dev. Set `VITE_API_BASE_URL` (including `/api`) only to call a different origin directly.
- `ENDPOINTS` is the single place where paths live. Add new ones there, not inline.
- `apiRequest(path, { method, body, query, auth, retryOnAuth, token })` unwraps the backend's `ApiResult<T>` envelope and returns `data`. `apiUpload` handles multipart.
- On 401 it calls `/reissue` once (deduped across concurrent requests) and retries; `lib/auth.ts` wires `configureClient` to persist the refreshed token and clear the session when refresh fails.
- Every failure throws `AuthError` (aliased `ApiError`) with a typed `.code` (`ApiErrorCode`) and a Korean `.message`. Branch on `.code`, surface `.message`. `isNotFound(err)` distinguishes a missing resource from a network/server failure — the detail pages rely on this.
- The admin session is separate: `lib/adminAuth.ts` persists its own token and admin calls pass it via the `token` option, so it never touches the user's `accessToken`.

Per-domain modules (`campaigns`, `notices`, `inquiries`, `notifications`, `reviews`, `uploads`, `auth`, `adminAuth`) own the mapping between backend DTOs (UPPER_SNAKE enums, `publisherName`, `deadlineAt`) and the frontend domain types. **Keep that translation inside `lib/api/`** — components never see backend field names.

### Data fetching: `useAsyncData`, not a data library
Page-scoped fetches use `lib/useAsyncData.ts`, which returns `{ data, status, error, isLoading, reload }`. It serializes its `deps` to compare them, so inline arrays/objects are fine. Always render three states — skeleton while `loading`, `ErrorState` with `onRetry` on `error`, `EmptyState` only when the result really is empty. Showing "결과 없음" during a fetch was a real bug; don't reintroduce it.

`lib/recruitmentsSource.ts` builds on it:
- `useRecruitmentList` — server-side search/filter/sort with "더 보기" pagination. The first page lives in `useAsyncData`; only appended pages are local state.
- `useRecruitmentCalendar` — the visible month only (the calendar needs every posting in that month to draw).
- `useRecruitment` — single fetch for the detail page. **Never look a recruitment up in a list cache**; direct links broke that way.

**Filtering and sorting belong on the server.** `filterRecruitments`/`sortRecruitments` in `lib/recruitmentFilter.ts` are only for bounded, fully-loaded sets (the favorites-only board view, a selected calendar day).

### State: hand-rolled external stores, not a state library
Shared or persisted state uses `useSyncExternalStore` over a small store, **not** Context or Redux/Zustand:

- **`lib/createStore.ts`** — generic factory with optional `localStorage` persistence and cross-tab `storage` sync. Used by `lib/auth.ts` (`bookpool:auth-v2`), `lib/adminAuth.ts` (`bookpool:admin-auth`), `lib/toast.ts`.
- **Per-user module stores** — `lib/recruitmentState.ts` (favorites, recently-viewed) and `lib/notifications.ts` (subscription, notification queue) hand-roll listener sets plus a cache keyed by the current user id, reloaded by a `syncXUser(userId)` called from a `useEffect`. Mutations are optimistic and roll back on failure.

Always pass a stable `getServerSnapshot` (the `EMPTY_*` constants) so snapshots stay referentially stable.

### React rules that bite here
- **No `setState` synchronously inside an effect.** To reset state when an input changes, compare against previous state *during render* (see `BoardPage`'s `syncedQuery`, `useAsyncData`'s `requestKey`).
- **No writing refs during render.** Update a "latest value" ref inside a `useEffect` with no deps, declared *before* the effect that reads it.

### Routing
All routes are in `src/App.tsx`. Auth pages (`/login`, `/signup`, `/forgot-password`) and the whole `/admin` tree render outside `<Layout>`; everything else renders inside it (`Header` + `<Outlet>`). `/mypage` is a nested layout route (`account` / `recruitments` / `notifications`). `vercel.json` rewrites all non-`/api` paths to `index.html` — without it, deep links 404 in production.

### Domain model
`types/recruitment.ts` is the core type. Key invariants:
- `RecruitmentType` is `'Reviewer' | 'Beta Reader'`; map to Korean via `RECRUITMENT_TYPE_LABELS` / `RECRUITMENT_TYPE_OPTIONS`, never hardcode the Korean strings. The same goes for `BOOK_FORMAT_LABELS`, `REVIEW_CHANNEL_LABELS`, `RECRUITMENT_SOURCE_LABELS`, `PUBLISH_STATUS_LABELS`.
- `CATEGORIES` is the canonical category list (`as const`).
- `applyUrl` is the whole point of a posting — a recruitment without one shows a disabled CTA, and the admin list flags it.
- `publishStatus` (`draft` | `published`) is the review queue. Crawled postings will arrive as `draft` and go through the same admin screen; keep that path working.
- `source` / `sourceUrl` / `collectedAt` record where a posting came from. `recruitmentDedupeKey()` (book + publisher + deadline) is how the same posting from multiple sources is recognized.

### Dates
`lib/date.ts` owns the real "today" (`TODAY_DATE` / `TODAY_ISO`, computed once at module load, local time). Use `parseIsoDate` / `toLocalIsoDate` rather than `new Date(iso)` or `toISOString()` — both shift the day in KST. `daysUntil`, `formatFullDate`, `formatMonthDay`, `getWeekdayKo`, `formatRelativeTime` live here too.

### SEO / sharing
`usePageMeta` (`lib/useDocumentTitle.ts`) sets title, description, OG/Twitter tags and canonical per route; `og:image` is only emitted when a real image exists. Postings spread by link, so keep detail pages calling it. Note the app is CSR — crawlers that don't run JS see only `index.html`'s defaults, so per-posting previews still need prerendering.

### Styling
Compose class names with `cn()` from `lib/cn.ts` (clsx + tailwind-merge). `components/ui/` holds reusable primitives (`Button`, `Badge`, `Chip`, `Toast`, `Skeleton`, `ErrorState`, `StarRating`, `ShareButton`); `components/{home,board,auth,layout,recruitment,notice,admin}/` hold feature components.

## Conventions

- Per user preference: cards stay visually simple (no thumbnails/progress bars). When showing PR or issue text, output it for the user to copy rather than invoking the `gh` CLI directly.
