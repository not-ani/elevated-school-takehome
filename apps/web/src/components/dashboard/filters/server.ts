import {
  createLoader,
  parseAsStringLiteral,
  parseAsString,
  type UrlKeys,
} from "nuqs/server";

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

export type FilterOptions = {
  turnaroundOptions: Array<string>;
  statusOptions: Array<string>;
  acquisitionOptions: Array<string>;
};

const presets = ["7d", "30d", "90d", "ytd", "custom"] as const;
export const turnaroundPresets = [
  "standard",
  "express",
  "urgent",
  "all",
] as const;
export const statusPresets = [
  "completed",
  "unassigned",
  "assigned",
  "all",
] as const;
export const customerTypePresent = [
  "single-draft",
  "multi-draft",
  "all",
] as const;
export const draftPresets = ["All", "1", "2", "3", "4", "5+"] as const;
export const customerTypePresets = ["All", "Single", "Multi"] as const;

export const coordinatesSearchParams = {
  preset: parseAsStringLiteral(presets).withDefault("30d"),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  turnaround: parseAsString.withDefault("All"),
  status: parseAsString.withDefault("All"),
  acquisition: parseAsString.withDefault("All"),
  draft: parseAsStringLiteral(draftPresets).withDefault("All"),
  customerType: parseAsStringLiteral(customerTypePresets).withDefault("All"),
};

export const coordinatesUrlKeys: UrlKeys<typeof coordinatesSearchParams> = {
  preset: "p",
  from: "from",
  to: "to",
  turnaround: "ta",
  status: "st",
  acquisition: "acq",
  draft: "d",
  customerType: "ct",
};

export const loadSearchParams = createLoader(coordinatesSearchParams, {
  urlKeys: coordinatesUrlKeys,
});
