import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router";
import {
  FiArrowLeft,
  FiClock,
  FiCalendar,
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
        if (!response.ok) throw new Error("Failed to fetch blog posts");
        const data = await response.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        setError(fetchError.message);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadPosts();
  }, []);

  const post = useMemo(
    () => posts.find((p) => p.slug === slug || p._id === slug),
    [posts, slug]
  );

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return posts
      .filter((p) => (p.id || p._id) !== (post.id || post._id) && p.category === post.category)
      .slice(0, 3);
  }, [posts, post]);

  const showPopup = (message) => {
    setPopup({ open: true, message });
    setTimeout(() => setPopup({ open: false, message: "" }), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showPopup("Link copied!");
  };

  if (isLoading) return (
    <section className="min-h-screen flex items-center justify-center bg-white">
      <div className="h-10 w-10 border-4 border-slate-100 border-t-[#3B42F2] rounded-full animate-spin" />
    </section>
  );

  if (!post) return (
    <section className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-black text-[#1E293B] mb-4">Post Not Found</h2>
        <Link to="/blog" className="text-[#3B42F2] font-black text-xs uppercase tracking-widest">Back to Blog</Link>
      </div>
    </section>
  );

  const renderBody = (body) => {
    const lines = body.trim().split("\n");
    const elements = [];
    
    const parseInline = (text) => text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-[#1E293B]">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-[#3B42F2]">$1</em>');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.startsWith("### ")) {
        elements.push(<h3 key={i} className="text-xl font-black text-[#1E293B] mt-8 mb-4">{line.replace("### ", "")}</h3>);
      } else if (line.startsWith("## ")) {
        elements.push(<h2 key={i} className="text-2xl font-black text-[#1E293B] mt-10 mb-5">{line.replace("## ", "")}</h2>);
      } else if (line.startsWith("> ")) {
        elements.push(
          <blockquote key={i} className="my-6 pl-6 border-l-4 border-[#3B42F2] py-1 bg-slate-50/50 rounded-r-xl">
            <p className="text-[#1E293B] text-lg font-medium leading-relaxed italic opacity-80">{line.replace("> ", "")}</p>
          </blockquote>
        );
      } else if (line.startsWith("- ")) {
        elements.push(
          <li key={i} className="ml-4 mb-2 text-[#475569] text-sm leading-relaxed flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
            <span dangerouslySetInnerHTML={{ __html: parseInline(line.replace("- ", "")) }} />
          </li>
        );
      } else {
        elements.push(<p key={i} className="my-4 text-[#475569] text-sm md:text-base leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: parseInline(line) }} />);
      }
    }
    return elements;
  };

  return (
    <article className="min-h-screen bg-white">
      {popup.open && (
        <div className="fixed left-1/2 top-8 z-50 -translate-x-1/2 bg-[#1E293B] text-white px-6 py-3 rounded-xl shadow-2xl text-[10px] font-black uppercase tracking-widest animate-slideDown">
          {popup.message}
        </div>
      )}

      {/* Compact Hero Header */}
      <div className="relative w-full h-[40vh] md:h-[45vh] overflow-hidden">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-[#1E293B] via-[#1E293B]/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end px-6 sm:px-12 lg:px-24 pb-10">
          <div className="max-w-3xl mx-auto w-full">
            <Link to="/blog" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] font-black uppercase tracking-widest mb-6 hover:bg-white/20 transition-all">
              <FiArrowLeft /> BACK
            </Link>
            <div className="inline-block px-3 py-1 rounded-md bg-[#3B42F2] text-white text-[8px] font-black tracking-widest uppercase mb-4">{post.category}</div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-6">{post.title}</h1>
            <div className="flex items-center gap-6 text-slate-300 text-[10px] font-bold uppercase tracking-widest">
               <div className="flex items-center gap-2 text-white">
                  <img src={`https://ui-avatars.com/api/?name=${post.author?.name}&background=3B42F2&color=fff`} className="h-6 w-6 rounded-full" />
                  <span>{post.author?.name}</span>
               </div>
               <div className="flex items-center gap-1.5"><FiCalendar /> {post.date}</div>
               <div className="flex items-center gap-1.5"><FiClock /> {post.readTime}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 -mt-6 px-6 sm:px-12 lg:px-24 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-[24px] shadow-xl shadow-slate-100 border border-slate-50 p-6 sm:p-10">
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
               <div className="flex items-center gap-3">
                  <button onClick={handleCopyLink} className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center text-[#1E293B] hover:bg-[#3B42F2] hover:text-white transition-all">
                    <FiCopy className="h-4 w-4" />
                  </button>
               </div>
               <div className="text-slate-400 font-black text-[9px] uppercase tracking-widest">Read: {post.readTime}</div>
            </div>

            {/* Article Body */}
            <div className="max-w-none">
              {renderBody(post.body)}
            </div>

            {/* Compact Author Section */}
            <div className="mt-12 p-6 rounded-[20px] bg-slate-50 flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <img src={`https://ui-avatars.com/api/?name=${post.author?.name}&background=3B42F2&color=fff`} className="h-16 w-16 rounded-full border-2 border-white shadow-lg shrink-0" />
              <div className="text-center sm:text-left">
                <p className="text-[#3B42F2] font-black text-[8px] uppercase tracking-widest mb-1">AUTHOR</p>
                <h3 className="text-lg font-black text-[#1E293B] mb-2">{post.author?.name}</h3>
                <p className="text-slate-500 font-medium text-xs leading-relaxed">Education expert helping institutions digitalize their workflow with Edubari LMS.</p>
              </div>
            </div>
          </div>

          {/* Related Stories */}
          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-[#1E293B]">More Insights</h2>
                <Link to="/blog" className="flex items-center gap-2 text-[#3B42F2] font-black text-[9px] uppercase tracking-widest group">
                  ALL POSTS <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((rp) => (
                  <BlogCard key={rp._id || rp.slug} post={rp} />
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
