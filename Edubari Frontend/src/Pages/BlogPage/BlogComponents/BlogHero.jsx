import React from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";

const BlogHero = ({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  categories = ["All"],
}) => {
  return (
    <section className="relative w-full pt-20 pb-16 px-6 sm:px-12 lg:px-24 bg-linear-to-b from-[#F5F7FF] to-white overflow-hidden">
      {/* Background Decorations (Dots and 3D illustration) */}
      <div className="absolute top-10 left-10 opacity-20 pointer-events-none hidden md:block">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          ))}
        </div>
      </div>
      
      <div className="absolute top-10 right-20 hidden lg:block animate-bounce-slow opacity-80">
        <div className="relative w-48 h-48">
           <img 
             src="https://img.freepik.com/free-psd/3d-rendering-school-elements_23-2149723555.jpg" 
             className="w-full h-full object-contain relative z-10" 
             alt="Education 3D"
           />
        </div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#1E293B] mb-4">
          Our Latest <span className="text-[#3B42F2]">Blogs & Insights</span>
        </h1>
        <p className="text-slate-500 font-bold text-xs md:text-sm max-w-lg mx-auto mb-8 leading-relaxed opacity-80">
          Discover useful tips, inspiring stories, and expert insights to help schools and institutions grow smarter.
        </p>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto">
          <div className="relative flex-1 w-full group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3B42F2] transition-colors text-sm" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full rounded-xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-50 px-10 py-3 text-xs font-bold text-slate-600 outline-none transition-all focus:ring-2 focus:ring-blue-500/5"
            />
          </div>
          
          <div className="relative w-full sm:w-48 group">
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="w-full appearance-none rounded-xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-50 py-3 pl-4 pr-10 text-xs font-bold text-slate-600 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/5"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogHero;
