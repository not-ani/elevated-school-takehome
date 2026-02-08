# Performance Optimizations Technical Report

## Executive Summary

This report documents the dashboard and realtime-query performance refactor delivered in the monorepo. The work replaces a monolithic, over-fetching query architecture with a route-scoped query model optimized for Convex indexing, pagination, and reactive subscriptions. It also addresses UI flicker during filter transitions using React concurrent patterns and stable-data rendering.

Primary outcomes:

- Eliminated the single large dashboard query path and moved to smaller route-specific queries.
- Reduced client-side data shaping and sorting by moving critical computation server-side.
- Added schema-level denormalized fields and indexes to align query shapes with index constraints.
- Introduced cursor-based pagination for heavy list surfaces.
- Reduced filter-change flicker through deferred query args, transitions, and stale-while-refresh rendering.

---

## 1) Baseline Bottlenecks Identified

### Query and data-shape issues

- One monolithic query fed all dashboard pages from layout, even when each route needed only a subset.
- Over-fetching occurred at both network and compute levels.
- Multiple data transforms (sort/slice/grouping) happened on the client.
- Large `.collect()` query patterns and post-filter logic increased server work and transfer size.

### Realtime and pagination issues

- Table-like datasets were truncated with array slicing instead of true cursor pagination.
- Companion messages used unpaginated retrieval.

### UX rendering issues

- Filter updates caused visible flicker due to immediate query arg churn and transient empty states.
- A shared utility module mixed server-safe helpers with client-only query hooks, causing RSC runtime constraints.

---

## 2) Backend Architecture Refactor (Convex)

### 2.1 Query decomposition

Created route-scoped query modules:

- `packages/backend/convex/dashboardOverview.ts`
- `packages/backend/convex/dashboardRevenue.ts`
- `packages/backend/convex/dashboardCustomers.ts`
- `packages/backend/convex/dashboardQuality.ts`
- `packages/backend/convex/dashboardOperations.ts`
- `packages/backend/convex/dashboardFilters.ts`

Shared query primitives moved to:

- `packages/backend/convex/dashboardShared.ts`

This module centralizes:

- typed filter validators and argument contracts,
- date-range normalization,
- residual filter logic,
- KPI/series/breakdown aggregators,
- student rollups and channel performance derivations.

### 2.2 Schema/index alignment for query performance

Enhanced `packages/backend/convex/schema.ts` (`essays` table) with denormalized dimensions and targeted indexes.

Added fields:

- `student_acquisition_channel`
- `student_is_multi_draft`
- `student_location`
- `draft_bucket`
- `is_late`

Added indexes:

- `by_status_turnaround_and_submitted_at`
- `by_draft_bucket_and_submitted_at`
- `by_student_channel_and_submitted_at`
- `by_student_type_and_submitted_at`
- `by_is_late_and_submitted_at`

These indexes match the dashboard filter dimensions and reduce broad scans/post-filtering.

### 2.3 Migration and data backfill

Implemented migration in:

- `packages/backend/convex/migrations.ts`

New migration:

- `backfillEssayDashboardDimensions`

Behavior:

- paginates essays in batches,
- computes denormalized dimensions,
- patches only changed rows,
- self-schedules continuation via cursor.

Migration executed successfully; first run processed rows and subsequent runs were idempotent (`processed: 0`) while continuation remained available.

---

## 3) Realtime and Pagination Improvements

### 3.1 Operations tables

In `packages/backend/convex/dashboardOperations.ts`:

- `listUnassignedEssays` uses `paginationOptsValidator` + `.paginate(...)`
- `listLateDeliveries` uses indexed selection + `.paginate(...)`

In `apps/web/src/app/dashboard/operations/page.tsx`:

- switched to `usePaginatedQuery` for both tables,
- added load-more interactions,
- added stable-list behavior during first-page reload.

### 3.2 Companion chat history

In `packages/backend/convex/messages.ts`:

- added `listByThreadPaginated`

In `packages/backend/convex/threads.ts`:

- added `listPaginated`

In `apps/web/src/components/dashboard/companion-chat.tsx`:

- switched thread message history to `usePaginatedQuery`,
- preserved UX with reverse-order rendering and incremental load.

---

## 4) Frontend Query Topology and URL State

### 4.1 Layout responsibilities reduced

`apps/web/src/app/dashboard/layout.tsx` now:

- no longer hydrates all dashboard datasets,
- only retrieves filter option metadata,
- provides lightweight context values to route pages.

### 4.2 Dashboard context minimized

`apps/web/src/components/dashboard/dashboard-context.tsx` now carries:

- filter state,
- immediate query args,
- deferred query args,
- filter-transition status.

This reduces unnecessary rerender pressure from giant context objects.

### 4.3 URL-backed filter system (nuqs)

`apps/web/src/components/dashboard/filters/server.ts` and
`apps/web/src/components/dashboard/use-dashboard-query-args.ts`:

- enforce typed parser defaults,
- use `urlKeys` mapping for compact query params,
- use `createLoader(..., { urlKeys })` for server/client consistency.

---

## 5) Flicker Mitigation and Rendering Stability

### 5.1 React concurrent rendering strategies

Implemented:

- `useDeferredValue` for query-arg stabilization (`use-dashboard-query-args.ts`),
- `useTransition` for non-blocking filter updates (`layout.tsx`),
- sticky “previous data” rendering with `useStableQueryData` to avoid empty flashes.

### 5.2 Skeleton and loading UX

Added reusable and route-level loading surfaces:

- `apps/web/src/components/dashboard/dashboard-page-skeleton.tsx`
- `apps/web/src/app/dashboard/loading.tsx`
- `apps/web/src/app/dashboard/revenue/loading.tsx`
- `apps/web/src/app/dashboard/customers/loading.tsx`
- `apps/web/src/app/dashboard/quality/loading.tsx`
- `apps/web/src/app/dashboard/operations/loading.tsx`
- `apps/web/src/app/dashboard/companion/loading.tsx`

This improves perceived performance and removes abrupt blank states on route transitions.

### 5.3 RSC/client boundary fix

Resolved context/runtime error by splitting client-only query hook code:

- server-safe utility retained in `apps/web/src/lib/utils.ts`
- client-only hook isolated in `apps/web/src/lib/use-query.ts`

All dashboard query consumers were updated to import `useQuery` from `@/lib/use-query`.

---

## 6) Measurable Impact Areas

Expected and observed improvements:

1. **Lower payload size per route**
   - each dashboard route subscribes to only required data.

2. **Reduced recomputation and rerenders**
   - smaller context payload, server-side shaping, stable data during refresh.

3. **Improved DB query efficiency**
   - better alignment between filter dimensions and compound indexes.

4. **Scalable list rendering**
   - cursor pagination replaces static slicing.

5. **Improved interaction smoothness**
   - deferred filter args + transition scheduling reduce flicker and jank.

---

## 7) Risk Controls and Operational Notes

- Migration designed to be idempotent (patch only on change).
- Query arg parsing uses typed defaults and explicit URL key mapping.
- Realtime UIs now preserve prior data during in-flight refresh, preventing content collapse.
- Convex codegen was rerun to synchronize generated API bindings with new modules.

---

## 8) Files Added/Updated (Performance-Significant)

### Added

- `packages/backend/convex/dashboardShared.ts`
- `packages/backend/convex/dashboardFilters.ts`
- `packages/backend/convex/dashboardOverview.ts`
- `packages/backend/convex/dashboardRevenue.ts`
- `packages/backend/convex/dashboardCustomers.ts`
- `packages/backend/convex/dashboardQuality.ts`
- `packages/backend/convex/dashboardOperations.ts`
- `apps/web/src/lib/use-query.ts`
- `apps/web/src/components/dashboard/use-dashboard-query-args.ts`
- `apps/web/src/components/dashboard/use-stable-query-data.ts`
- `apps/web/src/components/dashboard/dashboard-page-skeleton.tsx`
- `apps/web/src/components/dashboard/query-types.ts`
- `apps/web/src/app/dashboard/loading.tsx`
- `apps/web/src/app/dashboard/revenue/loading.tsx`
- `apps/web/src/app/dashboard/customers/loading.tsx`
- `apps/web/src/app/dashboard/quality/loading.tsx`
- `apps/web/src/app/dashboard/operations/loading.tsx`
- `apps/web/src/app/dashboard/companion/loading.tsx`

### Updated

- `packages/backend/convex/schema.ts`
- `packages/backend/convex/migrations.ts`
- `packages/backend/convex/messages.ts`
- `packages/backend/convex/threads.ts`
- `apps/web/src/app/dashboard/layout.tsx`
- `apps/web/src/components/dashboard/dashboard-context.tsx`
- `apps/web/src/components/dashboard/filters/server.ts`
- `apps/web/src/app/dashboard/page.tsx`
- `apps/web/src/app/dashboard/revenue/page.tsx`
- `apps/web/src/app/dashboard/customers/page.tsx`
- `apps/web/src/app/dashboard/quality/page.tsx`
- `apps/web/src/app/dashboard/operations/page.tsx`
- `apps/web/src/components/dashboard/companion-chat.tsx`
- `apps/web/src/lib/utils.ts`

---

## 9) Next Technical Opportunities

1. Add request-level tracing (timings per dashboard query) to quantify p50/p95 latency improvements.
2. Add synthetic filter-churn benchmarks to validate zero-flicker target under rapid interactions.
3. Implement ingest-path denorm writes so migration is only historical, not maintenance.
4. Add query-contract tests for each route module to guarantee payload shape stability.
