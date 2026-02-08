import { v } from 'convex/values'
import { internalMutation } from './_generated/server'
import { internal } from './_generated/api'

const BATCH_SIZE = 200

export const backfillEssaySubmittedAtMs = internalMutation({
  args: { cursor: v.optional(v.string()) },
  returns: v.object({ processed: v.number(), hasMore: v.boolean() }),
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query('essays')
      .paginate({ numItems: BATCH_SIZE, cursor: args.cursor ?? null })

    let processed = 0

    for (const essay of result.page) {
      const submittedAtMs = parseSubmittedAtMs(essay.submitted_at)
      if (submittedAtMs === null) continue

      if (essay.submittedAtMs !== submittedAtMs) {
        await ctx.db.patch(essay._id, { submittedAtMs })
        processed += 1
      }
    }

    if (!result.isDone) {
      await ctx.scheduler.runAfter(0, internal.migrations.backfillEssaySubmittedAtMs, {
        cursor: result.continueCursor,
      })
    }

    return { processed, hasMore: !result.isDone }
  },
})

export const backfillEssayRequestStatusGroup = internalMutation({
  args: { cursor: v.optional(v.string()) },
  returns: v.object({ processed: v.number(), hasMore: v.boolean() }),
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query('essayRequests')
      .paginate({ numItems: BATCH_SIZE, cursor: args.cursor ?? null })

    let processed = 0

    for (const request of result.page) {
      const desired = deriveStatusGroup(request.status)
      if (request.statusGroup !== desired) {
        await ctx.db.patch(request._id, { statusGroup: desired })
        processed += 1
      }
    }

    if (!result.isDone) {
      await ctx.scheduler.runAfter(0, internal.migrations.backfillEssayRequestStatusGroup, {
        cursor: result.continueCursor,
      })
    }

    return { processed, hasMore: !result.isDone }
  },
})

export const backfillEssayDashboardDimensions = internalMutation({
  args: { cursor: v.optional(v.string()) },
  returns: v.object({ processed: v.number(), hasMore: v.boolean() }),
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query('essays')
      .paginate({ numItems: BATCH_SIZE, cursor: args.cursor ?? null })

    let processed = 0

    for (const essay of result.page) {
      const student = essay.student_id
        ? await ctx.db
            .query('students')
            .withIndex('by_student_id', (q) => q.eq('student_id', essay.student_id))
            .first()
        : null

      const draft_bucket = essay.draft >= 5 ? '5+' : String(essay.draft)
      const is_late =
        typeof essay.time_remaining_hours === 'number'
          ? essay.time_remaining_hours < 0
          : false

      const patch = {
        draft_bucket,
        is_late,
        student_acquisition_channel: student?.acquisition_channel,
        student_is_multi_draft: student?.is_multi_draft,
        student_location: student?.location,
      }

      const unchanged =
        essay.draft_bucket === patch.draft_bucket &&
        essay.is_late === patch.is_late &&
        essay.student_acquisition_channel === patch.student_acquisition_channel &&
        essay.student_is_multi_draft === patch.student_is_multi_draft &&
        essay.student_location === patch.student_location

      if (unchanged) continue

      await ctx.db.patch(essay._id, patch)
      processed += 1
    }

    if (!result.isDone) {
      await ctx.scheduler.runAfter(0, internal.migrations.backfillEssayDashboardDimensions, {
        cursor: result.continueCursor,
      })
    }

    return { processed, hasMore: !result.isDone }
  },
})

function parseSubmittedAtMs(value: string) {
  const normalized = value.includes('T') ? value : value.replace(' ', 'T')
  const ms = Date.parse(normalized)
  return Number.isNaN(ms) ? null : ms
}

function deriveStatusGroup(status: string) {
  return status === 'submitted' || status === 'in_progress' ? 'current' : 'previous'
}
