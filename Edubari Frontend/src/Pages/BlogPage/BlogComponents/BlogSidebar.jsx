import React, { useState } from "react";
import { Link } from "react-router";
import { FiSend, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const API_URL = import.meta.env.VITE_SERVER || "http://localhost:3000";

const BlogSidebar = ({
  setActiveCategory,
  posts,
  categories,
  popularTags,
  isLoading,
}) => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const getCategoryCount = (cat) => {
    if (cat === "All") return posts.length;
    return posts.filter(p => p.category === cat).length;
  };

  const popularPosts = [...posts].slice(0, 4);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch(`${API_URL}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: "success", message: "Thanks for subscribing!" });
        setEmail("");
      } else {
        setStatus({ type: "error", message: data.error || "Something went wrong" });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Connection error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Categories Section */}
      <div className="bg-white rounded-[20px] p-5 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.01)]">
        <h4 className="text-[10px] font-black text-[#1E293B] uppercase tracking-[0.2em] mb-4 opacity-50">Categories</h4>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-blue-50/50 transition-all group text-left"
            >
              <span className="text-[11px] font-bold text-slate-500 group-hover:text-blue-600 transition-colors">
                {cat === "All" ? "All Categories" : cat}
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-slate-50 text-[8px] font-black text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                {getCategoryCount(cat)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Posts Section */}
      <div className="bg-white rounded-[20px] p-5 border border-slate-100 shadow-[0_10px_30_rgba(0,0,0,0.01)]">
        <h4 className="text-[10px] font-black text-[#1E293B] uppercase tracking-[0.2em] mb-4 opacity-50">Popular Posts</h4>
        <div className="space-y-4">
          {popularPosts.map((post) => (
            <Link 
              key={post._id || post.slug} 
              to={`/blog/${post.slug || post._id}`} 
              className="flex gap-3 group"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                <img 
                  src={post.image} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                  alt={post.title} 
                />
              </div>
              <div>
                <h5 className="text-[10px] font-black text-[#1E293B] leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {post.title}
                </h5>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{post.date}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stay Updated Card */}
      <div className="bg-[#3B42F2] rounded-[24px] p-6 text-white relative overflow-hidden shadow-xl shadow-blue-100">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
             <FiSend className="text-lg" />
          </div>
          <h4 className="text-xl font-black mb-2 leading-tight">Stay Updated</h4>
          <p className="text-white/70 font-bold text-[10px] leading-relaxed mb-6">
            Get the latest insights straight to your inbox.
          </p>
          
          <form onSubmit={handleSubscribe} className="relative">
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address" 
              className="w-full px-4 py-3 rounded-xl bg-white text-slate-800 text-[10px] font-bold outline-none placeholder:text-slate-400"
            />
            <button 
              disabled={submitting}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#3B42F2] flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50"
            >
               {submitting ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSend className="text-xs" />}
            </button>
          </form>

          {status.message && (
            <div className={`mt-4 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${status.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
               {status.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
               {status.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogSidebar;
