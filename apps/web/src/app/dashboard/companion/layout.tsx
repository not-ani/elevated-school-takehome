import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Companion",
  description:
    "AI-powered companion for analyzing dashboard data, answering questions, and providing insights about your business metrics.",
  openGraph: {
    title: "AI Companion | Dashboard | Elevated",
    description:
      "AI-powered companion for analyzing dashboard data, answering questions, and providing insights about your business metrics.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "AI Companion | Dashboard | Elevated",
    description:
      "AI-powered companion for analyzing dashboard data, answering questions, and providing insights about your business metrics.",
  },
};

export default function CompanionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
