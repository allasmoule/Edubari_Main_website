import React, { useEffect, useMemo, useState } from "react";
import BlogHero from "./BlogComponents/BlogHero";
import BlogGrid from "./BlogComponents/BlogGrid";
import BlogSidebar from "./BlogComponents/BlogSidebar";

const API_URL = import.meta.env.VITE_SERVER || "http://localhost:3000";

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
      <section className="w-full px-6 sm:px-12 lg:px-24 py-16 sm:py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-10 rounded-[28px] border-2 border-red-100 bg-red-50 p-6 text-sm font-bold text-red-600 shadow-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Grid */}
            <div className="lg:col-span-8">
              <BlogGrid
                searchQuery={searchQuery}
                activeCategory={activeCategory}
                posts={posts}
                isLoading={isLoading}
              />
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
