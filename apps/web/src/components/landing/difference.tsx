import { GraduationCap } from "lucide-react";
import { COLORS } from "./constants";

export function DifferenceSection() {
  const differences = [
    {
      title: "We're friends, not consultants",
      description:
        "Many of our students who begin in middle school stick with us throughout their high school years. This is because we envision ourselves as older siblings to our students who will stick around both in good times and tough times.",
    },
    {
      title: "ElevatEd values your time",
      description:
        "We respond to all emails, messages on WeChat, WhatsApp and text within 48 hours. We respond fast!",
    },
    {
      title: "We've done this ourselves",
      description:
        "All ElevatEd tutors are current students or recent graduates from Ivy League universities. It's precisely because we understand how challenging the process can be that we strive to make it easier and more fun for you!",
    },
  ];

  return (
    <section
      id="difference"
      className="relative overflow-hidden bg-[#101D45] py-24"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 h-40 w-40 rotate-45 border-4 border-white" />
        <div className="absolute right-20 bottom-20 h-60 w-60 -rotate-12 border-4 border-white" />
        <div className="absolute top-1/2 left-1/3 h-32 w-32 rotate-12 border-4 border-white" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Left Content */}
          <div>
            <span
              className="mb-4 inline-block px-4 py-1 text-sm font-bold tracking-wider"
              style={{
                backgroundColor: COLORS.white,
                color: COLORS.secondary,
                clipPath: "polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%)",
              }}
            >
              WHY CHOOSE US
            </span>
            <h2 className="font-display mb-8 text-4xl text-white sm:text-5xl">
              The ElevatEd{" "}
              <span style={{ color: COLORS.primary }}>Difference</span>
            </h2>

            <div className="space-y-6">
              {differences.map((diff, index) => (
                <div
                  key={index}
                  className="border-l-4 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10"
                  style={{
                    borderColor: index === 0 ? COLORS.primary : "white",
                  }}
                >
                  <h3 className="font-display mb-2 text-xl text-white">
                    {diff.title}
                  </h3>
                  <p className="leading-relaxed text-white/80">
                    {diff.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Additional Info */}
          <div className="space-y-6">
            <div
              className="relative p-8"
              style={{
                backgroundColor: COLORS.white,
                boxShadow: "8px 8px 0px rgba(0,0,0,0.3)",
                clipPath: "polygon(0 0, 100% 0, 100% 90%, 95% 100%, 0 100%)",
              }}
            >
              <GraduationCap
                className="mb-4 h-12 w-12"
                style={{ color: COLORS.secondary }}
              />
              <p className="text-lg leading-relaxed font-medium text-[#101D45]">
                Whether it's college mentorship or summer program apps, ElevatEd
                students will develop lifelong skills, including time management
                and habit-building along the way.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#FE4300] p-6 text-white">
                <div className="font-display mb-2 text-4xl">350+</div>
                <p className="text-sm opacity-90">Students mentored</p>
              </div>
              <div className="bg-white p-6 text-[#101D45]">
                <div className="font-display mb-2 text-4xl">8</div>
                <p className="text-sm opacity-70">Ivy League schools</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
