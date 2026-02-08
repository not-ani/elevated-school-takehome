import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customers",
  description:
    "Customer analytics dashboard showing active customers, multi-draft rates, lifetime value, satisfaction metrics, and channel performance.",
  openGraph: {
    title: "Customers | Dashboard | Elevated",
    description:
      "Customer analytics dashboard showing active customers, multi-draft rates, lifetime value, satisfaction metrics, and channel performance.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Customers | Dashboard | Elevated",
    description:
      "Customer analytics dashboard showing active customers, multi-draft rates, lifetime value, satisfaction metrics, and channel performance.",
  },
};

export default function CustomersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
