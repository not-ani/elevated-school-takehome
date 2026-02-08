import { COLORS } from "./constants";
import Image from "next/image";

export function FoundersSection() {
  const founders = [
    {
      name: "Jeffrey Yu",
      role: "COO",
      education: "Yale '23 (Computer Science & East Asian Studies)",
      bio: "Jeff has worked as a software engineering intern at Playstation, worked at Ernst & Young as a tech consultant and served as a Student Ambassador to the Yale Admissions Office. He has also written extensively about college admissions on Quora and taught courses on motivation and leadership while sponsored by the US Embassy in Tokyo.",
      image: "/founders.avif",
    },
    {
      name: "Kevin Zhen",
      role: "CEO",
      education: "Exeter '16, Yale '20 (East Asian Studies)",
      bio: "Kevin is a polyglot, entrepreneur, educator and content creator dedicated to helping youth better express themselves and develop their own initiatives. When he's not working, he loves to breakdance and organize dance workshops for his local community to celebrate hip-hop culture!",
      image: "/founders.avif",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-white py-24">
      {/* Decorative */}
      <div className="absolute top-0 right-0 h-96 w-96 opacity-5">
        <div className="h-full w-full rounded-full border-40 border-[#101D45]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <span
            className="mb-4 inline-block px-4 py-1 text-sm font-bold tracking-wider"
            style={{
              backgroundColor: COLORS.white,
              color: COLORS.secondary,
              clipPath: "polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%)",
            }}
          >
            MEET THE TEAM
          </span>
          <h2
            className="font-display mb-6 text-4xl sm:text-5xl lg:text-6xl"
            style={{ color: COLORS.secondary }}
          >
            The Founders!
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-[#101D45]/80">
            The ElevatEd team is composed of current Ivy League students and
            alums dedicated to guiding the academic, creative, and personal
            journeys of our students.
          </p>
        </div>

        {/* Founders Image */}
        <div className="mb-16">
          <div
            className="relative mx-auto max-w-4xl overflow-hidden"
            style={{
              boxShadow: "12px 12px 0px " + COLORS.secondary,
              clipPath: "polygon(0 0, 100% 0, 100% 95%, 98% 100%, 0 100%)",
            }}
          >
            <Image
              src="/founders.avif"
              alt="Jeffrey Yu and Kevin Zhen - ElevatEd Founders"
              className="h-auto w-full object-cover"
              width={800}
              height={400}
            />
            <div className="absolute right-0 bottom-0 left-0 bg-linear-to-t from-[#101D45] to-transparent p-8">
              <p className="font-display text-2xl text-white">
                Yale Friends, Lifelong Partners
              </p>
            </div>
          </div>
        </div>

        <p className="mx-auto mb-12 max-w-3xl text-center text-lg text-[#101D45]/80">
          In addition to our many writing and admissions services, we want to
          teach you important skills that school forgot to teach!
        </p>

        {/* Founder Cards */}
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          {founders.map((founder, index) => (
            <div
              key={index}
              className="p-8 transition-all duration-300 hover:-translate-y-2"
              style={{
                backgroundColor: COLORS.cream,
                boxShadow: "6px 6px 0px " + COLORS.secondary,
                clipPath: "polygon(0 0, 100% 0, 100% 90%, 95% 100%, 0 100%)",
              }}
            >
              <div className="mb-4 flex items-start gap-4">
                <div
                  className="font-display flex h-16 w-16 items-center justify-center text-2xl text-white"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  {founder.name[0]}
                </div>
                <div>
                  <h3
                    className="font-display text-2xl"
                    style={{ color: COLORS.secondary }}
                  >
                    {founder.name}
                  </h3>
                  <p className="font-bold text-[#FE4300]">{founder.role}</p>
                </div>
              </div>
              <p className="mb-3 text-sm font-medium text-[#101D45]/60">
                {founder.education}
              </p>
              <p className="text-sm leading-relaxed text-[#101D45]/80">
                {founder.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
