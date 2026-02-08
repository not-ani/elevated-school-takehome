import { tool } from 'ai'
import { z } from 'zod'

// CSV registry with hardcoded URLs and field descriptions
const csvRegistry = {
  'students.csv': {
    url: 'https://tj032z0m85.ufs.sh/f/SnzXVuggV8iuLZPPJ9sUuv3N1YSFb05C8zOf2k6s97eHtKoh',
    fields: [
      'student_id',
      'date_joined_utc',
      'joined_date',
      'location',
      'location_city',
      'location_region',
      'location_country',
      'how_did_you_find_us',
      'acquisition_channel_key',
      'first_submission_utc',
      'last_submission_utc',
      'first_submission_date',
      'last_submission_date',
      'total_items',
      'completed_items',
      'assigned_items',
      'unassigned_items',
      'cancelled_items',
      'refunded_items',
      'total_word_count',
      'avg_word_count',
      'gross_revenue_total',
      'booked_revenue_total',
      'recognized_revenue_total',
      'lost_revenue_total',
      'avg_essay_rating_midpoint',
      'avg_satisfaction_score',
      'multi_draft_rate',
      'max_draft',
      'late_count',
      'late_eligible_count',
      'avg_completion_hours',
      'avg_time_remaining_hours',
      'e_plus_rate',
      'late_rate',
    ],
  },
  'essays.csv': {
    url: 'https://tj032z0m85.ufs.sh/f/SnzXVuggV8iuSqMPUpBggV8iuPQdbpE5JmKR2q6wvlFyITcH',
    fields: [
      'item_id',
      'student_id',
      'draft',
      'item_status',
      'turnaround',
      'word_count',
      'customer_paid_rate_per_word',
      'gross_revenue',
      'booked_revenue',
      'recognized_revenue',
      'lost_revenue',
      'student_satisfaction_rating',
      'student_satisfaction_score',
      'student_feedback',
      'essay_rating',
      'essay_rating_type',
      'essay_rating_min',
      'essay_rating_max',
      'essay_rating_midpoint',
      'time_item_submitted_utc',
      'submitted_date',
      'completed_on_utc',
      'completed_date',
      'time_remaining_upon_overall_completion',
      'time_remaining_seconds',
      'time_remaining_hours',
      'late_flag',
      'late_by_seconds',
      'late_by_hours',
      'completion_hours',
      'how_did_you_find_us',
      'acquisition_channel_key',
      'date_joined_utc',
      'joined_date',
      'location',
      'location_city',
      'location_region',
      'location_country',
    ],
  },
  'daily_submissions.csv': {
    url: 'https://tj032z0m85.ufs.sh/f/SnzXVuggV8iuPfDcyBwbDHkvLyfi9T0S2CMF4nGs5xmbhEBg',
    fields: [
      'submitted_date',
      'submissions',
      'completed_items',
      'assigned_items',
      'unassigned_items',
      'cancelled_items',
      'refunded_items',
      'gross_revenue',
      'booked_revenue',
      'recognized_revenue',
      'lost_revenue',
      'avg_word_count',
      'avg_rate_per_word',
      'avg_essay_rating_midpoint',
      'multi_draft_rate',
      'late_count',
      'late_eligible_count',
      'e_plus_rate',
      'late_rate',
    ],
  },
  'daily_completions.csv': {
    url: 'https://tj032z0m85.ufs.sh/f/SnzXVuggV8iuDEEswYFjE5adqXGnwRSUcAP09iBbgrW27hy3',
    fields: [
      'completed_date',
      'completed_items',
      'late_count',
      'late_eligible_count',
      'recognized_revenue',
      'avg_completion_hours',
      'avg_time_remaining_hours',
      'avg_essay_rating_midpoint',
      'e_plus_rate',
      'late_rate',
    ],
  },
} as const

type CsvFileName = keyof typeof csvRegistry

const MAX_STDOUT_CHARS = 6_000
const MAX_STDERR_CHARS = 4_000
const MAX_MODEL_OUTPUT_CHARS = 1_200
const MAX_CHARTS_IN_TOOL_RESULT = 4

export function createE2BTools() {
  return {
    runPythonAnalysis: tool({
      description: `Execute Python code in a secure sandbox for data analysis. The sandbox has pandas, numpy, matplotlib, seaborn, scipy, scikit-learn, statsmodels, and plotly pre-installed.

Available CSV files (specify which to load):
- students.csv: ${csvRegistry['students.csv'].fields.join(', ')}
- essays.csv: ${csvRegistry['essays.csv'].fields.join(', ')}
- daily_submissions.csv: ${csvRegistry['daily_submissions.csv'].fields.join(', ')}
- daily_completions.csv: ${csvRegistry['daily_completions.csv'].fields.join(', ')}

Files are loaded to /data/ directory. Use pandas to read them:
  df = pd.read_csv('/data/students.csv')

IMPORTANT for large datasets: never load full CSVs by default. Start with a focused subset using techniques like usecols, nrows, date filters, groupby aggregations, and chunksize. Only read full files when absolutely necessary.

For visualizations, use plt.show() or plt.savefig() - charts are automatically captured.`,
      inputSchema: z.object({
        code: z
          .string()
          .describe(
            'Python code to execute. Use pandas for data manipulation, matplotlib/seaborn for visualization.',
          ),
        filesToLoad: z
          .array(
            z.enum([
              'students.csv',
              'essays.csv',
              'daily_submissions.csv',
              'daily_completions.csv',
            ]),
          )
          .describe(
            'List of CSV files to load into the sandbox. Only load files you need.',
          ),
        note: z
          .string()
          .optional()
          .describe('Brief description of what this analysis does'),
      }),
      execute: async ({ code, filesToLoad, note }) => {
        // Dynamically import E2B to avoid bundling issues
        const { Sandbox } = await import('@e2b/code-interpreter')

        let sandbox: InstanceType<typeof Sandbox> | null = null
        try {
          // Create sandbox - use default code-interpreter which has Python + data science libs
          sandbox = await Sandbox.create()

          // Load requested CSV files by fetching from URLs and writing to sandbox
          for (const fileName of filesToLoad) {
            const csvInfo = csvRegistry[fileName as CsvFileName]
            if (!csvInfo?.url) {
              console.warn(`CSV URL not configured for ${fileName}`)
              continue
            }

            console.log(`Loading ${fileName} from ${csvInfo.url}`)

            // Fetch CSV content from URL
            const response = await fetch(csvInfo.url)
            if (!response.ok) {
              throw new Error(
                `Failed to fetch ${fileName}: ${response.statusText}`,
              )
            }
            const csvContent = await response.text()

            // Write to sandbox filesystem
            await sandbox.files.write(`/data/${fileName}`, csvContent)
            console.log(
              `Wrote ${fileName} to /data/${fileName} (${csvContent.length} bytes)`,
            )
          }

          // Run the code
          const execution = await sandbox.runCode(code)

          // Collect results
          const result: {
            summary: string
            stdout: string
            stderr: string
            filesGenerated: string[]
            charts: string[]
            error?: string
          } = {
            summary: note || 'Analysis completed',
            stdout: truncateText(execution.logs.stdout.join('\n'), MAX_STDOUT_CHARS),
            stderr: truncateText(execution.logs.stderr.join('\n'), MAX_STDERR_CHARS),
            filesGenerated: [],
            charts: [],
          }

          // Check for generated charts
          if (execution.results) {
            for (const res of execution.results) {
              if (res.png) {
                result.charts.push(`data:image/png;base64,${res.png}`)
              }
              if ('jpeg' in res && res.jpeg) {
                result.charts.push(`data:image/jpeg;base64,${res.jpeg}`)
              }

              if (result.charts.length >= MAX_CHARTS_IN_TOOL_RESULT) {
                break
              }
            }
          }

          // Check for output files
          try {
            const files = await sandbox.files.list('/data')
            result.filesGenerated = files.map((f: { name: string }) => f.name)
          } catch {
            // Ignore if /data doesn't exist
          }

          if (execution.error) {
            result.error = `${execution.error.name}: ${execution.error.value}`
          }

          return result
        } finally {
          if (sandbox) {
            await sandbox.kill()
          }
        }
      },
      toModelOutput: ({ output }) => {
        const data = output as {
          summary?: string
          stdout?: string
          stderr?: string
          filesGenerated?: string[]
          charts?: string[]
          error?: string
        }

        const text = [
          data.summary ? `Summary: ${data.summary}` : 'Summary: Analysis completed.',
          data.error ? `Error: ${data.error}` : null,
          data.stdout
            ? `Stdout (truncated):\n${truncateText(data.stdout, MAX_MODEL_OUTPUT_CHARS)}`
            : null,
          data.stderr
            ? `Stderr (truncated):\n${truncateText(data.stderr, MAX_MODEL_OUTPUT_CHARS)}`
            : null,
          Array.isArray(data.filesGenerated) && data.filesGenerated.length > 0
            ? `Files generated: ${data.filesGenerated.slice(0, 12).join(', ')}`
            : null,
          Array.isArray(data.charts)
            ? `Charts generated: ${data.charts.length}`
            : null,
        ]
          .filter((line): line is string => Boolean(line))
          .join('\n\n')

        return {
          type: 'content' as const,
          value: [{ type: 'text' as const, text }],
        }
      },
    }),
  }
}

function truncateText(value: string, maxChars: number) {
  if (value.length <= maxChars) return value
  return `${value.slice(0, maxChars)}\n...[truncated]`
}
