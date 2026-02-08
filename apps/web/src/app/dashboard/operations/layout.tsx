import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Operations",
  description:
    "Operations dashboard tracking on-time delivery rates, unassigned essays, late deliveries, and operational performance metrics.",
  openGraph: {
    title: "Operations | Dashboard | Elevated",
    description:
      "Operations dashboard tracking on-time delivery rates, unassigned essays, late deliveries, and operational performance metrics.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Operations | Dashboard | Elevated",
    description:
      "Operations dashboard tracking on-time delivery rates, unassigned essays, late deliveries, and operational performance metrics.",
  },
};

export default function OperationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
