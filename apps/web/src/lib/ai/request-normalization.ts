import type { UIMessage } from "ai";

export type FilterState = {
  preset: "7d" | "30d" | "90d" | "ytd" | "custom";
  from: string;
  to: string;
  turnaround: string;
  status: string;
  acquisition: string;
  draft: string;
  customerType: string;
};

export type PageContext = {
  title: string;
  path: string;
};

export const DEFAULT_FILTERS: FilterState = {
  preset: "30d",
  from: "",
  to: "",
  turnaround: "All",
  status: "All",
  acquisition: "All",
  draft: "All",
  customerType: "All",
};

export function normalizeFilters(input?: Partial<FilterState>): FilterState {
  if (!input) return DEFAULT_FILTERS;
  const isPreset = (v: string): v is FilterState["preset"] =>
    ["7d", "30d", "90d", "ytd", "custom"].includes(v);

  return {
    preset:
      typeof input.preset === "string" && isPreset(input.preset)
        ? input.preset
        : DEFAULT_FILTERS.preset,
    from: input.from ?? DEFAULT_FILTERS.from,
    to: input.to ?? DEFAULT_FILTERS.to,
    turnaround: input.turnaround ?? DEFAULT_FILTERS.turnaround,
    status: input.status ?? DEFAULT_FILTERS.status,
    acquisition: input.acquisition ?? DEFAULT_FILTERS.acquisition,
    draft: input.draft ?? DEFAULT_FILTERS.draft,
    customerType: input.customerType ?? DEFAULT_FILTERS.customerType,
  };
}

export function normalizePage(input?: Partial<PageContext>): PageContext {
  return {
    title: input?.title ?? "Dashboard",
    path: input?.path ?? "/",
  };
}

export function getIncomingMessages(body: {
  messages?: Array<UIMessage>;
  message?: UIMessage;
}) {
  if (Array.isArray(body.messages) && body.messages.length > 0) {
    return body.messages;
  }

  if (body.message) {
    return [body.message];
  }

  return [];
}
