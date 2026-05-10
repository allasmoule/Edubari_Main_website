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
    <div className="min-h-screen bg-linear-to-b from-primary/30 via-white to-primary/20">
      {/* Hero */}
      <BlogHero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categories={categories}
      />

      {/* Content */}
      <section className="w-full px-4 sm:px-6 md:px-12 py-10 sm:py-14">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Grid */}
          <div className="flex-1 min-w-0">
            <BlogGrid
              searchQuery={searchQuery}
              activeCategory={activeCategory}
              posts={posts}
              isLoading={isLoading}
            />
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-[340px] shrink-0">
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
      </section>
    </div>
  );
};

export default Blog;
