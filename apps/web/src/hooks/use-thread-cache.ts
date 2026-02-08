import * as React from "react";
import type { UIMessage } from "ai";

/**
 * Hook to manage thread message caching
 * Uses a ref to store messages per thread ID, allowing quick switching
 * between threads without losing message state
 */
export function useThreadCache() {
  const threadMessagesCache = React.useRef(new Map<string, UIMessage[]>());

  const cacheMessages = React.useCallback(
    (threadId: string, messages: UIMessage[]) => {
      threadMessagesCache.current.set(threadId, messages);
    },
    [],
  );

  const getCachedMessages = React.useCallback(
    (threadId: string): UIMessage[] | undefined => {
      return threadMessagesCache.current.get(threadId);
    },
    [],
  );

  return {
    cacheMessages,
    getCachedMessages,
  };
}
