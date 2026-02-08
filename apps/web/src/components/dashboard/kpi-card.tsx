import { TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export function KpiCard({
  title,
  value,
  change,
  changeLabel,
  sparkline,
  trend = "up",
  accentColor = "var(--chart-1)",
}: {
  title: string;
  value: string;
  change?: string;
  changeLabel?: string;
  sparkline?: { value: number }[];
  trend?: "up" | "down" | "neutral";
  accentColor?: string;
}) {
  const isPositive = trend === "up";
  const isNegative = trend === "down";

  return (
    <div className="group bg-card relative overflow-hidden rounded-xl border p-4 transition-all hover:shadow-md">
      {/* Accent line at top */}
      <div
        className="absolute inset-x-0 top-0 h-1 opacity-80"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
          {title}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold tracking-tight tabular-nums">
            {value}
          </span>
          {change && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                isPositive && "text-emerald-600 dark:text-emerald-400",
                isNegative && "text-red-600 dark:text-red-400",
                !isPositive && !isNegative && "text-muted-foreground",
              )}
            >
              {isPositive && <TrendingUp className="size-3" />}
              {isNegative && <TrendingDown className="size-3" />}
              {change}
            </span>
          )}
        </div>
        {changeLabel && (
          <span className="text-muted-foreground text-[10px]">
            {changeLabel}
          </span>
        )}
      </div>

      {/* Sparkline */}
      {sparkline && sparkline.length > 1 && (
        <div className="-mx-1 mt-3 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkline}>
              <defs>
                <linearGradient
                  id={`gradient-${title.replace(/\s/g, "")}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={accentColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={accentColor}
                strokeWidth={1.5}
                fill={`url(#gradient-${title.replace(/\s/g, "")})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// Larger featured KPI card for hero metrics
export function FeaturedKpiCard({
  title,
  value,
  change,
  changeLabel,
  sparkline,
  trend = "up",
  accentColor = "var(--chart-1)",
}: {
  title: string;
  value: string;
  change?: string;
  changeLabel?: string;
  sparkline?: { value: number }[];
  trend?: "up" | "down" | "neutral";
  accentColor?: string;
}) {
  const isPositive = trend === "up";
  const isNegative = trend === "down";

  return (
    <div className="group bg-card relative overflow-hidden rounded-xl border p-5 transition-all hover:shadow-md">
      {/* Background sparkline */}
      {sparkline && sparkline.length > 1 && (
        <div className="absolute inset-0 opacity-[0.07]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkline}>
              <Area
                type="monotone"
                dataKey="value"
                stroke="transparent"
                fill={accentColor}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="relative flex flex-col gap-1">
        <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          {title}
        </span>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold tracking-tight tabular-nums">
            {value}
          </span>
          {change && (
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                isPositive &&
                  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                isNegative &&
                  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                !isPositive && !isNegative && "bg-muted text-muted-foreground",
              )}
            >
              {isPositive && <TrendingUp className="size-3" />}
              {isNegative && <TrendingDown className="size-3" />}
              {change}
            </span>
          )}
        </div>
        {changeLabel && (
          <span className="text-muted-foreground text-[11px]">
            {changeLabel}
          </span>
        )}
      </div>
    </div>
  );
}
