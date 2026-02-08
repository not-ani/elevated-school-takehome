"use client";
import {
  ArrowRight,
  Clock,
  FileText,
  Globe,
  PenLine,
  School,
  Sun,
} from "lucide-react";
import Image from "next/image";
import { COLORS } from "./constants";

export function ServicesSection() {
  const services = [
    {
      icon: PenLine,
      title: "Writing Fundamentals",
      description:
        "Our most popular program! We teach everything from analytical writing to short stories, poetry, memoirs and more!",
      image: "/writing.avif",
    },
    {
      icon: FileText,
      title: "College Consulting",
      description:
        "Personal statements, college supplements, UC essays and more! We help students at all stages, ranging from first drafts to final ones.",
      image: "/college.avif",
    },
    {
      icon: Sun,
      title: "Summer Program Applications",
      description:
        "Using our proven formula, students have been admitted to the overwhelming majority of the programs they apply to.",
      image: "/summer.avif",
    },
    {
      icon: Clock,
      title: "Long-Term Coaching",
      description:
        "Our program connects 7-11th graders with Ivy League mentors to ensure long-term success both in and out of the classroom.",
      image: "/coaching.avif",
    },
    {
      icon: Globe,
      title: "UK & EU Counseling",
      description:
        "Our UK consulting support provides applicants with individualized support in every aspect of their applications.",
      image: "/uk.avif",
    },
    {
      icon: School,
      title: "High School Applications",
      description:
        "We assist with interview training, boarding school applications, SSAT/ISEE preparation, personal essays and more!",
      image: "/boarding.avif",
    },
  ];

  return (
    <section id="services" className="relative bg-white py-24">
      {/* Section Header */}
      <div className="mx-auto mb-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span
              className="mb-4 inline-block px-4 py-1 text-sm font-bold tracking-wider"
              style={{
                backgroundColor: COLORS.white,
                color: COLORS.secondary,
                clipPath: "polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%)",
              }}
            >
              WHAT WE OFFER
            </span>
            <h2
              className="font-display text-4xl sm:text-5xl lg:text-6xl"
              style={{ color: COLORS.secondary }}
            >
              Our Services
            </h2>
          </div>
          <p className="max-w-xl text-lg leading-relaxed text-[#101D45]/80">
            At ElevatEd, we believe that every student deserves personalized,
            custom-tailored support to help them reach the next step in their
            educational journey. Our college admissions and application
            counseling model takes the classic mentorship model to a whole new
            level of success by connecting students to Ivy League consultants
            who have done it before.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative overflow-hidden bg-[#FDF8F3] transition-all duration-300 hover:-translate-y-2"
              style={{
                boxShadow: "6px 6px 0px " + COLORS.secondary,
                clipPath: "polygon(0 0, 100% 0, 100% 95%, 95% 100%, 0 100%)",
              }}
            >
              {/* Image */}
              <div className="h-48 overflow-hidden bg-[#101D45]/10">
                <Image
                  src={service.image}
                  alt={service.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  width={400}
                  height={200}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-[#101D45]/5 to-[#FE4300]/5">
                  <service.icon
                    className="h-16 w-16 opacity-20"
                    style={{ color: COLORS.primary }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div
                  className="mb-4 h-1 w-12 transition-all group-hover:w-20"
                  style={{ backgroundColor: COLORS.primary }}
                />
                <h3
                  className="font-display mb-3 text-2xl"
                  style={{ color: COLORS.secondary }}
                >
                  {service.title}
                </h3>
                <p className="mb-4 leading-relaxed text-[#101D45]/80">
                  {service.description}
                </p>
                <button
                  className="group/btn flex items-center gap-2 font-semibold transition-colors hover:text-[#FE4300]"
                  style={{ color: COLORS.secondary }}
                >
                  Learn More
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
