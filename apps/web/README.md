# Web Application

Next.js 16 web application with AI-powered features, dashboard analytics, and a marketing landing page.

## Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (landing)/         # Route group for landing page
│   │   │   └── landing/       # Landing page route
│   │   ├── dashboard/         # Dashboard routes
│   │   │   ├── customers/     # Customer management page
│   │   │   ├── quality/       # Quality metrics page
│   │   │   ├── operations/    # Operations page
│   │   │   ├── revenue/       # Revenue analytics page
│   │   │   └── companion/     # AI companion chat page
│   │   ├── api/               # API routes
│   │   │   └── ai/            # AI chat endpoint (POST /api/ai)
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home/index page
│   │
│   ├── components/            # React components
│   │   ├── dashboard/         # Dashboard-specific components
│   │   │   ├── companion-chat.tsx      # Main chat interface
│   │   │   ├── companion-context.tsx   # Chat context provider
│   │   │   ├── app-sidebar.tsx         # Dashboard sidebar navigation
│   │   │   └── filters/                # Filter components
│   │   ├── landing/           # Landing page components
│   │   │   ├── hero.tsx               # Hero section with animations
│   │   │   ├── navbar.tsx             # Navigation bar
│   │   │   ├── cheat-sheet.tsx        # Cheat sheet form section
│   │   │   ├── services.tsx           # Services showcase
│   │   │   └── ...                    # Other landing sections
│   │   ├── ai-elements/        # AI-related UI components
│   │   │   ├── python-code-block.tsx  # Python code display
│   │   │   └── tool-indicator.tsx     # Tool execution indicators
│   │   └── ui/                # Base UI components (shadcn/ui)
│   │
│   ├── lib/                   # Libraries and utilities
│   │   ├── ai/                # AI system (see lib/ai/README.md)
│   │   ├── utils.ts           # General utilities
│   │   ├── convex.ts          # Convex client setup
│   │   └── use-query.ts       # Custom query hooks
│   │
│   └── hooks/                 # React hooks
│       └── use-thread-cache.ts # Thread caching hook
│
├── public/                    # Static assets
└── package.json
```

## Key Features

### Dashboard Pages

Each dashboard page (`/dashboard/*`) provides:
- Real-time data from Convex
- Filtering and search capabilities
- Responsive layouts
- Navigation via sidebar

**Pages:**
- `/dashboard` - Overview/landing
- `/dashboard/customers` - Customer management
- `/dashboard/quality` - Quality metrics
- `/dashboard/operations` - Operations data
- `/dashboard/revenue` - Revenue analytics
- `/dashboard/companion` - AI chat interface

### AI Companion (`/dashboard/companion`)

The AI companion is a sophisticated chat interface that:
- Streams responses in real-time
- Maintains conversation threads
- Integrates with Convex for data queries
- Supports code execution via E2B
- Sanitizes and persists messages

See [`src/lib/ai/README.md`](./src/lib/ai/README.md) for detailed architecture.

### Landing Page (`/landing`)

Marketing landing page featuring:
- Animated hero section
- Services showcase
- Testimonials
- Cheat sheet form
- Responsive design with custom animations

### API Routes

#### `POST /api/ai`

Main AI chat endpoint that:
- Accepts messages, filters, and page context
- Resolves or creates conversation threads
- Builds dynamic system prompts
- Streams AI responses
- Persists messages to Convex

**Request Body:**
```typescript
{
  messages?: UIMessage[];
  message?: UIMessage;
  filters?: FilterState;
  page?: PageContext;
  threadId?: string;
}
```

## Component Organization

Components are organized by feature area:

- **`components/dashboard/`**: Dashboard-specific components
- **`components/landing/`**: Landing page components
- **`components/ai-elements/`**: Reusable AI UI components
- **`components/ui/`**: Base UI primitives (shadcn/ui)

See [`src/components/README.md`](./src/components/README.md) for more details.

## State Management

- **Convex**: Real-time data via `useQuery` and `useMutation`
- **React Context**: `CompanionContext` for chat state
- **URL State**: `nuqs` for filter and page state persistence
- **Local State**: React hooks for component-level state

## Styling

- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Component library built on Radix UI
- **Custom Animations**: Motion (Framer Motion) for animations
- **Responsive**: Mobile-first approach

## Environment Variables

Required environment variables:

```env
# Convex
CONVEX_URL=your-convex-url
NEXT_PUBLIC_CONVEX_URL=your-convex-url

# AI (optional, for AI features)
GOOGLE_GENERATIVE_AI_API_KEY=your-key
E2B_API_KEY=your-key
```

## Development

```bash
# Start dev server (port 3001)
bun run dev

# Type check
bun run check

# Lint
bun run lint

# Format
bun run format:write
```

## Build

```bash
# Production build
bun run build

# Start production server
bun run start
```

## Dependencies

Key dependencies:
- **Next.js 16**: React framework with App Router
- **React 19**: UI library
- **Convex**: Backend and real-time database
- **Vercel AI SDK**: AI streaming and tool integration
- **Tailwind CSS**: Styling
- **shadcn/ui**: Component library
- **Motion**: Animations