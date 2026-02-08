# Elevated School

A full-stack application built with Next.js, Convex, and AI capabilities for managing educational content and providing an AI-powered companion interface.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Convex (real-time database and backend functions)
- **AI**: Vercel AI SDK, Google AI SDK, E2B Code Interpreter
- **Monorepo**: Turborepo with Bun package manager
- **UI Components**: shadcn/ui, Radix UI, Base UI

## Project Structure

```
elevated-school/
├── apps/
│   └── web/                    # Next.js web application
│       ├── src/
│       │   ├── app/            # Next.js App Router pages and routes
│       │   │   ├── (landing)/  # Landing page route group
│       │   │   ├── dashboard/  # Dashboard pages (customers, quality, operations, revenue, companion)
│       │   │   └── api/        # API routes (AI chat endpoint)
│       │   ├── components/     # React components
│       │   │   ├── dashboard/  # Dashboard-specific components
│       │   │   ├── landing/    # Landing page components
│       │   │   ├── ai-elements/# AI-related UI components
│       │   │   └── ui/         # shadcn/ui base components
│       │   ├── lib/            # Utility libraries and business logic
│       │   │   └── ai/         # AI agent system, tools, and message handling
│       │   └── hooks/          # React hooks
│       └── public/             # Static assets
│
├── packages/
│   ├── backend/                # Convex backend package
│   │   └── convex/            # Convex functions and schema
│   │       ├── schema.ts      # Database schema definitions
│   │       ├── dashboard*.ts  # Dashboard query functions
│   │       ├── essays.ts      # Essay management
│   │       ├── messages.ts    # Message persistence
│   │       ├── threads.ts     # Thread management
│   │       └── ...            # Other Convex functions
│   ├── config/                # Shared TypeScript configuration
│   └── env/                   # Environment variable management
│
└── .agents/                   # Agent skills and documentation
```

## Getting Started

### Prerequisites

- Bun 1.3.3+ (package manager)
- Node.js 18+ (for Convex CLI)
- Convex account and project

### Installation

```bash
# Install dependencies
bun install

# Set up Convex (if not already configured)
bun run dev:setup
```

### Development

```bash
# Start all services
bun run dev

# Start specific services
bun run dev:web          # Web app only (port 3001)
bun run dev:server       # Convex backend only
```

### Environment Variables

Create `.env.local` in the root directory:

```env
# Convex
CONVEX_URL=your-convex-url
NEXT_PUBLIC_CONVEX_URL=your-convex-url

# AI (if needed)
GOOGLE_GENERATIVE_AI_API_KEY=your-api-key
E2B_API_KEY=your-api-key
```

## Key Features

### 1. Dashboard
Multi-page dashboard with analytics and data visualization:
- **Overview**: High-level metrics and KPIs
- **Customers**: Customer management and insights
- **Quality**: Quality metrics and analysis
- **Operations**: Operational data and workflows
- **Revenue**: Revenue tracking and analytics
- **Companion**: AI-powered chat interface

### 2. AI Companion
Intelligent chat interface powered by Google AI with:
- Context-aware conversations
- Tool integration (Convex queries, E2B code execution)
- Thread management and persistence
- Message sanitization and hydration
- Real-time streaming responses

### 3. Landing Page
Marketing landing page with:
- Hero section with animations
- Services showcase
- Testimonials
- Cheat sheet form
- Responsive design

## Architecture Highlights

### Monorepo Structure
- **Turborepo**: Build system and task orchestration
- **Workspace packages**: Shared code between apps
- **Type-safe imports**: TypeScript path aliases configured

### AI System Architecture
The AI system (`apps/web/src/lib/ai/`) is modularly structured:
- **Agent**: Core agent implementation (`agents/companion-agent.ts`)
- **Tools**: External integrations (`tools/`)
- **Message Handling**: Sanitization, hydration, persistence
- **Context Building**: Dynamic context assembly from filters and page state
- **Thread Management**: Conversation thread resolution and caching

### Backend Architecture
Convex functions are organized by domain:
- Dashboard queries grouped by feature area
- Shared utilities in `dashboardShared.ts`
- Schema-driven type safety
- Real-time subscriptions for live data

## Code Organization

### Frontend (`apps/web/src/`)
- **`app/`**: Next.js App Router structure with route groups
- **`components/`**: Feature-based component organization
- **`lib/`**: Business logic, utilities, and AI system
- **`hooks/`**: Reusable React hooks

### Backend (`packages/backend/convex/`)
- **Schema**: Centralized data model (`schema.ts`)
- **Queries**: Read operations grouped by domain
- **Mutations**: Write operations (if any)
- **Actions**: External API calls and side effects

## Development Guidelines

- **TypeScript**: Strict mode enabled, type-safe throughout
- **Code Style**: ESLint + Prettier configured
- **Component Patterns**: Composition over inheritance
- **State Management**: React hooks + Convex real-time queries
- **Error Handling**: Try-catch with proper error boundaries

## Scripts

```bash
# Development
bun run dev              # Start all services
bun run dev:web          # Web app only
bun run dev:server      # Backend only

# Build & Quality
bun run build           # Build all packages
bun run check-types     # Type check all packages
bun run lint            # Lint all packages
bun run format:check    # Check formatting
bun run format:write    # Format all code
```

## Documentation

- **[Web App README](./apps/web/README.md)**: Detailed web application documentation
- **[AI System README](./apps/web/src/lib/ai/README.md)**: AI architecture and implementation
- **[Components README](./apps/web/src/components/README.md)**: Component organization guide
- **[Backend README](./packages/backend/convex/README.md)**: Convex functions and schema

## Notes

This codebase was built as a technical interview takehome project, demonstrating:
- Full-stack development with modern frameworks
- AI integration and agent systems
- Real-time data with Convex
- Monorepo architecture
- Type-safe development practices