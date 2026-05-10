import React from "react";
import { Link } from "react-router";
import { FiClock, FiArrowRight } from "react-icons/fi";

const categoryColors = {
  Education: { text: "text-tertiary", bg: "bg-tertiary/10" },
  Technology: { text: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10" },
  "Tips & Tricks": { text: "text-[#10B981]", bg: "bg-[#10B981]/10" },
  News: { text: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
  Updates: { text: "text-secondary", bg: "bg-secondary/10" },
};

const BlogCard = ({ post }) => {
  const colors = categoryColors[post.category] || categoryColors.Education;
  const postPath = post?.slug || post?._id || "";
  const authorName = post?.author?.name || "Unknown Author";
  const authorAvatar =
    post?.author?.avatar || authorName.slice(0, 2).toUpperCase();

  return (
    <Link
      to={`/blog/${postPath}`}
      className="group relative flex flex-col rounded-2xl border border-white/40 bg-white/50 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-dark/8 hover:bg-white/80 hover:border-tertiary/20"
    >
      {/* Thumbnail */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-dark/20 to-transparent" />

        {/* Category Badge */}
        <span
          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${colors.text} ${colors.bg} backdrop-blur-sm border border-white/20`}
        >
          {post.category}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col grow p-5 sm:p-6">
        {/* Date & ReadTime */}
        <div className="flex items-center gap-3 text-xs text-dark/45 font-medium">
          <span>{post.date}</span>
          <span className="h-1 w-1 rounded-full bg-dark/20" />
          <span className="flex items-center gap-1">
            <FiClock className="h-3 w-3" />
            {post.readTime}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-3 text-lg font-bold text-dark leading-snug line-clamp-2 group-hover:text-tertiary transition-colors duration-300">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="mt-2.5 text-sm leading-relaxed text-dark/55 line-clamp-3">
          {post.excerpt}
        </p>

        {/* Footer */}
        <div className="mt-auto pt-5 flex items-center justify-between">
          {/* Author */}
          <div className="flex items-center gap-2.5">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-linear-to-br from-tertiary to-[#8B5CF6]`}
            >
              {authorAvatar}
            </div>
            <span className="text-sm font-semibold text-dark/70">
              {authorName}
            </span>
          </div>

          {/* Arrow */}
          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-dark/5 text-dark/40 group-hover:bg-tertiary group-hover:text-white transition-all duration-300">
            <FiArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
