import { query } from './_generated/server'
import { v } from 'convex/values'
import {
  averageByDraft,
  buildKpis,
  dashboardFilterArgs,
  kpisValidator,
  loadEssaysForFilters,
  ratingByDraftValidator,
  satisfactionBreakdownByDraft,
  satisfactionByDraftValidator,
} from './dashboardShared'

export const getQuality = query({
  args: dashboardFilterArgs,
  returns: v.object({
    kpis: kpisValidator,
    ratings: v.object({
      byDraft: v.array(ratingByDraftValidator),
      satisfactionByDraft: v.array(satisfactionByDraftValidator),
    }),
  }),
  handler: async (ctx, args) => {
    const essays = await loadEssaysForFilters(ctx, args)

    return {
      kpis: buildKpis(essays),
      ratings: {
        byDraft: averageByDraft(essays),
        satisfactionByDraft: satisfactionBreakdownByDraft(essays),
      },
    }
  },
})
