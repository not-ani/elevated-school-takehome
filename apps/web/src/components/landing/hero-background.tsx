"use client";

import Image from "next/image";
import { COLORS } from "./constants";

export function HeroBackground() {
  return (
    <div
      className="absolute inset-0 z-0"
      style={{
        clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 48px), 0 100%)",
        overflow: "hidden",
      }}
    >
      <Image
        src="/bg-hero.avif"
        alt="Campus Background"
        className="absolute object-cover"
        style={{
          width: "150%",
          height: "90%",
          objectPosition: "85% center",
          top: "10%",
          left: "-0.2%",
        }}
        width={1200}
        height={800}
      />
      <div className="absolute inset-0 bg-linear-to-r from-[#101D45]/90 via-[#101D45]/70 to-transparent" />

      <div className="absolute inset-0 opacity-30">
        <div
          className="animate-float absolute top-20 left-10 h-96 w-96 rounded-full"
          style={{
            background: `radial-gradient(circle, ${COLORS.primary}40 0%, transparent 70%)`,
            animation: "float 8s ease-in-out infinite",
          }}
        />
        <div
          className="animate-float-delayed absolute right-20 bottom-20 h-80 w-80 rounded-full"
          style={{
            background: `radial-gradient(circle, ${COLORS.accent}30 0%, transparent 70%)`,
            animation: "float 10s ease-in-out infinite reverse",
          }}
        />
      </div>
    </div>
  );
}
