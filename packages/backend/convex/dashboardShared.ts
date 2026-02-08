import type { QueryCtx } from './_generated/server'
import type { Doc } from './_generated/dataModel'
import { v } from 'convex/values'

export const dashboardFilterArgs = {
  dateRange: v.object({
    preset: v.union(
      v.literal('7d'),
      v.literal('30d'),
      v.literal('90d'),
      v.literal('ytd'),
      v.literal('custom'),
    ),
    from: v.optional(v.string()),
    to: v.optional(v.string()),
  }),
  turnaround: v.optional(v.string()),
  status: v.optional(v.string()),
  acquisition: v.optional(v.string()),
  draft: v.optional(v.union(v.string(), v.number())),
  customerType: v.optional(v.string()),
}

export const dashboardFilterValidator = v.object(dashboardFilterArgs)

export type DashboardFilters = {
  dateRange: {
    preset: '7d' | '30d' | '90d' | 'ytd' | 'custom'
    from?: string
    to?: string
  }
  turnaround?: string
  status?: string
  acquisition?: string
  draft?: string | number
  customerType?: string
}

export const seriesPointValidator = v.object({
  date: v.string(),
  value: v.number(),
})

export const kpisValidator = v.object({
  totalRevenue: v.number(),
  activeCustomers: v.number(),
  multiDraftRate: v.number(),
  avgRating: v.number(),
  ePlusRate: v.number(),
  onTimeRate: v.number(),
  unassignedCount: v.number(),
  lostRevenue: v.number(),
})

export const breakdownValidator = v.object({
  label: v.string(),
  value: v.number(),
})

export const ratingByDraftValidator = v.object({
  draft: v.number(),
  avgRating: v.number(),
})

export const satisfactionByDraftValidator = v.object({
  draft: v.number(),
  ePlus: v.number(),
  e: v.number(),
  eMinus: v.number(),
})

export const channelPerformanceValidator = v.object({
  channel: v.string(),
  customers: v.number(),
  revenue: v.number(),
  multiDraftRate: v.number(),
  avgLtv: v.number(),
})

export const unassignedEssayValidator = v.object({
  item_id: v.string(),
  student_id: v.string(),
  word_count: v.number(),
  turnaround: v.string(),
  revenue: v.number(),
})

export const lateDeliveryValidator = v.object({
  item_id: v.string(),
  student_id: v.string(),
  time_remaining_hours: v.number(),
})

export function resolveRange(range: DashboardFilters['dateRange']) {
  const now = Date.now()
  if (range.preset === 'custom' && range.from && range.to) {
    return {
      fromMs: Date.parse(range.from),
      toMs: Date.parse(range.to),
    }
  }
  if (range.preset === 'ytd') {
    const start = new Date(new Date().getFullYear(), 0, 1).getTime()
    return { fromMs: start, toMs: now }
  }

  const days =
    range.preset === '7d' ? 7 : range.preset === '30d' ? 30 : 90

  return { fromMs: now - days * 24 * 60 * 60 * 1000, toMs: now }
}

export function parseSubmittedAt(value: string) {
  const normalized = value.includes('T') ? value : value.replace(' ', 'T')
  const ms = Date.parse(normalized)
  return Number.isNaN(ms) ? null : ms
}

export function getSubmittedAtMs(essay: Doc<'essays'>) {
  if (typeof essay.submittedAtMs === 'number') return essay.submittedAtMs
  return parseSubmittedAt(essay.submitted_at)
}

function isFilterValueSet(value: string | number | undefined) {
  if (value === undefined) return false
  return value !== 'All'
}

export function toDraftBucket(draft: number) {
  if (draft >= 5) return '5+'
  return String(draft)
}

export function toLateFlag(essay: Doc<'essays'>) {
  return typeof essay.time_remaining_hours === 'number'
    ? essay.time_remaining_hours < 0
    : false
}

function toDraftFilterBucket(value: DashboardFilters['draft']) {
  if (!isFilterValueSet(value)) return undefined
  if (typeof value === 'number') {
    if (value >= 5) return '5+'
    return String(value)
  }
  if (value === '5+') return '5+'
  if (value === 'All') return undefined
  return value
}

export function matchesResidualFilters(essay: Doc<'essays'>, args: DashboardFilters) {
  if (isFilterValueSet(args.draft)) {
    const wantedBucket = toDraftFilterBucket(args.draft)
    if (wantedBucket && toDraftBucket(essay.draft) !== wantedBucket) return false
  }

  if (isFilterValueSet(args.acquisition)) {
    if ((essay.student_acquisition_channel ?? 'Unknown') !== args.acquisition) return false
  }

  if (isFilterValueSet(args.customerType)) {
    const wantsMulti = args.customerType === 'Multi'
    if ((essay.student_is_multi_draft ?? false) !== wantsMulti) return false
  }

  return true
}

function buildEssayQuery(
  ctx: QueryCtx,
  args: DashboardFilters,
  fromMs: number,
  toMs: number,
) {
  const hasStatus = isFilterValueSet(args.status)
  const hasTurnaround = isFilterValueSet(args.turnaround)
  const hasDraft = isFilterValueSet(args.draft)
  const hasAcquisition = isFilterValueSet(args.acquisition)
  const hasCustomerType = isFilterValueSet(args.customerType)

  if (hasStatus && hasTurnaround) {
    return ctx.db
      .query('essays')
      .withIndex('by_status_turnaround_and_submitted_at', (q) =>
        q
          .eq('item_status', String(args.status))
          .eq('turnaround', String(args.turnaround))
          .gte('submittedAtMs', fromMs)
          .lte('submittedAtMs', toMs),
      )
  }

  if (hasStatus) {
    return ctx.db
      .query('essays')
      .withIndex('by_status_and_submitted_at', (q) =>
        q
          .eq('item_status', String(args.status))
          .gte('submittedAtMs', fromMs)
          .lte('submittedAtMs', toMs),
      )
  }

  if (hasTurnaround) {
    return ctx.db
      .query('essays')
      .withIndex('by_turnaround_and_submitted_at', (q) =>
        q
          .eq('turnaround', String(args.turnaround))
          .gte('submittedAtMs', fromMs)
          .lte('submittedAtMs', toMs),
      )
  }

  if (hasDraft) {
    const draftBucket = toDraftFilterBucket(args.draft)
    if (draftBucket) {
      return ctx.db
        .query('essays')
        .withIndex('by_draft_bucket_and_submitted_at', (q) =>
          q
            .eq('draft_bucket', draftBucket)
            .gte('submittedAtMs', fromMs)
            .lte('submittedAtMs', toMs),
        )
    }
  }

  if (hasAcquisition) {
    return ctx.db
      .query('essays')
      .withIndex('by_student_channel_and_submitted_at', (q) =>
        q
          .eq('student_acquisition_channel', String(args.acquisition))
          .gte('submittedAtMs', fromMs)
          .lte('submittedAtMs', toMs),
      )
  }

  if (hasCustomerType) {
    return ctx.db
      .query('essays')
      .withIndex('by_student_type_and_submitted_at', (q) =>
        q
          .eq('student_is_multi_draft', args.customerType === 'Multi')
          .gte('submittedAtMs', fromMs)
          .lte('submittedAtMs', toMs),
      )
  }

  return ctx.db
    .query('essays')
    .withIndex('by_submitted_at', (q) => q.gte('submittedAtMs', fromMs).lte('submittedAtMs', toMs))
}

export async function loadEssaysForFilters(ctx: QueryCtx, args: DashboardFilters) {
  const { fromMs, toMs } = resolveRange(args.dateRange)
  const rows = await buildEssayQuery(ctx, args, fromMs, toMs).collect()
  return rows.filter((essay) => matchesResidualFilters(essay, args))
}

export function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0)
}

export function average(values: number[]) {
  if (values.length === 0) return 0
  return sum(values) / values.length
}

export function percent(numerator: number, denominator: number) {
  if (!denominator) return 0
  return (numerator / denominator) * 100
}

export function groupCount<T>(items: T[], getKey: (item: T) => string) {
  const tally = new Map<string, number>()
  for (const item of items) {
    const key = getKey(item)
    tally.set(key, (tally.get(key) ?? 0) + 1)
  }
  return Array.from(tally.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
}

export function groupSum<T>(
  items: T[],
  getKey: (item: T) => string,
  getValue: (item: T) => number,
) {
  const tally = new Map<string, number>()
  for (const item of items) {
    const key = getKey(item)
    tally.set(key, (tally.get(key) ?? 0) + getValue(item))
  }
  return Array.from(tally.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
}

export function seriesByDay(
  essays: Doc<'essays'>[],
  metric: (essay: Doc<'essays'>) => number,
) {
  const bucket = new Map<string, number>()
  for (const essay of essays) {
    const ms = getSubmittedAtMs(essay)
    if (ms === null) continue
    const key = new Date(ms).toISOString().slice(0, 10)
    bucket.set(key, (bucket.get(key) ?? 0) + metric(essay))
  }
  return Array.from(bucket.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }))
}

export function averageByDraft(essays: Doc<'essays'>[]) {
  const bucket = new Map<number, number[]>()
  for (const essay of essays) {
    if (essay.essay_rating_numeric === undefined) continue
    const list = bucket.get(essay.draft) ?? []
    list.push(essay.essay_rating_numeric)
    bucket.set(essay.draft, list)
  }
  return Array.from(bucket.entries())
    .sort(([a], [b]) => a - b)
    .map(([draft, ratings]) => ({
      draft,
      avgRating: average(ratings),
    }))
}

export function satisfactionBreakdownByDraft(essays: Doc<'essays'>[]) {
  const bucket = new Map<number, { ePlus: number; e: number; eMinus: number }>()
  for (const essay of essays) {
    const entry = bucket.get(essay.draft) ?? { ePlus: 0, e: 0, eMinus: 0 }
    if (essay.satisfaction_rating === 'E+') entry.ePlus += 1
    else if (essay.satisfaction_rating === 'E') entry.e += 1
    else if (essay.satisfaction_rating === 'E-') entry.eMinus += 1
    bucket.set(essay.draft, entry)
  }
  return Array.from(bucket.entries())
    .sort(([a], [b]) => a - b)
    .map(([draft, entry]) => ({ draft, ...entry }))
}

type StudentRollup = {
  id: string
  acquisition: string
  location: string
  isMultiDraft: boolean
  revenue: number
}

export function rollupStudents(essays: Doc<'essays'>[]) {
  const students = new Map<string, StudentRollup>()
  for (const essay of essays) {
    if (!essay.student_id) continue
    const current = students.get(essay.student_id) ?? {
      id: essay.student_id,
      acquisition: essay.student_acquisition_channel ?? 'Unknown',
      location: essay.student_location ?? 'Unknown',
      isMultiDraft: essay.student_is_multi_draft ?? false,
      revenue: 0,
    }

    current.revenue += essay.revenue
    if (essay.student_acquisition_channel) current.acquisition = essay.student_acquisition_channel
    if (essay.student_location) current.location = essay.student_location
    if (essay.student_is_multi_draft !== undefined) {
      current.isMultiDraft = essay.student_is_multi_draft
    }

    students.set(essay.student_id, current)
  }
  return Array.from(students.values())
}

export function buildKpis(essays: Doc<'essays'>[]) {
  const students = rollupStudents(essays)
  const activeCustomers = new Set(
    essays
      .filter((essay) => essay.item_status !== 'Cancelled')
      .map((essay) => essay.student_id)
      .filter(Boolean),
  )

  const completed = essays.filter((essay) => essay.is_completed)
  const withTimeRemaining = essays.filter(
    (essay) => typeof essay.time_remaining_hours === 'number',
  )
  const allUnassigned = essays.filter((essay) => essay.item_status === 'Unassigned')

  return {
    totalRevenue: sum(essays.map((essay) => essay.revenue)),
    activeCustomers: activeCustomers.size,
    multiDraftRate: percent(
      students.filter((student) => student.isMultiDraft).length,
      students.length,
    ),
    avgRating: average(
      completed
        .map((essay) => essay.essay_rating_numeric)
        .filter((rating): rating is number => typeof rating === 'number'),
    ),
    ePlusRate: percent(
      completed.filter((essay) => essay.satisfaction_rating === 'E+').length,
      completed.length,
    ),
    onTimeRate: percent(
      withTimeRemaining.filter((essay) => (essay.time_remaining_hours ?? 0) > 0).length,
      withTimeRemaining.length,
    ),
    unassignedCount: allUnassigned.length,
    lostRevenue: sum(allUnassigned.map((essay) => essay.revenue)),
  }
}

export function buildChannelPerformance(essays: Doc<'essays'>[]) {
  const students = rollupStudents(essays)
  const bucket = new Map<string, { customers: number; revenue: number; multiDraft: number }>()
  for (const student of students) {
    const key = student.acquisition || 'Unknown'
    const entry = bucket.get(key) ?? { customers: 0, revenue: 0, multiDraft: 0 }
    entry.customers += 1
    entry.revenue += student.revenue
    if (student.isMultiDraft) entry.multiDraft += 1
    bucket.set(key, entry)
  }

  return Array.from(bucket.entries())
    .map(([channel, entry]) => ({
      channel,
      customers: entry.customers,
      revenue: entry.revenue,
      multiDraftRate: percent(entry.multiDraft, entry.customers),
      avgLtv: entry.customers ? entry.revenue / entry.customers : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

export function topN(items: { label: string; value: number }[], count: number) {
  return [...items].sort((a, b) => b.value - a.value).slice(0, count)
}
