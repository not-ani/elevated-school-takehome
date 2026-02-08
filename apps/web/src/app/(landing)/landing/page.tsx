import type { Metadata } from "next";
import { HeroSection } from "@/components/landing/hero";
import { CheatSheetSection } from "@/components/landing/cheat-sheet";
import { StatsSection } from "@/components/landing/stats";
import { ServicesSection } from "@/components/landing/services";
import { DifferenceSection } from "@/components/landing/difference";
import { TestimonialsSection } from "@/components/landing/testimonial";
import { FoundersSection } from "@/components/landing/founder";

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

export default function LandingPage() {
  return (
    <div className="font-body min-h-screen overflow-x-hidden bg-[#FDF8F3]">
      <HeroSection />
      <CheatSheetSection />
      <StatsSection />
      <ServicesSection />
      <DifferenceSection />
      <TestimonialsSection />
      <FoundersSection />
    </div>
  );
}
