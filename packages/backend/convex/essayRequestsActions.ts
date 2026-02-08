"use node"

import { action } from './_generated/server'
import { v } from 'convex/values'
import { Resend } from '@convex-dev/resend'
import { createHash, randomBytes } from 'crypto'

import { components, internal } from './_generated/api'

const scoreValidator = v.union(
  v.literal(5),
  v.literal(6),
  v.literal(7),
  v.literal(8),
  v.literal(9),
)

export const resend: Resend = new Resend(components.resend, {
  testMode: false,
})

export const finishEssay = action({
  args: {
    id: v.id('essayRequests'),
    editedContent: v.any(),
    currentScore: v.optional(scoreValidator),
    potentialScore: v.optional(scoreValidator),
    appUrl: v.string(),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const token = randomBytes(16).toString('hex')
    const tokenHash = hashToken(token)
    const now = Date.now()

    const request = await ctx.runMutation(internal.essayRequests.completeEssay, {
      id: args.id,
      editedContent: args.editedContent,
      currentScore: args.currentScore,
      potentialScore: args.potentialScore,
      tokenHash,
      tokenCreatedAt: now,
    })

    const viewUrl = `${args.appUrl}/request/${request._id}/view`

    await resend.sendEmail(ctx, {
      from: 'Eled <support@eled.ai>',
      to: request.studentEmail,
      subject: 'Your edited essay is ready',
      html: buildEmailHtml({
        name: request.studentName,
        viewUrl,
        token,
      }),
    })

    return { success: true }
  },
})

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function buildEmailHtml({
  name,
  viewUrl,
  token,
}: {
  name: string
  viewUrl: string
  token: string
}) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Your edited essay is ready</h2>
      <p>Hi ${name},</p>
      <p>Your edited essay is ready to review. Use the link below and enter your private token to unlock it.</p>
      <p><a href="${viewUrl}">View your edited essay</a></p>
      <p><strong>Your token:</strong> ${token}</p>
      <p>If you have any issues, reply to this email and we will help right away.</p>
    </div>
  `
}
