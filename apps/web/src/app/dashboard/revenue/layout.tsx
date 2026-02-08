import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Revenue",
  description:
    "Revenue analytics dashboard showing total revenue, submission volume, revenue by channel and turnaround, and revenue trends over time.",
  openGraph: {
    title: "Revenue | Dashboard | Elevated",
    description:
      "Revenue analytics dashboard showing total revenue, submission volume, revenue by channel and turnaround, and revenue trends over time.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Revenue | Dashboard | Elevated",
    description:
      "Revenue analytics dashboard showing total revenue, submission volume, revenue by channel and turnaround, and revenue trends over time.",
  },
};

export default function RevenueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
