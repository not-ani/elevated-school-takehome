"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import { ChartCard } from "@/components/dashboard/chart-card";
import { FeaturedKpiCard } from "@/components/dashboard/kpi-card";
import { formatCurrency, formatNumber } from "@/components/dashboard/utils";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { cn } from "@/lib/utils";
import { api } from "@/lib/convex";
import { useQuery } from "@/lib/use-query";
import type { CustomersData } from "@/components/dashboard/query-types";
import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-page-skeleton";
import { useStableQueryData } from "@/components/dashboard/use-stable-query-data";

export default function CustomersPage() {
  const { deferredQueryArgs } = useDashboard();
  const result = useQuery(
    api.dashboardCustomers.getCustomers,
    deferredQueryArgs,
  );
  const liveData = result.data as CustomersData | undefined;
  const data = useStableQueryData(liveData);

  if (!data) return <DashboardPageSkeleton />;

  const maxLocationValue = Math.max(
    1,
    ...data.breakdowns.byLocation.map((l) => l.value),
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Hero KPIs */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FeaturedKpiCard
          title="Active Customers"
          value={formatNumber(data.kpis.activeCustomers)}
          change="+8.2%"
          changeLabel="vs last period"
          trend="up"
          accentColor="var(--chart-1)"
        />
        <FeaturedKpiCard
          title="Multi-Draft Rate"
          value={`${data.kpis.multiDraftRate.toFixed(1)}%`}
          change="+3.2%"
          changeLabel="returning customers"
          trend="up"
          accentColor="var(--chart-2)"
        />
        <FeaturedKpiCard
          title="Avg LTV"
          value={formatCurrency(
            data.kpis.activeCustomers > 0
              ? data.kpis.totalRevenue / data.kpis.activeCustomers
              : 0,
          )}
          change="+4.5%"
          changeLabel="lifetime value"
          trend="up"
          accentColor="var(--chart-3)"
        />
        <FeaturedKpiCard
          title="E+ Satisfaction"
          value={`${data.kpis.ePlusRate.toFixed(1)}%`}
          change="+5.1%"
          changeLabel="highly satisfied"
          trend="up"
          accentColor="var(--chart-4)"
        />
      </section>

      {/* Main Charts */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* Customer Mix Pie */}
        <ChartCard
          title="Customer Mix"
          description="Single vs multi-draft customers"
        >
          <div className="flex h-[280px] flex-col">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      {
                        label: "Single Draft",
                        value: Math.max(0, 100 - data.kpis.multiDraftRate),
                      },
                      { label: "Multi Draft", value: data.kpis.multiDraftRate },
                    ]}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="45%"
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
                      fill="var(--chart-2)"
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
            <div className="flex justify-center gap-6">
              <div className="flex items-center gap-1.5">
                <div
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: "var(--chart-1)" }}
                />
                <span className="text-muted-foreground text-xs">
                  Single Draft
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: "var(--chart-2)" }}
                />
                <span className="text-muted-foreground text-xs">
                  Multi Draft
                </span>
              </div>
            </div>
          </div>
        </ChartCard>

        {/* LTV by Channel */}
        <ChartCard
          title="LTV by Channel"
          description="Average lifetime value per channel"
        >
          <div className="h-[280px]">
            <ChartContainer
              config={{
                avgLtv: { label: "Avg LTV", color: "var(--chart-3)" },
              }}
              className="h-full w-full"
            >
              <BarChart
                data={data.tables.channelPerformance}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="channel"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(label) => `${label} Channel`}
                      formatter={(value, _name) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-muted-foreground text-xs font-medium">
                            Average LTV
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
                  dataKey="avgLtv"
                  fill="var(--color-avgLtv)"
                  radius={[4, 4, 0, 0]}
                >
                  {data.tables.channelPerformance.map((_, index) => (
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

        {/* Top Locations */}
        <ChartCard
          title="Top Locations"
          description="Customer distribution by location"
        >
          <div className="no-scrollbar flex h-[280px] flex-col gap-3 overflow-auto">
            {data.breakdowns.byLocation.map((entry, index) => {
              const percentage = (entry.value / maxLocationValue) * 100;
              return (
                <div key={entry.label} className="flex items-center gap-4">
                  <span className="text-muted-foreground text-right text-xs">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{entry.label}</span>
                      <span className="text-sm tabular-nums">
                        {Math.floor(entry.value)}
                      </span>
                    </div>
                    <div className="bg-muted h-2 overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: `var(--chart-${(index % 5) + 1})`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </section>

      {/* Channel Performance Table */}
      <section>
        <ChartCard
          title="Channel Performance"
          description="Detailed metrics by acquisition channel"
        >
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-2 py-3 text-left font-medium">Channel</th>
                  <th className="px-2 py-3 text-right font-medium">
                    Customers
                  </th>
                  <th className="px-2 py-3 text-right font-medium">Revenue</th>
                  <th className="px-2 py-3 text-right font-medium">
                    Multi-Draft
                  </th>
                  <th className="px-2 py-3 text-right font-medium">Avg LTV</th>
                </tr>
              </thead>
              <tbody>
                {data.tables.channelPerformance.map((row, index) => (
                  <tr
                    key={row.channel}
                    className={cn(
                      "border-b last:border-0",
                      index % 2 === 0 && "bg-muted/30",
                    )}
                  >
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="size-2 rounded-full"
                          style={{
                            backgroundColor: `var(--chart-${(index % 5) + 1})`,
                          }}
                        />
                        {row.channel}
                      </div>
                    </td>
                    <td className="px-2 py-3 text-right tabular-nums">
                      {formatNumber(row.customers)}
                    </td>
                    <td className="px-2 py-3 text-right tabular-nums">
                      {formatCurrency(row.revenue)}
                    </td>
                    <td className="px-2 py-3 text-right tabular-nums">
                      {row.multiDraftRate.toFixed(1)}%
                    </td>
                    <td className="px-2 py-3 text-right font-medium tabular-nums">
                      {formatCurrency(row.avgLtv)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </section>
    </div>
  );
}
