# Convex Backend

Convex functions and schema for the backend database and API.

## Structure

```
convex/
├── schema.ts                  # Database schema definitions
├── dashboard*.ts              # Dashboard query functions
│   ├── dashboard.ts           # Main dashboard queries
│   ├── dashboardOverview.ts   # Overview page queries
│   ├── dashboardCustomers.ts  # Customer queries
│   ├── dashboardQuality.ts    # Quality metrics queries
│   ├── dashboardOperations.ts # Operations queries
│   ├── dashboardRevenue.ts    # Revenue queries
│   ├── dashboardFilters.ts    # Filter utilities
│   └── dashboardShared.ts     # Shared dashboard utilities
├── essays.ts                  # Essay management queries
├── essayRequests.ts           # Essay request queries
├── essayRequestsActions.ts    # Essay request actions
├── messages.ts                # Message persistence queries
├── threads.ts                 # Thread management queries
├── migrations.ts              # Database migrations
├── myFunctions.ts             # Example/test functions
└── _generated/                # Auto-generated types
    ├── api.d.ts              # Function API types
    ├── dataModel.d.ts        # Schema types
    └── server.d.ts           # Server types
```

## Schema (`schema.ts`)

Centralized database schema defining all tables:
- Table definitions with field types
- Indexes for query optimization
- Validation rules
- Type-safe schema

**Key Tables:**
- `messages`: Chat messages
- `threads`: Conversation threads
- `essays`: Essay content
- `essayRequests`: Essay request tracking
- Dashboard-related tables

## Dashboard Functions

Dashboard functions are organized by feature area:

### `dashboard.ts`
Main dashboard entry point and shared queries.

### `dashboardOverview.ts`
Overview page queries:
- High-level metrics
- KPIs
- Summary statistics

### `dashboardCustomers.ts`
Customer management:
- Customer list queries
- Customer details
- Customer analytics

### `dashboardQuality.ts`
Quality metrics:
- Quality scores
- Quality trends
- Quality analysis

### `dashboardOperations.ts`
Operations data:
- Operational metrics
- Workflow data
- Process information

### `dashboardRevenue.ts`
Revenue analytics:
- Revenue queries
- Revenue trends
- Financial metrics

### `dashboardFilters.ts`
Filter utilities:
- Filter validation
- Filter normalization
- Common filter logic

### `dashboardShared.ts`
Shared dashboard utilities:
- Common query patterns
- Shared data transformations
- Reusable helpers

## Message & Thread Management

### `messages.ts`
Message persistence:
- Save user messages
- Save assistant messages
- Retrieve conversation history
- Message queries

### `threads.ts`
Thread management:
- Create threads
- Get thread by ID
- List threads
- Thread metadata

## Essay Management

### `essays.ts`
Essay content queries:
- Get essay by ID
- List essays
- Essay metadata

### `essayRequests.ts`
Essay request queries:
- Request status
- Request history
- Request details

### `essayRequestsActions.ts`
Essay request actions:
- Create requests
- Update request status
- Process requests

## Function Types

### Queries
Read-only functions that query the database:
```ts
export const getDashboardOverview = query({
  args: { filters: v.object({...}) },
  handler: async (ctx, args) => {
    // Query database
    return data;
  },
});
```

### Mutations
Functions that modify the database:
```ts
export const createThread = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("threads", {...});
    return id;
  },
});
```

### Actions
Functions that can call external APIs or perform side effects:
```ts
export const processEssayRequest = action({
  args: { requestId: v.id("essayRequests") },
  handler: async (ctx, args) => {
    // Call external API, perform side effects
    return result;
  },
});
```

## Usage in Frontend

### Queries
```tsx
import { useQuery } from "convex/react";
import { api } from "@elevated-school/backend/convex/_generated/api";

function Dashboard() {
  const data = useQuery(api.dashboardOverview.getOverview, {
    filters: { dateRange: "last30days" },
  });
  // ...
}
```

### Mutations
```tsx
import { useMutation } from "convex/react";

function Component() {
  const createThread = useMutation(api.threads.create);
  
  const handleCreate = () => {
    createThread({ title: "New Thread" });
  };
}
```

## Type Safety

All functions are fully typed:
- Argument validation with `v.*` validators
- Return types inferred
- Auto-generated API types
- Type-safe database queries

## Best Practices

1. **Group by Domain**: Functions grouped by feature area
2. **Shared Utilities**: Common logic in `dashboardShared.ts`
3. **Validation**: All arguments validated
4. **Error Handling**: Proper error handling and messages
5. **Performance**: Efficient queries with indexes
6. **Type Safety**: Full TypeScript coverage

## Migrations

Database schema changes handled via `migrations.ts`:
- Version tracking
- Schema updates
- Data transformations
- Backward compatibility

## Development

```bash
# Start Convex dev server
bun run dev:server

# Push functions to deployment
npx convex deploy

# View Convex dashboard
npx convex dashboard
```

## Environment

Convex configuration in `convex.config.ts`:
- Deployment settings
- Environment variables
- Function configuration

## Documentation

- [Convex Docs](https://docs.convex.dev)
- [Convex Functions](https://docs.convex.dev/functions)
- [Convex Schema](https://docs.convex.dev/database/schema)
