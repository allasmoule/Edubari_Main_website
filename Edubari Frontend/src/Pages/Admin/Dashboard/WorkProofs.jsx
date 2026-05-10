import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiLoader,
  FiRefreshCw,
  FiTag,
  FiLink,
  FiFileText,
  FiX,
  FiCheckCircle,
} from "react-icons/fi";
import { AuthContext } from "../../../Firebase/AuthContext";

const API_URL = import.meta.env.VITE_SERVER || "http://localhost:3000";

const initialForm = {
  title: "",
  type: "",
  category: "",
  link: "",
  featuresText: "",
  description: "",
};

const toFormState = (item) => ({
  title: item?.title || "",
  type: item?.type || "",
  category: item?.category || "",
  link: item?.link || "",
  featuresText: Array.isArray(item?.features) ? item.features.join("\n") : "",
  description: item?.description || "",
});

const toPayload = (form) => ({
  title: form.title.trim(),
  type: form.type.trim(),
  category: form.category.trim(),
  link: form.link.trim() || "#",
  features: form.featuresText
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean),
  description: form.description.trim(),
});

const WorkProofModal = ({
  open,
  onClose,
  onSubmit,
  form,
  setForm,
  saving,
  isEdit,
}) => {
  const [featureInput, setFeatureInput] = useState("");

  if (!open) return null;

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const features = form.featuresText
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);

  const addFeature = () => {
    const nextFeature = featureInput.trim();
    if (!nextFeature) return;
    if (features.includes(nextFeature)) return;

    const nextFeatures = [...features, nextFeature];
    handleChange("featuresText", nextFeatures.join("\n"));
    setFeatureInput("");
  };

  const removeFeature = (indexToRemove) => {
    const nextFeatures = features.filter((_, idx) => idx !== indexToRemove);
    handleChange("featuresText", nextFeatures.join("\n"));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        className="absolute inset-0 bg-dark/45 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close work proof form"
      />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl shadow-dark/10 animate-[fadeInUp_0.25s_ease-out]">
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-dark/5 bg-white/90 backdrop-blur-lg rounded-t-2xl">
          <h3 className="text-base sm:text-lg font-bold text-dark">
            {isEdit ? "Edit Work Proof" : "Add Work Proof"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-dark/35 hover:text-dark/60 hover:bg-dark/5 transition-all duration-200 cursor-pointer"
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-dark/65 mb-1.5 block">
                Title *
              </label>
              <div className="relative">
                <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/25" />
                <input
                  required
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-dark/10 bg-white/70 text-sm outline-none focus:border-tertiary/40 focus:ring-2 focus:ring-tertiary/10"
                  placeholder="Project title"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-dark/65 mb-1.5 block">
                Type *
              </label>
              <div className="relative">
                <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/25" />
                <input
                  required
                  value={form.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-dark/10 bg-white/70 text-sm outline-none focus:border-tertiary/40 focus:ring-2 focus:ring-tertiary/10"
                  placeholder="e.g. School Website"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-dark/65 mb-1.5 block">
                Category *
              </label>
              <input
                required
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-dark/10 bg-white/70 text-sm outline-none focus:border-tertiary/40 focus:ring-2 focus:ring-tertiary/10"
                placeholder="LMS / Website / Mobile App"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-dark/65 mb-1.5 block">
                Live Link
              </label>
              <div className="relative">
                <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/25" />
                <input
                  value={form.link}
                  onChange={(e) => handleChange("link", e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-dark/10 bg-white/70 text-sm outline-none focus:border-tertiary/40 focus:ring-2 focus:ring-tertiary/10"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-dark/65 mb-1.5 block">
              Features
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFeature();
                  }
                }}
                className="flex-1 px-3 py-2.5 rounded-xl border border-dark/10 bg-white/70 text-sm outline-none focus:border-tertiary/40 focus:ring-2 focus:ring-tertiary/10"
                placeholder="Type a feature and click Add"
              />
              <button
                type="button"
                onClick={addFeature}
                className="px-4 py-2.5 rounded-xl bg-tertiary/10 text-tertiary text-sm font-bold hover:bg-tertiary/20 transition-all duration-200 cursor-pointer inline-flex items-center gap-1.5"
              >
                <FiPlus className="w-4 h-4" />
                Add
              </button>
            </div>

            {features.length > 0 ? (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {features.map((feature, idx) => (
                  <span
                    key={`${feature}-${idx}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tertiary/8 text-tertiary text-xs font-bold border border-tertiary/10"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(idx)}
                      className="hover:text-red-500 transition-colors duration-150 cursor-pointer"
                      aria-label={`Remove feature ${feature}`}
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-dark/40 font-medium">
                Add features one by one for this work proof.
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-dark/65 mb-1.5 block">
              Description *
            </label>
            <div className="relative">
              <FiFileText className="absolute left-3 top-3 w-4 h-4 text-dark/25" />
              <textarea
                required
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-dark/10 bg-white/70 text-sm outline-none focus:border-tertiary/40 focus:ring-2 focus:ring-tertiary/10"
                rows={4}
                placeholder="Short summary of this work proof"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-dark/5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-dark/50 hover:bg-dark/5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-linear-to-r from-tertiary to-[#8B5CF6] text-white text-sm font-bold hover:shadow-md hover:shadow-tertiary/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const WorkProofs = () => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const getAuthHeaders = async (includeContentType = true) => {
    const token = await user?.getIdToken();
    if (!token) {
      throw new Error("Unauthorized access. Please login again.");
    }

    return {
      ...(includeContentType ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
    };
  };

  const categoryCount = useMemo(() => {
    return items.reduce((acc, item) => {
      const key = item.category || "Uncategorized";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [items]);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/workProof`);
      if (!response.ok) throw new Error("Failed to fetch work proofs");
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load work proofs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleAddClick = () => {
    setEditingId(null);
    setForm(initialForm);
    setOpen(true);
  };

  const handleEditClick = async (id) => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/workProof/${id}`);
      if (!response.ok) throw new Error("Failed to fetch selected work proof");
      const data = await response.json();
      setEditingId(id);
      setForm(toFormState(data));
      setOpen(true);
    } catch (err) {
      alert(err.message || "Could not load work proof");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = toPayload(form);

    if (
      !payload.title ||
      !payload.type ||
      !payload.category ||
      !payload.description
    ) {
      alert("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId
        ? `${API_URL}/workProof/${editingId}`
        : `${API_URL}/workProof`;
      const headers = await getAuthHeaders();

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Request failed");
      }

      setOpen(false);
      setEditingId(null);
      setForm(initialForm);
      await fetchAll();
    } catch (err) {
      alert(err.message || "Failed to save work proof");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this work proof?");
    if (!confirmed) return;

    try {
      const headers = await getAuthHeaders(false);
      const response = await fetch(`${API_URL}/workProof/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete work proof");
      }
      await fetchAll();
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6 animate-[fadeInUp_0.35s_ease-out]">
      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 sm:p-6 shadow-lg shadow-dark/3">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-dark tracking-tight">
              Work Proof Management
            </h2>
            <p className="text-xs sm:text-sm text-dark/45 font-medium mt-1">
              Admin-only CRUD operations for work proofs
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAll}
              className="px-3 py-2 rounded-xl border border-dark/10 text-sm font-semibold text-dark/60 hover:bg-dark/5 transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleAddClick}
              className="px-4 py-2 rounded-xl bg-linear-to-r from-tertiary to-[#8B5CF6] text-white text-sm font-bold shadow-md shadow-tertiary/25 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Add Work Proof
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-14 text-dark/50">
            <FiLoader className="w-5 h-5 animate-spin mr-2" />
            Loading work proofs...
          </div>
        ) : error ? (
          <div className="text-sm text-red-500 font-semibold bg-red-50 border border-red-200/60 rounded-xl p-3">
            {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              <div className="rounded-xl border border-white/40 bg-white/75 p-3">
                <p className="text-xs font-bold text-dark/40">
                  Total Work Proofs
                </p>
                <p className="text-xl font-extrabold text-dark mt-1">
                  {items.length}
                </p>
              </div>
              {Object.entries(categoryCount)
                .slice(0, 3)
                .map(([name, count]) => (
                  <div
                    key={name}
                    className="rounded-xl border border-white/40 bg-white/75 p-3"
                  >
                    <p className="text-xs font-bold text-dark/40 truncate">
                      {name}
                    </p>
                    <p className="text-xl font-extrabold text-dark mt-1">
                      {count}
                    </p>
                  </div>
                ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-180">
                <thead>
                  <tr className="text-left text-xs font-bold text-dark/35 uppercase tracking-wider border-b border-dark/5">
                    <th className="py-3 pl-1">Title</th>
                    <th className="py-3">Category</th>
                    <th className="py-3">Type</th>
                    <th className="py-3">Features</th>
                    <th className="py-3 text-right pr-1">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark/5">
                  {items.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-dark/2 transition-colors duration-150"
                    >
                      <td className="py-3.5 pl-1">
                        <div className="max-w-57.5">
                          <p className="text-sm font-semibold text-dark/80 truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-dark/40 truncate mt-0.5">
                            {item.link || "#"}
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 text-sm text-dark/60 font-medium">
                        {item.category}
                      </td>
                      <td className="py-3.5 text-sm text-dark/60 font-medium">
                        {item.type}
                      </td>
                      <td className="py-3.5 text-sm text-dark/60 font-medium">
                        {Array.isArray(item.features)
                          ? item.features.length
                          : 0}
                      </td>
                      <td className="py-3.5 pr-1">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEditClick(item._id)}
                            className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors duration-150 cursor-pointer"
                            aria-label={`Edit ${item.title}`}
                          >
                            <FiEdit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors duration-150 cursor-pointer"
                            aria-label={`Delete ${item.title}`}
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {items.length === 0 && (
                <div className="text-center py-12">
                  <FiCheckCircle className="w-8 h-8 text-tertiary/60 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-dark/60">
                    No work proofs found
                  </p>
                  <p className="text-xs text-dark/40 mt-1">
                    Create your first entry to get started.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <WorkProofModal
        open={open}
        onClose={() => {
          if (saving) return;
          setOpen(false);
          setEditingId(null);
          setForm(initialForm);
        }}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        saving={saving}
        isEdit={!!editingId}
      />
    </div>
  );
};

export default WorkProofs;
