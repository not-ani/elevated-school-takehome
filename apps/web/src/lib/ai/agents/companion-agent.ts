import { ToolLoopAgent, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import { ConvexHttpClient } from "convex/browser";
import { getConvexUrl } from "../env";
import { createConvexTools } from "../tools/convex-tools";
import { createE2BTools } from "../tools/e2b-tools";
import { createSubagentTools } from "../tools/subagent-tools";
import type { InferAgentUIMessage } from "ai";

const model = google("gemini-2.5-flash");

export function createCompanionAgent(instructions: string) {
  const convexUrl = getConvexUrl();

  if (!convexUrl) {
    throw new Error(
      "Missing Convex URL. Set CONVEX_URL or NEXT_PUBLIC_CONVEX_URL.",
    );
  }

  const convexClient = new ConvexHttpClient(convexUrl);
  const convexTools = createConvexTools(convexClient);
  const e2bTools = createE2BTools();
  const subagentTools = createSubagentTools();

  return new ToolLoopAgent({
    model,
    instructions,
    tools: {
      ...convexTools,
      ...e2bTools,
      ...subagentTools,
    },
    stopWhen: stepCountIs(10),
  });
}

// Create a typed agent reference for type inference
const _typedAgentForInference = new ToolLoopAgent({
  model,
  instructions: "",
  tools: {
    ...createConvexTools(
      new ConvexHttpClient("https://placeholder.convex.cloud"),
    ),
    ...createE2BTools(),
    ...createSubagentTools(),
  },
});

export type CompanionUIMessage = InferAgentUIMessage<
  typeof _typedAgentForInference
>;
