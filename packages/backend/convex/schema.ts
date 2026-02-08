import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  essays: defineTable({
    item_id: v.string(),
    student_id: v.optional(v.string()),
    student_acquisition_channel: v.optional(v.string()),
    student_is_multi_draft: v.optional(v.boolean()),
    student_location: v.optional(v.string()),
    draft: v.number(),
    draft_bucket: v.optional(v.string()),
    word_count: v.number(),
    turnaround: v.string(),
    revenue: v.number(),
    essay_rating_numeric: v.optional(v.number()),
    satisfaction_rating: v.optional(v.string()),
    item_status: v.string(),
    is_completed: v.boolean(),
    submitted_at: v.string(),
    submittedAtMs: v.optional(v.number()),
    time_remaining_hours: v.optional(v.number()),
    is_late: v.optional(v.boolean()),
  })
    .index("by_student", ["student_id"])
    .index("by_item_id", ["item_id"])
    .index("by_submitted_at", ["submittedAtMs"])
    .index("by_status_and_submitted_at", ["item_status", "submittedAtMs"])
    .index("by_turnaround_and_submitted_at", ["turnaround", "submittedAtMs"])
    .index("by_status_turnaround_and_submitted_at", [
      "item_status",
      "turnaround",
      "submittedAtMs",
    ])
    .index("by_draft_bucket_and_submitted_at", ["draft_bucket", "submittedAtMs"])
    .index("by_student_channel_and_submitted_at", [
      "student_acquisition_channel",
      "submittedAtMs",
    ])
    .index("by_student_type_and_submitted_at", [
      "student_is_multi_draft",
      "submittedAtMs",
    ])
    .index("by_is_late_and_submitted_at", ["is_late", "submittedAtMs"]),

  students: defineTable({
    student_id: v.optional(v.string()),
    total_essays: v.number(),
    total_revenue: v.number(),
    is_multi_draft: v.boolean(),
    first_rating: v.optional(v.number()),
    last_rating: v.optional(v.number()),
    acquisition_channel: v.string(),
    location: v.string(),
  }).index("by_student_id", ["student_id"]),

  essayRequests: defineTable({
    studentName: v.string(),
    studentEmail: v.string(),
    applicationType: v.string(),
    programPrompt: v.string(),
    originalContent: v.any(),
    editedContent: v.optional(v.any()),
    wordCount: v.number(),
    turnaround: v.union(
      v.literal("standard"),
      v.literal("express"),
      v.literal("urgent"),
    ),
    turnaroundLabel: v.string(),
    pricePerWord: v.number(),
    estimatedDeliveryAt: v.number(),
    comments: v.optional(v.string()),
    status: v.union(
      v.literal("submitted"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
    statusGroup: v.optional(
      v.union(v.literal("current"), v.literal("previous")),
    ),
    currentScore: v.optional(v.number()),
    potentialScore: v.optional(v.number()),
    revisionNumber: v.number(),
    parentRequestId: v.optional(v.id("essayRequests")),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
    viewTokenHash: v.optional(v.string()),
    viewTokenCreatedAt: v.optional(v.number()),
    viewTokenExpiresAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_status_and_due", ["status", "estimatedDeliveryAt"])
    .index("by_status_and_completed", ["status", "completedAt"])
    .index("by_created", ["createdAt"])
    .index("by_status_group_and_created", ["statusGroup", "createdAt"])
    .index("by_parent", ["parentRequestId", "revisionNumber"])
    .index("by_student_email", ["studentEmail"]),

  // AI Companion threads
  threads: defineTable({
    title: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastMessageAt: v.number(),
  }).index("by_updatedAt", ["updatedAt"]),

  // AI Companion messages
  messages: defineTable({
    threadId: v.id("threads"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    createdAt: v.number(),
    metadata: v.optional(v.any()),
  }).index("by_thread_createdAt", ["threadId", "createdAt"]),
});
