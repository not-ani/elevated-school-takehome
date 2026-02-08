"use client";

import { COLORS } from "./constants";

const benefits = [
  "Changes to Admissions in 2026: Test scores, interviews, and more.",
  "Key Admissions Concepts: Spikes, Double-Edges, Pyramids and Stamps of Legitimacy",
  "Complete Profiles of 4 Students Accepted to Yale, Brown, Stanford, UPenn and more!",
];

export function CheatSheetBenefits() {
  return (
    <div className="relative">
      <div
        className="relative overflow-hidden p-8 sm:p-10"
        style={{
          backgroundColor: COLORS.white,
          clipPath: "polygon(0 0, 100% 0, 100% 95%, 96% 100%, 0 100%)",
        }}
      >
        <div
          className="absolute top-0 left-0 h-full w-1.5"
          style={{ backgroundColor: COLORS.secondary }}
        />

        <h3
          className="mb-6 text-xl font-bold"
          style={{ color: COLORS.secondary }}
        >
          What You&apos;ll Get Inside:
        </h3>

        <div className="space-y-5">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-4">
              <div
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center"
                style={{ backgroundColor: COLORS.accent }}
              >
                <span
                  className="text-sm font-bold"
                  style={{ color: COLORS.secondary }}
                >
                  {index + 1}
                </span>
              </div>
              <p
                className="text-base leading-relaxed"
                style={{ color: COLORS.secondary }}
              >
                {benefit}
              </p>
            </div>
          ))}
        </div>

        <div
          className="mt-8 flex items-center gap-4 border-t pt-6"
          style={{ borderColor: "rgba(16, 29, 69, 0.1)" }}
        >
          <div className="flex -space-x-3">
            {[1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className="h-10 w-10 rounded-full border-2 border-white"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.primary} 100%)`,
                }}
              />
            ))}
          </div>
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: COLORS.secondary }}
            >
              Join 2,000+ families
            </p>
            <p className="text-xs text-gray-500">
              Already downloaded this guide
            </p>
          </div>
        </div>
      </div>

      <div
        className="absolute -right-3 -bottom-3 -z-10 h-full w-full"
        style={{
          backgroundColor: COLORS.secondary,
          clipPath: "polygon(0 0, 100% 0, 100% 95%, 96% 100%, 0 100%)",
        }}
      />
    </div>
  );
}
