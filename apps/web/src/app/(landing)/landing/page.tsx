import { HeroSection } from "@/components/landing/hero";
import { StatsSection } from "@/components/landing/stats";
import { ServicesSection } from "@/components/landing/services";
import { DifferenceSection } from "@/components/landing/difference";
import { TestimonialsSection } from "@/components/landing/testimonial";
import { FoundersSection } from "@/components/landing/founder";

export default function LandingPage() {
  return (
    <div className="font-body min-h-screen overflow-x-hidden bg-[#FDF8F3]">
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <DifferenceSection />
      <TestimonialsSection />
      <FoundersSection />
    </div>
  );
}
