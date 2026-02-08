import { tool } from "ai";
import { z } from "zod";
import type { ConvexHttpClient } from "convex/browser";
import { api } from "@/lib/convex";

// Helper to summarize trend data for tool output
function summarizeTrendData(series: Array<{ date: string; value: number }>) {
  if (!series.length) return { hasData: false };
  const sorted = [...series].sort((a, b) => a.date.localeCompare(b.date));
  const total = sorted.reduce((sum, e) => sum + e.value, 0);
  return {
    hasData: true,
    total,
    average: total / sorted.length,
    min: Math.min(...sorted.map((e) => e.value)),
    max: Math.max(...sorted.map((e) => e.value)),
    latest: sorted[sorted.length - 1],
    earliest: sorted[0],
    dataPoints: sorted.length,
  };
}

export function createConvexTools(client: ConvexHttpClient) {
  return {
    queryDashboard: tool({
      description:
        "Query dashboard data with custom filters. Use this to get revenue, customer, quality, and operations data for any date range or filter combination. Always use this tool when the user asks about data outside the current filter context.",
      inputSchema: z.object({
        dateRange: z
          .object({
            preset: z
              .enum(["7d", "30d", "90d", "ytd", "custom"])
              .describe('Date range preset. Use "custom" for specific dates.'),
            from: z
              .string()
              .optional()
              .describe(
                'Start date in YYYY-MM-DD format (required if preset is "custom")',
              ),
            to: z
              .string()
              .optional()
              .describe(
                'End date in YYYY-MM-DD format (required if preset is "custom")',
              ),
          })
          .describe("Date range to query"),
        turnaround: z
          .string()
          .optional()
          .describe(
            'Filter by turnaround: "All", "Standard", "Express", or "Urgent"',
          ),
        status: z
          .string()
          .optional()
          .describe(
            'Filter by status: "All", "Unassigned", "Completed", "Cancelled"',
          ),
        acquisition: z
          .string()
          .optional()
          .describe(
            'Filter by acquisition channel: "All" or specific channel name',
          ),
        draft: z
          .string()
          .optional()
          .describe('Filter by draft number: "All", "1", "2", "3", "4", "5+"'),
        customerType: z
          .string()
          .optional()
          .describe(
            'Filter by customer type: "All", "Multi" (multi-draft), or "Single"',
          ),
      }),
      execute: async ({
        dateRange,
        turnaround = "All",
        status = "All",
        acquisition = "All",
        draft = "All",
        customerType = "All",
      }) => {
        const data = await client.query(api.dashboard.getDashboard, {
          dateRange: {
            preset: dateRange.preset,
            from: dateRange.from,
            to: dateRange.to,
          },
          turnaround,
          status,
          acquisition,
          draft,
          customerType,
        });

        // Return a structured summary that's easy for the model to use
        return {
          dateRange:
            dateRange.preset === "custom"
              ? `${dateRange.from} to ${dateRange.to}`
              : dateRange.preset,
          filters: { turnaround, status, acquisition, draft, customerType },
          kpis: {
            totalRevenue: data.kpis.totalRevenue,
            activeCustomers: data.kpis.activeCustomers,
            multiDraftRate: data.kpis.multiDraftRate,
            avgRating: data.kpis.avgRating,
            ePlusRate: data.kpis.ePlusRate,
            onTimeRate: data.kpis.onTimeRate,
            unassignedCount: data.kpis.unassignedCount,
            lostRevenue: data.kpis.lostRevenue,
          },
          trends: {
            revenue: summarizeTrendData(data.series.revenueOverTime),
            volume: summarizeTrendData(data.series.volumeOverTime),
          },
          breakdowns: {
            byChannel: data.breakdowns.byChannel.slice(0, 10),
            byTurnaround: data.breakdowns.byTurnaround,
            byStatus: data.breakdowns.byStatus,
            byDraft: data.breakdowns.byDraft,
            byLocation: data.breakdowns.byLocation.slice(0, 10),
          },
          ratings: data.ratings,
          channelPerformance: data.tables.channelPerformance.slice(0, 10),
          unassignedEssays: data.tables.unassignedEssays.slice(0, 10),
          lateDeliveries: data.tables.lateDeliveries.slice(0, 10),
        };
      },
    }),

    getEssayStats: tool({
      description:
        "Get current essay request workload stats: queue size, upcoming deadlines, and recent completions.",
      inputSchema: z.object({}),
      execute: async () => {
        const stats = await client.query(
          api.essayRequests.getEssayRequestStats,
          {},
        );
        return {
          currentQueue: stats.currentTotal,
          dueSoon: stats.dueSoon,
          completedLast7Days: stats.completedLast7Days,
        };
      },
    }),

    comparePeriods: tool({
      description:
        "Compare dashboard KPIs between two time periods to analyze trends and changes. Useful for period-over-period analysis.",
      inputSchema: z.object({
        period1: z.object({
          preset: z.enum(["7d", "30d", "90d", "ytd", "custom"]),
          from: z.string().optional(),
          to: z.string().optional(),
          label: z.string().describe("Human-readable label for this period"),
        }),
        period2: z.object({
          preset: z.enum(["7d", "30d", "90d", "ytd", "custom"]),
          from: z.string().optional(),
          to: z.string().optional(),
          label: z.string().describe("Human-readable label for this period"),
        }),
      }),
      execute: async ({ period1, period2 }) => {
        const [data1, data2] = await Promise.all([
          client.query(api.dashboard.getDashboard, {
            dateRange: {
              preset: period1.preset,
              from: period1.from,
              to: period1.to,
            },
          }),
          client.query(api.dashboard.getDashboard, {
            dateRange: {
              preset: period2.preset,
              from: period2.from,
              to: period2.to,
            },
          }),
        ]);

        const calculateChange = (current: number, previous: number) => {
          if (previous === 0) return current > 0 ? 100 : 0;
          return ((current - previous) / previous) * 100;
        };

        return {
          period1: {
            label: period1.label,
            kpis: data1.kpis,
          },
          period2: {
            label: period2.label,
            kpis: data2.kpis,
          },
          changes: {
            revenue: {
              absolute: data1.kpis.totalRevenue - data2.kpis.totalRevenue,
              percent: calculateChange(
                data1.kpis.totalRevenue,
                data2.kpis.totalRevenue,
              ),
            },
            customers: {
              absolute: data1.kpis.activeCustomers - data2.kpis.activeCustomers,
              percent: calculateChange(
                data1.kpis.activeCustomers,
                data2.kpis.activeCustomers,
              ),
            },
            avgRating: {
              absolute: data1.kpis.avgRating - data2.kpis.avgRating,
              percent: calculateChange(
                data1.kpis.avgRating,
                data2.kpis.avgRating,
              ),
            },
            onTimeRate: {
              absolute: data1.kpis.onTimeRate - data2.kpis.onTimeRate,
              percent: calculateChange(
                data1.kpis.onTimeRate,
                data2.kpis.onTimeRate,
              ),
            },
          },
        };
      },
    }),
  };
}
