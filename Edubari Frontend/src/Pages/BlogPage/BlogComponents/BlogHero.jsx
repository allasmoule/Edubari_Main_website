import React from "react";
import { FiSearch } from "react-icons/fi";

const BlogHero = ({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  categories = ["All"],
}) => {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-primary via-primary-light to-white" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.08),transparent_60%)]" />

      <div className="relative px-4 sm:px-6 md:px-12 pt-12 sm:pt-16 pb-10 sm:pb-14">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold tracking-wide uppercase mb-5">
            ✍️ Our Blog
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-dark leading-[1.1]">
            Insights &{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]">
              Stories
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base lg:text-lg leading-7 text-dark/60 max-w-2xl mx-auto">
            Explore articles on education, technology, and tips to help your
            institution thrive in the digital age
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-linear-to-r from-tertiary/20 to-[#8B5CF6]/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg shadow-dark/5 focus-within:border-tertiary/30 focus-within:shadow-xl focus-within:shadow-tertiary/10 transition-all duration-300">
                <FiSearch className="ml-5 h-5 w-5 text-dark/30 shrink-0" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-4 bg-transparent text-dark text-[15px] placeholder:text-dark/35 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mr-4 p-1.5 rounded-lg hover:bg-dark/5 text-dark/40 hover:text-dark/70 transition-colors duration-200 shrink-0"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${
                  activeCategory === cat
                    ? "bg-linear-to-r from-tertiary to-[#8B5CF6] text-white border-transparent shadow-md shadow-tertiary/25"
                    : "bg-white/50 text-dark/70 border-white/50 hover:bg-white/80 hover:text-dark hover:border-tertiary/20 hover:-translate-y-0.5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogHero;
