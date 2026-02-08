import type { UIMessage } from "ai";

// Maximum characters for message text content
// Limit to prevent excessive storage and token usage
const MAX_MESSAGE_TEXT_CHARS = 4_000;

// Maximum characters for tool output text
// Higher limit for tool outputs as they may contain structured data
const MAX_TOOL_TEXT_CHARS = 12_000;

// Maximum number of charts to persist per message
// Prevents storage bloat from large visualization outputs
const MAX_PERSISTED_CHARTS = 2;

// Maximum characters for chart data URIs
// Base64-encoded images can be very large, limit to prevent storage issues
const MAX_PERSISTED_CHART_DATA_URI_CHARS = 450_000;

// Maximum depth for recursive sanitization
// Prevents infinite loops and excessive processing of deeply nested structures
const MAX_SANITIZATION_DEPTH = 4;

// Maximum array length for sanitization
// Limits array processing to prevent performance issues
const MAX_ARRAY_LENGTH = 20;

// Maximum object entries for sanitization
// Limits object processing to prevent performance issues
const MAX_OBJECT_ENTRIES = 40;

// Maximum files to load in Python tool output
// Limits file list size in persisted messages
const MAX_FILES_TO_LOAD = 8;

// Maximum files generated in Python tool output
// Limits file list size in persisted messages
const MAX_FILES_GENERATED = 16;

export function sanitizeMessages(messages: Array<UIMessage>) {
  return messages
    .map((message) => {
      const textParts = message.parts
        .filter((part) => part.type === "text")
        .map((part) => ({
          type: "text" as const,
          text: truncateText(part.text),
        }));

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

export function extractTextContent(message: UIMessage | undefined) {
  if (!message) return undefined;
  const text = message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();

  return text ? truncateText(text) : undefined;
}

export function truncateText(text: string) {
  if (text.length <= MAX_MESSAGE_TEXT_CHARS) return text;
  return `${text.slice(0, MAX_MESSAGE_TEXT_CHARS)}\n...[truncated]`;
}

export function truncateToolText(text: string) {
  if (text.length <= MAX_TOOL_TEXT_CHARS) return text;
  return `${text.slice(0, MAX_TOOL_TEXT_CHARS)}\n...[truncated]`;
}

export function sanitizeMessageForPersistence(message: UIMessage | undefined) {
  if (!message) return undefined;

  const parts = message.parts
    .map((part) => {
      if (part.type === "text") {
        return {
          type: "text" as const,
          text: truncateToolText(part.text),
        };
      }

      if (!part.type.startsWith("tool-")) {
        return null;
      }

      const sanitizedPart: {
        type: string;
        state?: string;
        input?: unknown;
        output?: unknown;
        errorText?: string;
      } = {
        type: part.type,
      };

      if ("state" in part && typeof part.state === "string") {
        sanitizedPart.state = part.state;
      }

      if ("input" in part && part.input !== undefined) {
        sanitizedPart.input = sanitizeToolData(part.input, part.type);
      }

      if ("output" in part && part.output !== undefined) {
        sanitizedPart.output = sanitizeToolData(part.output, part.type);
      }

      if ("errorText" in part && typeof part.errorText === "string") {
        sanitizedPart.errorText = truncateToolText(part.errorText);
      }

      return sanitizedPart;
    })
    .filter((part): part is Exclude<typeof part, null> => part !== null);

  if (parts.length === 0) return undefined;

  return {
    id:
      typeof message.id === "string" && message.id.length > 0
        ? message.id
        : `persisted-${Date.now()}`,
    role: message.role,
    parts,
  };
}

function sanitizeToolData(toolOutput: unknown, toolTypeName: string): unknown {
  if (toolTypeName === "tool-runPythonAnalysis") {
    return sanitizePythonToolData(toolOutput);
  }

  return sanitizeUnknown(toolOutput, 0);
}

function sanitizePythonToolData(toolOutput: unknown) {
  if (!toolOutput || typeof toolOutput !== "object") {
    return sanitizeUnknown(toolOutput, 0);
  }

  const pythonToolOutput = toolOutput as {
    code?: unknown;
    note?: unknown;
    filesToLoad?: unknown;
    summary?: unknown;
    stdout?: unknown;
    stderr?: unknown;
    filesGenerated?: unknown;
    charts?: unknown;
    error?: unknown;
  };

  const sanitized: Record<string, unknown> = {};

  if (typeof pythonToolOutput.code === "string") {
    sanitized.code = truncateToolText(pythonToolOutput.code);
  }
  if (typeof pythonToolOutput.note === "string") {
    sanitized.note = truncateToolText(pythonToolOutput.note);
  }
  if (Array.isArray(pythonToolOutput.filesToLoad)) {
    sanitized.filesToLoad = pythonToolOutput.filesToLoad
      .filter((entry): entry is string => typeof entry === "string")
      .slice(0, MAX_FILES_TO_LOAD);
  }
  if (typeof pythonToolOutput.summary === "string") {
    sanitized.summary = truncateToolText(pythonToolOutput.summary);
  }
  if (typeof pythonToolOutput.stdout === "string") {
    sanitized.stdout = truncateToolText(pythonToolOutput.stdout);
  }
  if (typeof pythonToolOutput.stderr === "string") {
    sanitized.stderr = truncateToolText(pythonToolOutput.stderr);
  }
  if (Array.isArray(pythonToolOutput.filesGenerated)) {
    sanitized.filesGenerated = pythonToolOutput.filesGenerated
      .filter((entry): entry is string => typeof entry === "string")
      .slice(0, MAX_FILES_GENERATED)
      .map((entry) => truncateToolText(entry));
  }
  if (Array.isArray(pythonToolOutput.charts)) {
    sanitized.charts = pythonToolOutput.charts
      .filter(
        (entry): entry is string =>
          typeof entry === "string" &&
          entry.startsWith("data:image/") &&
          entry.length <= MAX_PERSISTED_CHART_DATA_URI_CHARS,
      )
      .slice(0, MAX_PERSISTED_CHARTS);
  }
  if (typeof pythonToolOutput.error === "string") {
    sanitized.error = truncateToolText(pythonToolOutput.error);
  }

  return sanitized;
}

function sanitizeUnknown(data: unknown, currentDepth: number): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data === "string") return truncateToolText(data);
  if (typeof data === "number" || typeof data === "boolean") return data;
  if (currentDepth >= MAX_SANITIZATION_DEPTH) return "[truncated]";

  if (Array.isArray(data)) {
    return data
      .slice(0, MAX_ARRAY_LENGTH)
      .map((entry) => sanitizeUnknown(entry, currentDepth + 1));
  }

  if (typeof data === "object") {
    const objectEntries = Object.entries(data as Record<string, unknown>).slice(
      0,
      MAX_OBJECT_ENTRIES,
    );
    return Object.fromEntries(
      objectEntries.map(([key, value]) => [
        key,
        sanitizeUnknown(value, currentDepth + 1),
      ]),
    );
  }

  return String(data);
}
