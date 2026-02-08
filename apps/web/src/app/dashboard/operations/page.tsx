"use client";

import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ChartCard } from "@/components/dashboard/chart-card";
import { FeaturedKpiCard } from "@/components/dashboard/kpi-card";
import { formatCurrency, formatNumber } from "@/components/dashboard/utils";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { cn } from "@/lib/utils";
import { useQuery } from "@/lib/use-query";
import { api } from "@/lib/convex";
import { usePaginatedQuery } from "convex/react";
import type {
  LateDelivery,
  OperationsSummaryData,
  UnassignedEssay,
} from "@/components/dashboard/query-types";
import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-page-skeleton";
import { useStableQueryData } from "@/components/dashboard/use-stable-query-data";

export default function OperationsPage() {
  const { deferredQueryArgs } = useDashboard();
  const summaryResult = useQuery(
    api.dashboardOperations.getOperationsSummary,
    deferredQueryArgs,
  );
  const unassigned = usePaginatedQuery(
    api.dashboardOperations.listUnassignedEssays,
    deferredQueryArgs,
    { initialNumItems: 20 },
  );
  const late = usePaginatedQuery(
    api.dashboardOperations.listLateDeliveries,
    deferredQueryArgs,
    { initialNumItems: 20 },
  );

  const liveData = summaryResult.data as OperationsSummaryData | undefined;
  const data = useStableQueryData(liveData);
  const unassignedLiveRows =
    unassigned.status === "LoadingFirstPage"
      ? undefined
      : (unassigned.results as UnassignedEssay[]);
  const lateLiveRows =
    late.status === "LoadingFirstPage"
      ? undefined
      : (late.results as LateDelivery[]);
  const unassignedRows = useStableQueryData(unassignedLiveRows) ?? [];
  const lateRows = useStableQueryData(lateLiveRows) ?? [];

  if (!data) return <DashboardPageSkeleton />;

  return (
    <div className="flex flex-col gap-6">
      {/* Hero KPIs */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FeaturedKpiCard
          title="On-Time Rate"
          value={`${data.kpis.onTimeRate.toFixed(1)}%`}
          change="+2.1%"
          changeLabel="vs last period"
          trend="up"
          accentColor="var(--chart-2)"
        />
        <FeaturedKpiCard
          title="Unassigned Essays"
          value={formatNumber(data.kpis.unassignedCount)}
          changeLabel="needs assignment"
          trend={data.kpis.unassignedCount > 5 ? "down" : "neutral"}
          accentColor="var(--chart-5)"
        />
        <FeaturedKpiCard
          title="Lost Revenue"
          value={formatCurrency(data.kpis.lostRevenue)}
          changeLabel="from unassigned"
          trend={data.kpis.lostRevenue > 0 ? "down" : "neutral"}
          accentColor="var(--chart-5)"
        />
        <FeaturedKpiCard
          title="Late Deliveries"
          value={formatNumber(data.lateCount)}
          changeLabel="currently overdue"
          trend={data.lateCount > 0 ? "down" : "up"}
          accentColor={data.lateCount > 0 ? "var(--chart-5)" : "var(--chart-2)"}
        />
      </section>

      {/* Main Charts */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* On-Time Delivery Gauge */}
        <ChartCard
          title="On-Time Delivery"
          description="Delivery performance gauge"
        >
          <div className="flex h-[280px] flex-col items-center justify-center">
            <div className="relative">
              <ResponsiveContainer width={200} height={200}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  startAngle={180}
                  endAngle={0}
                  data={[
                    { value: data.kpis.onTimeRate, fill: "var(--chart-2)" },
                  ]}
                >
                  <RadialBar
                    dataKey="value"
                    cornerRadius={8}
                    background={{ fill: "var(--muted)" }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="-mt-4 text-center">
                  <span className="text-3xl font-bold">
                    {data.kpis.onTimeRate.toFixed(1)}%
                  </span>
                  <p className="text-muted-foreground text-xs">On-Time</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-6">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span className="text-muted-foreground text-xs">On-Time</span>
              </div>
              <div className="flex items-center gap-1.5">
                <AlertCircle className="size-4 text-red-500" />
                <span className="text-muted-foreground text-xs">Late</span>
              </div>
            </div>
          </div>
        </ChartCard>

        {/* Status Breakdown */}
        <ChartCard
          title="Status Breakdown"
          description="Essays by current status"
        >
          <div className="h-[280px]">
            <ChartContainer
              config={{
                value: { label: "Essays", color: "var(--chart-4)" },
              }}
              className="h-full w-full"
            >
              <BarChart
                data={data.breakdowns.byStatus}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 80, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="var(--border)"
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-muted-foreground text-xs font-medium">
                            {name}
                          </span>
                          <span className="text-foreground text-sm font-semibold tabular-nums">
                            {formatNumber(Number(value))} essays
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Bar
                  dataKey="value"
                  fill="var(--color-value)"
                  radius={[0, 4, 4, 0]}
                >
                  {data.breakdowns.byStatus.map((_, index) => (
                    <Cell
                      key={index}
                      fill={`var(--chart-${(index % 5) + 1})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        </ChartCard>

        {/* Unassigned Essays List */}
        <ChartCard
          title="Unassigned Essays"
          description="Essays needing assignment"
        >
          <div className="flex h-[280px] flex-col">
            {unassignedRows.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <CheckCircle2 className="mb-2 size-10 text-emerald-500" />
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-muted-foreground text-xs">
                  No unassigned essays
                </p>
              </div>
            ) : (
              <div className="flex-1 space-y-2 overflow-auto">
                {unassignedRows.map((essay, index) => (
                  <div
                    key={essay.item_id}
                    className={cn(
                      "flex items-center justify-between rounded-lg p-3",
                      index % 2 === 0 ? "bg-muted/50" : "bg-transparent",
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium">{essay.item_id}</p>
                      <p className="text-muted-foreground text-xs">
                        Needs assignment
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="text-muted-foreground size-3.5" />
                      <span className="text-xs font-medium">
                        {essay.turnaround}
                      </span>
                    </div>
                  </div>
                ))}
                {unassigned.status === "CanLoadMore" && (
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground w-full rounded-md border border-dashed py-2 text-xs"
                    onClick={() => unassigned.loadMore(20)}
                  >
                    Load more unassigned essays
                  </button>
                )}
              </div>
            )}
            {data.kpis.lostRevenue > 0 && (
              <div className="mt-3 border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">
                    Lost revenue
                  </span>
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                    {formatCurrency(data.kpis.lostRevenue)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </ChartCard>
      </section>

      {/* Late Deliveries Table */}
      <section>
        <ChartCard
          title="Late Deliveries"
          description="Essays past their deadline"
        >
          {lateRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="mb-3 size-12 text-emerald-500" />
              <p className="text-lg font-medium">No late deliveries!</p>
              <p className="text-muted-foreground text-sm">
                All essays delivered on time
              </p>
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-2 py-3 text-left font-medium">Item ID</th>
                    <th className="px-2 py-3 text-left font-medium">Student</th>
                    <th className="px-2 py-3 text-right font-medium">
                      Time Overdue
                    </th>
                    <th className="px-2 py-3 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lateRows.map((row, index) => {
                    const hoursOverdue = Math.abs(row.time_remaining_hours);
                    const severity =
                      hoursOverdue > 24
                        ? "critical"
                        : hoursOverdue > 12
                          ? "warning"
                          : "minor";

                    return (
                      <tr
                        key={row.item_id}
                        className={cn(
                          "border-b last:border-0",
                          index % 2 === 0 && "bg-muted/30",
                        )}
                      >
                        <td className="px-2 py-3 font-medium">{row.item_id}</td>
                        <td className="text-muted-foreground px-2 py-3">
                          {row.student_id}
                        </td>
                        <td className="px-2 py-3 text-right tabular-nums">
                          {hoursOverdue.toFixed(1)} hrs
                        </td>
                        <td className="px-2 py-3 text-right">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                              severity === "critical" &&
                                "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                              severity === "warning" &&
                                "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                              severity === "minor" &&
                                "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                            )}
                          >
                            <AlertCircle className="size-3" />
                            {severity === "critical"
                              ? "Critical"
                              : severity === "warning"
                                ? "Warning"
                                : "Minor"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {late.status === "CanLoadMore" && (
                <div className="p-3">
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground w-full rounded-md border border-dashed py-2 text-xs"
                    onClick={() => late.loadMore(20)}
                  >
                    Load more late deliveries
                  </button>
                </div>
              )}
            </div>
          )}
        </ChartCard>
      </section>
    </div>
  );
}
