# Elevated Dashboard: Technical Report

## Overview

This document walks through the architecture and key decisions behind my takehome. The goal was to build a full-stack analytics dashboard with Next.js 16, React 19, and Convex. Rather than catalog every file, I'll focus on the three areas that matter most: how the code is organized, how the UI handles real users, and how queries stay fast at scale.

NOTE: You I've added README.md files throughout the project to document the codebase. If you'd like a more in-depth explanation of each section of the application look at those.

## 1. Code Organization

### The Problem with Monolithic Approaches

Early in development, I had a single massive query that fetched all dashboard data at once—customers, revenue, operations, quality metrics, everything. The frontend then picked what it needed. This worked fine with 500 rows, but it's a scaling dead-end: every page loads data it doesn't use, payloads balloon, and caching becomes nearly impossible.

### Route-Scoped Queries

I restructured around a simple principle: **each page should fetch only what it renders**.

```
packages/backend/convex/
├── dashboardOverview.ts      # /dashboard
├── dashboardCustomers.ts     # /dashboard/customers
├── dashboardOperations.ts    # /dashboard/operations
├── dashboardQuality.ts       # /dashboard/quality
├── dashboardRevenue.ts       # /dashboard/revenue
└── dashboardShared.ts        # Common utilities
```

When a user visits `/dashboard/customers`, the app calls `getCustomers`—not a catch-all `getDashboard` function. This keeps payloads small (50-100KB vs. ~500KB), improves cache hit rates, and lets me optimize each query independently.

The shared module (`dashboardShared.ts`) contains common logic like date range parsing and filter validation. This avoids duplication without coupling unrelated features.

### Frontend Component Structure

Components are grouped by feature, not by technical role:

```
components/
├── dashboard/
│   ├── dashboard-context.tsx   # Shared filter state
│   ├── chart-card.tsx          # Reusable chart wrapper
│   ├── kpi-card.tsx            # Metric display
│   └── filters/                # Filter UI
├── landing/                    # Marketing pages
└── ui/                         # Base components (buttons, cards, etc.)
```

This means when I need to modify customer analytics, everything I need lives in one place. I'm not hunting through `components/charts/`, `components/cards/`, and `components/layouts/` to piece together a feature.

### Why Monorepo?

The project uses Turborepo with shared packages:

```
elevated-school/
├── apps/web/                  # Next.js frontend
├── packages/backend/          # Convex database layer
├── packages/config/           # Shared TypeScript configs
└── packages/env/              # Environment validation
```

The main benefit here is **type safety across boundaries**. When I define a schema in Convex, TypeScript types flow automatically to the frontend. If I rename a field in the database schema and forget to update a component, the build fails—not the user's session.

## 2. Effective UI Design

### The Core Problem: Users Don't Wait

The trickiest UI challenge in dashboards is filter changes. A user selects a new date range, and suddenly the data they were looking at vanishes while the new query runs. This creates a jarring experience—especially on slower connections or with larger datasets.

### Stable Data During Transitions

I solved this with React's `useDeferredValue` combined with a custom hook that preserves the last valid data:

```typescript
// Simplified version of the pattern
function useStableQueryData<T>(liveData: T | undefined) {
  const [stableData, setStableData] = useState<T | undefined>(liveData);

  useEffect(() => {
    if (liveData !== undefined) setStableData(liveData);
  }, [liveData]);

  return stableData;
}
```

When filters change, the previous data stays visible until new results arrive. A subtle loading indicator shows the update is in progress, but the user never sees an empty chart. This mirrors how applications like Notion and Linear handle data transitions—the old content remains until there's something better to show.

### Loading States That Match Layout

Every data component has a corresponding skeleton that matches its dimensions:

```typescript
function DashboardPageSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-xl" />
      ))}
    </div>
  );
}
```

This prevents layout shift—the page doesn't jump around as content loads. Users see the structure immediately, which makes the wait feel shorter even when it isn't.

### Error Recovery

When the AI companion fails mid-conversation, the error handler doesn't just show a generic message:

```typescript
onError: () => {
  toast.error("AI companion run failed.", {
    description: "Reopen the thread to retry.",
    action: {
      label: "Open thread",
      onClick: () =>
        router.push(`/dashboard/companion?threadId=${failedThreadId}`),
    },
  });
};
```

The user gets context (what failed), guidance (how to fix it), and a direct action (one-click retry). This matters because errors will happen—the question is whether users can recover without confusion.

### Anticipating Edge Cases

A few specific behaviors I accounted for:

- **Rapid filter changes**: Using `useDeferredValue` means the UI doesn't queue up every intermediate state. If a user clicks through five filter options quickly, only the final state triggers a full render.
- **Empty states**: When queries return no results, the UI shows an appropriate message rather than blank space.
- **Mobile breakpoints**: The grid layouts adapt (`md:grid-cols-2 lg:grid-cols-4`), and interactive elements remain usable on touch screens.

---

## 3. Query Runtime Efficiency

### Why This Matters

The dataset currently has around 2,500 rows. The evaluation mentions 5,000+ rows, but I designed for 50,000+ because that's where naive approaches start falling apart. The key insight: **query time should be roughly constant regardless of table size**—which means using indexes properly.

### Index Strategy

Convex (like most databases) scans entire tables by default. With 50,000 rows, that's slow. Indexes let the database jump directly to matching rows.

I created compound indexes that match my query patterns:

```typescript
essays: defineTable({...})
  .index("by_status_turnaround_and_submitted_at", [
    "item_status",
    "turnaround",
    "submittedAtMs"
  ])
```

The order matters: equality filters (`status = 'pending'`) come first, range filters (`date >= X AND date <= Y`) come last. This lets the database narrow down rows efficiently before applying range conditions.

Here's how queries use the index:

```typescript
ctx.db.query("essays").withIndex("by_status_turnaround_and_submitted_at", (q) =>
  q
    .eq("item_status", args.status) // Uses index: direct lookup
    .eq("turnaround", args.turnaround) // Uses index: further narrowing
    .gte("submittedAtMs", fromMs) // Uses index: range scan
    .lte("submittedAtMs", toMs),
);
```

Without the index, this query scans all 50,000 rows. With it, the database reads only matching rows—potentially a 100x improvement.

### Denormalization

Some filters required data from related tables. For example, filtering essays by `student_acquisition_channel` originally meant joining the `students` table on every query. At scale, joins compound the problem.

I denormalized these fields directly onto the `essays` table:

```typescript
essays: defineTable({
  // Original fields
  item_id: v.string(),
  revenue: v.number(),
  // Denormalized from students table
  student_acquisition_channel: v.optional(v.string()),
  student_is_multi_draft: v.optional(v.boolean()),
});
```

This is a tradeoff: slightly more storage and a backfill migration, but queries that previously required joins now hit a single indexed table. For read-heavy analytics dashboards, that's the right tradeoff.

### Pagination for Large Lists

The operations page shows individual essays—potentially thousands. Loading all of them at once would be slow and memory-intensive. Instead, I use cursor-based pagination:

```typescript
const unassigned = usePaginatedQuery(
  api.dashboardOperations.listUnassignedEssays,
  queryArgs,
  { initialNumItems: 20 },
);

// User clicks "Load more"
unassigned.loadMore(20);
```

The initial load fetches 20 items. The user sees results in under 100ms. They can load more on demand, but we're never fetching thousands of rows upfront.

### Server-Side Aggregation

Charts need aggregated data—totals, averages, distributions. I compute these on the server rather than sending raw rows to the client:

```typescript
// Server: compute once
export async function computeKPIs(essays: Essay[]): Promise<KPIs> {
  return {
    totalRevenue: essays.reduce((sum, e) => sum + e.revenue, 0),
    activeCustomers: new Set(essays.map((e) => e.student_id)).size,
    // ...
  };
}
```

The client receives `{ totalRevenue: 125000, activeCustomers: 847 }`—not an array of 5,000 objects it has to process. This keeps payloads small and keeps expensive computation off user devices.

### Scaling Projections

The current architecture should handle 50,000 rows without modification. Beyond that, I'd add pre-computed aggregation tables and background refresh jobs—but that's premature optimization for the current scale.

## Technical Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Convex (real-time database with automatic subscriptions)
- **AI**: Vercel AI SDK with Google Gemini
- **Build**: Turborepo, Bun

## Summary

Each decision has tradeoffs, but they're calibrated for a read-heavy analytics application that needs to scale beyond current data volumes while remaining responsive to real user behavior.
