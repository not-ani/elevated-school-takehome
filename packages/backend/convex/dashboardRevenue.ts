import { query } from './_generated/server'
import { v } from 'convex/values'
import {
  breakdownValidator,
  buildKpis,
  dashboardFilterArgs,
  groupSum,
  kpisValidator,
  loadEssaysForFilters,
  seriesByDay,
  seriesPointValidator,
} from './dashboardShared'

export const getRevenue = query({
  args: dashboardFilterArgs,
  returns: v.object({
    kpis: kpisValidator,
    series: v.object({
      revenueOverTime: v.array(seriesPointValidator),
      volumeOverTime: v.array(seriesPointValidator),
    }),
    breakdowns: v.object({
      byTurnaround: v.array(breakdownValidator),
      byChannel: v.array(breakdownValidator),
    }),
  }),
  handler: async (ctx, args) => {
    const essays = await loadEssaysForFilters(ctx, args)

    return {
      kpis: buildKpis(essays),
      series: {
        revenueOverTime: seriesByDay(essays, (essay) => essay.revenue),
        volumeOverTime: seriesByDay(essays, () => 1),
      },
      breakdowns: {
        byTurnaround: groupSum(essays, (essay) => essay.turnaround, (essay) => essay.revenue),
        byChannel: groupSum(
          essays,
          (essay) => essay.student_acquisition_channel ?? 'Unknown',
          (essay) => essay.revenue,
        ),
      },
    }
  },
})
