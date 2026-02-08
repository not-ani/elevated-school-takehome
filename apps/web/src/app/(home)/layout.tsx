import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Take Home Interview - Aniketh Chenjeri",
  description:
    "Take home interview project showcasing dashboard analytics, landing page redesign, and technical implementation details.",
  openGraph: {
    title: "Take Home Interview - Aniketh Chenjeri",
    description:
      "Take home interview project showcasing dashboard analytics, landing page redesign, and technical implementation details.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Take Home Interview - Aniketh Chenjeri",
    description:
      "Take home interview project showcasing dashboard analytics, landing page redesign, and technical implementation details.",
  },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
