import type { UIMessage } from "ai";

// Maximum characters for persisted text content
// Matches server-side limit for consistency
const MAX_PERSISTED_TEXT_CHARS = 12_000;

// Maximum characters for persisted image data URIs
// Base64-encoded images can be very large, limit to prevent storage issues
const MAX_PERSISTED_IMAGE_DATA_URI_CHARS = 450_000;

// Maximum depth for recursive sanitization
// Prevents infinite loops and excessive processing of deeply nested structures
const MAX_SANITIZATION_DEPTH = 4;

// Maximum array length for sanitization
// Limits array processing to prevent performance issues
const MAX_ARRAY_LENGTH = 20;

// Maximum object entries for sanitization
// Limits object processing to prevent performance issues
const MAX_OBJECT_ENTRIES = 50;

export function hydratePersistedMessage(message: {
  _id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: unknown;
}): UIMessage {
  const persistedUiMessage = extractPersistedUiMessage(
    message.metadata,
    message._id,
    message.role,
  );
  if (persistedUiMessage) {
    return {
      id: persistedUiMessage.id,
      role: persistedUiMessage.role,
      parts: persistedUiMessage.parts,
    } as UIMessage;
  }

  return {
    id: message._id,
    role: message.role,
    parts: [{ type: "text", text: message.content }],
  } as UIMessage;
}

function extractPersistedUiMessage(
  messageMetadata: unknown,
  fallbackId: string,
  fallbackRole: "user" | "assistant",
) {
  if (!messageMetadata || typeof messageMetadata !== "object") return undefined;

  const metadataObject = messageMetadata as {
    uiMessage?: {
      id?: unknown;
      role?: unknown;
      parts?: unknown;
    };
  };

  const uiMessage = metadataObject.uiMessage;
  if (!uiMessage || typeof uiMessage !== "object") return undefined;

  const role =
    uiMessage.role === "user" ||
    uiMessage.role === "assistant" ||
    uiMessage.role === "system"
      ? uiMessage.role
      : fallbackRole;

  const id =
    typeof uiMessage.id === "string" && uiMessage.id.length > 0
      ? uiMessage.id
      : fallbackId;

  const parts = Array.isArray(uiMessage.parts)
    ? uiMessage.parts
        .map((part) => sanitizePersistedPart(part))
        .filter((part): part is NonNullable<typeof part> => part !== null)
    : [];
  if (parts.length === 0) return undefined;

  return {
    id,
    role,
    parts: parts as UIMessage["parts"],
  };
}

function sanitizePersistedPart(messagePart: unknown) {
  if (!messagePart || typeof messagePart !== "object") return null;
  const partObject = messagePart as {
    type?: unknown;
    text?: unknown;
    state?: unknown;
    input?: unknown;
    output?: unknown;
    errorText?: unknown;
  };

  if (partObject.type === "text" && typeof partObject.text === "string") {
    return {
      type: "text" as const,
      text: truncatePersistedText(partObject.text),
    };
  }

  if (typeof partObject.type !== "string" || !partObject.type.startsWith("tool-")) {
    return null;
  }

  const sanitizedToolPart: {
    type: string;
    state?: string;
    input?: unknown;
    output?: unknown;
    errorText?: string;
  } = {
    type: partObject.type,
  };

  if (typeof partObject.state === "string") {
    sanitizedToolPart.state = partObject.state;
  }

  if (partObject.input !== undefined) {
    const input = sanitizePersistedUnknown(partObject.input, 0);
    if (input !== undefined) {
      sanitizedToolPart.input = input;
    }
  }

  if (partObject.output !== undefined) {
    const output = sanitizePersistedUnknown(partObject.output, 0);
    if (output !== undefined) {
      sanitizedToolPart.output = output;
    }
  }

  if (typeof partObject.errorText === "string") {
    sanitizedToolPart.errorText = truncatePersistedText(partObject.errorText);
  }

  return sanitizedToolPart;
}

function sanitizePersistedUnknown(data: unknown, currentDepth: number): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data === "number" || typeof data === "boolean") return data;

  if (typeof data === "string") {
    if (data.startsWith("data:image/")) {
      if (data.length > MAX_PERSISTED_IMAGE_DATA_URI_CHARS) {
        return undefined;
      }
      return data;
    }
    return truncatePersistedText(data);
  }

  if (currentDepth >= MAX_SANITIZATION_DEPTH) return "[truncated]";

  if (Array.isArray(data)) {
    const result = data
      .slice(0, MAX_ARRAY_LENGTH)
      .map((entry) => sanitizePersistedUnknown(entry, currentDepth + 1))
      .filter((entry) => entry !== undefined);
    return result;
  }

  if (typeof data === "object") {
    const objectEntries = Object.entries(data as Record<string, unknown>).slice(0, MAX_OBJECT_ENTRIES);
    const sanitizedEntries = objectEntries
      .map(([key, value]) => [key, sanitizePersistedUnknown(value, currentDepth + 1)] as const)
      .filter(([, value]) => value !== undefined);

    return Object.fromEntries(sanitizedEntries);
  }

  return String(data);
}

function truncatePersistedText(text: string) {
  if (text.length <= MAX_PERSISTED_TEXT_CHARS) return text;
  return `${text.slice(0, MAX_PERSISTED_TEXT_CHARS)}\n...[truncated]`;
}
