# AI System Architecture

The AI system provides a sophisticated chat interface with context-aware conversations, tool integration, and persistent thread management.

## Overview

The AI companion is built on top of:
- **Vercel AI SDK**: Streaming responses and tool integration
- **Google AI SDK**: Gemini model integration
- **Convex**: Message persistence and data queries
- **E2B**: Code execution capabilities

## Architecture

```
lib/ai/
├── agents/
│   └── companion-agent.ts      # Core agent implementation
├── tools/                      # Tool definitions
│   ├── convex-tools.ts         # Convex query tools
│   ├── e2b-tools.ts            # Code execution tools
│   └── subagent-tools.ts      # Sub-agent orchestration
├── companion-system-prompt.ts  # Dynamic system prompt builder
├── context-builder.ts          # Context message assembly
├── message-hydration.ts        # Message hydration from Convex
├── message-sanitization.ts     # Server-side message sanitization
├── message-sanitization-client.ts # Client-side sanitization
├── persistence.ts              # Message persistence to Convex
├── request-normalization.ts    # Request parsing and validation
├── thread-resolution.ts        # Thread ID resolution
└── env.ts                      # Environment configuration
```

## Core Components

### 1. Agent (`agents/companion-agent.ts`)

The main agent orchestrates:
- System prompt construction
- Context message building
- Tool execution
- Response streaming

**Key Responsibilities:**
- Creates agent instance with tools
- Handles streaming responses
- Manages tool calls and results

### 2. Tools (`tools/`)

Three categories of tools:

#### Convex Tools (`convex-tools.ts`)
- Query Convex database
- Execute dashboard queries
- Return structured data

#### E2B Tools (`e2b-tools.ts`)
- Execute Python code
- Run code in sandboxed environment
- Return execution results

#### Sub-agent Tools (`subagent-tools.ts`)
- Orchestrate sub-agents for complex tasks
- Chain multiple agent calls
- Aggregate results

### 3. Message Handling

#### Sanitization
- **Server-side** (`message-sanitization.ts`): Sanitizes messages before processing
- **Client-side** (`message-sanitization-client.ts`): Sanitizes messages for display

#### Hydration (`message-hydration.ts`)
- Loads messages from Convex
- Reconstructs conversation history
- Handles tool call results

#### Persistence (`persistence.ts`)
- Saves user messages to Convex
- Saves assistant messages and tool results
- Maintains thread associations

### 4. Context Building (`context-builder.ts`)

Builds dynamic context from:
- Current page context (which dashboard page)
- Active filters (date ranges, categories, etc.)
- Conversation history
- System state

### 5. Thread Management (`thread-resolution.ts`)

- Resolves thread IDs from requests
- Creates new threads when needed
- Associates messages with threads
- Handles thread caching

### 6. System Prompt (`companion-system-prompt.ts`)

Dynamically builds system prompts based on:
- Current page context
- Available data and filters
- User's current view
- Conversation history

## Request Flow

```
1. Client sends POST /api/ai
   ↓
2. Request Normalization
   - Parse messages, filters, page context
   - Validate request structure
   ↓
3. Thread Resolution
   - Resolve or create thread ID
   ↓
4. Context Building
   - Build system prompt from page/filters
   - Assemble context messages
   ↓
5. Message Hydration
   - Load conversation history from Convex
   - Sanitize messages
   ↓
6. Agent Execution
   - Create agent with tools
   - Stream response
   - Execute tools as needed
   ↓
7. Persistence
   - Save user message
   - Save assistant response
   - Save tool results
   ↓
8. Stream Response
   - Return streaming response to client
```

## Tool Execution Flow

When the agent calls a tool:

```
1. Agent identifies tool call
   ↓
2. Tool executor runs tool
   - Convex: Query database
   - E2B: Execute code
   - Sub-agent: Orchestrate agent
   ↓
3. Tool result sanitized
   ↓
4. Result added to conversation
   ↓
5. Agent continues with context
   ↓
6. Result persisted to Convex
```

## Thread Management

Threads represent conversation sessions:
- Each thread has a unique ID
- Messages are associated with threads
- Threads persist across sessions
- Thread cache improves performance

**Thread Resolution:**
- If `threadId` provided: Use existing thread
- If no `threadId`: Create new thread
- Thread ID returned in response

## Message Types

### User Messages
- Text content
- Associated with thread
- Timestamped
- Sanitized before storage

### Assistant Messages
- Streamed content
- May include tool calls
- Tool results embedded
- Full conversation state

### Tool Results
- Structured data from tools
- Code execution outputs
- Query results
- Embedded in assistant messages

## Security Considerations

### Message Sanitization
- Removes sensitive data
- Validates content
- Prevents injection attacks
- Cleans user input

### Tool Execution
- Sandboxed code execution (E2B)
- Query validation (Convex)
- Rate limiting considerations
- Error handling

## Performance Optimizations

1. **Thread Caching**: Cache thread data to reduce queries
2. **Message Hydration**: Efficient loading of conversation history
3. **Streaming**: Real-time response streaming
4. **Lazy Tool Loading**: Tools loaded on demand

## Usage Example

```typescript
// API Route
const response = await fetch('/api/ai', {
  method: 'POST',
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Show me revenue data' }],
    filters: { dateRange: 'last30days' },
    page: { name: 'revenue', context: {} },
  }),
});

// Stream response
const reader = response.body.getReader();
// ... handle streaming
```

## Configuration

Environment variables:
- `CONVEX_URL`: Convex deployment URL
- `GOOGLE_GENERATIVE_AI_API_KEY`: Google AI API key
- `E2B_API_KEY`: E2B API key (for code execution)

## Future Enhancements

Potential improvements:
- Multi-modal support (images, files)
- Advanced tool chaining
- Conversation summarization
- Custom tool definitions
- Agent memory/learning