import { paginationOptsValidator, paginationResultValidator } from 'convex/server'
import { v } from 'convex/values'
import { query } from './_generated/server'
import {
  breakdownValidator,
  buildKpis,
  dashboardFilterArgs,
  getSubmittedAtMs,
  groupCount,
  kpisValidator,
  lateDeliveryValidator,
  loadEssaysForFilters,
  resolveRange,
  toDraftBucket,
  unassignedEssayValidator,
} from './dashboardShared'

export const getOperationsSummary = query({
  args: dashboardFilterArgs,
  returns: v.object({
    kpis: kpisValidator,
    lateCount: v.number(),
    breakdowns: v.object({
      byStatus: v.array(breakdownValidator),
    }),
  }),
  handler: async (ctx, args) => {
    const essays = await loadEssaysForFilters(ctx, args)
    return {
      kpis: buildKpis(essays),
      lateCount: essays.filter((essay) => essay.is_late ?? false).length,
      breakdowns: {
        byStatus: groupCount(essays, (essay) => essay.item_status),
      },
    }
  },
})

export const listUnassignedEssays = query({
  args: {
    ...dashboardFilterArgs,
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(unassignedEssayValidator),
  handler: async (ctx, args) => {
    const { fromMs, toMs } = resolveRange(args.dateRange)

    const rows = await ctx.db
      .query('essays')
      .withIndex('by_status_and_submitted_at', (q) =>
        q.eq('item_status', 'Unassigned').gte('submittedAtMs', fromMs).lte('submittedAtMs', toMs),
      )
      .filter((q) => {
        let expr = q.eq(q.field('item_status'), 'Unassigned')

        if (args.turnaround && args.turnaround !== 'All') {
          expr = q.and(expr, q.eq(q.field('turnaround'), args.turnaround))
        }

        if (args.draft && args.draft !== 'All') {
          const draftBucket = args.draft === '5+' ? '5+' : String(args.draft)
          expr = q.and(expr, q.eq(q.field('draft_bucket'), draftBucket))
        }

        if (args.acquisition && args.acquisition !== 'All') {
          expr = q.and(
            expr,
            q.eq(q.field('student_acquisition_channel'), String(args.acquisition)),
          )
        }

        if (args.customerType && args.customerType !== 'All') {
          expr = q.and(expr, q.eq(q.field('student_is_multi_draft'), args.customerType === 'Multi'))
        }

        return expr
      })
      .order('desc')
      .paginate(args.paginationOpts)

    return {
      ...rows,
      page: rows.page.map((essay) => ({
        item_id: essay.item_id,
        student_id: essay.student_id ?? '',
        word_count: essay.word_count,
        turnaround: essay.turnaround,
        revenue: essay.revenue,
      })),
    }
  },
})

export const listLateDeliveries = query({
  args: {
    ...dashboardFilterArgs,
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(lateDeliveryValidator),
  handler: async (ctx, args) => {
    const { fromMs, toMs } = resolveRange(args.dateRange)

    const rows = await ctx.db
      .query('essays')
      .withIndex('by_is_late_and_submitted_at', (q) =>
        q.eq('is_late', true).gte('submittedAtMs', fromMs).lte('submittedAtMs', toMs),
      )
      .filter((q) => {
        let expr = q.eq(q.field('is_late'), true)

        if (args.turnaround && args.turnaround !== 'All') {
          expr = q.and(expr, q.eq(q.field('turnaround'), args.turnaround))
        }
        if (args.status && args.status !== 'All') {
          expr = q.and(expr, q.eq(q.field('item_status'), String(args.status)))
        }
        if (args.draft && args.draft !== 'All') {
          const draftBucket = args.draft === '5+' ? '5+' : String(args.draft)
          expr = q.and(expr, q.eq(q.field('draft_bucket'), draftBucket))
        }
        if (args.acquisition && args.acquisition !== 'All') {
          expr = q.and(
            expr,
            q.eq(q.field('student_acquisition_channel'), String(args.acquisition)),
          )
        }
        if (args.customerType && args.customerType !== 'All') {
          expr = q.and(expr, q.eq(q.field('student_is_multi_draft'), args.customerType === 'Multi'))
        }

        return expr
      })
      .order('desc')
      .paginate(args.paginationOpts)

    const page = rows.page
      .map((essay) => ({
        item_id: essay.item_id,
        student_id: essay.student_id ?? '',
        time_remaining_hours: essay.time_remaining_hours ?? 0,
        submittedAtMs: getSubmittedAtMs(essay) ?? 0,
      }))
      .sort((a, b) => {
        const severity = Math.abs(b.time_remaining_hours) - Math.abs(a.time_remaining_hours)
        if (severity !== 0) return severity
        return b.submittedAtMs - a.submittedAtMs
      })
      .map(({ submittedAtMs: _submittedAtMs, ...row }) => row)

    return {
      ...rows,
      page,
    }
  },
})

export const getOperationsPreview = query({
  args: dashboardFilterArgs,
  returns: v.object({
    unassignedEssays: v.array(unassignedEssayValidator),
    lateDeliveries: v.array(lateDeliveryValidator),
  }),
  handler: async (ctx, args) => {
    const essays = await loadEssaysForFilters(ctx, args)

    const unassignedEssays = essays
      .filter((essay) => essay.item_status === 'Unassigned')
      .sort((a, b) => (getSubmittedAtMs(b) ?? 0) - (getSubmittedAtMs(a) ?? 0))
      .slice(0, 3)
      .map((essay) => ({
        item_id: essay.item_id,
        student_id: essay.student_id ?? '',
        word_count: essay.word_count,
        turnaround: essay.turnaround,
        revenue: essay.revenue,
      }))

    const lateDeliveries = essays
      .filter((essay) => {
        const isLate = essay.is_late ?? (essay.time_remaining_hours ?? 0) < 0
        if (!isLate) return false
        if (args.draft && args.draft !== 'All') {
          const draftBucket = args.draft === '5+' ? '5+' : String(args.draft)
          return toDraftBucket(essay.draft) === draftBucket
        }
        return true
      })
      .sort((a, b) => Math.abs(b.time_remaining_hours ?? 0) - Math.abs(a.time_remaining_hours ?? 0))
      .slice(0, 3)
      .map((essay) => ({
        item_id: essay.item_id,
        student_id: essay.student_id ?? '',
        time_remaining_hours: essay.time_remaining_hours ?? 0,
      }))

    return { unassignedEssays, lateDeliveries }
  },
})
