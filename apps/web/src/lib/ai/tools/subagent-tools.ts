import { google } from "@ai-sdk/google";
import { generateText, tool } from "ai";
import { z } from "zod";

const cheapModel = google("gemini-2.5-flash");

export function createSubagentTools() {
  return {
    summarizeCsv: tool({
      description:
        "Summarize the key statistics and patterns from a CSV dataset. Use this for quick summaries before deeper analysis.",
      inputSchema: z.object({
        data: z
          .string()
          .describe("Raw CSV data or a summary of the data structure"),
        focus: z
          .string()
          .optional()
          .describe(
            'Specific aspect to focus on (e.g., "revenue trends", "customer segments")',
          ),
      }),
      execute: async ({ data, focus }) => {
        const { text } = await generateText({
          model: cheapModel,
          prompt: `You are a data analyst. Summarize the following data${focus ? ` with a focus on ${focus}` : ""}. Be concise and highlight key statistics, patterns, and outliers.

Data:
${data.slice(0, 5000)}${data.length > 5000 ? "\n...(truncated)" : ""}`,
        });
        return { summary: text };
      },
    }),

    extractInsights: tool({
      description:
        "Extract actionable business insights from analysis results. Use after running statistical analysis.",
      inputSchema: z.object({
        analysisResult: z
          .string()
          .describe(
            "The output from a statistical analysis or data exploration",
          ),
        businessContext: z
          .string()
          .optional()
          .describe("Additional business context to inform the insights"),
      }),
      execute: async ({ analysisResult, businessContext }) => {
        const { text } = await generateText({
          model: cheapModel,
          prompt: `You are a senior business analyst. Extract 3-5 actionable insights from this analysis.${businessContext ? ` Business context: ${businessContext}` : ""}

Focus on:
- What does this mean for the business?
- What actions should be taken?
- What risks or opportunities are evident?

Analysis Result:
${analysisResult}`,
        });
        return { insights: text };
      },
    }),

    draftNarrative: tool({
      description:
        "Draft an executive-level narrative summarizing findings. Use to create polished summaries for stakeholders.",
      inputSchema: z.object({
        findings: z
          .array(z.string())
          .describe("List of key findings to include in the narrative"),
        audience: z
          .enum(["executive", "technical", "general"])
          .describe("Target audience for the narrative"),
        tone: z
          .enum(["formal", "conversational"])
          .optional()
          .describe("Tone of the narrative"),
      }),
      execute: async ({ findings, audience, tone = "conversational" }) => {
        const audienceInstructions = {
          executive:
            "Focus on business impact, ROI, and strategic implications. Be concise.",
          technical: "Include relevant metrics and methodology. Be precise.",
          general: "Use plain language and explain any technical terms.",
        };

        const { text } = await generateText({
          model: cheapModel,
          prompt: `You are a communications specialist. Draft a ${tone} narrative for ${audience} audience.

${audienceInstructions[audience]}

Key Findings to Include:
${findings.map((f, i) => `${i + 1}. ${f}`).join("\n")}

Write a coherent 2-3 paragraph summary that connects these findings.`,
        });
        return { narrative: text };
      },
    }),
  };
}
