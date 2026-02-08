"use client";

import * as React from "react";
import { useQuery } from "@/lib/use-query";
import { api } from "@/lib/convex";
import type {
  FilterState,
  FilterOptions,
} from "@/components/dashboard/filters/filter-bar";
import { DashboardProvider } from "@/components/dashboard/dashboard-context";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CompanionProvider } from "@/components/dashboard/companion-context";
import { useDashboardQueryArgs } from "@/components/dashboard/use-dashboard-query-args";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPending, startTransition] = React.useTransition();
  const {
    filters: filterState,
    setFilters,
    queryArgs,
    deferredQueryArgs,
    isFiltering,
  } = useDashboardQueryArgs();
  const optionsResult = useQuery(
    api.dashboardFilters.getFilterOptions,
    deferredQueryArgs,
  );

  const [stableOptions, setStableOptions] = React.useState<FilterOptions>();
  React.useEffect(() => {
    if (optionsResult.data) setStableOptions(optionsResult.data);
  }, [optionsResult.data]);

  const isLoading =
    !stableOptions &&
    optionsResult.isPending &&
    optionsResult.data === undefined;
  const isFetching =
    isPending ||
    isFiltering ||
    (optionsResult.isPending && stableOptions !== undefined);

  const handleFilterChange = React.useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      startTransition(() => {
        void setFilters({ [key]: value });
      });
    },
    [setFilters, startTransition],
  );

  const filterOptions: FilterOptions = React.useMemo(() => {
    if (!stableOptions) {
      return {
        turnaroundOptions: ["All"],
        statusOptions: ["All"],
        acquisitionOptions: ["All"],
      };
    }
    return stableOptions;
  }, [stableOptions]);

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex min-h-screen flex-col">
            <div className="bg-background sticky top-0 z-10 flex flex-col gap-3 border-b px-4 py-3">
              <div className="flex items-center gap-4">
                <Skeleton className="h-7 w-7" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 md:p-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <CompanionProvider>
      <DashboardProvider
        value={{
          filters: filterState,
          queryArgs,
          deferredQueryArgs,
          isFiltering,
        }}
      >
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <div className="flex min-h-screen flex-col">
              <DashboardHeader
                filters={filterState}
                options={filterOptions}
                onFilterChange={handleFilterChange}
                isLoading={isFetching}
              />
              <div className="flex-1 overflow-auto p-4 md:p-6">{children}</div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </DashboardProvider>
    </CompanionProvider>
  );
}
