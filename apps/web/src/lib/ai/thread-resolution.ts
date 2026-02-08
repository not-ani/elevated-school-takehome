import type { ConvexHttpClient } from "convex/browser";
import { api } from "@elevated-school/backend/convex/_generated/api";
import type { Id } from "@elevated-school/backend/convex/_generated/dataModel";

export async function resolveValidThreadId(
  convexClient: ConvexHttpClient,
  threadId: string | undefined,
) {
  if (!threadId) return undefined;

  try {
    const thread = await convexClient.query(api.threads.get, {
      threadId: threadId as Id<"threads">,
    });
    if (!thread) return undefined;
    return threadId as Id<"threads">;
  } catch {
    return undefined;
  }
}
