"use client";

import * as React from "react";
import { useQueryStates } from "nuqs";
import {
  coordinatesSearchParams,
  coordinatesUrlKeys,
} from "@/components/dashboard/filters/server";
import type { FilterState } from "@/components/dashboard/filters/filter-bar";

export function useDashboardQueryArgs() {
  const [filters, setFilters] = useQueryStates(coordinatesSearchParams, {
    history: "replace",
    shallow: true,
    urlKeys: coordinatesUrlKeys,
  });

  const filterState: FilterState = React.useMemo(
    () => ({
      preset: filters.preset as FilterState["preset"],
      from: filters.from,
      to: filters.to,
      turnaround: filters.turnaround,
      status: filters.status,
      acquisition: filters.acquisition,
      draft: filters.draft,
      customerType: filters.customerType,
    }),
    [filters],
  );

  const queryArgs = React.useMemo(
    () => ({
      dateRange: {
        preset: filterState.preset,
        from: filterState.from || undefined,
        to: filterState.to || undefined,
      },
      turnaround: filterState.turnaround,
      status: filterState.status,
      acquisition: filterState.acquisition,
      draft: filterState.draft,
      customerType: filterState.customerType,
    }),
    [filterState],
  );

  const deferredQueryArgs = React.useDeferredValue(queryArgs);
  const isFiltering = deferredQueryArgs !== queryArgs;

  return {
    filters: filterState,
    setFilters,
    queryArgs,
    deferredQueryArgs,
    isFiltering,
  };
}
