"use client";

import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiX,
  FiCheck,
  FiFileText,
  FiImage,
  FiAlignLeft,
  FiClock,
  FiAlertCircle,
  FiLoader,
  FiToggleLeft,
  FiToggleRight,
  FiSearch,
} from "react-icons/fi";

const BlogModal = ({ post, onSave, onClose, saving }) => {
  const isEdit = !!post?.id || !!post?._id;
  const [form, setForm] = useState({
    id: post?.id || post?._id || undefined,
    title: post?.title || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    cover_image: post?.cover_image || post?.coverImage || "",
    active: post?.active ?? true,
    author_name: post?.author_name || post?.authorName || "Admin",
  });
  const [errors, setErrors] = useState({});

  // Auto-generate slug from title
  const handleTitleChange = (e) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setForm((prev) => ({ ...prev, title, slug }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.slug.trim()) errs.slug = "Slug is required";
    if (!form.excerpt.trim()) errs.excerpt = "Excerpt is required";
    if (!form.content.trim()) errs.content = "Content is required";
    if (!form.cover_image.trim()) errs.cover_image = "Cover image URL is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-dark/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl p-6 z-10 animate-[fadeInUp_0.3s_ease-out]">
        <div className="flex items-center justify-between pb-4 border-b border-dark/5 mb-5">
          <h3 className="text-base font-bold text-dark">
            {isEdit ? "Edit Blog Post" : "Create New Post"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-dark/30 hover:text-dark/65 hover:bg-dark/5 border-none bg-transparent cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-dark/60 uppercase mb-1.5">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={handleTitleChange}
              placeholder="e.g. Navigating Education Technology"
              className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-sm font-medium text-dark outline-none focus:border-tertiary focus:ring-2 focus:ring-tertiary/10 transition-all"
            />
            {errors.title && <p className="text-xs text-red-500 font-semibold mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-dark/60 uppercase mb-1.5">Slug *</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="e.g. navigating-education-technology"
              className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-sm font-medium text-dark outline-none focus:border-tertiary focus:ring-2 focus:ring-tertiary/10 transition-all"
            />
            {errors.slug && <p className="text-xs text-red-500 font-semibold mt-1">{errors.slug}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-dark/60 uppercase mb-1.5">Excerpt *</label>
            <textarea
              rows="2"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="A brief summary of the post..."
              className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-sm font-medium text-dark outline-none focus:border-tertiary focus:ring-2 focus:ring-tertiary/10 transition-all"
            />
            {errors.excerpt && <p className="text-xs text-red-500 font-semibold mt-1">{errors.excerpt}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-dark/60 uppercase mb-1.5">Content (Markdown / HTML) *</label>
            <textarea
              rows="6"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write the full content..."
              className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-sm font-medium text-dark outline-none focus:border-tertiary focus:ring-2 focus:ring-tertiary/10 transition-all font-mono"
            />
            {errors.content && <p className="text-xs text-red-500 font-semibold mt-1">{errors.content}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-dark/60 uppercase mb-1.5">Cover Image URL *</label>
              <input
                type="text"
                value={form.cover_image}
                onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-sm font-medium text-dark outline-none focus:border-tertiary focus:ring-2 focus:ring-tertiary/10 transition-all"
              />
              {errors.cover_image && <p className="text-xs text-red-500 font-semibold mt-1">{errors.cover_image}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-dark/60 uppercase mb-1.5">Author Name</label>
              <input
                type="text"
                value={form.author_name}
                onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                placeholder="Admin"
                className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-sm font-medium text-dark outline-none focus:border-tertiary focus:ring-2 focus:ring-tertiary/10 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setForm({ ...form, active: !form.active })}
              className="cursor-pointer bg-transparent border-none p-0 flex items-center"
            >
              {form.active ? (
                <FiToggleRight className="w-7 h-7 text-emerald-500" />
              ) : (
                <FiToggleLeft className="w-7 h-7 text-dark/25" />
              )}
            </button>
            <span className="text-sm font-semibold text-dark/60">Visible on website</span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark/5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-dark/50 hover:bg-dark/5 border-none bg-transparent cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-tertiary to-[#8B5CF6] text-white text-sm font-bold shadow-md shadow-tertiary/25 hover:shadow-lg hover:-translate-y-0.5 transition-all border-none cursor-pointer disabled:opacity-50"
            >
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function AdminBlogsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/blog-posts");
      if (!response.ok) throw new Error("Failed to fetch blog posts");
      const data = await response.json();
      setPosts(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      setSaving(true);
      const id = formData.id;
      const method = id ? "PATCH" : "POST";
      const url = id ? `/api/blog-posts/${id}` : "/api/blog-posts";

      const payload = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        cover_image: formData.cover_image,
        active: formData.active,
        author_name: formData.author_name,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save post");
      const saved = await response.json();

      if (id) {
        setPosts((prev) => prev.map((p) => (p.id === id ? saved : p)));
      } else {
        setPosts((prev) => [saved, ...prev]);
      }

      setShowModal(false);
      setEditingPost(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const response = await fetch(`/api/blog-posts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete post");
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete post");
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      const response = await fetch(`/api/blog-posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });
      if (!response.ok) throw new Error("Failed to update post");
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, active: !currentActive } : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-[fadeInUp_0.35s_ease-out]">
      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 sm:p-6 shadow-lg shadow-dark/3">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-dark tracking-tight">
              Blog Posts
            </h2>
            <p className="text-xs sm:text-sm text-dark/45 font-medium mt-1">
              Publish news, tutorials, and announcements to the educational community.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingPost({});
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-tertiary to-[#8B5CF6] px-4 py-2.5 text-white text-xs sm:text-sm font-bold shadow-md shadow-tertiary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all border-none cursor-pointer"
          >
            <FiPlus className="w-4 h-4 stroke-[3]" /> Add New Post
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center border border-dark/10 bg-white/60 rounded-xl px-3 py-2 w-full sm:max-w-xs transition-all focus-within:border-tertiary/50 mb-5">
          <FiSearch className="w-4 h-4 text-dark/30 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-medium bg-transparent outline-none text-dark placeholder:text-dark/30 border-none p-0"
          />
        </div>

        {loading && (
          <div className="py-24 text-center">
            <FiLoader className="w-8 h-8 mx-auto text-tertiary animate-spin mb-3" />
            <p className="text-dark/50 font-semibold text-sm">Loading posts...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold px-4 py-3 inline-flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="py-24 text-center border border-dark/10 bg-white/40 rounded-2xl">
            <FiFileText className="w-12 h-12 mx-auto text-dark/20 mb-3" />
            <p className="text-dark/50 font-bold">No Articles Found</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((post) => (
              <div
                key={post.id}
                className="group rounded-2xl border border-white/40 bg-white/50 hover:bg-white/80 p-5 flex flex-col transition-all duration-300 shadow-md"
              >
                {post.cover_image && (
                  <div className="h-40 rounded-xl overflow-hidden mb-4 relative bg-dark/5">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-base font-bold text-dark line-clamp-2">{post.title}</h3>
                  <p className="text-xs text-dark/45 font-medium mt-1">By {post.author_name} | {post.slug}</p>
                  <p className="text-xs text-dark/55 leading-relaxed mt-2 line-clamp-3">{post.excerpt}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-dark/5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(post.id, post.active)}
                    className="flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
                  >
                    {post.active ? (
                      <FiToggleRight className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <FiToggleLeft className="w-6 h-6 text-dark/20" />
                    )}
                    <span className="text-[11px] font-bold text-dark/45">Active</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPost(post);
                        setShowModal(true);
                      }}
                      className="p-2 rounded-lg border border-dark/10 hover:bg-dark/5 text-dark/65 cursor-pointer bg-transparent"
                    >
                      <FiEdit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(post.id)}
                      className="p-2 rounded-lg border border-red-200 hover:bg-red-50 text-red-500 cursor-pointer bg-transparent"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <BlogModal
          post={editingPost}
          saving={saving}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingPost(null);
          }}
        />
      )}
    </div>
  );
}
