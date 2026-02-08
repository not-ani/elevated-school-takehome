import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quality",
  description:
    "Quality metrics dashboard showing average essay ratings, satisfaction rates (E+/E/E-), draft-by-draft improvement, and quality lift analytics.",
  openGraph: {
    title: "Quality | Dashboard | Elevated",
    description:
      "Quality metrics dashboard showing average essay ratings, satisfaction rates (E+/E/E-), draft-by-draft improvement, and quality lift analytics.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Quality | Dashboard | Elevated",
    description:
      "Quality metrics dashboard showing average essay ratings, satisfaction rates (E+/E/E-), draft-by-draft improvement, and quality lift analytics.",
  },
};

export default function QualityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
