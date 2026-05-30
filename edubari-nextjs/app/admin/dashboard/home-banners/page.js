"use client";

import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiX,
  FiImage,
  FiAlertCircle,
  FiLoader,
  FiToggleLeft,
  FiToggleRight,
  FiSearch,
} from "react-icons/fi";

const BannerModal = ({ banner, onSave, onClose, saving }) => {
  const isEdit = !!banner?.id || !!banner?._id;
  const [form, setForm] = useState({
    id: banner?.id || banner?._id || undefined,
    title: banner?.title || "",
    subtitle: banner?.subtitle || "",
    image: banner?.image || "",
    alt: banner?.alt || "",
    order_index: banner?.order_index || banner?.orderIndex || 1,
    active: banner?.active ?? true,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.image.trim()) errs.image = "Image URL is required";
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
      <div className="relative w-full max-w-lg rounded-2xl border border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl p-6 z-10 animate-[fadeInUp_0.3s_ease-out]">
        <div className="flex items-center justify-between pb-4 border-b border-dark/5 mb-5">
          <h3 className="text-base font-bold text-dark">
            {isEdit ? "Edit Banner" : "Create Homepage Banner"}
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
            <label className="block text-xs font-bold text-dark/60 uppercase mb-1.5">Banner Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Modern School Management Platform"
              className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-sm font-medium text-dark outline-none focus:border-tertiary focus:ring-2 focus:ring-tertiary/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-dark/60 uppercase mb-1.5">Subtitle / Description</label>
            <textarea
              rows="2"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="e.g. Elevate your institution into a robust digital hub..."
              className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-sm font-medium text-dark outline-none focus:border-tertiary focus:ring-2 focus:ring-tertiary/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-dark/60 uppercase mb-1.5">Image URL *</label>
            <input
              type="text"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-sm font-medium text-dark outline-none focus:border-tertiary focus:ring-2 focus:ring-tertiary/10 transition-all"
            />
            {errors.image && <p className="text-xs text-red-500 font-semibold mt-1">{errors.image}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-dark/60 uppercase mb-1.5">Alt Text</label>
            <input
              type="text"
              value={form.alt}
              onChange={(e) => setForm({ ...form, alt: e.target.value })}
              placeholder="e.g. School students coding on computers"
              className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-sm font-medium text-dark outline-none focus:border-tertiary focus:ring-2 focus:ring-tertiary/10 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-dark/60 uppercase mb-1.5">Order Index</label>
              <input
                type="number"
                value={form.order_index}
                onChange={(e) => setForm({ ...form, order_index: Number(e.target.value) })}
                className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-sm font-medium text-dark outline-none focus:border-tertiary focus:ring-2 focus:ring-tertiary/10 transition-all"
              />
            </div>
            <div className="flex items-center gap-2.5 pt-6">
              <button
                type="button"
                onClick={() => setForm({ ...form, active: !form.active })}
                className="cursor-pointer bg-transparent border-none p-0 flex items-center"
              >
                {form.active ? (
                  <FiToggleRight className="w-6 h-6 text-emerald-500" />
                ) : (
                  <FiToggleLeft className="w-6 h-6 text-dark/20" />
                )}
              </button>
              <span className="text-xs font-bold text-dark/60">Active Status</span>
            </div>
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
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/banners");
      if (!response.ok) throw new Error("Failed to fetch banners");
      const data = await response.json();
      setBanners(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      setSaving(true);
      const id = formData.id;
      const method = id ? "PATCH" : "POST";
      const url = id ? `/api/banners/${id}` : "/api/banners";

      const payload = {
        title: formData.title,
        subtitle: formData.subtitle,
        image: formData.image,
        alt: formData.alt,
        order_index: formData.order_index,
        active: formData.active,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save banner");
      const saved = await response.json();

      if (id) {
        setBanners((prev) => prev.map((b) => (b.id === id ? saved : b)));
      } else {
        setBanners((prev) => [...prev, saved].sort((a, b) => (a.order_index || 1) - (b.order_index || 1)));
      }

      setShowModal(false);
      setEditingBanner(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save banner");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;

    try {
      const response = await fetch(`/api/banners/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete banner");
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete banner");
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      const response = await fetch(`/api/banners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });
      if (!response.ok) throw new Error("Failed to update active status");
      setBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, active: !currentActive } : b))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-[fadeInUp_0.35s_ease-out]">
      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 sm:p-6 shadow-lg shadow-dark/3">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-dark tracking-tight">
              Homepage Banners
            </h2>
            <p className="text-xs sm:text-sm text-dark/45 font-medium mt-1">
              Add and edit slides displayed in the homepage interactive Ken Burns image carousel.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingBanner({});
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-tertiary to-[#8B5CF6] px-4 py-2.5 text-white text-xs sm:text-sm font-bold shadow-md shadow-tertiary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all border-none cursor-pointer"
          >
            <FiPlus className="w-4 h-4 stroke-[3]" /> Add New Banner
          </button>
        </div>

        {loading && (
          <div className="py-24 text-center">
            <FiLoader className="w-8 h-8 mx-auto text-tertiary animate-spin mb-3" />
            <p className="text-dark/50 font-semibold text-sm">Loading banners...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold px-4 py-3 inline-flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && banners.length === 0 && (
          <div className="py-24 text-center border border-dark/10 bg-white/40 rounded-2xl">
            <FiImage className="w-12 h-12 mx-auto text-dark/20 mb-3" />
            <p className="text-dark/50 font-bold">No Banners Found</p>
          </div>
        )}

        {!loading && !error && banners.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="group rounded-2xl border border-white/40 bg-white/50 hover:bg-white/80 p-5 flex flex-col transition-all duration-300 shadow-md animate-[fadeInUp_0.2s_ease-out]"
              >
                {banner.image && (
                  <div className="h-40 rounded-xl overflow-hidden mb-4 relative bg-dark/5">
                    <img
                      src={banner.image}
                      alt={banner.alt || banner.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-base font-bold text-dark line-clamp-1">{banner.title || "Untitled Banner"}</h3>
                  <p className="text-xs text-dark/45 font-medium mt-1">Order Index: {banner.order_index} | Alt: {banner.alt || "None"}</p>
                  <p className="text-xs text-dark/55 leading-relaxed mt-2 line-clamp-2">{banner.subtitle || "No subtitle available"}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-dark/5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(banner.id, banner.active)}
                    className="flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
                  >
                    {banner.active ? (
                      <FiToggleRight className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <FiToggleLeft className="w-6 h-6 text-dark/20" />
                    )}
                    <span className="text-[11px] font-bold text-dark/45">Visible</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBanner(banner);
                        setShowModal(true);
                      }}
                      className="p-2 rounded-lg border border-dark/10 hover:bg-dark/5 text-dark/65 cursor-pointer bg-transparent"
                    >
                      <FiEdit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(banner.id)}
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
        <BannerModal
          banner={editingBanner}
          saving={saving}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingBanner(null);
          }}
        />
      )}
    </div>
  );
}
