import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  FiSearch,
  FiExternalLink,
  FiCalendar,
  FiClock,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { categories } from "../../BlogPage/BlogComponents/blogData";
import { imageUpload } from "../../../Utils/Upload";
import { AuthContext } from "../../../Firebase/AuthContext";

const API_URL = import.meta.env.VITE_SERVER || "http://localhost:3000";

const CATEGORY_OPTIONS = categories.filter((item) => item !== "All");
const READ_TIME_OPTIONS = Array.from(
  { length: 10 },
  (_, index) => `${index + 1} min read`,
);

const toDisplayDate = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const EMPTY_FORM = {
  title: "",
  excerpt: "",
  category: CATEGORY_OPTIONS[0] || "Education",
  authorName: "",
  date: toDisplayDate(new Date()),
  readTime: READ_TIME_OPTIONS[4],
  image: "",
  body: "",
};

const toSlug = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const Blogs = () => {
  const { user } = useContext(AuthContext);
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [requestError, setRequestError] = useState("");

  const getAuthHeaders = async (includeJson = false) => {
    const token = await user?.getIdToken();
    if (!token) {
      throw new Error("Unauthorized access. Please login again.");
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    if (includeJson) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  };

  const loadPosts = async () => {
    setIsLoading(true);
    setRequestError("");

    try {
      const response = await fetch(`${API_URL}/blogPosts`);
      if (!response.ok) {
        throw new Error("Failed to load blog posts");
      }

      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      setRequestError(error.message || "Failed to load blog posts");
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return posts;

    return posts.filter((post) => {
      const haystack = [
        post.title,
        post.excerpt,
        post.category,
        post.author?.name,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [query, posts]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError("");
    setFormOpen(true);
  };

  const openEditModal = (post) => {
    setEditingId(post._id || post.id);
    setFormData({
      title: post.title || "",
      excerpt: post.excerpt || "",
      category: post.category || CATEGORY_OPTIONS[0] || "Education",
      authorName: post.author?.name || "",
      date: toDisplayDate(post.date),
      readTime: READ_TIME_OPTIONS.includes(post.readTime)
        ? post.readTime
        : READ_TIME_OPTIONS[4],
      image: post.image || "",
      body: post.body || "",
    });
    setFormError("");
    setFormOpen(true);
  };

  const closeFormModal = () => {
    setFormOpen(false);
    setFormError("");
  };

  const showSuccess = (text) => {
    setSuccessMessage(text);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleSave = async () => {
    const title = formData.title.trim();
    const excerpt = formData.excerpt.trim();
    const authorName = formData.authorName.trim();
    const category = formData.category.trim();
    const date = formData.date.trim();
    const image = formData.image.trim();
    const body = formData.body.trim();
    const slug = toSlug(title);

    if (
      !title ||
      !excerpt ||
      !authorName ||
      !category ||
      !date ||
      !image ||
      !body
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }

    if (!slug) {
      setFormError("Please provide a valid title.");
      return;
    }

    const slugTaken = posts.some(
      (post) => post.slug === slug && (post._id || post.id) !== editingId,
    );
    if (slugTaken) {
      setFormError("This slug already exists. Use a unique slug.");
      return;
    }

    const payload = {
      slug,
      title,
      excerpt,
      category,
      author: {
        name: authorName,
        avatar: authorName.slice(0, 2).toUpperCase(),
      },
      date: toDisplayDate(date),
      readTime: formData.readTime || READ_TIME_OPTIONS[4],
      image,
      body,
    };

    setIsSaving(true);
    setFormError("");
    setRequestError("");

    try {
      const url = editingId
        ? `${API_URL}/blogPosts/${editingId}`
        : `${API_URL}/blogPosts`;
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: await getAuthHeaders(true),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          editingId ? "Failed to update blog post" : "Failed to add blog post",
        );
      }

      await loadPosts();
      showSuccess(
        editingId
          ? "Blog post updated successfully"
          : "Blog post added successfully",
      );
      closeFormModal();
    } catch (error) {
      setFormError(
        error.message ||
          (editingId
            ? "Failed to update blog post"
            : "Failed to add blog post"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const targetId = deleteTarget._id || deleteTarget.id;
    if (!targetId) {
      setRequestError("Invalid post id");
      return;
    }

    setIsDeleting(true);
    setRequestError("");

    try {
      const response = await fetch(`${API_URL}/blogPosts/${targetId}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to delete blog post");
      }

      setPosts((prev) =>
        prev.filter((post) => (post._id || post.id) !== targetId),
      );
      setDeleteTarget(null);
      showSuccess("Blog post deleted successfully");
    } catch (error) {
      setRequestError(error.message || "Failed to delete blog post");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please select a valid image file.");
      return;
    }

    setUploadingImage(true);
    setFormError("");
    try {
      const uploadedUrl = await imageUpload(file);
      if (!uploadedUrl) {
        throw new Error("Image upload failed. Please try again.");
      }

      setFormData((prev) => ({
        ...prev,
        image: uploadedUrl,
      }));
    } catch (error) {
      setFormError(error.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-6 animate-[fadeInUp_0.35s_ease-out]">
      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 sm:p-6 shadow-lg shadow-dark/3">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-dark tracking-tight">
              Blog Management
            </h2>
            <p className="text-xs sm:text-sm text-dark/45 font-medium mt-1">
              View and manage published blog posts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCreateModal}
              className="px-3 py-2 rounded-xl bg-tertiary text-white text-sm font-semibold hover:bg-tertiary/90 transition-all duration-200 inline-flex items-center gap-2 cursor-pointer"
            >
              <FiPlus className="w-4 h-4" />
              Add Blog
            </button>

            <Link
              to="/blog"
              className="px-3 py-2 rounded-xl border border-dark/10 text-sm font-semibold text-dark/60 hover:bg-dark/5 transition-all duration-200 inline-flex items-center gap-2"
            >
              <FiExternalLink className="w-4 h-4" />
              Open Public Blog
            </Link>
          </div>
        </div>

        {successMessage && (
          <div className="mb-4 text-sm text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200/60 rounded-xl p-3">
            {successMessage}
          </div>
        )}

        {requestError && (
          <div className="mb-4 text-sm text-rose-700 font-semibold bg-rose-50 border border-rose-200/60 rounded-xl p-3">
            {requestError}
          </div>
        )}

        <div className="relative max-w-md mb-5">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/35" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search by title, category, or author"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-dark/10 bg-white/80 text-sm text-dark/80 outline-none focus:ring-2 focus:ring-tertiary/20"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-sm font-semibold text-dark/55">
            Loading blog posts...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-sm font-semibold text-dark/55">
            No blog post matched your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] table-fixed">
              <thead>
                <tr className="text-left text-xs font-bold text-dark/35 uppercase tracking-wider border-b border-dark/5">
                  <th className="py-3.5 px-4 w-14">SL</th>
                  <th className="py-3.5 px-4 w-[34%]">Title</th>
                  <th className="py-3.5 px-4 w-[14%]">Category</th>
                  <th className="py-3.5 px-4 w-[16%]">Author</th>
                  <th className="py-3.5 px-4 w-[16%]">Meta</th>
                  <th className="py-3.5 px-4 w-[20%] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark/5">
                {filteredPosts.map((post, index) => (
                  <tr
                    key={post._id || post.id || post.slug || index}
                    className="hover:bg-dark/2 transition-colors duration-150"
                  >
                    <td className="py-4 px-4 text-sm font-semibold text-dark/60">
                      {index + 1}
                    </td>
                    <td className="py-4 px-4">
                      <div className="max-w-140">
                        <p className="text-sm font-semibold text-dark/80 line-clamp-1">
                          {post.title}
                        </p>
                        <p className="text-xs text-dark/45 mt-1 line-clamp-2">
                          {post.excerpt}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold bg-tertiary/10 text-tertiary">
                        {post.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm font-semibold text-dark/70">
                      {post.author?.name || "Unknown"}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-xs font-semibold text-dark/45 flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1.5 leading-none">
                          <FiCalendar className="w-3.5 h-3.5" />
                          {post.date}
                        </span>
                        <span className="inline-flex items-center gap-1.5 leading-none">
                          <FiClock className="w-3.5 h-3.5" />
                          {post.readTime}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(post)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-700 border border-amber-200 hover:bg-amber-50 transition-colors duration-150 cursor-pointer"
                        >
                          <FiEdit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(post)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-700 border border-rose-200 hover:bg-rose-50 transition-colors duration-150 cursor-pointer"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>

                        <Link
                          to={`/blog/${post.slug || post._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-dark/70 border border-dark/10 hover:bg-dark/5 transition-colors duration-150"
                        >
                          <FiExternalLink className="w-3.5 h-3.5" />
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-dark/45 backdrop-blur-sm"
            onClick={closeFormModal}
            aria-label="Close blog form"
          />

          <div className="relative w-full max-w-2xl rounded-2xl border border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl shadow-dark/10 p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-dark">
                {editingId ? "Update Blog" : "Add Blog"}
              </h3>
              <button
                type="button"
                onClick={closeFormModal}
                className="p-2 rounded-lg text-dark/45 hover:bg-dark/5 transition-colors duration-150"
                aria-label="Close"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 text-sm text-rose-700 font-semibold bg-rose-50 border border-rose-200/60 rounded-xl p-3">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-dark/45 uppercase tracking-wide mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-dark/10 bg-white/90 px-3 py-2.5 text-sm text-dark/80 outline-none focus:ring-2 focus:ring-tertiary/20"
                  placeholder="Enter blog title"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-dark/45 uppercase tracking-wide mb-1.5">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-dark/10 bg-white/90 px-3 py-2.5 text-sm text-dark/80 outline-none focus:ring-2 focus:ring-tertiary/20"
                >
                  {CATEGORY_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-dark/45 uppercase tracking-wide mb-1.5">
                  Author Name
                </label>
                <input
                  type="text"
                  value={formData.authorName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      authorName: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-dark/10 bg-white/90 px-3 py-2.5 text-sm text-dark/80 outline-none focus:ring-2 focus:ring-tertiary/20"
                  placeholder="Author"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-dark/45 uppercase tracking-wide mb-1.5">
                  Date
                </label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-dark/10 bg-white/90 px-3 py-2.5 text-sm text-dark/80 outline-none focus:ring-2 focus:ring-tertiary/20"
                  placeholder="Mar 12, 2026"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-dark/45 uppercase tracking-wide mb-1.5">
                  Read Time
                </label>
                <select
                  value={formData.readTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      readTime: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-dark/10 bg-white/90 px-3 py-2.5 text-sm text-dark/80 outline-none focus:ring-2 focus:ring-tertiary/20"
                >
                  {READ_TIME_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-dark/45 uppercase tracking-wide mb-1.5">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="w-full rounded-xl border border-dark/10 bg-white/90 px-3 py-2 text-sm text-dark/70 outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-tertiary/10 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-tertiary hover:file:bg-tertiary/15"
                />
                {uploadingImage && (
                  <p className="mt-1.5 text-xs font-semibold text-dark/55">
                    Uploading image...
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-dark/45 uppercase tracking-wide mb-1.5">
                  Or Image URL
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      image: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-dark/10 bg-white/90 px-3 py-2.5 text-sm text-dark/80 outline-none focus:ring-2 focus:ring-tertiary/20"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              {formData.image && (
                <div className="sm:col-span-2 rounded-xl border border-dark/10 bg-white/80 p-3">
                  <p className="text-xs font-bold text-dark/45 uppercase tracking-wide mb-2">
                    Image Preview
                  </p>
                  <img
                    src={formData.image}
                    alt="Blog preview"
                    className="w-full max-h-52 object-cover rounded-lg border border-dark/10"
                  />
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-dark/45 uppercase tracking-wide mb-1.5">
                  Excerpt
                </label>
                <textarea
                  rows={4}
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      excerpt: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-dark/10 bg-white/90 px-3 py-2.5 text-sm text-dark/80 outline-none focus:ring-2 focus:ring-tertiary/20"
                  placeholder="Short summary of the blog"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-dark/45 uppercase tracking-wide mb-1.5">
                  Body (Markdown)
                </label>
                <textarea
                  rows={10}
                  value={formData.body}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      body: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-dark/10 bg-white/90 px-3 py-2.5 text-sm text-dark/80 outline-none focus:ring-2 focus:ring-tertiary/20"
                  placeholder="Write full blog content in markdown format"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={closeFormModal}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-dark/60 hover:bg-dark/5 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || uploadingImage}
                className="px-4 py-2 rounded-xl bg-tertiary text-white text-sm font-bold hover:bg-tertiary/90 transition-all duration-200 inline-flex items-center gap-2"
              >
                {isSaving
                  ? "Saving..."
                  : `${editingId ? "Update" : "Add"} Blog`}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-dark/45 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
            aria-label="Close delete dialog"
          />

          <div className="relative w-full max-w-md rounded-2xl border border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl shadow-dark/10 p-5 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-dark">
              Delete Blog
            </h3>
            <p className="mt-2 text-sm text-dark/60">
              Are you sure you want to delete
              <span className="font-semibold text-dark">
                {" "}
                {deleteTarget.title}
              </span>
              ?
            </p>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-dark/60 hover:bg-dark/5 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 transition-all duration-200"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blogs;
