"use client";

export function HeroAnimations() {
  return (
    <style>{`
      @keyframes float {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(30px, -30px) scale(1.1); }
      }
    `}</style>
  );
}
