import { query } from './_generated/server'
import { v } from 'convex/values'
import { dashboardFilterArgs, loadEssaysForFilters } from './dashboardShared'

export const getFilterOptions = query({
  args: dashboardFilterArgs,
  returns: v.object({
    turnaroundOptions: v.array(v.string()),
    statusOptions: v.array(v.string()),
    acquisitionOptions: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const essays = await loadEssaysForFilters(ctx, {
      ...args,
      turnaround: 'All',
      status: 'All',
      acquisition: 'All',
      draft: 'All',
      customerType: 'All',
    })

    const turnarounds = new Set<string>()
    const statuses = new Set<string>()
    const acquisitions = new Set<string>()

    for (const essay of essays) {
      turnarounds.add(essay.turnaround)
      statuses.add(essay.item_status)
      acquisitions.add(essay.student_acquisition_channel ?? 'Unknown')
    }

    return {
      turnaroundOptions: ['All', ...Array.from(turnarounds).sort()],
      statusOptions: ['All', ...Array.from(statuses).sort()],
      acquisitionOptions: ['All', ...Array.from(acquisitions).sort()],
    }
  },
})
