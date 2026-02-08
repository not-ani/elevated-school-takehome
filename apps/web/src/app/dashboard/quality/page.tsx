"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { formatNumber } from "@/components/dashboard/utils";
import { useQuery } from "@/lib/use-query";
import { api } from "@/lib/convex";
import type { QualityData } from "@/components/dashboard/query-types";
import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-page-skeleton";
import { useStableQueryData } from "@/components/dashboard/use-stable-query-data";

export default function QualityPage() {
  const { deferredQueryArgs } = useDashboard();
  const result = useQuery(api.dashboardQuality.getQuality, deferredQueryArgs);
  const liveData = result.data as QualityData | undefined;
  const data = useStableQueryData(liveData);

  if (!data) return <DashboardPageSkeleton />;

  // Calculate total satisfaction counts
  const totalSatisfaction = data.ratings.satisfactionByDraft.reduce(
    (acc, d) => ({
      ePlus: acc.ePlus + d.ePlus,
      e: acc.e + d.e,
      eMinus: acc.eMinus + d.eMinus,
    }),
    { ePlus: 0, e: 0, eMinus: 0 },
  );
  const totalResponses =
    totalSatisfaction.ePlus + totalSatisfaction.e + totalSatisfaction.eMinus;
  const safeResponses = Math.max(1, totalResponses);

  return (
    <div className="flex flex-col gap-6">
      {/* Hero KPIs */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FeaturedKpiCard
          title="Avg Essay Rating"
          value={data.kpis.avgRating.toFixed(2)}
          change="+0.3"
          changeLabel="vs last period"
          sparkline={data.ratings.byDraft.map((entry) => ({
            value: entry.avgRating,
          }))}
          trend="up"
          accentColor="var(--chart-1)"
        />
        <FeaturedKpiCard
          title="E+ Satisfaction"
          value={`${data.kpis.ePlusRate.toFixed(1)}%`}
          change="+5.1%"
          changeLabel="highly satisfied"
          trend="up"
          accentColor="var(--chart-2)"
        />
        <FeaturedKpiCard
          title="E Satisfaction"
          value={`${((totalSatisfaction.e / safeResponses) * 100).toFixed(1)}%`}
          changeLabel="satisfied"
          trend="neutral"
          accentColor="var(--chart-3)"
        />
        <FeaturedKpiCard
          title="E- Rate"
          value={`${((totalSatisfaction.eMinus / safeResponses) * 100).toFixed(1)}%`}
          changeLabel="needs improvement"
          trend={totalSatisfaction.eMinus > 0 ? "down" : "neutral"}
          accentColor="var(--chart-5)"
        />
      </section>

      {/* Main Charts */}
      <section className="grid gap-4 lg:grid-cols-2">
        {/* Rating by Draft */}
        <FeaturedChartCard
          title="Average Rating by Draft"
          description="Quality improvement across iterations"
          value={data.kpis.avgRating.toFixed(2)}
          valueLabel="overall average"
        >
          <div className="h-[280px]">
            <ChartContainer
              config={{
                avgRating: { label: "Avg Rating", color: "var(--chart-1)" },
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
        </FeaturedChartCard>

        {/* Satisfaction by Draft - Stacked Bar */}
        <ChartCard
          title="Satisfaction by Draft"
          description="E+/E/E- distribution per draft"
        >
          <div className="h-[320px]">
            <ChartContainer
              config={{
                ePlus: { label: "E+", color: "var(--chart-2)" },
                e: { label: "E", color: "var(--chart-3)" },
                eMinus: { label: "E-", color: "var(--chart-5)" },
              }}
              className="h-full w-full"
            >
              <BarChart
                data={data.ratings.satisfactionByDraft}
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
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(label) => `Draft ${label}`}
                      formatter={(value, name) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-muted-foreground text-xs font-medium">
                            {name} Satisfaction
                          </span>
                          <span className="text-foreground text-sm font-semibold tabular-nums">
                            {formatNumber(Number(value))} responses
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Bar
                  dataKey="ePlus"
                  name="E+"
                  fill="var(--color-ePlus)"
                  stackId="a"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="e"
                  name="E"
                  fill="var(--color-e)"
                  stackId="a"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="eMinus"
                  name="E-"
                  fill="var(--color-eMinus)"
                  stackId="a"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
            {/* Legend */}
            <div className="flex justify-center gap-6 pt-2">
              <div className="flex items-center gap-1.5">
                <div
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: "var(--chart-2)" }}
                />
                <span className="text-muted-foreground text-xs">
                  E+ (Excellent)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: "var(--chart-3)" }}
                />
                <span className="text-muted-foreground text-xs">E (Good)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: "var(--chart-5)" }}
                />
                <span className="text-muted-foreground text-xs">
                  E- (Needs Work)
                </span>
              </div>
            </div>
          </div>
        </ChartCard>
      </section>

      {/* Satisfaction Heatmap */}
      <section>
        <ChartCard
          title="Satisfaction Heatmap"
          description="Detailed breakdown by draft number"
        >
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {data.ratings.satisfactionByDraft.map((row) => {
              const total = row.ePlus + row.e + row.eMinus;
              const ePlusPercent = total > 0 ? (row.ePlus / total) * 100 : 0;
              const ePercent = total > 0 ? (row.e / total) * 100 : 0;
              const eMinusPercent = total > 0 ? (row.eMinus / total) * 100 : 0;

              return (
                <div
                  key={row.draft}
                  className="bg-card space-y-3 rounded-xl border p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      Draft {row.draft}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {total} total
                    </span>
                  </div>

                  {/* Progress bars */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground w-6 text-xs">
                        E+
                      </span>
                      <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${ePlusPercent}%`,
                            backgroundColor: "var(--chart-2)",
                          }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs tabular-nums">
                        {row.ePlus}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground w-6 text-xs">
                        E
                      </span>
                      <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${ePercent}%`,
                            backgroundColor: "var(--chart-3)",
                          }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs tabular-nums">
                        {row.e}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground w-6 text-xs">
                        E-
                      </span>
                      <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${eMinusPercent}%`,
                            backgroundColor: "var(--chart-5)",
                          }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs tabular-nums">
                        {row.eMinus}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </section>
    </div>
  );
}
