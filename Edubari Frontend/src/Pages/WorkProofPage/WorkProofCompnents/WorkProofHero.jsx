import React from "react";
import { FiLayout } from "react-icons/fi";

const WorkProofHero = () => {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background — matching blog/contact hero style */}
      <div className="absolute inset-0 bg-linear-to-br from-primary via-primary-light to-white" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.08),transparent_60%)]" />

      <div className="relative px-4 sm:px-6 md:px-12 pt-12 sm:pt-16 pb-8 sm:pb-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold tracking-wide uppercase mb-5">
            <FiLayout className="h-3.5 w-3.5" />
            Our Portfolio
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-dark leading-[1.1]">
            Our Work{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]">
              Proof
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-base lg:text-lg leading-7 text-dark/60 max-w-2xl mx-auto">
            Explore our portfolio of live projects — websites, apps, and
            management systems built for educational institutions across the
            country.
          </p>

          {/* Decorative Dots */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-tertiary/60" />
            <span className="h-1.5 w-8 rounded-full bg-linear-to-r from-tertiary to-[#8B5CF6]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6]/60" />
          </div>

          {/* Category Filter Pills */}
          {/* <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border cursor-pointer ${
                                    activeCategory === cat
                                        ? "bg-linear-to-r from-tertiary to-[#8B5CF6] text-white border-transparent shadow-md shadow-tertiary/25"
                                        : "bg-white/50 text-dark/70 border-white/50 hover:bg-white/80 hover:text-dark hover:border-tertiary/20 hover:-translate-y-0.5"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div> */}
        </div>
      </div>
    </section>
  );
};

export default WorkProofHero;
