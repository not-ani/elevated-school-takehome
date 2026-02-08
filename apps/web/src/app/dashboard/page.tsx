"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  Area,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartCard,
  FeaturedChartCard,
} from "@/components/dashboard/chart-card";
import { FeaturedKpiCard } from "@/components/dashboard/kpi-card";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { formatCurrency, formatNumber } from "@/components/dashboard/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@/lib/use-query";
import { api } from "@/lib/convex";
import type { OverviewData } from "@/components/dashboard/query-types";
import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-page-skeleton";
import { useStableQueryData } from "@/components/dashboard/use-stable-query-data";

export default function OverviewPage() {
  const { deferredQueryArgs } = useDashboard();
  const result = useQuery(api.dashboardOverview.getOverview, deferredQueryArgs);
  const liveData = result.data as OverviewData | undefined;
  const data = useStableQueryData(liveData);

  if (!data) return <DashboardPageSkeleton />;

  const derived = React.useMemo(() => {
    const volumeLookup = new Map(
      data.series.volumeOverTime.map((entry) => [entry.date, entry.value]),
    );
    const momentumSeries = data.series.revenueOverTime.map((entry) => ({
      date: entry.date,
      revenue: entry.value,
      volume: volumeLookup.get(entry.date) ?? 0,
    }));

    const revenueSparkline = data.series.revenueOverTime.map((entry) => ({
      value: entry.value,
    }));
    const ratingSparkline = data.ratings.byDraft.map((entry) => ({
      value: entry.avgRating,
    }));

    const draft1 =
      data.ratings.byDraft.find((row) => row.draft === 1)?.avgRating ?? 0;
    const draft2 =
      data.ratings.byDraft.find((row) => row.draft === 2)?.avgRating ?? 0;
    const draftLift = draft2 - draft1;

    const avgLtv =
      data.kpis.activeCustomers > 0
        ? data.kpis.totalRevenue / data.kpis.activeCustomers
        : 0;

    const multiDraftRate = Math.min(100, Math.max(0, data.kpis.multiDraftRate));
    const singleDraftRate = Math.max(0, 100 - multiDraftRate);

    const topChannel = data.breakdowns.byChannel[0] ?? {
      label: "No data",
      value: 0,
    };

    const unassignedPreview = data.tables.unassignedEssays;
    const latePreview = data.tables.lateDeliveries;

    const maxOverdue = data.tables.lateDeliveries.reduce(
      (max, row) => Math.max(max, Math.abs(row.time_remaining_hours)),
      0,
    );

    const onTimeRate = Math.min(100, Math.max(0, data.kpis.onTimeRate));

    return {
      momentumSeries,
      revenueSparkline,
      ratingSparkline,
      draftLift,
      avgLtv,
      multiDraftRate,
      singleDraftRate,
      topChannel,
      unassignedPreview,
      latePreview,
      maxOverdue,
      onTimeRate,
    };
  }, [data]);

  const draftLiftLabel =
    derived.draftLift >= 0
      ? `+${derived.draftLift.toFixed(2)}`
      : derived.draftLift.toFixed(2);

  const lateCount = data.lateCount;
  const unassignedCount = data.kpis.unassignedCount;
  const totalExceptions = lateCount + unassignedCount;

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FeaturedKpiCard
          title="Total Revenue"
          value={formatCurrency(data.kpis.totalRevenue)}
          sparkline={derived.revenueSparkline}
          accentColor="var(--chart-1)"
        />
        <FeaturedKpiCard
          title="Active Customers"
          value={formatNumber(data.kpis.activeCustomers)}
          accentColor="var(--chart-2)"
        />
        <FeaturedKpiCard
          title="Multi-Draft Rate"
          value={`${derived.multiDraftRate.toFixed(1)}%`}
          accentColor="var(--chart-3)"
        />
        <FeaturedKpiCard
          title="Avg Rating"
          value={data.kpis.avgRating.toFixed(2)}
          sparkline={derived.ratingSparkline}
          accentColor="var(--chart-4)"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <FeaturedChartCard
          title="Business Momentum"
          description="Revenue vs submission volume"
          value={formatCurrency(data.kpis.totalRevenue)}
          valueLabel="total revenue"
          className="xl:col-span-8"
          action={
            <Link
              className={buttonVariants({
                variant: "outline",
                size: "sm",
              })}
              href="/dashboard/revenue"
            >
              Revenue
              <ArrowUpRight className="size-4" />
            </Link>
          }
        >
          <div className="h-[430px] w-full">
            <ChartContainer
              config={{
                revenue: { label: "Revenue", color: "var(--chart-1)" },
                volume: { label: "Submissions", color: "var(--chart-2)" },
              }}
              className="h-full w-full"
            >
              <ComposedChart
                data={derived.momentumSeries}
                margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="momentumGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--color-revenue)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--color-revenue)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => formatNumber(Number(value))}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        return date.toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        });
                      }}
                      formatter={(value, name) => {
                        const numeric = Number(value);
                        return (
                          <div className="flex w-full items-center justify-between gap-4">
                            <span className="text-muted-foreground text-xs font-medium">
                              {name}
                            </span>
                            <span className="text-foreground text-sm font-semibold tabular-nums">
                              {name === "Revenue"
                                ? formatCurrency(numeric)
                                : `${formatNumber(numeric)} submissions`}
                            </span>
                          </div>
                        );
                      }}
                    />
                  }
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                  fill="url(#momentumGradient)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="volume"
                  stroke="var(--color-volume)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </ComposedChart>
            </ChartContainer>
          </div>
        </FeaturedChartCard>

        <ChartCard
          title="Operations Watchlist"
          description="What needs attention today"
          className="overflow-y-scroll xl:col-span-4"
          contentClassName="p-4 lg:h-[360px] flex flex-col min-h-0"
          action={
            <Link
              className={buttonVariants({
                variant: "outline",
                size: "sm",
              })}
              href="/dashboard/operations"
            >
              Operations
              <ArrowUpRight className="size-4" />
            </Link>
          }
        >
          <div className="flex-1 space-y-3">
            <div className="bg-muted/30 rounded-lg border p-3">
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>On-time rate</span>
                <span className="text-foreground font-medium">
                  {data.kpis.onTimeRate.toFixed(1)}%
                </span>
              </div>
              <div className="bg-muted mt-2 h-2 rounded-full">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${derived.onTimeRate}%`,
                    backgroundColor: "var(--chart-2)",
                  }}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="bg-muted/30 rounded-lg border p-3">
                <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="size-3.5 text-amber-500" />
                  Unassigned
                </div>
                <div className="mt-1 text-xl font-semibold">
                  {formatNumber(unassignedCount)}
                </div>
                <p className="text-muted-foreground text-[11px]">
                  {data.kpis.lostRevenue > 0
                    ? `${formatCurrency(data.kpis.lostRevenue)} at risk`
                    : "No revenue at risk"}
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg border p-3">
                <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <Clock className="size-3.5 text-red-500" />
                  Late deliveries
                </div>
                <div className="mt-1 text-xl font-semibold">
                  {formatNumber(lateCount)}
                </div>
                <p className="text-muted-foreground text-[11px]">
                  {derived.maxOverdue > 0
                    ? `Max ${derived.maxOverdue.toFixed(1)} hrs overdue`
                    : "No overdue items"}
                </p>
              </div>
            </div>

            <div className="h-full w-full rounded-lg border p-3">
              <div className="text-muted-foreground flex items-center justify-between text-[11px] font-medium uppercase">
                <span>Top exceptions</span>
                <Badge
                  variant={totalExceptions > 0 ? "destructive" : "secondary"}
                  className="text-[10px]"
                >
                  {totalExceptions > 0 ? `${totalExceptions} open` : "Clear"}
                </Badge>
              </div>
              <ScrollArea className="mt-2 max-h-48 pr-1">
                <div className="grid gap-2">
                  {derived.unassignedPreview.map((essay) => (
                    <div
                      key={essay.item_id}
                      className="bg-background/60 flex items-center justify-between rounded-md border px-2.5 py-2 text-xs"
                    >
                      <div>
                        <p className="font-medium">{essay.item_id}</p>
                        <p className="text-muted-foreground">
                          {essay.turnaround} · {formatNumber(essay.word_count)}{" "}
                          words
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        Unassigned
                      </Badge>
                    </div>
                  ))}
                  {derived.latePreview.map((row) => (
                    <div
                      key={row.item_id}
                      className="bg-background/60 flex items-center justify-between rounded-md border px-2.5 py-2 text-xs"
                    >
                      <div>
                        <p className="font-medium">{row.item_id}</p>
                        <p className="text-muted-foreground">
                          {Math.abs(row.time_remaining_hours).toFixed(1)} hrs
                          overdue
                        </p>
                      </div>
                      <Badge variant="destructive" className="text-[10px]">
                        Late
                      </Badge>
                    </div>
                  ))}
                  {totalExceptions === 0 && (
                    <div className="bg-muted/30 text-muted-foreground flex items-center gap-2 rounded-md border px-2.5 py-2 text-xs">
                      <CheckCircle2 className="size-3.5 text-emerald-500" />
                      All clear. No exceptions to resolve.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </ChartCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Quality Lift"
          description="Draft-by-draft improvement"
          action={
            <Link
              href="/dashboard/quality"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
              })}
            >
              Quality
              <ArrowUpRight className="size-4" />
            </Link>
          }
        >
          <div className="h-[260px]">
            <ChartContainer
              config={{
                avgRating: { label: "Avg Rating", color: "var(--chart-4)" },
              }}
              className="h-full w-full"
            >
              <LineChart
                data={data.ratings.byDraft}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="draft"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => `Draft ${value}`}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  domain={["dataMin - 0.5", "dataMax + 0.5"]}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(label) => `Draft ${label}`}
                      formatter={(value, name) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-muted-foreground text-xs font-medium">
                            {name}
                          </span>
                          <span className="text-foreground text-sm font-semibold tabular-nums">
                            {Number(value).toFixed(2)} / 5.0
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="avgRating"
                  stroke="var(--color-avgRating)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-avgRating)", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="bg-muted/30 rounded-lg border p-3">
              <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Sparkles className="size-3.5 text-amber-500" />
                Draft 1 → 2 lift
              </div>
              <div className="mt-1 text-xl font-semibold">
                {draftLiftLabel} pts
              </div>
              <p className="text-muted-foreground text-[11px]">
                Largest quality improvement window
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg border p-3">
              <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                E+ Satisfaction
              </div>
              <div className="mt-1 text-xl font-semibold">
                {data.kpis.ePlusRate.toFixed(1)}%
              </div>
              <p className="text-muted-foreground text-[11px]">
                Overall student sentiment
              </p>
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title="Customer Mix"
          description="Single vs multi-draft behavior"
          action={
            <Link
              className={buttonVariants({
                variant: "outline",
                size: "sm",
              })}
              href="/dashboard/customers"
            >
              Customers
              <ArrowUpRight className="size-4" />
            </Link>
          }
        >
          <div className="grid gap-4 sm:grid-cols-[180px,1fr] sm:items-center">
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { label: "Single Draft", value: derived.singleDraftRate },
                      { label: "Multi Draft", value: derived.multiDraftRate },
                    ]}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    <Cell
                      fill="var(--chart-1)"
                      stroke="var(--background)"
                      strokeWidth={2}
                    />
                    <Cell
                      fill="var(--chart-3)"
                      stroke="var(--background)"
                      strokeWidth={2}
                    />
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const item = payload[0];
                      return (
                        <div className="border-border/60 bg-background/95 rounded-xl border px-4 py-3 shadow-2xl ring-1 ring-black/5 backdrop-blur-sm dark:ring-white/10">
                          <p className="text-muted-foreground mb-1 text-xs font-medium">
                            Customer Type
                          </p>
                          <p className="text-foreground text-sm font-semibold">
                            {item.name}
                          </p>
                          <p className="text-muted-foreground mt-1.5 text-xs font-medium">
                            {Number(item.value).toFixed(1)}% of customers
                          </p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">
                  Multi-draft customers
                </span>
                <span className="text-xl font-semibold">
                  {derived.multiDraftRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Avg LTV</span>
                <span className="text-xl font-semibold">
                  {formatCurrency(derived.avgLtv)}
                </span>
              </div>
              <div className="bg-muted/30 rounded-lg border p-3">
                <div className="text-muted-foreground flex items-center justify-between text-xs">
                  <span>Top channel</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {derived.topChannel.label}
                  </Badge>
                </div>
                <div className="mt-1 text-sm font-semibold">
                  {formatCurrency(derived.topChannel.value)}
                </div>
              </div>
            </div>
          </div>
        </ChartCard>
      </section>
    </div>
  );
}
