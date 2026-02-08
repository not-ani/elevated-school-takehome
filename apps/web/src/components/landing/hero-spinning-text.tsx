"use client";

import { COLORS } from "./constants";

const headlineVariants = [
  "Get into your dream school?",
  "Win writing awards?",
  "Land elite summer programs?",
  "Study abroad?",
  "Get into top high schools?",
  "Build a winning portfolio?",
];

type HeroSpinningTextProps = {
  activeHeadlineIndex: number;
  isVisible: boolean;
};

export function HeroSpinningText({
  activeHeadlineIndex,
  isVisible,
}: HeroSpinningTextProps) {
  return (
    <div
      className={`mb-2 h-14 transform overflow-hidden transition-all duration-700 sm:h-16 lg:h-20 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
      style={{ transitionDelay: "300ms" }}
    >
      <div className="relative h-full w-full">
        {headlineVariants.map((text, index) => (
          <div
            key={index}
            className={`font-display absolute top-0 left-0 w-full text-4xl transition-all duration-700 sm:text-5xl lg:text-6xl ${
              index === activeHeadlineIndex
                ? "translate-y-0 opacity-100"
                : index ===
                    (activeHeadlineIndex - 1 + headlineVariants.length) %
                      headlineVariants.length
                  ? "-translate-y-full opacity-0"
                  : "translate-y-full opacity-0"
            }`}
            style={{
              color: COLORS.primary,
              textShadow: "0 0 40px rgba(254, 67, 0, 0.3)",
            }}
          >
            <span className="inline-flex items-center gap-2">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
