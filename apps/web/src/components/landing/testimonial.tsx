import { Star } from "lucide-react";
import { COLORS } from "./constants";

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "At first, like many others, I thought a life coaching class would be awkward, purposeless, and perhaps even boring since I thought all I would do is talk about myself, but Kevin made it seem like the exact opposite.",
      author: "Shaams Nur",
      title: "Shark Tank Finalist",
      rating: 5,
    },
    {
      quote:
        "ElevatEd was crucial during my college essay drafting process. He was constantly there with great insight into making my big ideas better, and of course, tweaking the small issues to refine the edges.",
      author: "Cory Fan",
      title: "Yale University",
      rating: 5,
    },
    {
      quote:
        "Having worked with ElevatEd, I realized that my essays weren't merely drafts, but rather contained a reflection of my life story. During editing, his suggestions reinforced my main topics.....",
      author: "Cristofer Arrellano",
      title: "Stanford University",
      rating: 5,
    },
    {
      quote:
        "Kevin's mentorship was really helpful and a big reason I got into Harker! He gives good advice in an easygoing manner, encourages passions, and is lighthearted, bringing humor into the conversation without sacrificing efficiency and quality!",
      author: "Jingjing Liang",
      title: "The Harker School",
      rating: 5,
    },
    {
      quote:
        "During Albert's high school application, ElevatEd was instrumental in helping with essays. Kevin's passion to help other students and his unique approach to inspire them really separates him from all the other counseling services.",
      author: "Albert Wu",
      title: "Phillips Exeter Academy",
      rating: 5,
    },
    {
      quote:
        "Kevin is flexible in scheduling and treats everyone equally regardless of skill level or age. He teaches writing as not a task but an art, one where students can peek into the complex layers of literature and transfer that knowledge to stories of our own!",
      author: "Andy Sheng",
      title: "15x Scholastic Award Winner",
      rating: 5,
    },
  ];

  return (
    <section className="relative bg-[#FDF8F3] py-24">
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
            TESTIMONIALS
          </span>
          <h2
            className="font-display text-4xl sm:text-5xl lg:text-6xl"
            style={{ color: COLORS.secondary }}
          >
            Hear What Our Students <br />
            Have To Say!
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-6 transition-all duration-300 hover:-translate-y-1"
              style={{
                boxShadow:
                  "6px 6px 0px " +
                  (index % 2 === 0 ? COLORS.primary : COLORS.secondary),
                clipPath: "polygon(0 0, 100% 0, 100% 95%, 95% 100%, 0 100%)",
              }}
            >
              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-[#F8DF7F] text-[#F8DF7F]"
                  />
                ))}
              </div>

              <p className="mb-6 text-sm leading-relaxed text-[#101D45]/90">
                "{testimonial.quote}"
              </p>

              <div className="border-t-2 border-[#FDF8F3] pt-4">
                <p className="font-bold text-[#101D45]">{testimonial.author}</p>
                <p className="text-sm font-medium text-[#FE4300]">
                  {testimonial.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
