"use client";

import { COLORS } from "./constants";

export function HeroGeometricAccents() {
  return (
    <>
      <div
        className="absolute top-20 right-0 h-48 w-48 opacity-10"
        style={{
          backgroundColor: COLORS.accent,
          clipPath: "polygon(100% 0, 0 0, 100% 100%)",
        }}
      />
      <div
        className="absolute bottom-40 left-20 h-32 w-32 opacity-5"
        style={{
          border: `2px solid ${COLORS.white}`,
          transform: "rotate(45deg)",
        }}
      />
    </>
  );
}
