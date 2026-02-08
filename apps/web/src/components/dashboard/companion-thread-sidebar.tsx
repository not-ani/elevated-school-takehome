"use client";

import * as React from "react";
import { useMutation, usePaginatedQuery } from "convex/react";
import { Loader2, MessageSquare, Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/convex";
import type { Id } from "@/lib/convex";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CompanionThreadSidebarProps = {
  activeThreadId: string | undefined;
  runningThreadId: string | undefined;
  isRunning: boolean;
  onSelectThread: (threadId: string) => void;
  onNewThread: () => void;
};

export function CompanionThreadSidebar({
  activeThreadId,
  runningThreadId,
  isRunning,
  onSelectThread,
  onNewThread,
}: CompanionThreadSidebarProps) {
  const threads = usePaginatedQuery(
    api.threads.listPaginated,
    {},
    { initialNumItems: 30 },
  );
  const removeThread = useMutation(api.threads.remove);
  const updateThreadTitle = useMutation(api.threads.updateTitle);

  const handleRename = React.useCallback(
    async (threadId: string, currentTitle: string | undefined) => {
      const proposedTitle = window.prompt(
        "Rename thread",
        currentTitle ?? "Untitled thread",
      );
      if (proposedTitle === null) return;
      const title = proposedTitle.trim();
      if (!title) return;
      if (title === currentTitle) return;

      await updateThreadTitle({
        threadId: threadId as Id<"threads">,
        title,
      });
    },
    [updateThreadTitle],
  );

  const handleDelete = React.useCallback(
    async (threadId: string) => {
      const confirmed = window.confirm(
        "Delete this thread and all of its messages?",
      );
      if (!confirmed) return;
      await removeThread({ threadId: threadId as Id<"threads"> });
      if (threadId === activeThreadId) {
        onNewThread();
      }
    },
    [activeThreadId, onNewThread, removeThread],
  );

  return (
    <aside className="bg-muted/20 flex h-full min-h-0 flex-col border-b md:border-r md:border-b-0">
      <div className="flex items-center justify-between border-b p-3">
        <div>
          <h2 className="text-sm font-semibold">Threads</h2>
          <p className="text-muted-foreground text-xs">Conversation history</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onNewThread}
          disabled={isRunning}
          className="gap-1.5"
        >
          <Plus className="size-3.5" />
          New
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {threads.results.length === 0 ? (
          <div className="text-muted-foreground flex h-full min-h-24 items-center justify-center text-center text-xs">
            No threads yet. Start a message to create one.
          </div>
        ) : (
          <div className="space-y-1.5">
            {threads.results.map((thread) => {
              const isActive = thread._id === activeThreadId;
              const isThreadRunning =
                isRunning && runningThreadId === thread._id;

              return (
                <div
                  key={thread._id}
                  className={cn(
                    "group hover:bg-accent/60 w-full rounded-md border p-2 text-left transition-colors",
                    isActive
                      ? "border-primary/40 bg-accent"
                      : "border-transparent",
                  )}
                >
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectThread(thread._id)}
                      disabled={isRunning}
                      className="flex min-w-0 flex-1 items-start gap-2 text-left"
                    >
                      <MessageSquare className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">
                          {thread.title || "Untitled thread"}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-[11px]">
                          {formatTimestamp(thread.updatedAt)}
                        </p>
                      </div>
                    </button>
                    <div className="flex items-center gap-1">
                      {isThreadRunning && (
                        <Loader2 className="text-muted-foreground size-3 animate-spin" />
                      )}
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground rounded p-1"
                        onClick={() =>
                          void handleRename(thread._id, thread.title)
                        }
                        aria-label="Rename thread"
                        disabled={isRunning}
                      >
                        <Pencil className="size-3" />
                      </button>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-destructive rounded p-1"
                        onClick={() => void handleDelete(thread._id)}
                        aria-label="Delete thread"
                        disabled={isRunning}
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {threads.status === "CanLoadMore" && (
        <div className="border-t p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => threads.loadMore(30)}
            className="w-full text-xs"
            disabled={isRunning}
          >
            Load more threads
          </Button>
        </div>
      )}
    </aside>
  );
}

function formatTimestamp(timestamp: number) {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
