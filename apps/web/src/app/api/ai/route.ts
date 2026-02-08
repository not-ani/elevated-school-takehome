import { createAgentUIStreamResponse, type UIMessage } from "ai";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse, type NextRequest } from "next/server";
import { createCompanionAgent } from "@/lib/ai/agents/companion-agent";
import { getConvexUrl } from "@/lib/ai/env";
import { buildCompanionSystemPrompt } from "@/lib/ai/companion-system-prompt";
import { api } from "@elevated-school/backend/convex/_generated/api";
import { buildContextMessages } from "@/lib/ai/context-builder";
import { persistUserMessage, persistAssistantMessage } from "@/lib/ai/persistence";
import {
  normalizeFilters,
  normalizePage,
  getIncomingMessages,
  type FilterState,
  type PageContext,
} from "@/lib/ai/request-normalization";
import { resolveValidThreadId } from "@/lib/ai/thread-resolution";

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

    if (threadId) {
      await persistUserMessage(convexClient, threadId, incomingMessages);
    }

    return createAgentUIStreamResponse({
      agent,
      uiMessages: contextMessages,
      onFinish: async ({ messages }) => {
        if (threadId) {
          await persistAssistantMessage(convexClient, threadId, messages);
        }
      },
    });
  } catch (error) {
    console.error("AI route error:", error);
    return NextResponse.json({ error: "Failed to process AI request." }, { status: 500 });
  }
}

