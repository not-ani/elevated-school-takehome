import { ConvexHttpClient } from "convex/browser";
import type { UIMessage } from "ai";
import { api } from "@elevated-school/backend/convex/_generated/api";
import type { Id } from "@elevated-school/backend/convex/_generated/dataModel";
import { sanitizeMessages, truncateText } from "./message-sanitization";

// Maximum number of messages to include in context
// Balances context completeness with token limits and performance
const MAX_CONTEXT_MESSAGES = 24;

export async function buildContextMessages(
  convexClient: ConvexHttpClient,
  threadId: Id<"threads"> | undefined,
  incomingMessages: Array<UIMessage>,
) {
  const sanitizedIncoming = sanitizeMessages(incomingMessages);

  if (!threadId) {
    return sanitizedIncoming.slice(-MAX_CONTEXT_MESSAGES);
  }

  const history = await convexClient.query(api.messages.listByThread, {
    threadId,
  });
  const historyMessages: UIMessage[] = history.map((message) => ({
    id: message._id,
    role: message.role,
    parts: [{ type: "text", text: truncateText(message.content) }],
  }));

  const latestIncoming = sanitizedIncoming.slice(-1);
  return [...historyMessages, ...latestIncoming].slice(-MAX_CONTEXT_MESSAGES);
}
