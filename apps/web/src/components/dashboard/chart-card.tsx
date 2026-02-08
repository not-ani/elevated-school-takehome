import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ChartCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card
      className={cn(
        "bg-card flex flex-col overflow-hidden rounded-xl border",
        className,
      )}
    >
      <CardHeader className="sticky top-0 z-10 flex w-full items-center justify-between gap-4 rounded-t-xl border-b">
        <div className="flex flex-col gap-1">
          <CardTitle className="font-semibold tracking-tight">
            {title}
          </CardTitle>

          {description && (
            <p className="text-muted-foreground text-xs">{description}</p>
          )}
        </div>
        {action}
      </CardHeader>
      <CardContent
        className={cn("w-full flex-1 overflow-y-auto", contentClassName)}
      >
        {children}
      </CardContent>
    </Card>
  );
}

// Larger chart card for featured visualizations
export function FeaturedChartCard({
  title,
  description,
  value,
  valueLabel,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  value?: string;
  valueLabel?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-card rounded-xl border", className)}>
      <div className="flex items-start justify-between gap-4 px-5 py-4">
        <div className="space-y-1">
          <h3 className="font-semibold tracking-tight">{title}</h3>
          {description && (
            <p className="text-muted-foreground text-xs">{description}</p>
          )}
          {value && (
            <div className="pt-1">
              <span className="text-2xl font-bold tabular-nums">{value}</span>
              {valueLabel && (
                <span className="text-muted-foreground ml-2 text-xs">
                  {valueLabel}
                </span>
              )}
            </div>
          )}
        </div>
        {action}
      </div>
      <div className="">{children}</div>
    </div>
  );
}
