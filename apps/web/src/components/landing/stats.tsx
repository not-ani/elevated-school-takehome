import { COLORS } from "./constants";

export function StatsSection() {
  const stats = [
    {
      number: "98%",
      label: "win a writing award after just",
      sublabel: "1 year of private tutoring",
    },
    {
      number: "227+",
      label: "Scholastic Art & Writing Awards across",
      sublabel: "8+ categories",
    },
    {
      number: "96%",
      label: "of our seniors were accepted to their",
      sublabel: "1st, 2nd, or 3rd choice school",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#FDF8F3] py-20">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 h-32 w-32 border-t-4 border-l-4 border-[#FE4300] opacity-30" />
      <div className="absolute right-0 bottom-0 h-48 w-48 border-r-4 border-b-4 border-[#101D45] opacity-20" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative p-8 transition-all duration-300 hover:-translate-y-2"
              style={{
                backgroundColor: "white",
                boxShadow:
                  "8px 8px 0px " +
                  (index === 1 ? COLORS.primary : COLORS.secondary),
                clipPath: "polygon(0 0, 100% 0, 100% 90%, 95% 100%, 0 100%)",
              }}
            >
              <div
                className="font-display mb-4 text-6xl sm:text-7xl"
                style={{
                  color: index === 1 ? COLORS.secondary : COLORS.primary,
                }}
              >
                {stat.number}
              </div>
              <p className="text-lg leading-relaxed font-medium text-[#101D45]">
                {stat.label}
              </p>
              <p className="mt-1 font-semibold text-[#101D45]/70">
                {stat.sublabel}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
