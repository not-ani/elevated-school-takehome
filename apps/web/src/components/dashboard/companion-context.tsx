"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type ChatStatus, type UIMessage } from "ai";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/convex";
import type { Id } from "@/lib/convex";
import type { FilterState } from "./filters/filter-bar";
import { hydratePersistedMessage } from "@/lib/ai/message-hydration";
import { sanitizeOutgoingMessage } from "@/lib/ai/message-sanitization-client";
import { useThreadCache } from "@/hooks/use-thread-cache";

type CompanionPageContext = {
  title: string;
  path: string;
};

type SendCompanionMessageInput = {
  text: string;
  filters: FilterState;
  page: CompanionPageContext;
};

type CompanionContextValue = {
  activeThreadId: string | undefined;
  runningThreadId: string | undefined;
  lastCompletedThreadId: string | undefined;
  isRunning: boolean;
  messages: UIMessage[];
  status: ChatStatus;
  error: Error | undefined;
  selectThread: (id: string | undefined) => void;
  startNewThread: () => void;
  sendMessage: (input: SendCompanionMessageInput) => Promise<void>;
  stop: () => void;
};

const CompanionContext = React.createContext<CompanionContextValue | null>(
  null,
);

export function CompanionProvider({ children }: { children: React.ReactNode }) {
  const [activeThreadId, setActiveThreadId] = React.useState<
    string | undefined
  >();
  const [runningThreadId, setRunningThreadId] = React.useState<
    string | undefined
  >();
  const [lastCompletedThreadId, setLastCompletedThreadId] = React.useState<
    string | undefined
  >();

  const { cacheMessages, getCachedMessages } = useThreadCache();

  const pathname = usePathname();
  const router = useRouter();
  const pathnameRef = React.useRef(pathname);
  React.useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const runningThreadIdRef = React.useRef<string | undefined>(undefined);
  const createThreadMutation = useMutation(api.threads.create);

  const handleCompletionToast = React.useCallback(
    (threadId: string, title: string) => {
      if (pathnameRef.current === "/dashboard/companion") return;
      toast.success(title, {
        description: "Open AI Companion to review the result.",
        action: {
          label: "Open thread",
          onClick: () => {
            router.push(`/dashboard/companion?threadId=${threadId}`);
          },
        },
      });
    },
    [router],
  );

  const {
    messages,
    status,
    error,
    sendMessage: sendChatMessage,
    stop,
    setMessages,
  } = useChat({
    id: "dashboard-companion-runtime",
    transport: new DefaultChatTransport({
      api: "/api/ai",
      prepareSendMessagesRequest: ({
        id,
        messages,
        body,
        trigger,
        messageId,
      }) => {
        const lastMessage = messages[messages.length - 1];

        if (!lastMessage) {
          return {
            body: {
              id,
              trigger,
              messageId,
              ...body,
              messages,
            },
          };
        }

        const safeMessage = sanitizeOutgoingMessage(lastMessage);

        return {
          body: {
            id,
            trigger,
            messageId,
            ...body,
            message: safeMessage ?? lastMessage,
          },
        };
      },
    }),
    onFinish: () => {
      const completedThreadId = runningThreadIdRef.current;
      runningThreadIdRef.current = undefined;
      setRunningThreadId(undefined);
      if (!completedThreadId) return;
      setLastCompletedThreadId(completedThreadId);
      handleCompletionToast(
        completedThreadId,
        "AI companion finished this thread.",
      );
    },
    onError: () => {
      const failedThreadId = runningThreadIdRef.current;
      runningThreadIdRef.current = undefined;
      setRunningThreadId(undefined);
      if (!failedThreadId) return;
      toast.error("AI companion run failed.", {
        description: "Reopen the thread to retry.",
        action: {
          label: "Open thread",
          onClick: () => {
            router.push(`/dashboard/companion?threadId=${failedThreadId}`);
          },
        },
      });
    },
  });

  const persistedMessages = useQuery(
    api.messages.listByThread,
    activeThreadId ? { threadId: activeThreadId as Id<"threads"> } : "skip",
  );

  const isRunning = status === "submitted" || status === "streaming";

  const selectThread = React.useCallback(
    (threadId: string | undefined) => {
      if (isRunning) return;

      if (activeThreadId && messages.length > 0) {
        cacheMessages(activeThreadId, messages);
      }

      setActiveThreadId(threadId);

      if (!threadId) {
        setMessages([]);
        return;
      }

      const cachedMessages = getCachedMessages(threadId);
      setMessages(cachedMessages ?? []);
    },
    [
      activeThreadId,
      isRunning,
      messages,
      setMessages,
      cacheMessages,
      getCachedMessages,
    ],
  );

  const startNewThread = React.useCallback(() => {
    if (isRunning) return;

    if (activeThreadId && messages.length > 0) {
      cacheMessages(activeThreadId, messages);
    }

    setActiveThreadId(undefined);
    setMessages([]);
  }, [activeThreadId, isRunning, messages, setMessages, cacheMessages]);

  const sendMessage = React.useCallback(
    async ({ text, filters, page }: SendCompanionMessageInput) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      let threadId = activeThreadId;
      if (!threadId) {
        const newThreadId = await createThreadMutation({
          title: trimmed.slice(0, 50),
        });
        threadId = newThreadId;
        setActiveThreadId(newThreadId);
        setMessages([]);
      }

      runningThreadIdRef.current = threadId;
      setRunningThreadId(threadId);

      await sendChatMessage(
        { text: trimmed },
        {
          body: {
            filters,
            page,
            threadId,
          },
        },
      );
    },
    [activeThreadId, createThreadMutation, sendChatMessage, setMessages],
  );

  React.useEffect(() => {
    if (!activeThreadId) return;
    if (messages.length === 0) return;

    cacheMessages(activeThreadId, messages);
  }, [activeThreadId, messages, cacheMessages]);

  React.useEffect(() => {
    if (!activeThreadId) return;
    if (!persistedMessages) return;
    if (isRunning || runningThreadId) return;
    if (messages.length > 0) return;

    const hydratedMessages: UIMessage[] = persistedMessages.map((message) =>
      hydratePersistedMessage(message),
    );

    setMessages(hydratedMessages);
  }, [
    activeThreadId,
    isRunning,
    messages.length,
    persistedMessages,
    runningThreadId,
    setMessages,
  ]);

  const value = React.useMemo(
    () => ({
      activeThreadId,
      runningThreadId,
      lastCompletedThreadId,
      isRunning,
      messages,
      status,
      error,
      selectThread,
      startNewThread,
      sendMessage,
      stop,
    }),
    [
      activeThreadId,
      runningThreadId,
      lastCompletedThreadId,
      isRunning,
      messages,
      status,
      error,
      selectThread,
      startNewThread,
      sendMessage,
      stop,
    ],
  );

  return (
    <CompanionContext.Provider value={value}>
      {children}
    </CompanionContext.Provider>
  );
}

export function useCompanion() {
  const context = React.useContext(CompanionContext);
  if (!context) {
    throw new Error("useCompanion must be used within a CompanionProvider");
  }
  return context;
}

// Optional hook that doesn't throw if outside provider
export function useCompanionOptional() {
  return React.useContext(CompanionContext);
}
