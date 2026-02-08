"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
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
import type { FilterState } from "./filters/filter-bar";
import { useCompanion } from "./companion-context";
import { ChatMessage } from "./chat-message";

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
