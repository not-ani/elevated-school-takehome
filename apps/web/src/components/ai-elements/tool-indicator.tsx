"use client";

import { CheckCircle2, Loader2 } from "lucide-react";

const toolLabels: Record<string, string> = {
  queryDashboard: "Fetching dashboard data",
  getEssayStats: "Checking workload stats",
  comparePeriods: "Comparing time periods",
  runPythonAnalysis: "Running data analysis",
  summarizeCsv: "Summarizing dataset",
  extractInsights: "Extracting insights",
  draftNarrative: "Drafting summary",
};

type ToolIndicatorProps = {
  toolName: string;
  isComplete: boolean;
  isError: boolean;
};

export function ToolIndicator({
  toolName,
  isComplete,
  isError,
}: ToolIndicatorProps) {
  const label = toolLabels[toolName] || "Looking up data";

  return (
    <div className="bg-muted/50 text-muted-foreground flex items-center gap-2 rounded-md px-3 py-2 text-xs">
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
