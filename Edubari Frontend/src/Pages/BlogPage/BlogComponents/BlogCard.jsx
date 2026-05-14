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
  const postPath = post?.slug || post?._id || "";
  const authorName = post?.author?.name || "Anonymous";
  const authorAvatar = post?.author?.avatar || `https://ui-avatars.com/api/?name=${authorName}&background=3B42F2&color=fff`;

  return (
    <Link
      to={`/blog/${postPath}`}
      className="group flex flex-col bg-white rounded-[40px] border border-slate-50 overflow-hidden transition-all duration-700 hover:-translate-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(59,66,242,0.1)]"
    >
      {/* Thumbnail */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />

        {/* Category Badge */}
        <div className="absolute top-6 left-6">
          <span className="px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-white/90 backdrop-blur-md text-[#3B42F2] shadow-sm">
            {post.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col grow p-8">
        {/* Meta Info */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <FiClock className="h-3.5 w-3.5" />
            <span>{post.readTime}</span>
          </div>
          <div className="h-1 w-1 rounded-full bg-slate-200" />
          <span className="text-xs font-bold text-slate-400">{post.date}</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-black text-[#1E293B] leading-tight mb-4 group-hover:text-[#3B42F2] transition-colors duration-300 line-clamp-2">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-slate-500 font-medium text-sm leading-relaxed line-clamp-3 mb-8">
          {post.excerpt}
        </p>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={authorAvatar} 
              alt={authorName} 
              className="h-8 w-8 rounded-full border border-slate-100 p-0.5"
            />
            <span className="text-sm font-bold text-[#1E293B]">
              {authorName}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[#3B42F2] font-black text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
            READ <FiArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
