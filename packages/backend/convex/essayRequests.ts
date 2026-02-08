import { ConvexError, v } from 'convex/values'
import { paginationOptsValidator, paginationResultValidator } from 'convex/server'
import { internalMutation, mutation, query } from './_generated/server'
import type { Doc } from './_generated/dataModel'

const turnaroundValidator = v.union(
  v.literal('standard'),
  v.literal('express'),
  v.literal('urgent'),
)

const statusValidator = v.union(
  v.literal('submitted'),
  v.literal('in_progress'),
  v.literal('completed'),
  v.literal('cancelled'),
)

type EssayScore = 5 | 6 | 7 | 8 | 9
const SCORE_VALUES: EssayScore[] = [5, 6, 7, 8, 9]

const essayRequestValidator = v.object({
  _id: v.id('essayRequests'),
  _creationTime: v.number(),
  studentName: v.string(),
  studentEmail: v.string(),
  applicationType: v.string(),
  programPrompt: v.string(),
  originalContent: v.any(),
  editedContent: v.optional(v.any()),
  wordCount: v.number(),
  turnaround: turnaroundValidator,
  turnaroundLabel: v.string(),
  pricePerWord: v.number(),
  estimatedDeliveryAt: v.number(),
  comments: v.optional(v.string()),
  status: statusValidator,
  statusGroup: v.optional(v.union(v.literal('current'), v.literal('previous'))),
  currentScore: v.optional(v.number()),
  potentialScore: v.optional(v.number()),
  revisionNumber: v.number(),
  parentRequestId: v.optional(v.id('essayRequests')),
  createdAt: v.number(),
  updatedAt: v.number(),
  completedAt: v.optional(v.number()),
  viewTokenHash: v.optional(v.string()),
  viewTokenCreatedAt: v.optional(v.number()),
  viewTokenExpiresAt: v.optional(v.number()),
})

const essayRequestPublicValidator = v.object({
  _id: v.id('essayRequests'),
  _creationTime: v.number(),
  studentName: v.string(),
  studentEmail: v.string(),
  applicationType: v.string(),
  programPrompt: v.string(),
  originalContent: v.any(),
  editedContent: v.optional(v.any()),
  wordCount: v.number(),
  turnaround: turnaroundValidator,
  turnaroundLabel: v.string(),
  pricePerWord: v.number(),
  estimatedDeliveryAt: v.number(),
  comments: v.optional(v.string()),
  status: statusValidator,
  statusGroup: v.optional(v.union(v.literal('current'), v.literal('previous'))),
  currentScore: v.optional(v.number()),
  potentialScore: v.optional(v.number()),
  revisionNumber: v.number(),
  parentRequestId: v.optional(v.id('essayRequests')),
  createdAt: v.number(),
  updatedAt: v.number(),
  completedAt: v.optional(v.number()),
})

const essayRequestSummaryValidator = v.object({
  _id: v.id('essayRequests'),
  _creationTime: v.number(),
  studentName: v.string(),
  studentEmail: v.string(),
  applicationType: v.string(),
  programPrompt: v.string(),
  wordCount: v.number(),
  turnaround: turnaroundValidator,
  turnaroundLabel: v.string(),
  estimatedDeliveryAt: v.number(),
  status: statusValidator,
  currentScore: v.optional(v.number()),
  potentialScore: v.optional(v.number()),
  revisionNumber: v.number(),
  parentRequestId: v.optional(v.id('essayRequests')),
  createdAt: v.number(),
  completedAt: v.optional(v.number()),
})

const filterValidator = v.object({
  status: v.optional(statusValidator),
  turnaround: v.optional(turnaroundValidator),
  search: v.optional(v.string()),
  from: v.optional(v.number()),
  to: v.optional(v.number()),
})

export const getEssayRequest = query({
  args: { id: v.id('essayRequests') },
  returns: v.union(essayRequestValidator, v.null()),
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.id)
    return request ?? null
  },
})

export const getEssayRequestPublic = query({
  args: { id: v.id('essayRequests'), token: v.string() },
  returns: v.union(essayRequestPublicValidator, v.null()),
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.id)
    if (!request) return null

    if (!request.viewTokenHash) {
      throw new ConvexError('This essay is not ready yet.')
    }

    const tokenHash = await hashToken(args.token)
    if (tokenHash !== request.viewTokenHash) {
      throw new ConvexError('Invalid token. Please check your email.')
    }

    return stripPrivateFields(request)
  },
})

export const listEssayRequests = query({
  args: {
    statusGroup: v.union(v.literal('current'), v.literal('previous')),
    filters: filterValidator,
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(essayRequestSummaryValidator),
  handler: async (ctx, args) => {
    const { statusGroup, filters } = args
    const baseQuery = ctx.db.query('essayRequests').withIndex(
      'by_status_group_and_created',
      (q) => {
        const base = q.eq('statusGroup', statusGroup)
        if (filters.from !== undefined && filters.to !== undefined) {
          return base.gte('createdAt', filters.from).lte('createdAt', filters.to)
        }
        if (filters.from !== undefined) {
          return base.gte('createdAt', filters.from)
        }
        if (filters.to !== undefined) {
          return base.lte('createdAt', filters.to)
        }
        return base
      },
    )

    const statusFiltered = filters.status
      ? baseQuery.filter((q) => q.eq(q.field('status'), filters.status))
      : baseQuery

    const finalQuery = filters.turnaround
      ? statusFiltered.filter((q) => q.eq(q.field('turnaround'), filters.turnaround))
      : statusFiltered

    const result = await finalQuery.order('desc').paginate(args.paginationOpts)

    const filteredPage =
      filters.search?.trim().length
        ? result.page.filter((request) => {
            const needle = filters.search?.toLowerCase().trim()
            if (!needle) return true
            const haystack = `${request.studentName} ${request.studentEmail}`.toLowerCase()
            return haystack.includes(needle)
          })
        : result.page

    return {
      ...result,
      page: filteredPage.map(toSummary),
    }
  },
})

export const getEssayRequestStats = query({
  args: {},
  returns: v.object({
    currentTotal: v.number(),
    dueSoon: v.number(),
    completedLast7Days: v.number(),
  }),
  handler: async (ctx) => {
    const now = Date.now()
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000
    const dueSoonWindow = now + 24 * 60 * 60 * 1000

    const currentSubmitted = await ctx.db
      .query('essayRequests')
      .withIndex('by_status', (q) => q.eq('status', 'submitted'))
      .collect()
    const currentInProgress = await ctx.db
      .query('essayRequests')
      .withIndex('by_status', (q) => q.eq('status', 'in_progress'))
      .collect()

    const dueSoonSubmitted = await ctx.db
      .query('essayRequests')
      .withIndex('by_status_and_due', (q) =>
        q.eq('status', 'submitted').lte('estimatedDeliveryAt', dueSoonWindow),
      )
      .collect()
    const dueSoonInProgress = await ctx.db
      .query('essayRequests')
      .withIndex('by_status_and_due', (q) =>
        q.eq('status', 'in_progress').lte('estimatedDeliveryAt', dueSoonWindow),
      )
      .collect()

    const completedLast7Days = await ctx.db
      .query('essayRequests')
      .withIndex('by_status_and_completed', (q) =>
        q.eq('status', 'completed').gte('completedAt', sevenDaysAgo),
      )
      .collect()

    return {
      currentTotal: currentSubmitted.length + currentInProgress.length,
      dueSoon: dueSoonSubmitted.length + dueSoonInProgress.length,
      completedLast7Days: completedLast7Days.length,
    }
  },
})

export const createEssayRequest = mutation({
  args: {
    studentName: v.string(),
    studentEmail: v.string(),
    applicationType: v.string(),
    programPrompt: v.string(),
    originalContent: v.any(),
    wordCount: v.number(),
    turnaround: turnaroundValidator,
    turnaroundLabel: v.string(),
    pricePerWord: v.number(),
    estimatedDeliveryAt: v.number(),
    comments: v.optional(v.string()),
  },
  returns: v.id('essayRequests'),
  handler: async (ctx, args) => {
    const now = Date.now()
    return await ctx.db.insert('essayRequests', {
      studentName: args.studentName,
      studentEmail: args.studentEmail,
      applicationType: args.applicationType,
      programPrompt: args.programPrompt,
      originalContent: args.originalContent,
      wordCount: args.wordCount,
      turnaround: args.turnaround,
      turnaroundLabel: args.turnaroundLabel,
      pricePerWord: args.pricePerWord,
      estimatedDeliveryAt: args.estimatedDeliveryAt,
      comments: args.comments,
      status: 'submitted',
      statusGroup: 'current',
      revisionNumber: 1,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const updateEditedContent = mutation({
  args: {
    id: v.id('essayRequests'),
    editedContent: v.any(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.id)
    if (!request) {
      throw new ConvexError('Request not found.')
    }

    const nextStatus = request.status === 'submitted' ? 'in_progress' : request.status
    await ctx.db.patch(args.id, {
      editedContent: args.editedContent,
      updatedAt: Date.now(),
      status: nextStatus,
      statusGroup: deriveStatusGroup(nextStatus),
    })

    return null
  },
})

export const saveDraft = mutation({
  args: {
    id: v.id('essayRequests'),
    editedContent: v.any(),
    currentScore: v.optional(v.number()),
    potentialScore: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    validateScore(args.currentScore)
    validateScore(args.potentialScore)

    const request = await ctx.db.get(args.id)
    if (!request) {
      throw new ConvexError('Request not found.')
    }

    const nextStatus = request.status === 'submitted' ? 'in_progress' : request.status
    await ctx.db.patch(args.id, {
      editedContent: args.editedContent,
      currentScore: args.currentScore,
      potentialScore: args.potentialScore,
      updatedAt: Date.now(),
      status: nextStatus,
      statusGroup: deriveStatusGroup(nextStatus),
    })

    return null
  },
})

export const setScores = mutation({
  args: {
    id: v.id('essayRequests'),
    currentScore: v.optional(v.number()),
    potentialScore: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    validateScore(args.currentScore)
    validateScore(args.potentialScore)

    await ctx.db.patch(args.id, {
      currentScore: args.currentScore,
      potentialScore: args.potentialScore,
      updatedAt: Date.now(),
    })
    return null
  },
})

export const requestRevision = mutation({
  args: {
    id: v.id('essayRequests'),
    editedContent: v.optional(v.any()),
  },
  returns: v.id('essayRequests'),
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.id)
    if (!request) {
      throw new ConvexError('Request not found.')
    }

    const parentRequestId = request.parentRequestId ?? request._id
    const latestRevision = await ctx.db
      .query('essayRequests')
      .withIndex('by_parent', (q) => q.eq('parentRequestId', parentRequestId))
      .order('desc')
      .first()

    const baseRevision = latestRevision?.revisionNumber ?? request.revisionNumber
    const now = Date.now()
    const originalContent =
      args.editedContent ?? request.editedContent ?? request.originalContent

    return await ctx.db.insert('essayRequests', {
      studentName: request.studentName,
      studentEmail: request.studentEmail,
      applicationType: request.applicationType,
      programPrompt: request.programPrompt,
      originalContent,
      wordCount: request.wordCount,
      turnaround: request.turnaround,
      turnaroundLabel: request.turnaroundLabel,
      pricePerWord: request.pricePerWord,
      estimatedDeliveryAt: request.estimatedDeliveryAt,
      comments: request.comments,
      status: 'submitted',
      statusGroup: 'current',
      revisionNumber: baseRevision + 1,
      parentRequestId,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const completeEssay = internalMutation({
  args: {
    id: v.id('essayRequests'),
    editedContent: v.any(),
    currentScore: v.optional(v.number()),
    potentialScore: v.optional(v.number()),
    tokenHash: v.string(),
    tokenCreatedAt: v.number(),
  },
  returns: essayRequestValidator,
  handler: async (ctx, args) => {
    validateScore(args.currentScore)
    validateScore(args.potentialScore)

    const request = await ctx.db.get(args.id)
    if (!request) {
      throw new ConvexError('Request not found.')
    }

    await ctx.db.patch(args.id, {
      editedContent: args.editedContent,
      currentScore: args.currentScore,
      potentialScore: args.potentialScore,
      status: 'completed',
      statusGroup: 'previous',
      completedAt: Date.now(),
      viewTokenHash: args.tokenHash,
      viewTokenCreatedAt: args.tokenCreatedAt,
      updatedAt: Date.now(),
    })

    return (await ctx.db.get(args.id)) as Doc<'essayRequests'>
  },
})

function deriveStatusGroup(status: Doc<'essayRequests'>['status']) {
  return status === 'submitted' || status === 'in_progress' ? 'current' : 'previous'
}

function stripPrivateFields(request: Doc<'essayRequests'>) {
  const {
    viewTokenHash: _viewTokenHash,
    viewTokenCreatedAt: _viewTokenCreatedAt,
    viewTokenExpiresAt: _viewTokenExpiresAt,
    ...rest
  } = request
  return rest
}

function validateScore(score: number | undefined) {
  if (score === undefined) return
  if (!SCORE_VALUES.includes(score as EssayScore)) {
    throw new ConvexError('Score must be between 5 and 9.')
  }
}

async function hashToken(token: string) {
  const data = new TextEncoder().encode(token)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(digest))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

function toSummary(request: Doc<'essayRequests'>) {
  return {
    _id: request._id,
    _creationTime: request._creationTime,
    studentName: request.studentName,
    studentEmail: request.studentEmail,
    applicationType: request.applicationType,
    programPrompt: request.programPrompt,
    wordCount: request.wordCount,
    turnaround: request.turnaround,
    turnaroundLabel: request.turnaroundLabel,
    estimatedDeliveryAt: request.estimatedDeliveryAt,
    status: request.status,
    currentScore: request.currentScore,
    potentialScore: request.potentialScore,
    revisionNumber: request.revisionNumber,
    parentRequestId: request.parentRequestId,
    createdAt: request.createdAt,
    completedAt: request.completedAt,
  }
}
