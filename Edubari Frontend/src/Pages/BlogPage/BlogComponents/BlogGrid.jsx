import React, { useMemo } from "react";
import BlogCard from "./BlogCard";
import { FiSearch } from "react-icons/fi";
import { FiLoader } from "react-icons/fi";

const BlogGrid = ({
  searchQuery,
  activeCategory,
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
        post?.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post?.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post?.author?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [posts, searchQuery, activeCategory]);

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-tertiary/8 text-tertiary mb-5">
          <FiLoader className="h-8 w-8 animate-spin" />
        </div>
        <h3 className="text-xl font-bold text-dark">Loading posts...</h3>
      </div>
    );
  }

  if (filteredPosts.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-tertiary/8 text-tertiary mb-5">
          <FiSearch className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-dark">No posts found</h3>
        <p className="mt-2 text-sm text-dark/50 max-w-md mx-auto">
          Try adjusting your search term or selecting a different category
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {filteredPosts.map((post) => (
        <BlogCard
          key={post.id || post._id || post.slug || post.title}
          post={post}
        />
      ))}
    </div>
  );
};

export default BlogGrid;
