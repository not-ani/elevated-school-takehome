import { v } from 'convex/values'
import { paginationOptsValidator, paginationResultValidator } from 'convex/server'
import { query, mutation } from './_generated/server'

const threadValidator = v.object({
  _id: v.id('threads'),
  _creationTime: v.number(),
  title: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
  lastMessageAt: v.number(),
})

export const list = query({
  args: {},
  handler: async (ctx) => {
    const threads = await ctx.db
      .query('threads')
      .withIndex('by_updatedAt')
      .order('desc')
      .collect()
    return threads
  },
})

export const listPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(threadValidator),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('threads')
      .withIndex('by_updatedAt')
      .order('desc')
      .paginate(args.paginationOpts)
  },
})

export const create = mutation({
  args: {
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const threadId = await ctx.db.insert('threads', {
      title: args.title,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
    })
    return threadId
  },
})

export const touch = mutation({
  args: {
    threadId: v.id('threads'),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    await ctx.db.patch(args.threadId, {
      updatedAt: now,
      lastMessageAt: now,
    })
  },
})

export const get = query({
  args: {
    threadId: v.id('threads'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.threadId)
  },
})

export const updateTitle = mutation({
  args: {
    threadId: v.id('threads'),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.threadId, {
      title: args.title,
      updatedAt: Date.now(),
    })
  },
})

export const remove = mutation({
  args: {
    threadId: v.id('threads'),
  },
  handler: async (ctx, args) => {
    // Delete all messages in the thread
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_thread_createdAt', (q) => q.eq('threadId', args.threadId))
      .collect()

    for (const message of messages) {
      await ctx.db.delete(message._id)
    }

    // Delete the thread
    await ctx.db.delete(args.threadId)
  },
})
