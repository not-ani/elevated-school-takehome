"use client";

import * as React from "react";
import type { FilterState } from "./filters/filter-bar";

export type DashboardQueryArgs = {
  dateRange: {
    preset: FilterState["preset"];
    from?: string;
    to?: string;
  };
  turnaround?: string;
  status?: string;
  acquisition?: string;
  draft?: string;
  customerType?: string;
};

type DashboardContextValue = {
  filters: FilterState;
  queryArgs: DashboardQueryArgs;
  deferredQueryArgs: DashboardQueryArgs;
  isFiltering: boolean;
};

const DashboardContext = React.createContext<DashboardContextValue | null>(
  null,
);

export function DashboardProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: DashboardContextValue;
}) {
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = React.useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
}
