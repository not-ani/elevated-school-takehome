import type { Metadata } from "next";
import * as React from "react";
import { DashboardLayoutContent } from "./_components/dashboard-layout-content";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Analytics dashboard for tracking revenue, customers, quality metrics, and operations performance.",
  openGraph: {
    title: "Dashboard | Elevated",
    description:
      "Analytics dashboard for tracking revenue, customers, quality metrics, and operations performance.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Dashboard | Elevated",
    description:
      "Analytics dashboard for tracking revenue, customers, quality metrics, and operations performance.",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <React.Suspense fallback={null}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </React.Suspense>
  );
}
