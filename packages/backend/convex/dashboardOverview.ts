import { query } from './_generated/server'
import { v } from 'convex/values'
import {
  averageByDraft,
  breakdownValidator,
  buildKpis,
  dashboardFilterArgs,
  kpisValidator,
  lateDeliveryValidator,
  loadEssaysForFilters,
  ratingByDraftValidator,
  seriesByDay,
  seriesPointValidator,
  topN,
  unassignedEssayValidator,
} from './dashboardShared'

export const getOverview = query({
  args: dashboardFilterArgs,
  returns: v.object({
    kpis: kpisValidator,
    lateCount: v.number(),
    series: v.object({
      revenueOverTime: v.array(seriesPointValidator),
      volumeOverTime: v.array(seriesPointValidator),
    }),
    breakdowns: v.object({
      byChannel: v.array(breakdownValidator),
    }),
    ratings: v.object({
      byDraft: v.array(ratingByDraftValidator),
    }),
    tables: v.object({
      unassignedEssays: v.array(unassignedEssayValidator),
      lateDeliveries: v.array(lateDeliveryValidator),
    }),
  }),
  handler: async (ctx, args) => {
    const essays = await loadEssaysForFilters(ctx, args)

    const byChannel = topN(
      essays.reduce<Array<{ label: string; value: number }>>((acc, essay) => {
        const key = essay.student_acquisition_channel ?? 'Unknown'
        const index = acc.findIndex((row) => row.label === key)
        if (index === -1) acc.push({ label: key, value: essay.revenue })
        else acc[index].value += essay.revenue
        return acc
      }, []),
      8,
    )

    const unassignedEssays = essays
      .filter((essay) => essay.item_status === 'Unassigned')
      .sort((a, b) => (b.submittedAtMs ?? 0) - (a.submittedAtMs ?? 0))
      .slice(0, 3)
      .map((essay) => ({
        item_id: essay.item_id,
        student_id: essay.student_id ?? '',
        word_count: essay.word_count,
        turnaround: essay.turnaround,
        revenue: essay.revenue,
      }))

    const lateDeliveries = essays
      .filter((essay) => typeof essay.time_remaining_hours === 'number')
      .filter((essay) => (essay.time_remaining_hours ?? 0) < 0)
      .sort(
        (a, b) => Math.abs(b.time_remaining_hours ?? 0) - Math.abs(a.time_remaining_hours ?? 0),
      )
      .slice(0, 3)
      .map((essay) => ({
        item_id: essay.item_id,
        student_id: essay.student_id ?? '',
        time_remaining_hours: essay.time_remaining_hours ?? 0,
      }))

    return {
      kpis: buildKpis(essays),
      lateCount: essays.filter((essay) => (essay.is_late ?? false) === true).length,
      series: {
        revenueOverTime: seriesByDay(essays, (essay) => essay.revenue),
        volumeOverTime: seriesByDay(essays, () => 1),
      },
      breakdowns: {
        byChannel,
      },
      ratings: {
        byDraft: averageByDraft(essays),
      },
      tables: {
        unassignedEssays,
        lateDeliveries,
      },
    }
  },
})
