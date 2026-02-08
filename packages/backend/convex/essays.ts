import { mutation } from './_generated/server'
import { v } from 'convex/values'

export const backfillSatisfaction = mutation({
  args: {
    rows: v.array(
      v.object({
        item_id: v.string(),
        satisfaction_rating: v.union(v.string(), v.null()),
      }),
    ),
  },
  returns: v.object({
    updated: v.number(),
    missing: v.number(),
    skipped: v.number(),
  }),
  handler: async (ctx, args) => {
    let updated = 0
    let missing = 0
    let skipped = 0

    for (const row of args.rows) {
      const existing = await ctx.db
        .query('essays')
        .withIndex('by_item_id', (q) => q.eq('item_id', row.item_id))
        .first()

      if (!existing) {
        missing++
        continue
      }

      if (existing.satisfaction_rating === row.satisfaction_rating) {
        skipped++
        continue
      }

      await ctx.db.patch(existing._id, {
        satisfaction_rating: row.satisfaction_rating ?? undefined,
      })
      updated++
    }

    return { updated, missing, skipped }
  },
})

