import type { ConvexHttpClient } from "convex/browser";
import type { UIMessage } from "ai";
import { api } from "@elevated-school/backend/convex/_generated/api";
import type { Id } from "@elevated-school/backend/convex/_generated/dataModel";
import {
  extractTextContent,
  sanitizeMessageForPersistence,
} from "./message-sanitization";

export async function persistUserMessage(
  convexClient: ConvexHttpClient,
  threadId: Id<"threads">,
  incomingMessages: Array<UIMessage>,
) {
  if (incomingMessages.length === 0) return;

  const lastUserMessage = incomingMessages
    .filter((m) => m.role === "user")
    .pop();
  const textContent = extractTextContent(lastUserMessage);

  if (textContent) {
    const persistedUserMessage = sanitizeMessageForPersistence(lastUserMessage);
    await convexClient
      .mutation(api.messages.create, {
        threadId,
        role: "user",
        content: textContent,
        metadata: persistedUserMessage
          ? { uiMessage: persistedUserMessage }
          : undefined,
      })
      .catch((error) => console.error("Save user message failed:", error));
  }
}

export async function persistAssistantMessage(
  convexClient: ConvexHttpClient,
  threadId: Id<"threads">,
  messages: Array<UIMessage>,
) {
  if (messages.length === 0) return;

  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== "assistant") return;

  const textContent = extractTextContent(lastMessage);
  if (!textContent) return;

  try {
    const persistedAssistantMessage =
      sanitizeMessageForPersistence(lastMessage);
    await convexClient.mutation(api.messages.create, {
      threadId,
      role: "assistant",
      content: textContent,
      metadata: persistedAssistantMessage
        ? { uiMessage: persistedAssistantMessage }
        : undefined,
    });
    await convexClient.mutation(api.threads.touch, { threadId });
  } catch (error) {
    console.error("Save assistant message failed:", error);
  }
}
