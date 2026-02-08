"use client";

import { isToolUIPart, type UIMessage } from "ai";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { ToolIndicator } from "@/components/ai-elements/tool-indicator";
import {
  PythonCodeBlock,
  type PythonAnalysisOutput,
} from "@/components/ai-elements/python-code-block";

type ChatMessageProps = {
  message: UIMessage;
  isStreaming: boolean;
};

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <Message from={message.role}>
      <MessageContent>
        {message.parts.map((part, index) => {
          const key = `${message.id}-${index}`;

          if (part.type === "text") {
            if (isUser) {
              return (
                <span key={key} className="whitespace-pre-wrap">
                  {part.text}
                </span>
              );
            }
            return (
              <MessageResponse
                key={key}
                isAnimating={isStreaming}
                caret={isStreaming ? "block" : undefined}
              >
                {part.text}
              </MessageResponse>
            );
          }

          if (isToolUIPart(part)) {
            const toolName = part.type.startsWith("tool-")
              ? part.type.slice(5)
              : part.type;
            const isComplete = part.state === "output-available";
            const isError = part.state === "output-error";

            const toolInput =
              "input" in part
                ? part.input
                : "args" in part
                  ? ((part as { args?: unknown }).args ?? null)
                  : null;
            const normalizedOutput =
              "output" in part
                ? normalizePythonAnalysisOutput(part.output)
                : undefined;

            if (
              toolName === "runPythonAnalysis" &&
              (toolInput || normalizedOutput)
            ) {
              const pythonInput = (toolInput ?? {}) as {
                code?: string;
                note?: string;
                filesToLoad?: string[];
              };
              return (
                <PythonCodeBlock
                  key={key}
                  code={
                    pythonInput.code ||
                    "# Code unavailable for this completed tool call."
                  }
                  note={pythonInput.note ?? normalizedOutput?.summary}
                  filesToLoad={pythonInput.filesToLoad}
                  output={normalizedOutput}
                  isComplete={isComplete}
                  isError={isError}
                  isRunning={!isComplete && !isError}
                />
              );
            }

            return (
              <ToolIndicator
                key={key}
                toolName={toolName}
                isComplete={isComplete}
                isError={isError}
              />
            );
          }

          return null;
        })}
      </MessageContent>
    </Message>
  );
}

function normalizePythonAnalysisOutput(
  rawOutput: unknown,
): PythonAnalysisOutput | undefined {
  if (!rawOutput || typeof rawOutput !== "object") return undefined;
  const outputObject = rawOutput as {
    summary?: unknown;
    stdout?: unknown;
    stderr?: unknown;
    filesGenerated?: unknown;
    charts?: unknown;
    error?: unknown;
  };

  const charts = Array.isArray(outputObject.charts)
    ? outputObject.charts.filter(
        (value): value is string => typeof value === "string",
      )
    : undefined;

  const filesGenerated = Array.isArray(outputObject.filesGenerated)
    ? outputObject.filesGenerated.filter(
        (value): value is string => typeof value === "string",
      )
    : undefined;

  return {
    summary:
      typeof outputObject.summary === "string"
        ? outputObject.summary
        : undefined,
    stdout:
      typeof outputObject.stdout === "string" ? outputObject.stdout : undefined,
    stderr:
      typeof outputObject.stderr === "string" ? outputObject.stderr : undefined,
    filesGenerated,
    charts,
    error:
      typeof outputObject.error === "string" ? outputObject.error : undefined,
  };
}
