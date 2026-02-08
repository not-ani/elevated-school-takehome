import type { Metadata } from "next";
import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";

export const metadata: Metadata = {
  title: "Elevated - College Admissions Consulting and Writing Tutoring",
  description:
    "Elevated helps students tell the best stories of their lives, with 920+ Top 20 college acceptances & 200+ writing prizes since 2020. Schedule a free intro call today for help with college admissions and/or writing tutoring!",
  openGraph: {
    title: "Elevated - College Admissions Consulting and Writing Tutoring",
    description:
      "Elevated helps students tell the best stories of their lives, with 920+ Top 20 college acceptances & 200+ writing prizes since 2020. Schedule a free intro call today!",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elevated - College Admissions Consulting",
    description:
      "920+ Top 20 college acceptances & 200+ writing prizes since 2020. Help students tell the best stories of their lives.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
