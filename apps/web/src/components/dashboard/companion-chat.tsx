"use client";

import * as React from "react";
import Image from "next/image";

import { isToolUIPart, type UIMessage } from "ai";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Loader2,
  Sparkles,
} from "lucide-react";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { FilterState } from "./filters/filter-bar";
import { useCompanion } from "./companion-context";

// Human-readable labels for tool names
const toolLabels: Record<string, string> = {
  queryDashboard: "Fetching dashboard data",
  getEssayStats: "Checking workload stats",
  comparePeriods: "Comparing time periods",
  runPythonAnalysis: "Running data analysis",
  summarizeCsv: "Summarizing dataset",
  extractInsights: "Extracting insights",
  draftNarrative: "Drafting summary",
};

const promptSuggestions = [
  {
    label: "Summarize revenue drivers",
    text: "Summarize the top revenue drivers for this period.",
  },
  {
    label: "Explain late deliveries",
    text: "What is driving late deliveries right now?",
  },
  {
    label: "Customer mix insights",
    text: "What does the customer mix tell us about retention?",
  },
  {
    label: "Quality trends analysis",
    text: "Analyze the rating trends across drafts and create a visualization.",
  },
  {
    label: "Revenue correlation",
    text: "Is there a correlation between turnaround time and revenue per essay?",
  },
];

type CompanionChatProps = {
  filters: FilterState;
  pageTitle: string;
  pagePath: string;
  className?: string;
};

export function CompanionChat({
  filters,
  pageTitle,
  pagePath,
  className,
}: CompanionChatProps) {
  const [input, setInput] = React.useState("");
  const {
    activeThreadId,
    messages,
    status,
    error,
    stop,
    sendMessage: sendCompanionMessage,
    isRunning,
  } = useCompanion();

  const isBusy = isRunning;

  const sendMessage = React.useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      await sendCompanionMessage({
        text: trimmed,
        filters,
        page: {
          title: pageTitle,
          path: pagePath,
        },
      });
    },
    [filters, pagePath, pageTitle, sendCompanionMessage],
  );

  const handleSubmit = React.useCallback(
    (message: PromptInputMessage) => {
      const trimmed = message.text.trim();
      if (!trimmed || isBusy) return;
      setInput("");
      void sendMessage(trimmed);
    },
    [isBusy, sendMessage],
  );

  return (
    <div className={`flex h-full flex-col ${className || ""}`}>
      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="gap-4 p-4">
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<Sparkles className="size-10 opacity-50" />}
              title="AI Data Scientist"
              description="Ask questions about your data, request visualizations, or get insights"
            >
              <div className="mt-4 grid gap-2">
                {promptSuggestions.map((suggestion) => (
                  <Button
                    key={suggestion.label}
                    variant="outline"
                    size="sm"
                    className="h-auto justify-start py-2 text-left text-xs whitespace-normal"
                    onClick={() => void sendMessage(suggestion.text)}
                    disabled={isBusy}
                  >
                    {suggestion.label}
                  </Button>
                ))}
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isStreaming={
                  isBusy && message.id === messages[messages.length - 1]?.id
                }
              />
            ))
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t p-4">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your data, request an analysis..."
              className="min-h-[60px] text-sm"
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <span className="text-muted-foreground text-[11px]">
                {activeThreadId
                  ? `Thread: ${activeThreadId.slice(0, 8)}... | Filters active`
                  : "New thread | Filters active"}
              </span>
            </PromptInputTools>
            <PromptInputSubmit
              status={status}
              onStop={stop}
              disabled={!input.trim() && !isBusy}
            />
          </PromptInputFooter>
        </PromptInput>
        {error && (
          <p className="text-destructive mt-2 text-xs">{error.message}</p>
        )}
      </div>
    </div>
  );
}

function ChatMessage({
  message,
  isStreaming,
}: {
  message: UIMessage;
  isStreaming: boolean;
}) {
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
            // Extract tool name and show a simple, user-friendly indicator
            const toolName = part.type.startsWith("tool-")
              ? part.type.slice(5)
              : part.type;
            const label = toolLabels[toolName] || "Looking up data";
            const isComplete = part.state === "output-available";
            const isError = part.state === "output-error";

            // For runPythonAnalysis, show the code
            // The args are in 'input' for dynamic tools or direct properties
            const toolArgs =
              "input" in part
                ? part.input
                : "args" in part
                  ? (part as { args?: unknown }).args ?? null
                  : null;
            const toolOutput =
              "output" in part
                ? normalizePythonAnalysisOutput(part.output)
                : undefined;

            if (toolName === "runPythonAnalysis" && (toolArgs || toolOutput)) {
              const args = (toolArgs ?? {}) as {
                code?: string;
                note?: string;
                filesToLoad?: string[];
              };
              return (
                <PythonCodeBlock
                  key={key}
                  code={args.code || "# Code unavailable for this completed tool call."}
                  note={args.note ?? toolOutput?.summary}
                  filesToLoad={args.filesToLoad}
                  output={toolOutput}
                  isComplete={isComplete}
                  isError={isError}
                  isRunning={!isComplete && !isError}
                />
              );
            }

            return (
              <div
                key={key}
                className="bg-muted/50 text-muted-foreground flex items-center gap-2 rounded-md px-3 py-2 text-xs"
              >
                {isComplete ? (
                  <CheckCircle2 className="size-3.5 text-green-600" />
                ) : isError ? (
                  <span className="size-3.5 text-red-500">!</span>
                ) : (
                  <Loader2 className="size-3.5 animate-spin" />
                )}
                <span>
                  {isError
                    ? "Failed to fetch data"
                    : isComplete
                      ? `${label} done`
                      : `${label}...`}
                </span>
              </div>
            );
          }

          return null;
        })}
      </MessageContent>
    </Message>
  );
}

// Component to display Python code being executed
function PythonCodeBlock({
  code,
  note,
  filesToLoad,
  output,
  isComplete,
  isError,
  isRunning,
}: {
  code: string;
  note?: string;
  filesToLoad?: string[];
  output?: PythonAnalysisOutput;
  isComplete: boolean;
  isError: boolean;
  isRunning: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const charts = output?.charts ?? [];
  const hasCharts = charts.length > 0;

  return (
    <div className="bg-muted/30 overflow-hidden rounded-lg border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger>
          <button
            type="button"
            className="hover:bg-muted/50 flex w-full items-center gap-2 px-3 py-2 text-xs transition-colors"
          >
            {isRunning ? (
              <Loader2 className="size-3.5 animate-spin text-blue-500" />
            ) : isComplete ? (
              <CheckCircle2 className="size-3.5 text-green-600" />
            ) : (
              <span className="size-3.5 text-red-500">!</span>
            )}
            <Code2 className="text-muted-foreground size-3.5" />
            <span className="flex-1 text-left font-medium">
              {note || "Running Python analysis"}
            </span>
            {filesToLoad && filesToLoad.length > 0 && (
              <span className="text-muted-foreground">
                {filesToLoad.join(", ")}
              </span>
            )}
            {isOpen ? (
              <ChevronDown className="text-muted-foreground size-3.5" />
            ) : (
              <ChevronRight className="text-muted-foreground size-3.5" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t bg-zinc-950 p-3">
            <pre className="overflow-x-auto font-mono text-xs whitespace-pre-wrap text-zinc-300">
              <code>{code}</code>
            </pre>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {hasCharts && (
        <div className="border-t p-3">
          <p className="text-muted-foreground mb-2 text-[11px]">Generated visuals</p>
          <div className="grid gap-2 md:grid-cols-2">
            {charts.map((chart, index) => (
              <a
                key={`${chart.slice(0, 24)}-${index}`}
                href={chart}
                target="_blank"
                rel="noreferrer"
                className="hover:border-primary/50 overflow-hidden rounded-md border transition-colors"
              >
                <Image
                  src={chart}
                  alt={`Generated chart ${index + 1}`}
                  width={1200}
                  height={700}
                  unoptimized
                  className="h-auto w-full bg-white"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {output?.stderr && !isError && (
        <div className="border-t px-3 py-2">
          <p className="text-muted-foreground text-[11px]">Warnings</p>
          <pre className="text-muted-foreground mt-1 max-h-24 overflow-auto font-mono text-[11px] whitespace-pre-wrap">
            {output.stderr}
          </pre>
        </div>
      )}

      {isError && (
        <div className="border-t px-3 py-2 text-xs text-red-500">
          Analysis failed
        </div>
      )}
    </div>
  );
}

type PythonAnalysisOutput = {
  summary?: string;
  stdout?: string;
  stderr?: string;
  filesGenerated?: string[];
  charts?: string[];
  error?: string;
};

function normalizePythonAnalysisOutput(
  output: unknown,
): PythonAnalysisOutput | undefined {
  if (!output || typeof output !== "object") return undefined;
  const source = output as {
    summary?: unknown;
    stdout?: unknown;
    stderr?: unknown;
    filesGenerated?: unknown;
    charts?: unknown;
    error?: unknown;
  };

  const charts = Array.isArray(source.charts)
    ? source.charts.filter((value): value is string => typeof value === "string")
    : undefined;

  const filesGenerated = Array.isArray(source.filesGenerated)
    ? source.filesGenerated.filter(
        (value): value is string => typeof value === "string",
      )
    : undefined;

  return {
    summary: typeof source.summary === "string" ? source.summary : undefined,
    stdout: typeof source.stdout === "string" ? source.stdout : undefined,
    stderr: typeof source.stderr === "string" ? source.stderr : undefined,
    filesGenerated,
    charts,
    error: typeof source.error === "string" ? source.error : undefined,
  };
}
