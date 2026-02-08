# Components

React components organized by feature area and purpose.

## Structure

```
components/
├── dashboard/              # Dashboard-specific components
│   ├── companion-chat.tsx         # Main AI chat interface
│   ├── companion-context.tsx      # Chat context provider
│   ├── app-sidebar.tsx            # Dashboard navigation sidebar
│   ├── chat-message.tsx           # Individual chat message component
│   └── filters/                   # Filter components
│
├── landing/                # Landing page components
│   ├── hero.tsx                   # Hero section with animations
│   ├── navbar.tsx                 # Navigation bar
│   ├── cheat-sheet.tsx            # Cheat sheet form section
│   ├── cheat-sheet-form.tsx       # Form component
│   ├── cheat-sheet-benefits.tsx   # Benefits list
│   ├── services.tsx               # Services showcase
│   ├── stats.tsx                  # Statistics section
│   ├── difference.tsx             # Differentiators section
│   ├── testimonial.tsx            # Testimonials carousel
│   ├── founder.tsx                # Founders section
│   └── ...                        # Other landing sections
│
├── ai-elements/            # AI-related UI components
│   ├── python-code-block.tsx      # Python code display with syntax highlighting
│   └── tool-indicator.tsx         # Tool execution status indicators
│
└── ui/                     # Base UI components (shadcn/ui)
    ├── button.tsx
    ├── card.tsx
    ├── input.tsx
    └── ...                        # Other base components
```

## Component Categories

### Dashboard Components (`dashboard/`)

Components specific to the dashboard application:

#### `companion-chat.tsx`
Main chat interface component:
- Message list rendering
- Input handling
- Streaming response display
- Tool result visualization
- Scroll management

#### `companion-context.tsx`
Context provider for chat state:
- Message state management
- Thread management
- Message hydration
- Client-side sanitization
- Thread caching

#### `app-sidebar.tsx`
Dashboard navigation sidebar:
- Route navigation
- Active state management
- Responsive design
- Icon-based navigation

#### `chat-message.tsx`
Individual message component:
- User/assistant message rendering
- Tool call display
- Code block rendering
- Timestamp display

#### `filters/`
Filter components for dashboard pages:
- Date range pickers
- Category filters
- Search inputs
- Filter state management

### Landing Components (`landing/`)

Marketing landing page components:

#### `hero.tsx`
Hero section with:
- Animated text
- Background effects
- Call-to-action buttons
- Responsive layout

#### `navbar.tsx`
Navigation bar:
- Logo and branding
- Navigation links
- Responsive menu
- Scroll behavior

#### `cheat-sheet.tsx`
Cheat sheet form section:
- Form handling
- Validation
- Submission logic
- Benefits display

#### Other Landing Components
- `services.tsx`: Services showcase grid
- `stats.tsx`: Statistics/metrics display
- `difference.tsx`: Differentiators section
- `testimonial.tsx`: Testimonials carousel
- `founder.tsx`: Founders/team section

### AI Elements (`ai-elements/`)

Reusable components for AI features:

#### `python-code-block.tsx`
Displays Python code with:
- Syntax highlighting (Shiki)
- Copy functionality
- Execution results
- Error display

#### `tool-indicator.tsx`
Shows tool execution status:
- Tool name
- Execution state
- Results preview
- Loading states

### UI Components (`ui/`)

Base UI primitives from shadcn/ui:
- Form components (input, textarea, select)
- Layout components (card, sheet, dialog)
- Navigation components (button, link)
- Feedback components (toast, alert)

## Component Patterns

### Composition
Components are composed from smaller pieces:
```tsx
<CheatSheetSection>
  <CheatSheetForm />
  <CheatSheetBenefits />
</CheatSheetSection>
```

### Props Interface
Clear TypeScript interfaces:
```tsx
interface CompanionChatProps {
  threadId?: string;
  initialMessages?: Message[];
}
```

### State Management
- **Local State**: `useState` for component-specific state
- **Context**: `CompanionContext` for chat state
- **Convex**: `useQuery` for server state
- **URL State**: `nuqs` for filter/page state

### Styling
- **Tailwind CSS**: Utility classes
- **CSS Variables**: Theme customization
- **Responsive**: Mobile-first approach
- **Animations**: Motion library for transitions

## Best Practices

1. **Single Responsibility**: Each component has one clear purpose
2. **Composition**: Build complex components from simple ones
3. **Type Safety**: Full TypeScript coverage
4. **Accessibility**: ARIA labels and keyboard navigation
5. **Performance**: Memoization where needed
6. **Reusability**: Extract common patterns

## Component Size Guidelines

- **Small**: < 100 lines (UI primitives)
- **Medium**: 100-300 lines (feature components)
- **Large**: 300+ lines (consider splitting)

Large components that could be split:
- `companion-chat.tsx` (464 lines)
- `companion-context.tsx` (471 lines)
- `cheat-sheet.tsx` (380 lines)

## Import Patterns

```tsx
// UI components
import { Button } from "@/components/ui/button";

// Feature components
import { HeroSection } from "@/components/landing/hero";

// Utilities
import { cn } from "@/lib/utils";

// Hooks
import { useThreadCache } from "@/hooks/use-thread-cache";
```

## Testing Considerations

Components should be:
- **Testable**: Clear props, minimal side effects
- **Isolated**: Can render independently
- **Documented**: JSDoc comments for complex logic
- **Accessible**: Screen reader friendly

## Future Improvements

- Extract large components into smaller pieces
- Add Storybook for component documentation
- Increase test coverage
- Improve accessibility audit
- Optimize bundle size