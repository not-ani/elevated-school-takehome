"use client";

import * as React from "react";
import { parseAsString, useQueryState } from "nuqs";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { CompanionChat } from "@/components/dashboard/companion-chat";
import { useCompanion } from "@/components/dashboard/companion-context";
import { CompanionThreadSidebar } from "@/components/dashboard/companion-thread-sidebar";

export default function CompanionPage() {
  const { filters } = useDashboard();
  const [threadId, setThreadId] = useQueryState("threadId", parseAsString);
  const {
    activeThreadId,
    runningThreadId,
    isRunning,
    selectThread,
    startNewThread,
  } = useCompanion();

  React.useEffect(() => {
    if (!threadId) return;
    if (threadId === activeThreadId) return;
    selectThread(threadId);
  }, [activeThreadId, selectThread, threadId]);

  React.useEffect(() => {
    if (threadId) return;
    if (!activeThreadId) return;
    void setThreadId(activeThreadId, {
      history: "replace",
      shallow: true,
    });
  }, [activeThreadId, setThreadId, threadId]);

  const handleSelectThread = React.useCallback(
    (id: string) => {
      selectThread(id);
      void setThreadId(id, {
        history: "replace",
        shallow: true,
      });
    },
    [selectThread, setThreadId],
  );

  const handleNewThread = React.useCallback(() => {
    startNewThread();
    void setThreadId(null, {
      history: "replace",
      shallow: true,
    });
  }, [setThreadId, startNewThread]);

  return (
    <div className="mx-auto h-[calc(100vh-8rem)] max-w-7xl overflow-hidden rounded-xl border bg-card">
      <div className="grid h-full min-h-0 grid-rows-[220px_1fr] md:grid-cols-[290px_1fr] md:grid-rows-1">
        <CompanionThreadSidebar
          activeThreadId={activeThreadId}
          runningThreadId={runningThreadId}
          isRunning={isRunning}
          onSelectThread={handleSelectThread}
          onNewThread={handleNewThread}
        />
        <CompanionChat
          filters={filters}
          pageTitle="AI Companion"
          pagePath="/dashboard/companion"
          className="h-full"
        />
      </div>
    </div>
  );
}
