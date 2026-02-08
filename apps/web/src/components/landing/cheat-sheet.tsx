"use client";

import { COLORS } from "./constants";
import { CheatSheetBenefits } from "./cheat-sheet-benefits";
import { CheatSheetForm } from "./cheat-sheet-form";

export function CheatSheetSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: COLORS.cream }}
    >
      {/* Background Pattern - subtle texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, ${COLORS.secondary} 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Main Container - proper spacing from hero */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {/* Header Section - Large and Bold on Cream Background */}
        <div className="mb-16 text-center lg:mb-20">
          {/* Main Heading - Editorial Style */}
          <h2
            className="font-display mx-auto max-w-4xl text-4xl leading-[1.1] sm:text-5xl lg:text-6xl"
            style={{ color: COLORS.secondary }}
          >
            Download Our <span style={{ color: COLORS.primary }}>FREE</span>
            <br />
            <span className="relative inline-block">
              Cheat Sheet
              <svg
                className="absolute -bottom-2 left-0 w-full"
                height="8"
                viewBox="0 0 200 8"
                fill="none"
              >
                <path
                  d="M0 4C50 0 150 8 200 4"
                  stroke={COLORS.accent}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            TODAY!
          </h2>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Get insider admissions strategies that helped 880+ students get into
            their dream schools
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <CheatSheetBenefits />
          </div>

          <div className="lg:col-span-5">
            <div className="relative">
              <div
                className="relative overflow-hidden p-8"
                style={{
                  backgroundColor: COLORS.secondary,
                  clipPath: "polygon(0 0, 100% 0, 100% 95%, 96% 100%, 0 100%)",
                }}
              >
                <div
                  className="absolute top-0 right-0 h-24 w-24 opacity-30"
                  style={{
                    backgroundColor: COLORS.primary,
                    clipPath: "polygon(100% 0, 0 0, 100% 100%)",
                  }}
                />

                <div className="relative">
                  <h3 className="mb-2 text-xl font-bold text-white">
                    Get Instant Access
                  </h3>
                  <p className="mb-6 text-sm text-white/60">
                    Fill out the form below and we&apos;ll email it to you right
                    away
                  </p>

                  <CheatSheetForm />
                </div>
              </div>

              <div
                className="absolute -right-2 -bottom-2 -z-10 h-full w-full opacity-20"
                style={{
                  backgroundColor: COLORS.secondary,
                  clipPath: "polygon(0 0, 100% 0, 100% 95%, 96% 100%, 0 100%)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom decorative element */}
      <div
        className="absolute right-0 bottom-0 h-40 w-40 opacity-10"
        style={{
          backgroundColor: COLORS.primary,
          clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
        }}
      />
    </section>
  );
}
