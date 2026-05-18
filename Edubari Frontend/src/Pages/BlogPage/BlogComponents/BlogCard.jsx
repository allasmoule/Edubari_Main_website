import React from "react";
import { Link } from "react-router";
import { FiCalendar, FiClock, FiArrowRight } from "react-icons/fi";

const BlogCard = ({ post }) => {
  const postPath = post?.slug || post?._id || "";
  const authorName = post?.author?.name || "Anonymous";

  return (
    <article className="bg-white rounded-[20px] border border-slate-100 overflow-hidden group hover:shadow-[0_15px_30px_rgba(0,0,0,0.02)] transition-all duration-500 mb-4">
      <div className="flex flex-col md:flex-row h-full">
        {/* Image Side */}
        <div className="w-full md:w-[28%] h-48 md:h-auto overflow-hidden relative">
          <Link to={`/blog/${postPath}`} className="block h-full w-full">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          </Link>
          <div className="absolute top-3 left-3">
             <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest shadow-lg">
                {post.category}
             </span>
          </div>
        </div>

        {/* Content Side */}
        <div className="flex-1 p-4 md:p-5 flex flex-col justify-center">
          <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <FiCalendar className="text-blue-600" /> {post.date}
            </span>
            <span className="h-0.5 w-0.5 rounded-full bg-slate-200" />
            <span className="flex items-center gap-1.5">
              <FiClock className="text-blue-600" /> {post.readTime}
            </span>
          </div>

          <Link to={`/blog/${postPath}`}>
            <h3 className="text-base md:text-lg font-black text-[#1E293B] mb-2 leading-tight group-hover:text-[#3B42F2] transition-colors line-clamp-2">
              {post.title}
            </h3>
          </Link>

          <Link to={`/blog/${postPath}`}>
            <p className="text-slate-500 font-bold text-[10px] leading-relaxed line-clamp-2 mb-4 opacity-80">
              {post.excerpt}
            </p>
          </Link>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
            <div className="flex items-center gap-2">
              <img 
                src={`https://ui-avatars.com/api/?name=${authorName}&background=F1F5F9&color=3B42F2`} 
                className="w-6 h-6 rounded-full border border-slate-100" 
                alt={authorName} 
              />
              <span className="text-[9px] font-black text-[#1E293B] uppercase tracking-widest opacity-70">By {authorName}</span>
            </div>
            
            <Link 
              to={`/blog/${postPath}`} 
              className="flex items-center gap-1.5 text-blue-600 font-black text-[9px] uppercase tracking-widest group/link"
            >
              Read More <FiArrowRight className="transition-transform group-hover/link:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
