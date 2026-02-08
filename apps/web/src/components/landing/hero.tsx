"use client";

import { useState, useEffect } from "react";
import { COLORS } from "./constants";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const spinningTexts = [
    "Get into your dream school?",
    "Win writing awards?",
    "Land elite summer programs?",
    "Study abroad?",
    "Get into top high schools?",
    "Build a winning portfolio?",
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % spinningTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 96px), 0 100%)",
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

        {/* Subtle animated gradient overlay */}
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

      {/* Geometric Accents */}
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

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          {/* Trust Badge */}
          <div
            className={`mb-8 inline-flex transform items-center gap-2 px-4 py-2 transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              clipPath: "polygon(0 0, 95% 0, 100% 50%, 95% 100%, 0 100%)",
            }}
          >
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-6 w-6 rounded-full border-2 border-[#101D45] bg-linear-to-br from-[#F8DF7F] to-[#FE4300]"
                />
              ))}
            </div>
            <span className="pr-2 text-xs font-medium text-white/90">
              Trusted by 500+ families worldwide
            </span>
          </div>

          {/* Main Heading */}
          <h1
            className={`font-display mb-2 transform text-5xl leading-tight text-white transition-all duration-700 sm:text-6xl lg:text-7xl ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            style={{ transitionDelay: "200ms" }}
          >
            Do you want to:
          </h1>

          {/* Spinning Text Container */}
          <div
            className={`mb-2 h-14 transform overflow-hidden transition-all duration-700 sm:h-16 lg:h-20 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            style={{ transitionDelay: "300ms" }}
          >
            <div className="relative h-full w-full">
              {spinningTexts.map((text, index) => (
                <div
                  key={index}
                  className={`font-display absolute top-0 left-0 w-full text-4xl transition-all duration-700 sm:text-5xl lg:text-6xl ${
                    index === currentIndex
                      ? "translate-y-0 opacity-100"
                      : index ===
                          (currentIndex - 1 + spinningTexts.length) %
                            spinningTexts.length
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

          {/* Subtext */}
          <p
            className={`mb-8 max-w-2xl transform text-lg leading-relaxed font-light text-white/80 transition-all duration-700 sm:text-xl lg:text-2xl ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            style={{ transitionDelay: "400ms" }}
          >
            Learn from the team that has gotten over{" "}
            <span className="font-bold" style={{ color: COLORS.accent }}>
              880 seniors
            </span>{" "}
            into their top 3 choices
          </p>

          {/* CTAs */}
          <div
            className={`mb-12 flex transform flex-wrap gap-4 transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            style={{ transitionDelay: "500ms" }}
          >
            <button
              className="group relative flex items-center gap-3 overflow-hidden px-8 py-4 text-lg font-bold text-white transition-all hover:scale-105"
              style={{
                backgroundColor: COLORS.primary,
                boxShadow:
                  "0 0 30px rgba(254, 67, 0, 0.4), 8px 8px 0px rgba(0, 0, 0, 0.3)",
                clipPath: "polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%)",
              }}
            >
              <span className="relative z-10">Book a Free Consultation</span>
              <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 bg-linear-to-r from-[#FE4300] to-[#ff6b35] opacity-0 transition-opacity group-hover:opacity-100" />
            </button>

            <button
              className="group flex items-center gap-2 border-2 border-white/50 px-8 py-4 text-lg font-bold text-white transition-all hover:border-white hover:bg-white hover:text-[#101D45]"
              style={{
                clipPath: "polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%)",
              }}
            >
              <span>See Success Stories</span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div
            className={`flex transform flex-wrap items-center gap-8 transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            style={{ transitionDelay: "600ms" }}
          >
            <div className="flex items-center gap-2 text-white/60">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">Yale Mentors</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">100% Personalized</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">Proven Results</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div
        className="absolute right-0 bottom-0 left-0 z-10 h-24 bg-[#FDF8F3]"
        style={{ clipPath: "polygon(0 100%, 100% 100%, 0 0, 0 100%)" }}
      />

      {/* Animation Keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
      `}</style>
    </section>
  );
}
