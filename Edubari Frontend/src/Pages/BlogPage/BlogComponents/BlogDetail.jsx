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
        .catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  if (isLoading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-slate-100 border-t-[#3B42F2] rounded-full animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Article...</p>
        </div>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="max-w-md text-center">
          <div className="text-8xl mb-8">📄</div>
          <h2 className="text-3xl font-black text-[#1E293B] mb-4">Post Not Found</h2>
          <p className="text-[#64748B] font-medium mb-10">
            {error || "The article you're looking for doesn't exist or has been removed."}
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#3B42F2] text-white font-black text-sm shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all"
          >
            <FiArrowLeft className="h-4 w-4" />
            BACK TO BLOG
          </Link>
        </div>
      </section>
    );
  }

  const renderBody = (body) => {
    const lines = body.trim().split("\n");
    const elements = [];
    let listItems = [];
    let orderedItems = [];

    const flushUnorderedList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`} className="my-8 space-y-4">
            {listItems.map((item, i) => (
              <li key={i} className="flex items-start gap-4 text-[#475569] text-lg leading-relaxed">
                <span className="mt-3 h-2 w-2 rounded-full bg-[#3B42F2] shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    const flushOrderedList = () => {
      if (orderedItems.length > 0) {
        elements.push(
          <ol key={`ol-${elements.length}`} className="my-8 space-y-4">
            {orderedItems.map((item, i) => (
              <li key={i} className="flex items-start gap-4 text-[#475569] text-lg leading-relaxed font-medium">
                <span className="h-8 w-8 rounded-xl bg-blue-50 text-[#3B42F2] flex items-center justify-center text-sm font-black shrink-0">
                  {i + 1}
                </span>
                <span dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
              </li>
            ))}
          </ol>
        );
        orderedItems = [];
      }
    };

    const parseInline = (text) => {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-[#1E293B]">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic text-[#3B42F2]">$1</em>');
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) { flushUnorderedList(); flushOrderedList(); continue; }

      if (line.startsWith("### ")) {
        flushUnorderedList(); flushOrderedList();
        elements.push(<h3 key={`h3-${i}`} className="text-2xl font-black text-[#1E293B] mt-12 mb-6">{line.replace("### ", "")}</h3>);
      } else if (line.startsWith("## ")) {
        flushUnorderedList(); flushOrderedList();
        elements.push(<h2 key={`h2-${i}`} className="text-3xl font-black text-[#1E293B] mt-16 mb-8">{line.replace("## ", "")}</h2>);
      } else if (line.startsWith("> ")) {
        flushUnorderedList(); flushOrderedList();
        elements.push(
          <blockquote key={`bq-${i}`} className="my-10 pl-8 border-l-4 border-[#3B42F2] py-2">
            <p className="text-[#1E293B] text-2xl font-medium leading-relaxed italic opacity-80">
              {line.replace("> ", "").replace(/"/g, "")}
            </p>
          </blockquote>
        );
      } else if (line.startsWith("- ")) {
        flushOrderedList(); listItems.push(line.replace("- ", ""));
      } else if (/^\d+\.\s/.test(line)) {
        flushUnorderedList(); orderedItems.push(line.replace(/^\d+\.\s/, ""));
      } else {
        flushUnorderedList(); flushOrderedList();
        elements.push(<p key={`p-${i}`} className="my-6 text-[#475569] text-lg leading-[1.8] font-medium" dangerouslySetInnerHTML={{ __html: parseInline(line) }} />);
      }
    }

    flushUnorderedList(); flushOrderedList();
    return elements;
  };

  return (
    <article className="min-h-screen bg-white">
      {popup.open && (
        <div className="fixed left-1/2 top-8 z-50 -translate-x-1/2 bg-[#1E293B] text-white px-8 py-4 rounded-2xl shadow-2xl text-sm font-black tracking-widest uppercase animate-slideDown">
          {popup.message}
        </div>
      )}

      {/* Hero Header */}
      <div className="relative w-full h-[60vh] sm:h-[70vh] overflow-hidden">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-[#1E293B] via-[#1E293B]/40 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end px-6 sm:px-12 lg:px-24 pb-16">
          <div className="max-w-4xl mx-auto w-full">
            <Link to="/blog" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-black uppercase tracking-widest mb-10 hover:bg-white/20 transition-all">
              <FiArrowLeft className="h-4 w-4" />
              BACK TO FEED
            </Link>
            
            <div className="inline-block px-4 py-1.5 rounded-full bg-[#3B42F2] text-white text-[10px] font-black tracking-widest uppercase mb-6 shadow-xl">
              {post.category}
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-8">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-8 text-slate-300">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full border-2 border-white/20 p-0.5">
                   <img src={`https://ui-avatars.com/api/?name=${post.author.name}&background=3B42F2&color=fff`} className="h-full w-full rounded-full object-cover" />
                </div>
                <span className="font-black text-white text-sm">{post.author.name}</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-white/30" />
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                <FiCalendar className="h-4 w-4" />
                {post.date}
              </div>
              <div className="h-1 w-1 rounded-full bg-white/30" />
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                <FiClock className="h-4 w-4" />
                {post.readTime}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 -mt-10 px-6 sm:px-12 lg:px-24 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-50 p-8 sm:p-16">
            {/* Share & Tools */}
            <div className="flex items-center justify-between mb-16 pb-8 border-b border-slate-50">
               <div className="flex items-center gap-4">
                  <button onClick={handleShare} className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#1E293B] hover:bg-[#3B42F2] hover:text-white transition-all">
                    <FiShare2 className="h-5 w-5" />
                  </button>
                  <button onClick={handleCopyLink} className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#1E293B] hover:bg-[#3B42F2] hover:text-white transition-all">
                    <FiCopy className="h-5 w-5" />
                  </button>
               </div>
               <div className="text-slate-400 font-black text-xs uppercase tracking-widest">
                  Reading Time: {post.readTime}
               </div>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg prose-slate max-w-none">
              {renderBody(post.body)}
            </div>

            {/* Author Section */}
            <div className="mt-20 p-10 rounded-[32px] bg-slate-50 flex flex-col sm:flex-row items-center sm:items-start gap-8">
              <div className="h-24 w-24 rounded-full border-4 border-white shadow-xl shrink-0 overflow-hidden">
                 <img src={`https://ui-avatars.com/api/?name=${post.author.name}&background=3B42F2&color=fff`} className="h-full w-full object-cover" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-[#3B42F2] font-black text-[10px] uppercase tracking-widest mb-2">AUTHORED BY</p>
                <h3 className="text-2xl font-black text-[#1E293B] mb-4">{post.author.name}</h3>
                <p className="text-slate-500 font-medium text-lg leading-relaxed">
                  Education technology expert focusing on digital transformation and smart institutional management. Helping schools embrace the future.
                </p>
              </div>
            </div>
          </div>

          {/* Related Stories */}
          {relatedPosts.length > 0 && (
            <div className="mt-24">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-4xl font-black text-[#1E293B]">More Stories</h2>
                <Link to="/blog" className="flex items-center gap-2 text-[#3B42F2] font-black text-xs uppercase tracking-widest group">
                  SEE ALL POSTS <FiArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map((rp) => (
                  <BlogCard key={rp.id || rp._id} post={rp} />
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
