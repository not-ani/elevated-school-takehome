"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { FilterBar } from "./filters/filter-bar";
import type { FilterOptions, FilterState } from "./filters/filter-bar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const pageTitles: Record<string, string> = {
  "/": "Overview",
  "/revenue": "Revenue",
  "/customers": "Customers",
  "/quality": "Quality",
  "/operations": "Operations",
  "/companion": "AI Companion",
};

export function DashboardHeader({
  filters,
  options,
  onFilterChange,
  isLoading,
}: {
  filters: FilterState;
  options: FilterOptions;
  onFilterChange: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => void;
  isLoading?: boolean;
}) {
  const pathname = usePathname();
  const normalizedPath =
    pathname === "/dashboard" ? "/" : pathname.replace("/dashboard", "");
  const pageTitle = pageTitles[normalizedPath] || "Dashboard";

  return (
    <>
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 flex flex-col gap-3 border-b px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink render={<Link href="/" />}>
                  ElevatED
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium">
                  {pageTitle}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-3">
            <div
              className="text-muted-foreground flex min-w-[110px] items-center justify-end gap-1.5 transition-opacity"
              aria-live="polite"
              aria-atomic="true"
              data-loading={isLoading ? "true" : "false"}
              style={{ opacity: isLoading ? 1 : 0 }}
            >
              <Loader2 className="size-3.5 animate-spin" />
              <span className="text-xs">Updating...</span>
            </div>
            <Badge variant="secondary" className="text-[10px] font-normal">
              Demo
            </Badge>
          </div>
        </div>
      </header>
      <div className="pointer-events-none fixed right-0 bottom-4 left-0 z-20">
        <div className="mx-auto flex max-w-7xl justify-center">
          <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 pointer-events-auto rounded-full border px-4 py-1.5 shadow-sm backdrop-blur">
            <FilterBar
              filters={filters}
              options={options}
              onFilterChange={onFilterChange}
            />
          </div>
        </div>
      </div>
    </>
  );
}
