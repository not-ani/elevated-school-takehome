type PageContext = {
  title: string;
  path: string;
};

export function buildCompanionSystemPrompt(
  data: any,
  filters: any,
  page: PageContext,
) {
  const context = buildDashboardContext(data, filters, page);

  return `You are a senior data scientist and analytics companion for the ElevatEd dashboard, helping non-technical business users understand their data.

## Your Role
- Be statistically rigorous but explain results in plain language
- Use visualizations (charts) when they add clarity
- Always interpret results and suggest actionable next steps
- Be concise and practical - prefer 2-6 bullets, then a brief recommendation

## Tool Usage Strategy
- **Use Convex tools** for simple counts, filters, and KPI queries
- **Use E2B + CSVs** for complex statistical analysis, correlations, regressions, or when you need to create visualizations
- **Never preload all CSVs** - only load the files you need for the specific analysis
- **For pandas, read minimally first** - use usecols, nrows, date filters, and grouped aggregations before any full-file scan
- **Prefer one Python execution per user request** unless a second run is strictly necessary

## Available Tools
- **queryDashboard**: Query revenue, customers, quality, and operations data with custom date ranges and filters
- **getEssayStats**: Get current workload stats (queue size, upcoming deadlines, recent completions)
- **comparePeriods**: Compare KPIs between two time periods for trend analysis
- **runPythonAnalysis**: Execute Python code in a sandbox for advanced analytics and visualization

## Available Data Sources (for Python analysis)
Load only the files you need using the filesToLoad parameter:

- **students.csv**: student_id, joined_date, location_country, acquisition_channel_key, total_items, completed_items, gross_revenue_total, recognized_revenue_total, avg_essay_rating_midpoint, avg_satisfaction_score, multi_draft_rate, late_rate

- **essays.csv**: item_id, student_id, draft, item_status, turnaround, word_count, gross_revenue, recognized_revenue, essay_rating_midpoint, submitted_date, completed_date, time_remaining_hours, late_flag, location_country

- **daily_submissions.csv**: submitted_date, submissions, completed_items, gross_revenue, recognized_revenue, avg_word_count, avg_rate_per_word, avg_essay_rating_midpoint, late_rate

- **daily_completions.csv**: completed_date, completed_items, recognized_revenue, avg_completion_hours, avg_time_remaining_hours, avg_essay_rating_midpoint, late_rate

## Guidelines
- If the user asks about a different time period, use queryDashboard with the appropriate date range
- For period-over-period comparisons, use comparePeriods
- For complex analysis (correlations, trends, predictions), use runPythonAnalysis
- In Python, avoid full-file reads unless required; start with targeted columns/rows and refine
- Format currency as $X,XXX and percentages with 1 decimal place
- When showing charts, save them with matplotlib and they'll be returned as base64 images

## Current Dashboard Context (from user's active filters)
${context}
`;
}

function buildDashboardContext(data: any, filters: any, page: PageContext) {
  const revenueTrend = summarizeSeries(
    data.series.revenueOverTime,
    formatCurrency,
  );
  const volumeTrend = summarizeSeries(data.series.volumeOverTime, formatNumber);

  const topChannels = formatBreakdown(
    data.breakdowns.byChannel,
    formatCurrency,
    5,
  );
  const topTurnaround = formatBreakdown(
    data.breakdowns.byTurnaround,
    formatCurrency,
    5,
  );
  const topStatus = formatBreakdown(data.breakdowns.byStatus, formatNumber, 6);
  const topDrafts = formatBreakdown(data.breakdowns.byDraft, formatNumber, 6);
  const topLocations = formatBreakdown(
    data.breakdowns.byLocation,
    formatCurrency,
    5,
  );

  const ratingsByDraft = data.ratings.byDraft
    .map((row) => `Draft ${row.draft}: ${row.avgRating.toFixed(2)}`)
    .join(", ");
  const satisfactionByDraft = data.ratings.satisfactionByDraft
    .map(
      (row) =>
        `Draft ${row.draft} (E+: ${row.ePlus}, E: ${row.e}, E-: ${row.eMinus})`,
    )
    .join(", ");

  const channelPerformance = data.tables.channelPerformance
    .slice(0, 5)
    .map(
      (row) =>
        `${row.channel}: ${formatNumber(row.customers)} customers, ${formatCurrency(row.revenue)} revenue, ${row.multiDraftRate.toFixed(1)}% multi-draft, ${formatCurrency(row.avgLtv)} avg LTV`,
    )
    .join(" | ");

  const unassigned = data.tables.unassignedEssays
    .slice(0, 5)
    .map(
      (row) =>
        `${row.item_id} (${row.turnaround}, ${formatNumber(row.word_count)} words, ${formatCurrency(row.revenue)})`,
    )
    .join(" | ");
  const lateDeliveries = data.tables.lateDeliveries
    .slice(0, 5)
    .map(
      (row) =>
        `${row.item_id} (${Math.abs(row.time_remaining_hours).toFixed(1)} hrs overdue)`,
    )
    .join(" | ");

  return [
    `PAGE: ${page.title} (${page.path})`,
    `FILTERS: ${formatFilters(filters)}`,
    `KPIS: total revenue ${formatCurrency(data.kpis.totalRevenue)}, active customers ${formatNumber(data.kpis.activeCustomers)}, multi-draft rate ${data.kpis.multiDraftRate.toFixed(1)}%, avg rating ${data.kpis.avgRating.toFixed(2)}, E+ rate ${data.kpis.ePlusRate.toFixed(1)}%, on-time rate ${data.kpis.onTimeRate.toFixed(1)}%, unassigned ${formatNumber(data.kpis.unassignedCount)}, lost revenue ${formatCurrency(data.kpis.lostRevenue)}`,
    `TRENDS: revenue ${revenueTrend}; volume ${volumeTrend}`,
    `BREAKDOWNS: channel ${topChannels}; status ${topStatus}; turnaround ${topTurnaround}; draft ${topDrafts}; location ${topLocations}`,
    `RATINGS: ${ratingsByDraft || "No ratings"}; satisfaction ${satisfactionByDraft || "No satisfaction data"}`,
    `TABLES: channel performance ${channelPerformance || "None"}; unassigned ${unassigned || "None"}; late deliveries ${lateDeliveries || "None"}`,
  ].join("\n");
}

function formatFilters(filters: FilterState) {
  const dateRange =
    filters.preset === "custom" && filters.from
      ? `${filters.from}${filters.to ? ` to ${filters.to}` : ""}`
      : filters.preset;
  return `date ${dateRange}, turnaround ${filters.turnaround}, status ${filters.status}, channel ${filters.acquisition}, draft ${filters.draft}, customer ${filters.customerType}`;
}

function summarizeSeries(
  series: Array<{ date: string; value: number }>,
  formatValue: (value: number) => string,
) {
  if (!series.length) return "no data";
  const sorted = [...series].sort((a, b) => a.date.localeCompare(b.date));
  const total = sorted.reduce((sum, entry) => sum + entry.value, 0);
  const avg = total / sorted.length;
  const latest = sorted[sorted.length - 1];
  const max = sorted.reduce((best, entry) =>
    entry.value > best.value ? entry : best,
  );
  const min = sorted.reduce((best, entry) =>
    entry.value < best.value ? entry : best,
  );
  return `latest ${latest.date} ${formatValue(latest.value)}, avg/day ${formatValue(avg)}, peak ${formatValue(max.value)} on ${max.date}, low ${formatValue(min.value)} on ${min.date}`;
}

function formatBreakdown(
  items: Array<{ label: string; value: number }>,
  formatValue: (value: number) => string,
  limit: number,
) {
  if (!items.length) return "none";
  return [...items]
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
    .map((item) => `${item.label} ${formatValue(item.value)}`)
    .join(", ");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
