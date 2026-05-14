import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { FiClock, FiTag, FiMail, FiArrowRight } from "react-icons/fi";

const BlogSidebar = ({
  setActiveCategory,
  setSearchQuery,
  posts = [],
  categories = ["All"],
  popularTags = [],
  isLoading = false,
}) => {
  const [email, setEmail] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  // Simple email validation
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (isValidEmail(email)) {
      setSuccessMsg("Subscription successful! Thank you for subscribing.");
      setShowPopup(true);
      setEmail("");
      // Here you could also trigger an API call if needed
    } else {
      setSuccessMsg("");
      setShowPopup(false);
      // Optionally, you could show an error message for invalid email
    }
  };

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  const recentPosts = posts.slice(0, 5);

  const categoryCounts = categories
    .filter((c) => c !== "All")
    .map((cat) => ({
      name: cat,
      count: posts.filter((p) => p.category === cat).length,
    }));

  const handleTagClick = (tag) => {
    setSearchQuery(tag);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <aside className="space-y-10">
      {/* Newsletter */}
      <div className="rounded-[40px] bg-[#1E293B] p-10 overflow-hidden relative shadow-[0_30px_70px_rgba(30,41,59,0.3)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B42F2] rounded-full blur-[80px] opacity-20" />
        
        <div className="relative z-10">
          <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white mb-6 border border-white/10">
            <FiMail className="h-7 w-7" />
          </div>
          <h3 className="text-2xl font-black text-white mb-3">Stay Updated</h3>
          <p className="text-slate-400 font-medium text-sm leading-relaxed mb-8">
            Get the latest articles and trends delivered to your inbox.
          </p>
          
          <form className="space-y-3" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#3B42F2] transition-all"
              required
            />
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-[#3B42F2] text-white font-black text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group/btn shadow-xl shadow-blue-500/20"
            >
              SUBSCRIBE
              <FiArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        {showPopup && (
          <div className="mt-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold text-center">
            {successMsg}
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="rounded-[40px] bg-white border border-slate-50 p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] transition-all duration-500">
        <h3 className="text-xl font-black text-[#1E293B] mb-6 flex items-center gap-2">
          Categories
        </h3>
        <div className="space-y-2">
          {categoryCounts.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-[#3B42F2] transition-all duration-300 group"
            >
              <span>{cat.name}</span>
              <span className="px-3 py-1 rounded-full bg-slate-50 text-[10px] font-black group-hover:bg-[#3B42F2] group-hover:text-white transition-all">
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Posts */}
      <div className="rounded-[40px] bg-white border border-slate-50 p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] transition-all duration-500">
        <h3 className="text-xl font-black text-[#1E293B] mb-6 flex items-center gap-2">
          Recent Posts
        </h3>
        <div className="space-y-6">
          {isLoading && recentPosts.length === 0 && (
            <p className="text-sm text-slate-400 font-medium">Loading posts...</p>
          )}
          {recentPosts.map((post) => (
            <Link
              key={post.id || post._id || post.slug || post.title}
              to={`/blog/${post.slug || post._id || ""}`}
              className="group flex gap-4 items-center"
            >
              <div className="h-16 w-16 rounded-2xl overflow-hidden shrink-0 border border-slate-100">
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-[#1E293B] leading-snug line-clamp-2 group-hover:text-[#3B42F2] transition-colors">
                  {post.title}
                </p>
                <p className="mt-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">{post.date}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular Tags */}
      <div className="rounded-[40px] bg-white border border-slate-50 p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] transition-all duration-500">
        <h3 className="text-xl font-black text-[#1E293B] mb-6 flex items-center gap-2">
          Popular Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className="px-4 py-2 rounded-xl bg-slate-50 text-xs font-black text-slate-500 hover:bg-[#3B42F2] hover:text-white transition-all duration-300"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default BlogSidebar;
