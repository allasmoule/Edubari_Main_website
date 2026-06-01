"use client";

import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiX,
  FiBriefcase,
  FiImage,
  FiLink,
  FiAlertCircle,
  FiLoader,
  FiToggleLeft,
  FiToggleRight,
  FiSearch,
} from "react-icons/fi";

const WorkProofModal = ({ project, onSave, onClose, saving }) => {
  const isEdit = !!project?.id || !!project?._id;
  const [form, setForm] = useState({
    id: project?.id || project?._id || undefined,
    title: project?.title || "",
    description: project?.description || "",
    image_url: project?.image_url || project?.imageUrl || "",
    client_name: project?.client_name || project?.clientName || "",
    project_url: project?.project_url || project?.projectUrl || "",
    order_index: project?.order_index || project?.orderIndex || 1,
    active: project?.active ?? true,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.image_url.trim()) errs.image_url = "Image URL is required";
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
            {isEdit ? "Edit Work Proof" : "Create Work Proof"}
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
            <label className="block text-xs font-bold text-dark/60 uppercase mb-1.5">Project Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Sunrise Academy Landing Page"
              className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-sm font-medium text-dark outline-none focus:border-tertiary focus:ring-2 focus:ring-tertiary/10 transition-all"
            />
            {errors.title && <p className="text-xs text-red-500 font-semibold mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-dark/60 uppercase mb-1.5">Description</label>
            <textarea
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Clean and premium school administration layout..."
              className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-sm font-medium text-dark outline-none focus:border-tertiary focus:ring-2 focus:ring-tertiary/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-dark/60 uppercase mb-1.5">Image URL *</label>
            <input
              type="text"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-sm font-medium text-dark outline-none focus:border-tertiary focus:ring-2 focus:ring-tertiary/10 transition-all"
            />
            {errors.image_url && <p className="text-xs text-red-500 font-semibold mt-1">{errors.image_url}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-dark/60 uppercase mb-1.5">Client Name</label>
              <input
                type="text"
                value={form.client_name}
                onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                placeholder="Sunrise School"
                className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-sm font-medium text-dark outline-none focus:border-tertiary focus:ring-2 focus:ring-tertiary/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-dark/60 uppercase mb-1.5">Project URL</label>
              <input
                type="text"
                value={form.project_url}
                onChange={(e) => setForm({ ...form, project_url: e.target.value })}
                placeholder="sunrise.edubari.bd"
                className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-sm font-medium text-dark outline-none focus:border-tertiary focus:ring-2 focus:ring-tertiary/10 transition-all"
              />
            </div>
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
              <span className="text-xs font-bold text-dark/60">Visible</span>
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
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function AdminWorkProofsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/work-proofs");
      if (!response.ok) throw new Error("Failed to fetch work proofs");
      const data = await response.json();
      setProjects(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load live examples");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      setSaving(true);
      const id = formData.id;
      const method = id ? "PATCH" : "POST";
      const url = id ? `/api/work-proofs/${id}` : "/api/work-proofs";

      const payload = {
        title: formData.title,
        description: formData.description,
        image_url: formData.image_url,
        client_name: formData.client_name,
        project_url: formData.project_url,
        order_index: formData.order_index,
        active: formData.active,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save work proof");
      const saved = await response.json();

      if (id) {
        setProjects((prev) => prev.map((p) => (p.id === id ? saved : p)));
      } else {
        setProjects((prev) => [...prev, saved].sort((a, b) => (a.order_index || 1) - (b.order_index || 1)));
      }

      setShowModal(false);
      setEditingProject(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this live example?")) return;

    try {
      const response = await fetch(`/api/work-proofs/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete example");
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete example");
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      const response = await fetch(`/api/work-proofs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, active: !currentActive } : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-[fadeInUp_0.35s_ease-out]">
      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 sm:p-6 shadow-lg shadow-dark/3">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-dark tracking-tight">
              Work Proof & Live Sites
            </h2>
            <p className="text-xs sm:text-sm text-dark/45 font-medium mt-1">
              Add and edit school websites we have built that are currently live.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingProject({});
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-tertiary to-[#8B5CF6] px-4 py-2.5 text-white text-xs sm:text-sm font-bold shadow-md shadow-tertiary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all border-none cursor-pointer"
          >
            <FiPlus className="w-4 h-4 stroke-[3]" /> Add New Site
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center border border-dark/10 bg-white/60 rounded-xl px-3 py-2 w-full sm:max-w-xs transition-all focus-within:border-tertiary/50 mb-5">
          <FiSearch className="w-4 h-4 text-dark/30 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search live sites..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-medium bg-transparent outline-none text-dark placeholder:text-dark/30 border-none p-0"
          />
        </div>

        {loading && (
          <div className="py-24 text-center">
            <FiLoader className="w-8 h-8 mx-auto text-tertiary animate-spin mb-3" />
            <p className="text-dark/50 font-semibold text-sm">Loading live sites...</p>
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
            <FiBriefcase className="w-12 h-12 mx-auto text-dark/20 mb-3" />
            <p className="text-dark/50 font-bold">No Sites Found</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((project) => (
              <div
                key={project.id}
                className="group rounded-2xl border border-white/40 bg-white/50 hover:bg-white/80 p-5 flex flex-col transition-all duration-300 shadow-md"
              >
                {project.image_url && (
                  <div className="h-40 rounded-xl overflow-hidden mb-4 relative bg-dark/5">
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-base font-bold text-dark line-clamp-2">{project.title}</h3>
                  <p className="text-xs text-dark/45 font-medium mt-1">Client: {project.client_name || "Unknown"}</p>
                  <p className="text-xs text-dark/55 leading-relaxed mt-2 line-clamp-3">{project.description}</p>
                  {project.project_url && (
                    <a
                      href={`https://${project.project_url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-tertiary font-bold hover:underline flex items-center gap-1.5 mt-3 no-underline"
                    >
                      <FiLink className="w-3.5 h-3.5" /> {project.project_url}
                    </a>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-dark/5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(project.id, project.active)}
                    className="flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
                  >
                    {project.active ? (
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
                        setEditingProject(project);
                        setShowModal(true);
                      }}
                      className="p-2 rounded-lg border border-dark/10 hover:bg-dark/5 text-dark/65 cursor-pointer bg-transparent"
                    >
                      <FiEdit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(project.id)}
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
        <WorkProofModal
          project={editingProject}
          saving={saving}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
}
