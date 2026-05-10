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
    <aside className="space-y-6">
      {/* Recent Posts */}
      <div className="rounded-2xl border border-white/40 bg-white/50 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-lg hover:shadow-dark/5">
        <h3 className="text-lg font-bold text-dark flex items-center gap-2">
          <FiClock className="h-4 w-4 text-tertiary" />
          Recent Posts
        </h3>
        <div className="mt-4 space-y-4">
          {isLoading && recentPosts.length === 0 && (
            <p className="text-sm text-dark/50">Loading recent posts...</p>
          )}
          {recentPosts.map((post) => (
            <Link
              key={post.id || post._id || post.slug || post.title}
              to={`/blog/${post.slug || post._id || ""}`}
              className="group flex gap-3 items-start"
            >
              <img
                src={post.image}
                alt={post.title}
                className="h-14 w-14 rounded-xl object-cover shrink-0 border border-white/30 group-hover:border-tertiary/20 transition-all duration-300"
                loading="lazy"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-dark leading-snug line-clamp-2 group-hover:text-tertiary transition-colors duration-300">
                  {post.title}
                </p>
                <p className="mt-1 text-xs text-dark/40">{post.date}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="rounded-2xl border border-white/40 bg-white/50 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-lg hover:shadow-dark/5">
        <h3 className="text-lg font-bold text-dark flex items-center gap-2">
          <svg
            className="h-4 w-4 text-tertiary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          Categories
        </h3>
        <div className="mt-4 space-y-1.5">
          {categoryCounts.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-dark/70 hover:bg-tertiary/8 hover:text-tertiary transition-all duration-200 group"
            >
              <span>{cat.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-dark/5 text-xs font-semibold text-dark/40 group-hover:bg-tertiary/15 group-hover:text-tertiary transition-all duration-200">
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Tags */}
      <div className="rounded-2xl border border-white/40 bg-white/50 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-lg hover:shadow-dark/5">
        <h3 className="text-lg font-bold text-dark flex items-center gap-2">
          <FiTag className="h-4 w-4 text-tertiary" />
          Popular Tags
        </h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className="px-3 py-1.5 rounded-full bg-dark/5 text-xs font-semibold text-dark/60 hover:bg-tertiary/10 hover:text-tertiary border border-transparent hover:border-tertiary/20 transition-all duration-200"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="rounded-2xl border border-tertiary/20 bg-linear-to-br from-tertiary/8 to-[#8B5CF6]/8 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-lg hover:shadow-tertiary/10">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-9 w-9 rounded-xl bg-linear-to-br from-tertiary to-[#8B5CF6] flex items-center justify-center">
            <FiMail className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-bold text-dark">Newsletter</h3>
        </div>
        <p className="text-sm text-dark/55 leading-relaxed">
          Get the latest articles and updates delivered to your inbox
        </p>
        <form className="mt-4 space-y-2.5" onSubmit={handleSubscribe}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/70 border border-white/50 text-sm text-dark placeholder:text-dark/30 focus:outline-none focus:border-tertiary/30 focus:ring-2 focus:ring-tertiary/10 transition-all duration-300"
            required
          />
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-linear-to-r from-tertiary to-[#8B5CF6] text-white text-sm font-bold shadow-md shadow-tertiary/25 hover:shadow-lg hover:shadow-tertiary/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
          >
            Subscribe
            <FiArrowRight className="h-4 w-4" />
          </button>
        </form>
        {/* Popup Notification */}
        {showPopup && (
          <div
            className="fixed left-1/2 top-8 z-50 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg animate-slideDown text-base font-semibold"
            style={{ minWidth: "260px", textAlign: "center" }}
          >
            {successMsg}
          </div>
        )}
      </div>
    </aside>
  );
};

export default BlogSidebar;
