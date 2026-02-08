"use client";
import { COLORS } from "./constants";

export function SuccessSection() {
  const schools = [
    "Harvard",
    "Yale",
    "Princeton",
    "Columbia",
    "Brown",
    "Dartmouth",
    "Cornell",
    "UPenn",
    "Stanford",
    "MIT",
    "Duke",
    "UChicago",
    "Northwestern",
    "Johns Hopkins",
  ];

  return (
    <section className="relative overflow-hidden bg-[#101D45] py-20">
      {/* Header */}
      <div className="mx-auto mb-12 max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-display mb-4 text-3xl text-white sm:text-4xl lg:text-5xl">
          We've helped more than{" "}
          <span style={{ color: COLORS.primary }}>350+</span> students get into{" "}
          <br />
          all 8 Ivy League Schools and other T20 colleges <br />
          from 2021-2024!
        </h2>
      </div>

      {/* Scrolling Schools */}
      <div className="relative">
        {/* Gradient Overlays */}
        <div className="absolute top-0 bottom-0 left-0 z-10 w-32 bg-linear-to-r from-[#101D45] to-transparent" />
        <div className="absolute top-0 right-0 bottom-0 z-10 w-32 bg-linear-to-l from-[#101D45] to-transparent" />

        {/* Scrolling Container */}
        <div className="flex overflow-hidden">
          <div className="animate-scroll flex gap-8 py-4">
            {[...schools, ...schools].map((school, index) => (
              <div
                key={index}
                className="shrink-0 border border-white/20 bg-white/10 px-8 py-4 backdrop-blur-sm"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 100% 85%, 90% 100%, 0 100%)",
                }}
              >
                <span className="font-display text-xl whitespace-nowrap text-white">
                  {school}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
