"use client";

import * as React from "react";
import Image from "next/image";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Loader2,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ImagePreview } from "@/components/image-preview";

export type PythonAnalysisOutput = {
  summary?: string;
  stdout?: string;
  stderr?: string;
  filesGenerated?: string[];
  charts?: string[];
  error?: string;
};

type PythonCodeBlockProps = {
  code: string;
  note?: string;
  filesToLoad?: string[];
  output?: PythonAnalysisOutput;
  isComplete: boolean;
  isError: boolean;
  isRunning: boolean;
};

export function PythonCodeBlock({
  code,
  note,
  filesToLoad,
  output,
  isComplete,
  isError,
  isRunning,
}: PythonCodeBlockProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const charts = output?.charts ?? [];
  const hasCharts = charts.length > 0;

  return (
    <div className="bg-muted/30 overflow-hidden rounded-lg border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger
          render={
            <button className="hover:bg-muted/50 flex w-full items-center gap-2 px-3 py-2 text-xs transition-colors" />
          }
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
          <p className="text-muted-foreground mb-2 text-[11px]">
            Generated visuals
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {charts.map((chart, index) => (
              <ImagePreview
                key={`${chart.slice(0, 24)}-${index}`}
                src={chart}
                alt={`Generated chart ${index + 1}`}
              >
                <Image
                  src={chart}
                  alt={`Generated chart ${index + 1}`}
                  width={1200}
                  height={700}
                  unoptimized
                  className="h-auto w-full bg-white"
                />
              </ImagePreview>
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
