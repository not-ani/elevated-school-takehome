import { v } from 'convex/values'
import { paginationOptsValidator, paginationResultValidator } from 'convex/server'
import { query, mutation } from './_generated/server'

const messageValidator = v.object({
  _id: v.id('messages'),
  _creationTime: v.number(),
  threadId: v.id('threads'),
  role: v.union(v.literal('user'), v.literal('assistant')),
  content: v.string(),
  createdAt: v.number(),
  metadata: v.optional(v.any()),
})

export const listByThread = query({
  args: {
    threadId: v.id('threads'),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_thread_createdAt', (q) => q.eq('threadId', args.threadId))
      .order('asc')
      .collect()
    return messages
  },
})

export const listByThreadPaginated = query({
  args: {
    threadId: v.id('threads'),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(messageValidator),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('messages')
      .withIndex('by_thread_createdAt', (q) => q.eq('threadId', args.threadId))
      .order('desc')
      .paginate(args.paginationOpts)
  },
})

export const create = mutation({
  args: {
    threadId: v.id('threads'),
    role: v.union(v.literal('user'), v.literal('assistant')),
    content: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const messageId = await ctx.db.insert('messages', {
      threadId: args.threadId,
      role: args.role,
      content: args.content,
      createdAt: now,
      metadata: args.metadata,
    })

    // Update thread's lastMessageAt
    await ctx.db.patch(args.threadId, {
      updatedAt: now,
      lastMessageAt: now,
    })

    return messageId
  },
})

export const get = query({
  args: {
    messageId: v.id('messages'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.messageId)
  },
})
