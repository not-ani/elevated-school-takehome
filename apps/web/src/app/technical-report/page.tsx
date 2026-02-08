import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Technical Report",
  description:
    "Technical report covering code organization, effective UI design, and query runtime efficiency for the Elevated dashboard application.",
  openGraph: {
    title: "Technical Report | Elevated",
    description:
      "Technical report covering code organization, effective UI design, and query runtime efficiency for the Elevated dashboard application.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Technical Report | Elevated",
    description:
      "Technical report covering code organization, effective UI design, and query runtime efficiency for the Elevated dashboard application.",
  },
};

/*
-Code organization
-Effective UI design (ease of use, anticipating unexpected user behavior)
-Query runtime efficiency (how your solution would scale to 5,000+ rows of data)

*/
export default function TechnicalReportPage() {
  return <div>Technical Report</div>;
}
