import { query, type QueryCtx } from './_generated/server'
import { v } from 'convex/values'
import type { Doc } from './_generated/dataModel'

const dateRangeValidator = v.object({
  preset: v.union(
    v.literal('7d'),
    v.literal('30d'),
    v.literal('90d'),
    v.literal('ytd'),
    v.literal('custom'),
  ),
  from: v.optional(v.string()),
  to: v.optional(v.string()),
})

const filterValidator = v.object({
  dateRange: dateRangeValidator,
  turnaround: v.optional(v.string()),
  status: v.optional(v.string()),
  acquisition: v.optional(v.string()),
  draft: v.optional(v.union(v.string(), v.number())),
  customerType: v.optional(v.string()),
})

type DashboardFilters = {
  dateRange: { preset: string; from?: string; to?: string }
  turnaround?: string
  status?: string
  acquisition?: string
  draft?: string | number
  customerType?: string
}

const seriesPointValidator = v.object({
  date: v.string(),
  value: v.number(),
})

const kpisValidator = v.object({
  totalRevenue: v.number(),
  activeCustomers: v.number(),
  multiDraftRate: v.number(),
  avgRating: v.number(),
  ePlusRate: v.number(),
  onTimeRate: v.number(),
  unassignedCount: v.number(),
  lostRevenue: v.number(),
})

const breakdownValidator = v.object({
  label: v.string(),
  value: v.number(),
})

const ratingByDraftValidator = v.object({
  draft: v.number(),
  avgRating: v.number(),
})

const satisfactionByDraftValidator = v.object({
  draft: v.number(),
  ePlus: v.number(),
  e: v.number(),
  eMinus: v.number(),
})

const channelPerformanceValidator = v.object({
  channel: v.string(),
  customers: v.number(),
  revenue: v.number(),
  multiDraftRate: v.number(),
  avgLtv: v.number(),
})

const unassignedEssayValidator = v.object({
  item_id: v.string(),
  student_id: v.string(),
  word_count: v.number(),
  turnaround: v.string(),
  revenue: v.number(),
})

const lateDeliveryValidator = v.object({
  item_id: v.string(),
  student_id: v.string(),
  time_remaining_hours: v.number(),
})

export const getDashboard = query({
  args: filterValidator,
  returns: v.object({
    kpis: kpisValidator,
    series: v.object({
      revenueOverTime: v.array(seriesPointValidator),
      volumeOverTime: v.array(seriesPointValidator),
    }),
    breakdowns: v.object({
      byTurnaround: v.array(breakdownValidator),
      byChannel: v.array(breakdownValidator),
      byStatus: v.array(breakdownValidator),
      byDraft: v.array(breakdownValidator),
      byLocation: v.array(breakdownValidator),
    }),
    ratings: v.object({
      byDraft: v.array(ratingByDraftValidator),
      satisfactionByDraft: v.array(satisfactionByDraftValidator),
    }),
    tables: v.object({
      channelPerformance: v.array(channelPerformanceValidator),
      unassignedEssays: v.array(unassignedEssayValidator),
      lateDeliveries: v.array(lateDeliveryValidator),
    }),
  }),
  handler: async (ctx, args) => {
    const { fromMs, toMs } = resolveRange(args.dateRange)
    const essays = await loadEssaysForDashboard(ctx, args, fromMs, toMs)
    const filteredEssays = essays.filter((essay) =>
      matchesEssayFilters(essay, args, fromMs, toMs),
    )

    const studentIds = new Set<string>()
    for (const essay of filteredEssays) {
      if (essay.student_id) studentIds.add(essay.student_id)
    }

    const studentById = await loadStudentsByIds(ctx, studentIds)

    const finalEssays =
      args.acquisition || args.customerType
        ? filteredEssays.filter((essay) =>
            studentMatchesFilters(essay, studentById, args),
          )
        : filteredEssays

    const filteredStudentIds = new Set<string>()
    for (const essay of finalEssays) {
      if (essay.student_id) filteredStudentIds.add(essay.student_id)
    }

    const filteredStudents = Array.from(filteredStudentIds)
      .map((id) => studentById.get(id))
      .filter((student): student is Doc<'students'> => Boolean(student))

    const activeCustomers = new Set(
      finalEssays
        .filter((essay) => essay.item_status !== 'Cancelled')
        .map((essay) => essay.student_id)
        .filter(Boolean),
    )

    const totalRevenue = sum(finalEssays.map((essay) => essay.revenue))
    const avgRating = average(
      finalEssays
        .filter((essay) => essay.is_completed)
        .map((essay) => essay.essay_rating_numeric)
        .filter((rating): rating is number => typeof rating === 'number'),
    )
    const ePlusRate =
      percent(
        finalEssays.filter(
          (essay) =>
            essay.is_completed && essay.satisfaction_rating === 'E+',
        ).length,
        finalEssays.filter((essay) => essay.is_completed).length,
      ) ?? 0

    const multiDraftRate = percent(
      filteredStudents.filter((student) => student.is_multi_draft).length,
      filteredStudents.length,
    )

    const revenueOverTime = seriesByDay(finalEssays, (e) => e.revenue)
    const volumeOverTime = seriesByDay(finalEssays, () => 1)

    const byTurnaround = groupSum(finalEssays, (e) => e.turnaround, (e) => e.revenue)
    const byStatus = groupCount(finalEssays, (e) => e.item_status)
    const byDraft = groupCount(finalEssays, (e) => `Draft ${e.draft}`)

    const byChannel = groupSum(
      finalEssays,
      (essay) => {
        const student = essay.student_id ? studentById.get(essay.student_id) : undefined
        return student?.acquisition_channel || 'Unknown'
      },
      (essay) => essay.revenue,
    )

    const byLocation = topN(
      groupSum(
        finalEssays,
        (essay) => {
          const student = essay.student_id ? studentById.get(essay.student_id) : undefined
          return student?.location || 'Unknown'
        },
        (essay) => essay.revenue,
      ),
      10,
    )

    const ratingsByDraft = averageByDraft(finalEssays)
    const satisfactionByDraft = satisfactionBreakdownByDraft(finalEssays)

    const channelPerformance = buildChannelPerformance(filteredStudents)

    const allUnassigned = finalEssays.filter((essay) => essay.item_status === 'Unassigned')

    const unassignedEssays = allUnassigned
      .slice(0, 20)
      .map((essay) => ({
        item_id: essay.item_id,
        student_id: essay.student_id ?? '',
        word_count: essay.word_count,
        turnaround: essay.turnaround,
        revenue: essay.revenue,
      }))

    const lateDeliveries = finalEssays
      .filter((essay) => typeof essay.time_remaining_hours === 'number')
      .filter((essay) => (essay.time_remaining_hours ?? 0) < 0)
      .slice(0, 20)
      .map((essay) => ({
        item_id: essay.item_id,
        student_id: essay.student_id ?? '',
        time_remaining_hours: essay.time_remaining_hours ?? 0,
      }))

    const onTimeRate = percent(
      finalEssays.filter(
        (essay) => typeof essay.time_remaining_hours === 'number' && essay.time_remaining_hours > 0,
      ).length,
      finalEssays.filter((essay) => typeof essay.time_remaining_hours === 'number').length,
    )

    const lostRevenue = sum(allUnassigned.map((essay) => essay.revenue))

    return {
      kpis: {
        totalRevenue,
        activeCustomers: activeCustomers.size,
        multiDraftRate,
        avgRating,
        ePlusRate,
        onTimeRate,
        unassignedCount: allUnassigned.length,
        lostRevenue,
      },
      series: {
        revenueOverTime,
        volumeOverTime,
      },
      breakdowns: {
        byTurnaround,
        byChannel,
        byStatus,
        byDraft,
        byLocation,
      },
      ratings: {
        byDraft: ratingsByDraft,
        satisfactionByDraft,
      },
      tables: {
        channelPerformance,
        unassignedEssays,
        lateDeliveries,
      },
    }
  },
})

function resolveRange(range: { preset: string; from?: string; to?: string }) {
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
    range.preset === '7d'
      ? 7
      : range.preset === '30d'
        ? 30
        : 90
  return { fromMs: now - days * 24 * 60 * 60 * 1000, toMs: now }
}

function parseSubmittedAt(value: string) {
  const normalized = value.includes('T') ? value : value.replace(' ', 'T')
  const ms = Date.parse(normalized)
  return Number.isNaN(ms) ? null : ms
}

function getSubmittedAtMs(essay: Doc<'essays'>) {
  if (typeof essay.submittedAtMs === 'number') return essay.submittedAtMs
  return parseSubmittedAt(essay.submitted_at)
}

function matchesEssayFilters(
  essay: Doc<'essays'>,
  args: DashboardFilters,
  fromMs: number,
  toMs: number,
) {
  const submittedMs = getSubmittedAtMs(essay)
  if (submittedMs === null) return false
  if (submittedMs < fromMs || submittedMs > toMs) return false
  if (args.turnaround && args.turnaround !== 'All') {
    if (essay.turnaround !== args.turnaround) return false
  }
  if (args.status && args.status !== 'All') {
    if (essay.item_status !== args.status) return false
  }
  if (args.draft && args.draft !== 'All') {
    if (args.draft === '5+') {
      if (essay.draft < 5) return false
    } else if (essay.draft !== Number(args.draft)) {
      return false
    }
  }
  return true
}

function studentMatchesFilters(
  essay: Doc<'essays'>,
  studentById: Map<string, Doc<'students'>>,
  args: DashboardFilters,
) {
  const student =
    essay.student_id && studentById.has(essay.student_id)
      ? studentById.get(essay.student_id)
      : undefined
  if (args.acquisition && args.acquisition !== 'All') {
    if (!student || student.acquisition_channel !== args.acquisition) {
      return false
    }
  }
  if (args.customerType && args.customerType !== 'All') {
    if (!student) return false
    const wantsMulti = args.customerType === 'Multi'
    if (student.is_multi_draft !== wantsMulti) return false
  }
  return true
}

function buildEssayQuery(
  ctx: QueryCtx,
  args: DashboardFilters,
  fromMs: number,
  toMs: number,
) {
  const hasStatus = args.status && args.status !== 'All'
  const hasTurnaround = args.turnaround && args.turnaround !== 'All'

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

  return ctx.db
    .query('essays')
    .withIndex('by_submitted_at', (q) =>
      q.gte('submittedAtMs', fromMs).lte('submittedAtMs', toMs),
    )
}

async function loadEssaysForDashboard(
  ctx: QueryCtx,
  args: DashboardFilters,
  fromMs: number,
  toMs: number,
) {
  const indexedAvailable = await ctx.db
    .query('essays')
    .withIndex('by_submitted_at', (q) => q.gte('submittedAtMs', 0))
    .take(1)

  if (indexedAvailable.length === 0) {
    return await ctx.db.query('essays').collect()
  }

  return await buildEssayQuery(ctx, args, fromMs, toMs).collect()
}

async function loadStudentsByIds(ctx: QueryCtx, studentIds: Set<string>) {
  if (studentIds.size === 0) return new Map<string, Doc<'students'>>()

  const lookups = Array.from(studentIds).map((studentId) =>
    ctx.db
      .query('students')
      .withIndex('by_student_id', (q) => q.eq('student_id', studentId))
      .first(),
  )

  const students = await Promise.all(lookups)
  const studentById = new Map<string, Doc<'students'>>()
  for (const student of students) {
    if (student?.student_id) {
      studentById.set(student.student_id, student)
    }
  }
  return studentById
}

function seriesByDay(
  essays: Doc<'essays'>[],
  metric: (essay: Doc<'essays'>) => number,
) {
  const bucket = new Map<string, number>()
  for (const essay of essays) {
    const ms = getSubmittedAtMs(essay)
    if (ms === null) continue
    const date = new Date(ms)
    const key = date.toISOString().slice(0, 10)
    bucket.set(key, (bucket.get(key) ?? 0) + metric(essay))
  }
  return Array.from(bucket.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }))
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0)
}

function average(values: number[]) {
  if (values.length === 0) return 0
  return sum(values) / values.length
}

function percent(numerator: number, denominator: number) {
  if (!denominator) return 0
  return (numerator / denominator) * 100
}

function groupCount<T>(items: T[], getKey: (item: T) => string) {
  const tally = new Map<string, number>()
  for (const item of items) {
    const key = getKey(item)
    tally.set(key, (tally.get(key) ?? 0) + 1)
  }
  return Array.from(tally.entries()).map(([label, value]) => ({
    label,
    value,
  }))
}

function groupSum<T>(
  items: T[],
  getKey: (item: T) => string,
  getValue: (item: T) => number,
) {
  const tally = new Map<string, number>()
  for (const item of items) {
    const key = getKey(item)
    tally.set(key, (tally.get(key) ?? 0) + getValue(item))
  }
  return Array.from(tally.entries()).map(([label, value]) => ({
    label,
    value,
  }))
}

function topN(items: { label: string; value: number }[], count: number) {
  return [...items].sort((a, b) => b.value - a.value).slice(0, count)
}

function averageByDraft(essays: Doc<'essays'>[]) {
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

function satisfactionBreakdownByDraft(essays: Doc<'essays'>[]) {
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

function buildChannelPerformance(students: Doc<'students'>[]) {
  const bucket = new Map<
    string,
    { customers: number; revenue: number; multiDraft: number }
  >()
  for (const student of students) {
    const key = student.acquisition_channel || 'Unknown'
    const entry = bucket.get(key) ?? { customers: 0, revenue: 0, multiDraft: 0 }
    entry.customers += 1
    entry.revenue += student.total_revenue
    if (student.is_multi_draft) entry.multiDraft += 1
    bucket.set(key, entry)
  }
  return Array.from(bucket.entries()).map(([channel, entry]) => ({
    channel,
    customers: entry.customers,
    revenue: entry.revenue,
    multiDraftRate: percent(entry.multiDraft, entry.customers),
    avgLtv: entry.customers ? entry.revenue / entry.customers : 0,
  }))
}
