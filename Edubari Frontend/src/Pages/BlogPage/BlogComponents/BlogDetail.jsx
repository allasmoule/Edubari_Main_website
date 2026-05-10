import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router";
import {
  FiArrowLeft,
  FiClock,
  FiCalendar,
  FiUser,
  FiShare2,
  FiCopy,
  FiArrowRight,
} from "react-icons/fi";
import BlogCard from "./BlogCard";

const API_URL = import.meta.env.VITE_SERVER || "http://localhost:3000";

const BlogDetail = () => {
  const { slug } = useParams();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [popup, setPopup] = useState({ open: false, message: "" });

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

  const post = useMemo(
    () => posts.find((p) => p.slug === slug || p._id === slug),
    [posts, slug],
  );

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return posts
      .filter(
        (p) =>
          (p.id || p._id) !== (post.id || post._id) &&
          p.category === post.category,
      )
      .slice(0, 3);
  }, [posts, post]);

  const showPopup = (message) => {
    setPopup({ open: true, message });
    setTimeout(() => setPopup({ open: false, message: "" }), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showPopup("Link copied to clipboard!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: post.title,
          text: post.title,
          url: window.location.href,
        })
        .then(() => showPopup("Shared successfully!"))
        .catch(() => {}); // User cancelled or error
    } else {
      handleCopyLink();
    }
  };

  if (isLoading) {
    return (
      <section className="w-full px-4 sm:px-6 md:px-12 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-dark">Loading post...</h2>
        </div>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="w-full px-4 sm:px-6 md:px-12 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-6xl mb-5">📄</div>
          <h2 className="text-2xl font-bold text-dark">Post Not Found</h2>
          <p className="mt-3 text-dark/50">
            {error ||
              "The article you're looking for doesn't exist or has been removed."}
          </p>
          <Link
            to="/blog"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-tertiary to-[#8B5CF6] text-white text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </div>
      </section>
    );
  }

  // Parse the markdown-like body into sections
  const renderBody = (body) => {
    const lines = body.trim().split("\n");
    const elements = [];
    let listItems = [];
    let orderedItems = [];

    const flushUnorderedList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`} className="my-4 space-y-2 pl-1">
            {listItems.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-dark/70 text-[15px] leading-relaxed"
              >
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-tertiary shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
              </li>
            ))}
          </ul>,
        );
        listItems = [];
      }
    };

    const flushOrderedList = () => {
      if (orderedItems.length > 0) {
        elements.push(
          <ol key={`ol-${elements.length}`} className="my-4 space-y-2 pl-1">
            {orderedItems.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-dark/70 text-[15px] leading-relaxed"
              >
                <span className="mt-0.5 h-6 w-6 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <span dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
              </li>
            ))}
          </ol>,
        );
        orderedItems = [];
      }
    };

    const parseInline = (text) => {
      return text
        .replace(
          /\*\*(.*?)\*\*/g,
          '<strong class="font-semibold text-dark">$1</strong>',
        )
        .replace(/\*(.*?)\*/g, "<em>$1</em>");
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) {
        flushUnorderedList();
        flushOrderedList();
        continue;
      }

      if (line.startsWith("### ")) {
        flushUnorderedList();
        flushOrderedList();
        elements.push(
          <h3 key={`h3-${i}`} className="mt-8 mb-3 text-xl font-bold text-dark">
            {line.replace("### ", "")}
          </h3>,
        );
      } else if (line.startsWith("## ")) {
        flushUnorderedList();
        flushOrderedList();
        elements.push(
          <h2
            key={`h2-${i}`}
            className="mt-10 mb-4 text-2xl font-black text-dark"
          >
            {line.replace("## ", "")}
          </h2>,
        );
      } else if (line.startsWith("> ")) {
        flushUnorderedList();
        flushOrderedList();
        elements.push(
          <blockquote
            key={`bq-${i}`}
            className="my-6 pl-5 border-l-4 border-tertiary/30 py-3 bg-tertiary/5 rounded-r-xl pr-5"
          >
            <p className="text-dark/70 text-[15px] leading-relaxed italic">
              {line.replace("> ", "").replace(/"/g, "").replace(/"/g, "")}
            </p>
          </blockquote>,
        );
      } else if (line.startsWith("- ")) {
        flushOrderedList();
        listItems.push(line.replace("- ", ""));
      } else if (/^\d+\.\s/.test(line)) {
        flushUnorderedList();
        orderedItems.push(line.replace(/^\d+\.\s/, ""));
      } else {
        flushUnorderedList();
        flushOrderedList();
        elements.push(
          <p
            key={`p-${i}`}
            className="my-3 text-dark/70 text-[15px] leading-[1.8]"
            dangerouslySetInnerHTML={{ __html: parseInline(line) }}
          />,
        );
      }
    }

    flushUnorderedList();
    flushOrderedList();

    return elements;
  };

  return (
    <article className="w-full relative">
      {/* Custom Popup */}
      {popup.open && (
        <div className="fixed left-1/2 top-8 z-50 -translate-x-1/2 bg-dark text-white px-6 py-3 rounded-xl shadow-lg text-sm font-semibold animate-fade-in-up">
          {popup.message}
        </div>
      )}
      {/* Hero Image */}
      <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[480px] overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-dark/80 via-dark/30 to-transparent" />

        {/* Back Button */}
        <Link
          to="/blog"
          className="absolute top-6 left-4 sm:left-8 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-white text-sm font-semibold hover:bg-white/25 transition-all duration-300"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        {/* Title Overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 md:px-12 pb-8 sm:pb-10"
          style={{ animation: "slideDown 0.6s ease-out" }}
        >
          <div className="max-w-4xl mx-auto">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold border border-white/20 mb-4">
              {post.category}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight max-w-3xl">
              {post.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Meta & Content */}
      <div className="px-4 sm:px-8 md:px-12 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Meta Bar */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pb-8 border-b border-dark/8">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white bg-linear-to-br from-tertiary to-[#8B5CF6]">
                {post.author.avatar}
              </div>
              <div>
                <p className="text-sm font-bold text-dark">
                  {post.author.name}
                </p>
                <p className="text-xs text-dark/40">Author</p>
              </div>
            </div>

            <div className="h-8 w-px bg-dark/10 hidden sm:block" />

            <div className="flex items-center gap-1.5 text-sm text-dark/50">
              <FiCalendar className="h-3.5 w-3.5" />
              {post.date}
            </div>

            <div className="flex items-center gap-1.5 text-sm text-dark/50">
              <FiClock className="h-3.5 w-3.5" />
              {post.readTime}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dark/5 text-dark/50 text-sm font-medium hover:bg-tertiary/10 hover:text-tertiary transition-all duration-200"
                title="Copy link"
              >
                <FiCopy className="h-3.5 w-3.5" />
                Copy Link
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dark/5 text-dark/50 text-sm font-medium hover:bg-tertiary/10 hover:text-tertiary transition-all duration-200"
                title="Share"
              >
                <FiShare2 className="h-3.5 w-3.5" />
                Share
              </button>
            </div>
          </div>

          {/* Article Body */}
          <div className="py-8 max-w-3xl">{renderBody(post.body)}</div>

          {/* Author Card */}
          <div className="mt-8 rounded-2xl border border-white/40 bg-linear-to-br from-primary/60 to-white/60 backdrop-blur-sm p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-5">
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white bg-linear-to-br from-tertiary to-[#8B5CF6] shrink-0">
              {post.author.avatar}
            </div>
            <div>
              <p className="text-xs font-bold text-tertiary uppercase tracking-wider">
                Written by
              </p>
              <h3 className="mt-1 text-lg font-bold text-dark">
                {post.author.name}
              </h3>
              <p className="mt-2 text-sm text-dark/55 leading-relaxed">
                Passionate about education technology and helping institutions
                embrace digital transformation. Writes about EdTech trends, best
                practices, and product updates.
              </p>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-dark">
                    Related Articles
                  </h2>
                  <p className="mt-1 text-sm text-dark/50">
                    More from {post.category}
                  </p>
                </div>
                <Link
                  to="/blog"
                  className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/60 border border-dark/10 text-sm font-bold text-dark hover:bg-white/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                >
                  All Posts
                  <FiArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {relatedPosts.map((rp) => (
                  <BlogCard key={rp.id} post={rp} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default BlogDetail;
