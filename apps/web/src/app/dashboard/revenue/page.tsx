"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  ChartCard,
  FeaturedChartCard,
} from "@/components/dashboard/chart-card";
import { FeaturedKpiCard } from "@/components/dashboard/kpi-card";
import { formatCurrency, formatNumber } from "@/components/dashboard/utils";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { useQuery } from "@/lib/use-query";
import { api } from "@/lib/convex";
import type { RevenueData } from "@/components/dashboard/query-types";
import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-page-skeleton";
import { useStableQueryData } from "@/components/dashboard/use-stable-query-data";

export default function RevenuePage() {
  const { deferredQueryArgs } = useDashboard();
  const result = useQuery(api.dashboardRevenue.getRevenue, deferredQueryArgs);
  const liveData = result.data as RevenueData | undefined;
  const data = useStableQueryData(liveData);

  if (!data) return <DashboardPageSkeleton />;

  const avgRevenuePerCustomer =
    data.kpis.activeCustomers > 0
      ? data.kpis.totalRevenue / data.kpis.activeCustomers
      : 0;

  const totalVolume = data.series.volumeOverTime.reduce(
    (sum, entry) => sum + entry.value,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Hero KPIs */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FeaturedKpiCard
          title="Total Revenue"
          value={formatCurrency(data.kpis.totalRevenue)}
          change="+12.5%"
          changeLabel="vs last period"
          sparkline={data.series.revenueOverTime.map((entry) => ({
            value: entry.value,
          }))}
          trend="up"
          accentColor="var(--chart-1)"
        />
        <FeaturedKpiCard
          title="Total Volume"
          value={formatNumber(totalVolume)}
          change="+8.3%"
          changeLabel="essays submitted"
          sparkline={data.series.volumeOverTime.map((entry) => ({
            value: entry.value,
          }))}
          trend="up"
          accentColor="var(--chart-2)"
        />
        <FeaturedKpiCard
          title="Avg Revenue/Customer"
          value={formatCurrency(avgRevenuePerCustomer)}
          change="+4.2%"
          changeLabel="vs last period"
          trend="up"
          accentColor="var(--chart-3)"
        />
        <FeaturedKpiCard
          title="Lost Revenue"
          value={formatCurrency(data.kpis.lostRevenue)}
          changeLabel="from unassigned"
          trend={data.kpis.lostRevenue > 0 ? "down" : "neutral"}
          accentColor="var(--chart-5)"
        />
      </section>

      {/* Main Charts */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* Revenue Over Time - Full Width */}
        <FeaturedChartCard
          title="Revenue Over Time"
          description="Daily revenue trend"
          value={formatCurrency(data.kpis.totalRevenue)}
          valueLabel="total revenue"
          className="lg:col-span-2"
        >
          <div className="h-[320px]">
            <ChartContainer
              config={{
                value: { label: "Revenue", color: "var(--chart-1)" },
              }}
              className="h-full w-full"
            >
              <AreaChart
                data={data.series.revenueOverTime}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="revenueGradient2"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--color-value)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--color-value)"
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
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
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
                      formatter={(value, _name) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-muted-foreground text-xs font-medium">
                            Daily Revenue
                          </span>
                          <span className="text-foreground text-sm font-semibold tabular-nums">
                            {formatCurrency(Number(value))}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-value)"
                  strokeWidth={2}
                  fill="url(#revenueGradient2)"
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </FeaturedChartCard>

        {/* Revenue by Channel */}
        <ChartCard
          title="Revenue by Channel"
          description="Acquisition source breakdown"
        >
          <div className="flex h-[320px] flex-col">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.breakdowns.byChannel}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {data.breakdowns.byChannel.map((_, index) => (
                      <Cell
                        key={index}
                        fill={`var(--chart-${(index % 5) + 1})`}
                        stroke="var(--background)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const item = payload[0];
                      return (
                        <div className="border-border/60 bg-background/95 rounded-xl border px-4 py-3 shadow-2xl ring-1 ring-black/5 backdrop-blur-sm dark:ring-white/10">
                          <p className="text-muted-foreground mb-1 text-xs font-medium">
                            Channel
                          </p>
                          <p className="text-foreground text-sm font-semibold">
                            {item.name}
                          </p>
                          <p className="text-muted-foreground mt-1.5 text-xs font-medium">
                            {formatCurrency(Number(item.value))} revenue
                          </p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 pt-2">
              {data.breakdowns.byChannel.map((item, index) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div
                    className="size-2.5 rounded-full"
                    style={{
                      backgroundColor: `var(--chart-${(index % 5) + 1})`,
                    }}
                  />
                  <span className="text-muted-foreground text-xs">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </section>

      {/* Secondary Charts */}
      <section className="grid gap-4 lg:grid-cols-2">
        {/* Submission Volume */}
        <ChartCard
          title="Submission Volume"
          description="Essays submitted over time"
        >
          <div className="h-[260px]">
            <ChartContainer
              config={{
                value: { label: "Essays", color: "var(--chart-2)" },
              }}
              className="h-full w-full"
            >
              <LineChart
                data={data.series.volumeOverTime}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
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
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
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
                      formatter={(value, _name) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-muted-foreground text-xs font-medium">
                            Submissions
                          </span>
                          <span className="text-foreground text-sm font-semibold tabular-nums">
                            {formatNumber(Number(value))} essays
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-value)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </ChartCard>

        {/* Revenue by Turnaround */}
        <ChartCard
          title="Revenue by Turnaround"
          description="Speed tier performance"
        >
          <div className="h-[260px]">
            <ChartContainer
              config={{
                value: { label: "Revenue", color: "var(--chart-3)" },
              }}
              className="h-full w-full"
            >
              <BarChart
                data={data.breakdowns.byTurnaround}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(label) => `${label} Turnaround`}
                      formatter={(value, _name) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-muted-foreground text-xs font-medium">
                            Total Revenue
                          </span>
                          <span className="text-foreground text-sm font-semibold tabular-nums">
                            {formatCurrency(Number(value))}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Bar
                  dataKey="value"
                  fill="var(--color-value)"
                  radius={[4, 4, 0, 0]}
                >
                  {data.breakdowns.byTurnaround.map((_, index) => (
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
      </section>
    </div>
  );
}
