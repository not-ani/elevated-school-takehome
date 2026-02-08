import { createAgentUIStreamResponse, type UIMessage } from "ai";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse, type NextRequest } from "next/server";
import { createCompanionAgent } from "@/lib/ai/agents/companion-agent";
import { getConvexUrl } from "@/lib/ai/env";
import { buildCompanionSystemPrompt } from "@/lib/ai/companion-system-prompt";
import { api } from "@elevated-school/backend/convex/_generated/api";
import type { Id } from "@elevated-school/backend/convex/_generated/dataModel";

type FilterState = {
  preset: "7d" | "30d" | "90d" | "ytd" | "custom";
  from: string;
  to: string;
  turnaround: string;
  status: string;
  acquisition: string;
  draft: string;
  customerType: string;
};

type PageContext = {
  title: string;
  path: string;
};

const DEFAULT_FILTERS: FilterState = {
  preset: "30d",
  from: "",
  to: "",
  turnaround: "All",
  status: "All",
  acquisition: "All",
  draft: "All",
  customerType: "All",
};

const MAX_CONTEXT_MESSAGES = 24;
const MAX_MESSAGE_TEXT_CHARS = 4_000;

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const convexUrl = getConvexUrl();
    if (!convexUrl) {
      return NextResponse.json(
        {
          error:
            "Missing Convex URL configuration. Set CONVEX_URL or NEXT_PUBLIC_CONVEX_URL.",
        },
        { status: 500 },
      );
    }

    const convexClient = new ConvexHttpClient(convexUrl);

    const body: {
      messages?: Array<UIMessage>;
      message?: UIMessage;
      filters?: Partial<FilterState>;
      page?: Partial<PageContext>;
      threadId?: string;
    } = await req.json();

    const incomingMessages = getIncomingMessages(body);
    if (!incomingMessages.length) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    const filters = normalizeFilters(body.filters);
    const page = normalizePage(body.page);
    const threadId = await resolveValidThreadId(convexClient, body.threadId);
    const contextMessages = await buildContextMessages(
      convexClient,
      threadId,
      incomingMessages,
    );

    const data = await convexClient.query(api.dashboard.getDashboard, {
      dateRange: {
        preset: filters.preset,
        from: filters.from || undefined,
        to: filters.to || undefined,
      },
      turnaround: filters.turnaround,
      status: filters.status,
      acquisition: filters.acquisition,
      draft: filters.draft,
      customerType: filters.customerType,
    });

    const instructions = buildCompanionSystemPrompt(data, filters, page);
    const agent = createCompanionAgent(instructions);

    // Persistence: Save User Message
    if (threadId && incomingMessages.length > 0) {
      const lastUserMessage = incomingMessages
        .filter((m) => m.role === "user")
        .pop();
      const textContent = extractTextContent(lastUserMessage);

      if (textContent) {
        await convexClient
          .mutation(api.messages.create, {
            threadId,
            role: "user",
            content: textContent,
          })
          .catch((e) => console.error("Save user message failed:", e));
      }
    }

    return createAgentUIStreamResponse({
      agent,
      uiMessages: contextMessages,
      onFinish: async ({ messages }) => {
        if (threadId && messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          if (lastMessage.role === "assistant") {
            const textContent = extractTextContent(lastMessage);

            if (textContent) {
              try {
                await convexClient.mutation(api.messages.create, {
                  threadId,
                  role: "assistant",
                  content: textContent,
                });
                await convexClient.mutation(api.threads.touch, { threadId });
              } catch (e) {
                console.error("Save assistant message failed:", e);
              }
            }
          }
        }
      },
    });
  } catch (error) {
    console.error("AI route error:", error);
    return NextResponse.json({ error: "Failed to process AI request." }, { status: 500 });
  }
}

function normalizeFilters(input?: Partial<FilterState>): FilterState {
  if (!input) return DEFAULT_FILTERS;
  const isPreset = (v: string): v is FilterState["preset"] =>
    ["7d", "30d", "90d", "ytd", "custom"].includes(v);

  return {
    preset:
      typeof input.preset === "string" && isPreset(input.preset)
        ? input.preset
        : DEFAULT_FILTERS.preset,
    from: input.from ?? DEFAULT_FILTERS.from,
    to: input.to ?? DEFAULT_FILTERS.to,
    turnaround: input.turnaround ?? DEFAULT_FILTERS.turnaround,
    status: input.status ?? DEFAULT_FILTERS.status,
    acquisition: input.acquisition ?? DEFAULT_FILTERS.acquisition,
    draft: input.draft ?? DEFAULT_FILTERS.draft,
    customerType: input.customerType ?? DEFAULT_FILTERS.customerType,
  };
}

function normalizePage(input?: Partial<PageContext>): PageContext {
  return {
    title: input?.title ?? "Dashboard",
    path: input?.path ?? "/",
  };
}

async function resolveValidThreadId(
  convexClient: ConvexHttpClient,
  threadId: string | undefined,
) {
  if (!threadId) return undefined;

  try {
    const thread = await convexClient.query(api.threads.get, {
      threadId: threadId as Id<"threads">,
    });
    if (!thread) return undefined;
    return threadId as Id<"threads">;
  } catch {
    return undefined;
  }
}

function getIncomingMessages(body: {
  messages?: Array<UIMessage>;
  message?: UIMessage;
}) {
  if (Array.isArray(body.messages) && body.messages.length > 0) {
    return body.messages;
  }

  if (body.message) {
    return [body.message];
  }

  return [];
}

async function buildContextMessages(
  convexClient: ConvexHttpClient,
  threadId: Id<"threads"> | undefined,
  incomingMessages: Array<UIMessage>,
) {
  const sanitizedIncoming = sanitizeMessages(incomingMessages);

  if (!threadId) {
    return sanitizedIncoming.slice(-MAX_CONTEXT_MESSAGES);
  }

  const history = await convexClient.query(api.messages.listByThread, { threadId });
  const historyMessages: UIMessage[] = history.map((message) => ({
    id: message._id,
    role: message.role,
    parts: [{ type: "text", text: truncateText(message.content) }],
  }));

  const latestIncoming = sanitizedIncoming.slice(-1);
  return [...historyMessages, ...latestIncoming].slice(-MAX_CONTEXT_MESSAGES);
}

function sanitizeMessages(messages: Array<UIMessage>) {
  return messages
    .map((message) => {
      const textParts = message.parts
        .filter((part) => part.type === "text")
        .map((part) => ({ type: "text" as const, text: truncateText(part.text) }));

      if (textParts.length === 0) {
        return null;
      }

      const sanitizedMessage: UIMessage = {
        id: message.id,
        role: message.role,
        parts: textParts as UIMessage["parts"],
      };

      return sanitizedMessage;
    })
    .filter((message): message is UIMessage => message !== null);
}

function extractTextContent(message: UIMessage | undefined) {
  if (!message) return undefined;
  const text = message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();

  return text ? truncateText(text) : undefined;
}

function truncateText(value: string) {
  if (value.length <= MAX_MESSAGE_TEXT_CHARS) return value;
  return `${value.slice(0, MAX_MESSAGE_TEXT_CHARS)}\n...[truncated]`;
}
