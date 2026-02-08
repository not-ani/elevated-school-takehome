import type { UIMessage } from "ai";

// Maximum characters for outgoing message text
// Limits message size to prevent API issues
const MAX_OUTGOING_MESSAGE_CHARS = 4000;

export function sanitizeOutgoingMessage(message: UIMessage) {
  const textParts = message.parts
    .filter((part) => part.type === "text")
    .map((part) => ({ type: "text" as const, text: part.text.slice(0, MAX_OUTGOING_MESSAGE_CHARS) }));

  if (textParts.length === 0) return null;

  return {
    id: message.id,
    role: message.role,
    parts: textParts as UIMessage["parts"],
  };
}
