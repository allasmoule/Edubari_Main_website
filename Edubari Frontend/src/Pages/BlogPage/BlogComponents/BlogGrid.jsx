import React, { useMemo } from "react";
import BlogCard from "./BlogCard";
import { FiSearch, FiLoader, FiArrowRight } from "react-icons/fi";
import { Link } from "react-router";

const BlogGrid = ({
  searchQuery,
  activeCategory,
  setActiveCategory,
  categories,
  posts = [],
  isLoading = false,
}) => {
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        activeCategory === "All" || post?.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        post?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post?.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [posts, searchQuery, activeCategory]);

  const featuredPost = useMemo(() => {
    if (activeCategory !== "All" || searchQuery) return null;
    return posts[0];
  }, [posts, activeCategory, searchQuery]);

  const regularPosts = useMemo(() => {
    if (!featuredPost) return filteredPosts;
    return filteredPosts.filter(p => p._id !== featuredPost._id);
  }, [filteredPosts, featuredPost]);

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-50 text-blue-600 mb-4">
          <FiLoader className="h-6 w-6 animate-spin" />
        </div>
        <h3 className="text-lg font-bold text-dark">Loading posts...</h3>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Featured Article */}
      {featuredPost && (
        <div className="mb-10">
          <h4 className="text-[10px] font-black text-[#1E293B] uppercase tracking-[0.2em] mb-4 opacity-50">Featured Article</h4>
          <div className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.02)] group transition-all duration-500">
            <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:w-[50%] h-56 lg:h-auto overflow-hidden">
                <img 
                  src={featuredPost.image} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  alt="Featured" 
                />
              </div>
              <div className="flex-1 p-6 lg:p-8 flex flex-col justify-center">
                <div className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest mb-4 w-fit">
                   {featuredPost.category}
                </div>
                <div className="flex items-center gap-2.5 text-[10px] font-bold text-slate-400 mb-3">
                  <span>{featuredPost.date}</span>
                  <span className="h-0.5 w-0.5 rounded-full bg-slate-300" />
                  <span>5 min read</span>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-[#1E293B] mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                  {featuredPost.title}
                </h3>
                <p className="text-slate-500 font-bold text-xs leading-relaxed mb-6 opacity-80">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-2.5">
                    <img 
                       src={`https://ui-avatars.com/api/?name=${featuredPost.author?.name}&background=3B42F2&color=fff`} 
                       className="w-8 h-8 rounded-full border-2 border-white shadow-md" 
                       alt="Author" 
                    />
                    <span className="text-[10px] font-black text-[#1E293B] uppercase tracking-widest">By {featuredPost.author?.name}</span>
                  </div>
                  <Link 
                    to={`/blog/${featuredPost.slug || featuredPost._id}`} 
                    className="flex items-center gap-1.5 text-blue-600 font-black text-[10px] uppercase tracking-widest"
                  >
                    Read More <FiArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex items-center gap-6 border-b border-slate-100 overflow-x-auto pb-px">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`pb-3 text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${
              activeCategory === cat
                ? "text-blue-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {cat === "All" ? "All Posts" : cat}
            {activeCategory === cat && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full shadow-[0_-1px_6px_rgba(59,66,242,0.3)]" />
            )}
          </button>
        ))}
      </div>

      {/* Regular Articles List */}
      <div className="space-y-4">
        {regularPosts.map((post) => (
          <BlogCard
            key={post._id || post.slug}
            post={post}
          />
        ))}
      </div>
    </div>
  );
};

export default BlogGrid;
