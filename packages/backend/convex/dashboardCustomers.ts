import { query } from './_generated/server'
import { v } from 'convex/values'
import {
  breakdownValidator,
  buildChannelPerformance,
  buildKpis,
  channelPerformanceValidator,
  dashboardFilterArgs,
  groupSum,
  kpisValidator,
  loadEssaysForFilters,
  topN,
} from './dashboardShared'

export const getCustomers = query({
  args: dashboardFilterArgs,
  returns: v.object({
    kpis: kpisValidator,
    breakdowns: v.object({
      byLocation: v.array(breakdownValidator),
    }),
    tables: v.object({
      channelPerformance: v.array(channelPerformanceValidator),
    }),
  }),
  handler: async (ctx, args) => {
    const essays = await loadEssaysForFilters(ctx, args)

    return {
      kpis: buildKpis(essays),
      breakdowns: {
        byLocation: topN(
          groupSum(
            essays,
            (essay) => essay.student_location ?? 'Unknown',
            (essay) => essay.revenue,
          ),
          10,
        ),
      },
      tables: {
        channelPerformance: buildChannelPerformance(essays),
      },
    }
  },
})
