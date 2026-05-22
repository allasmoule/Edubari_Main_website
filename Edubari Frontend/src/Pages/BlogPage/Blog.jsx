import React, { useEffect, useMemo, useState } from "react";
import BlogHero from "./BlogComponents/BlogHero";
import BlogGrid from "./BlogComponents/BlogGrid";
import BlogSidebar from "./BlogComponents/BlogSidebar";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const API_URL = import.meta.env.VITE_SERVER || "http://localhost:5000";

const DEFAULT_TAGS = [
  "EdTech",
  "School",
  "Digital Learning",
  "AI",
  "Exam",
  "Students",
  "Teachers",
  "Results",
  "Attendance",
  "Fee",
  "Online Class",
  "Management",
];

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/blogPosts`);
        if (!response.ok) {
          throw new Error("Failed to fetch blog posts");
        }

        const data = await response.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        setError(fetchError.message || "Failed to fetch blog posts");
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

  const categories = useMemo(() => {
    const fromPosts = [
      ...new Set(posts.map((post) => post?.category).filter(Boolean)),
    ];
    return ["All", ...fromPosts];
  }, [posts]);

  const popularTags = useMemo(() => {
    const tagSet = new Set();
    posts.forEach((post) => {
      if (Array.isArray(post?.tags)) {
        post.tags.forEach((tag) => {
          if (typeof tag === "string" && tag.trim()) {
            tagSet.add(tag.trim());
          }
        });
      }
    });

    const tags = [...tagSet];
    return tags.length > 0 ? tags : DEFAULT_TAGS;
  }, [posts]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <BlogHero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categories={categories}
      />

      {/* Content */}
      <section className="w-full px-6 sm:px-12 lg:px-24 py-12 bg-white">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="mb-10 rounded-2xl border border-red-100 bg-red-50 p-6 text-xs font-black text-red-600 shadow-sm uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Main Grid */}
            <div className="lg:col-span-8">
              <BlogGrid
                searchQuery={searchQuery}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                categories={categories}
                posts={posts}
                isLoading={isLoading}
              />

              
              {/* Pagination Placeholder */}
              {!isLoading && posts.length > 0 && (
                <div className="flex justify-center mt-10">
                  <div className="flex items-center gap-1.5">
                    <button className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all text-slate-400">
                      <FiChevronLeft className="text-base" />
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-[#3B42F2] text-white flex items-center justify-center font-black text-xs shadow-md shadow-blue-50">1</button>
                    <button className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all text-slate-400 font-black text-xs">2</button>
                    <button className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all text-slate-400 font-black text-xs">3</button>
                    <span className="px-1.5 text-slate-300 font-black text-xs">...</span>
                    <button className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all text-slate-400 font-black text-xs">12</button>
                    <button className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all text-slate-400">
                      <FiChevronRight className="text-base" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4">
              <BlogSidebar
                setActiveCategory={setActiveCategory}
                setSearchQuery={setSearchQuery}
                posts={posts}
                categories={categories}
                popularTags={popularTags}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
