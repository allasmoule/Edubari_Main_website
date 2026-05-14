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
    <section className="relative w-full overflow-hidden bg-white pt-24 pb-16 sm:pt-32 sm:pb-24">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-[120px] opacity-40" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-100 rounded-full blur-[120px] opacity-40" />
      </div>

      <div className="relative px-6 sm:px-12 lg:px-24 z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-widest uppercase mb-8 shadow-sm border border-blue-100/50">
            ✍️ INSIGHTS & STORIES
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-[#1E293B] leading-tight mb-6">
            Explore the Future of <span className="text-[#3B42F2]">Education</span>
          </h1>

          <p className="text-[#64748B] font-medium text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
            Stay updated with the latest trends, tips, and success stories in modern education management.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative group">
              <div className="absolute inset-0 bg-[#3B42F2]/10 rounded-[32px] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center bg-white border-2 border-slate-100 rounded-[28px] shadow-2xl shadow-slate-200/50 focus-within:border-[#3B42F2] transition-all duration-300 p-2">
                <div className="pl-6 pr-4">
                  <FiSearch className="h-6 w-6 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search articles, topics, or authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-4 bg-transparent text-[#1E293B] font-semibold placeholder:text-slate-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mr-2 p-3 rounded-full hover:bg-slate-50 text-slate-400 hover:text-[#1E293B] transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <button className="bg-[#1E293B] text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-[#3B42F2] transition-all hidden sm:block">
                  SEARCH
                </button>
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-3 rounded-2xl text-sm font-black transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-[#3B42F2] text-white shadow-xl shadow-blue-200"
                    : "bg-white text-[#64748B] border-2 border-slate-100 hover:border-[#3B42F2] hover:text-[#3B42F2] hover:-translate-y-1"
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
