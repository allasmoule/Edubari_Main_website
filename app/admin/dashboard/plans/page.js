"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiX,
  FiCheck,
  FiTag,
  FiDollarSign,
  FiClock,
  FiStar,
  FiToggleLeft,
  FiToggleRight,
  FiUsers,
  FiTrendingUp,
  FiSearch,
  FiFilter,
  FiMoreHorizontal,
  FiCopy,
  FiPackage,
  FiPercent,
  FiAlertCircle,
  FiLoader,
  FiCpu,
  FiLayers,
} from "react-icons/fi";

/* ── Feature input tag helper ── */
const FeatureInput = ({ features, setFeatures }) => {
  const [input, setInput] = useState("");

  const addFeature = () => {
    const trimmed = input.trim();
    if (trimmed && !features.includes(trimmed)) {
      setFeatures([...features, trimmed]);
      setInput("");
    }
  };

  const removeFeature = (idx) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-dark/70 mb-2">
        Features
      </label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && (e.preventDefault(), addFeature())
          }
          placeholder="Type a feature and press Enter"
          className="flex-1 px-4 py-2.5 rounded-xl border border-dark/10 bg-white/60 text-sm font-medium text-dark placeholder:text-dark/30 outline-none focus:border-tertiary/40 focus:ring-2 focus:ring-tertiary/10 transition-all duration-200"
        />
        <button
          type="button"
          onClick={addFeature}
          className="px-4 py-2.5 rounded-xl bg-tertiary/10 text-tertiary text-sm font-bold hover:bg-tertiary/20 transition-all duration-200 cursor-pointer border-none"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {features.map((f, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tertiary/8 text-tertiary text-xs font-bold border border-tertiary/10 animate-[fadeInUp_0.2s_ease-out]"
          >
            {f}
            <button
              type="button"
              onClick={() => removeFeature(idx)}
              className="hover:text-red-500 transition-colors duration-150 cursor-pointer border-none bg-transparent p-0"
            >
              <FiX className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

/* ── Plan Form Modal ── */
const PlanModal = ({ plan, onSave, onClose, saving }) => {
  const isEdit = !!plan?.id || !!plan?._id;
  const [form, setForm] = useState({
    id: plan?.id || plan?._id || undefined,
    name: plan?.name || "",
    durationDays: plan?.durationDays || 30,
    price: plan?.price || "",
    oldPrice: plan?.oldPrice || plan?.old_price || "",
    badge: plan?.badge || "",
    popular: plan?.popular || false,
    active: plan?.active ?? true,
    features: plan?.features || [],
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Plan name is required";
    if (!form.durationDays || form.durationDays < 1)
      errs.durationDays = "Duration must be at least 1 day";
    if (!form.price || Number(form.price) < 0) errs.price = "Price is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const days = Number(form.durationDays);
    const durationLabel =
      days <= 1
        ? "1 day"
        : days <= 30
          ? `${days} days`
          : days <= 90
            ? `${Math.round(days / 30)} months`
            : days <= 365
              ? `${Math.round(days / 30)} months`
              : `${Math.round(days / 365)} year(s)`;

    onSave({
      ...plan,
      ...form,
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      durationDays: days,
      duration: durationLabel,
      badge: form.badge.trim() || null,
    });
  };

  const discountPercent =
    form.oldPrice && form.price
      ? Math.round(((Number(form.oldPrice) - Number(form.price)) / Number(form.oldPrice)) * 100)
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl shadow-dark/10 animate-[fadeInUp_0.3s_ease-out] z-10">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-dark/5 bg-white/90 backdrop-blur-lg rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-tertiary to-[#8B5CF6] flex items-center justify-center shadow-md shadow-tertiary/20">
              {isEdit ? (
                <FiEdit3 className="w-4 h-4 text-white" />
              ) : (
                <FiPlus className="w-4 h-4 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-dark">
                {isEdit ? "Edit Plan" : "Create New Plan"}
              </h3>
              <p className="text-xs text-dark/40 font-medium">
                {isEdit ? "Modify plan details" : "Set up a new subscription plan"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-dark/30 hover:text-dark/60 hover:bg-dark/5 transition-all duration-200 cursor-pointer border-none bg-transparent"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Plan Name */}
          <div>
            <label className="block text-sm font-semibold text-dark/70 mb-2">
              Plan Name *
            </label>
            <div className="relative">
              <FiTag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/25" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Monthly, Quarterly, Annual"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.name ? "border-red-300 bg-red-50/50" : "border-dark/10 bg-white/60"} text-sm font-medium text-dark placeholder:text-dark/30 outline-none focus:border-tertiary/40 focus:ring-2 focus:ring-tertiary/10 transition-all duration-200`}
              />
            </div>
            {errors.name && (
              <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                <FiAlertCircle className="w-3 h-3" /> {errors.name}
              </p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-dark/70 mb-2">
              Duration (days) *
            </label>
            <div className="relative">
              <FiClock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/25" />
              <input
                type="number"
                min="1"
                value={form.durationDays}
                onChange={(e) =>
                  setForm({ ...form, durationDays: e.target.value })
                }
                placeholder="e.g. 30, 180, 365"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.durationDays ? "border-red-300 bg-red-50/50" : "border-dark/10 bg-white/60"} text-sm font-medium text-dark placeholder:text-dark/30 outline-none focus:border-tertiary/40 focus:ring-2 focus:ring-tertiary/10 transition-all duration-200`}
              />
            </div>
            {errors.durationDays && (
              <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                <FiAlertCircle className="w-3 h-3" /> {errors.durationDays}
              </p>
            )}
          </div>

          {/* Price Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark/70 mb-2">
                Price (৳) *
              </label>
              <div className="relative">
                <FiDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/25" />
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="500"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.price ? "border-red-300 bg-red-50/50" : "border-dark/10 bg-white/60"} text-sm font-medium text-dark placeholder:text-dark/30 outline-none focus:border-tertiary/40 focus:ring-2 focus:ring-tertiary/10 transition-all duration-200`}
                />
              </div>
              {errors.price && (
                <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                  <FiAlertCircle className="w-3 h-3" /> {errors.price}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark/70 mb-2">
                Old Price (৳)
              </label>
              <div className="relative">
                <FiDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/25" />
                <input
                  type="number"
                  min="0"
                  value={form.oldPrice}
                  onChange={(e) =>
                    setForm({ ...form, oldPrice: e.target.value })
                  }
                  placeholder="Optional"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-dark/10 bg-white/60 text-sm font-medium text-dark placeholder:text-dark/30 outline-none focus:border-tertiary/40 focus:ring-2 focus:ring-tertiary/10 transition-all duration-200"
                />
              </div>
              {discountPercent > 0 && (
                <p className="mt-1.5 text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <FiPercent className="w-3 h-3" /> {discountPercent}% discount
                </p>
              )}
            </div>
          </div>

          {/* Badge */}
          <div>
            <label className="block text-sm font-semibold text-dark/70 mb-2">
              Badge Label
            </label>
            <input
              type="text"
              value={form.badge}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
              placeholder='e.g. "20% OFF", "Best Value"'
              className="w-full px-4 py-3 rounded-xl border border-dark/10 bg-white/60 text-sm font-medium text-dark placeholder:text-dark/30 outline-none focus:border-tertiary/40 focus:ring-2 focus:ring-tertiary/10 transition-all duration-200"
            />
          </div>

          {/* Features */}
          <FeatureInput
            features={form.features}
            setFeatures={(f) => setForm({ ...form, features: f })}
          />

          {/* Toggles */}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <button
                type="button"
                onClick={() => setForm({ ...form, popular: !form.popular })}
                className="cursor-pointer bg-transparent border-none p-0 flex items-center"
              >
                {form.popular ? (
                  <FiToggleRight className="w-7 h-7 text-tertiary" />
                ) : (
                  <FiToggleLeft className="w-7 h-7 text-dark/25" />
                )}
              </button>
              <span className="text-sm font-semibold text-dark/60 group-hover:text-dark/80 transition-colors">
                Popular
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
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
              <span className="text-sm font-semibold text-dark/60 group-hover:text-dark/80 transition-colors">
                Active
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-dark/5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-dark/50 hover:text-dark/70 hover:bg-dark/5 transition-all duration-200 cursor-pointer border-none bg-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-tertiary to-[#8B5CF6] text-white text-sm font-bold shadow-md shadow-tertiary/25 hover:shadow-lg hover:shadow-tertiary/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <FiLoader className="w-4 h-4 animate-spin" />
                  {isEdit ? "Saving..." : "Creating..."}
                </span>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Plan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Delete Confirmation Modal ── */
const DeleteModal = ({ plan, onConfirm, onClose, saving }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-dark/40 backdrop-blur-sm"
      onClick={onClose}
    />
    <div className="relative w-full max-w-sm rounded-2xl border border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl p-6 text-center animate-[fadeInUp_0.3s_ease-out] z-10">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <FiTrash2 className="w-6 h-6 text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-dark">Delete Plan</h3>
      <p className="mt-2 text-sm text-dark/50 font-medium leading-relaxed">
        Are you sure you want to delete <strong className="text-dark/80">"{plan.name}"</strong>? This action cannot be undone.
      </p>
      {plan.subscribers > 0 && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200/60">
          <p className="text-xs text-amber-700 font-bold flex items-center justify-center gap-1.5">
            <FiAlertCircle className="w-3.5 h-3.5" />
            {plan.subscribers} active subscribers will be affected
          </p>
        </div>
      )}
      <div className="flex items-center gap-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-dark/50 hover:text-dark/70 bg-dark/4 hover:bg-dark/8 transition-all duration-200 cursor-pointer border-none bg-transparent"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={saving}
          className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold shadow-md shadow-red-500/25 hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer border-none disabled:opacity-55"
        >
          {saving ? "Deleting..." : "Delete Plan"}
        </button>
      </div>
    </div>
  </div>
);

/* ── Main Plans Page ── */
export default function AdminPlansPage() {
  const [plans, setPlans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deletingPlan, setDeletingPlan] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, active, inactive
  const [actionMenuId, setActionMenuId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  /* AI Packages State */
  const [activeView, setActiveView] = useState("tenant"); // "tenant" or "ai"
  const [aiPackages, setAiPackages] = useState([]);
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [pkgFormData, setPkgFormData] = useState({
    name: "",
    credits: "",
    price: "",
    validityDays: "30",
    currency: "BDT",
    isActive: true,
    highlight: false,
  });

  /* Fetch plans from API on mount */
  useEffect(() => {
    fetchPlans();
    fetchAiPackages();
  }, []);

  const fetchAiPackages = async () => {
    try {
      const response = await fetch("/api/ai-packages");
      if (!response.ok) throw new Error("Failed to fetch AI packages");
      const data = await response.json();
      setAiPackages(data || []);
    } catch (err) {
      console.error("Error fetching AI packages:", err);
    }
  };

  const handleSavePackage = async (formDataPayload) => {
    try {
      setSaving(true);
      const res = await fetch("/api/ai-packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formDataPayload),
      });

      if (!res.ok) throw new Error("Failed to save package");

      await fetchAiPackages();
      setIsPkgModalOpen(false);
      setEditingPkg(null);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const openEditPackage = (pkg) => {
    setEditingPkg(pkg);
    setPkgFormData({
      name: pkg.name,
      credits: pkg.credits.toString(),
      price: pkg.price.toString(),
      validityDays: pkg.validityDays.toString(),
      currency: pkg.currency || "BDT",
      isActive: pkg.isActive !== false,
      highlight: pkg.highlight || false,
    });
    setIsPkgModalOpen(true);
  };

  const openNewPackage = () => {
    setEditingPkg(null);
    setPkgFormData({
      name: "",
      credits: "",
      price: "",
      validityDays: "30",
      currency: "BDT",
      isActive: true,
      highlight: false,
    });
    setIsPkgModalOpen(true);
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/plans");
      if (!response.ok) throw new Error("Failed to fetch plans");
      const data = await response.json();
      setPlans(data || []);
    } catch (err) {
      console.error("Error fetching plans:", err);
      setError(err.message);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  /* Handlers */
  const handleSave = async (data) => {
    try {
      setSaving(true);
      const planId = data.id || data._id;

      if (planId) {
        // Update existing plan
        const { id, _id, createdAt, subscribers, revenue, ...updateData } = data;
        const response = await fetch(`/api/plans/${planId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Failed to update plan: ${response.status} ${errText}`);
        }

        setPlans((prev) => prev.map((p) => ((p.id === planId || p._id === planId) ? data : p)));
      } else {
        // Create new plan
        const { id, _id, createdAt, subscribers, revenue, ...createData } = data;
        const response = await fetch("/api/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(createData),
        });
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Failed to create plan: ${response.status} ${errText}`);
        }
        const newPlan = await response.json();

        setPlans((prev) => [...prev, {
          ...newPlan,
          subscribers: 0,
          revenue: 0,
        }]);
      }

      setShowModal(false);
      setEditingPlan(null);
    } catch (err) {
      console.error("Error saving plan:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      const planId = deletingPlan.id || deletingPlan._id;
      const response = await fetch(`/api/plans/${planId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to delete plan: ${response.status} ${errText}`);
      }

      setPlans((prev) => prev.filter((p) => (p.id !== planId && p._id !== planId)));
      setDeletingPlan(null);
    } catch (err) {
      console.error("Error deleting plan:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (planId) => {
    try {
      const plan = plans.find((p) => (p.id === planId || p._id === planId));
      if (!plan) return;

      const response = await fetch(`/api/plans/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !plan.active }),
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to toggle active: ${response.status} ${errText}`);
      }

      setPlans((prev) =>
        prev.map((p) => ((p.id === planId || p._id === planId) ? { ...p, active: !p.active } : p))
      );
    } catch (err) {
      console.error("Error toggling active status:", err);
      setError(err.message);
    }
  };

  const handleTogglePopular = async (planId) => {
    try {
      const plan = plans.find((p) => (p.id === planId || p._id === planId));
      if (!plan) return;

      const response = await fetch(`/api/plans/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ popular: !plan.popular }),
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to toggle popular: ${response.status} ${errText}`);
      }

      setPlans((prev) =>
        prev.map((p) => ((p.id === planId || p._id === planId) ? { ...p, popular: !p.popular } : p))
      );
      setActionMenuId(null);
    } catch (err) {
      console.error("Error toggling popular status:", err);
      setError(err.message);
    }
  };

  const handleDuplicate = async (plan) => {
    try {
      setSaving(true);
      const { id, _id, createdAt, subscribers, revenue, ...dupPlanData } = plan;
      const dupPlan = {
        ...dupPlanData,
        name: `${plan.name} (Copy)`,
      };

      const response = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dupPlan),
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to duplicate plan: ${response.status} ${errText}`);
      }
      const newPlan = await response.json();

      setPlans((prev) => [...prev, {
        ...newPlan,
        subscribers: 0,
        revenue: 0,
      }]);
      setActionMenuId(null);
    } catch (err) {
      console.error("Error duplicating plan:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* Derived Stats */
  const subsCount = plans.reduce((s, p) => s + (p.subscribers || 0), 0);
  const revenueSum = plans.reduce((s, p) => s + (p.revenue || 0), 0);
  const activeCount = plans.filter((p) => p.active).length;

  const popularPlan = plans.reduce(
    (best, p) => ((p.subscribers || 0) > (best?.subscribers || 0) ? p : best),
    null
  );

  const filtered = plans
    .filter((p) => {
      if (filter === "active") return p.active;
      if (filter === "inactive") return !p.active;
      return true;
    })
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      {/* Error Alert */}
      {error && (
        <div className="px-5 py-4 rounded-xl bg-red-50 border border-red-200/60 flex items-center gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm font-medium text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-600 transition-colors border-none bg-transparent cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── View Toggle Tabs ─── */}
      <div className="flex p-1 rounded-2xl bg-dark/[0.04] w-max border border-dark/5">
        <button
          type="button"
          onClick={() => setActiveView("tenant")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${
            activeView === "tenant"
              ? "bg-white text-tertiary shadow-sm font-extrabold"
              : "bg-transparent text-dark/50 hover:text-dark/80"
          }`}
        >
          <FiPackage className="w-4 h-4" /> LMS Tenant Plans
        </button>
        <button
          type="button"
          onClick={() => setActiveView("ai")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${
            activeView === "ai"
              ? "bg-white text-tertiary shadow-sm font-extrabold"
              : "bg-transparent text-dark/50 hover:text-dark/80"
          }`}
        >
          <FiCpu className="w-4 h-4" /> AI Credit Add-ons
        </button>
      </div>

      {activeView === "tenant" ? (
        <>
          {/* ─── Summary Stats ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {[
          {
            label: "Total Plans",
            value: plans.length,
            sub: `${activeCount} active`,
            icon: FiPackage,
            gradient: "from-tertiary to-[#6366F1]",
            shadow: "shadow-tertiary/20",
          },
          {
            label: "Total Subscribers",
            value: subsCount.toLocaleString(),
            sub: "Across all plans",
            icon: FiUsers,
            gradient: "from-emerald-500 to-teal-500",
            shadow: "shadow-emerald-500/20",
          },
          {
            label: "Total Revenue",
            value: `৳${revenueSum.toLocaleString()}`,
            sub: "Lifetime earnings",
            icon: FiDollarSign,
            gradient: "from-amber-500 to-orange-500",
            shadow: "shadow-amber-500/20",
          },
          {
            label: "Most Popular",
            value: popularPlan?.name || "—",
            sub: `${popularPlan?.subscribers || 0} subscribers`,
            icon: FiStar,
            gradient: "from-rose-500 to-pink-500",
            shadow: "shadow-rose-500/20",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="group relative rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 sm:p-6 shadow-lg shadow-dark/3 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-lg ${s.shadow} mb-4`}
            >
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-dark/45 font-semibold">{s.label}</p>
            <h3 className="text-2xl font-extrabold text-dark tracking-tight mt-1">
              {s.value}
            </h3>
            <p className="text-xs text-dark/35 font-medium mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ─── Plans Header + Controls ─── */}
      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm shadow-lg shadow-dark/3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 sm:px-6 py-5 border-b border-dark/5">
          <div>
            <h2 className="text-base font-bold text-dark">Subscription Plans</h2>
            <p className="text-xs text-dark/40 font-medium mt-0.5">Manage and configure plans visible to users</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingPlan({});
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-tertiary to-[#8B5CF6] px-4 py-2.5 text-white text-xs sm:text-sm font-bold shadow-md shadow-tertiary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border-none cursor-pointer"
          >
            <FiPlus className="w-4 h-4 stroke-[3]" /> Add New Plan
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 px-5 sm:px-6 py-4 border-b border-dark/5 bg-white/40 backdrop-blur-xs justify-between">
          <div className="flex items-center border border-dark/10 bg-white/60 rounded-xl px-3 py-2 w-full sm:max-w-xs transition-all focus-within:border-tertiary/50">
            <FiSearch className="w-4 h-4 text-dark/30 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search plans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs font-medium bg-transparent outline-none text-dark placeholder:text-dark/30 border-none p-0"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto select-none py-1">
            {["all", "active", "inactive"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
                  filter === f
                    ? "bg-gradient-to-r from-tertiary to-[#8B5CF6] text-white border-transparent shadow-sm shadow-tertiary/20"
                    : "bg-white/60 border-dark/10 text-dark/65 hover:bg-white hover:border-tertiary/20 hover:-translate-y-0.5"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-24 text-center">
            <FiLoader className="w-8 h-8 mx-auto text-tertiary animate-spin mb-3" />
            <p className="text-dark/50 font-semibold text-sm">Loading plans...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <FiPackage className="w-12 h-12 mx-auto text-dark/20 mb-3" />
            <p className="text-dark/50 font-bold">No Plans Found</p>
            <p className="text-xs text-dark/35 mt-1">Try expanding your search or filters.</p>
          </div>
        ) : (
          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((plan) => {
              const planId = plan.id || plan._id;
              const price = plan.price || 0;
              const oldPrice = plan.oldPrice || plan.old_price;
              return (
                <div
                  key={planId}
                  className={`group relative rounded-2xl border p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    plan.popular
                      ? "border-tertiary/30 bg-white/80 shadow-lg shadow-tertiary/5 ring-1 ring-tertiary/10"
                      : "border-white/40 bg-white/50 hover:bg-white/80"
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <span className="absolute -top-2.5 left-6 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-gradient-to-r from-tertiary to-[#8B5CF6] text-white shadow-sm shadow-tertiary/20">
                      {plan.badge}
                    </span>
                  )}

                  {/* Actions Dropdown */}
                  <div className="absolute top-4 right-4 z-20">
                    <button
                      type="button"
                      onClick={() => setActionMenuId(actionMenuId === planId ? null : planId)}
                      className="p-1.5 rounded-lg text-dark/30 hover:text-dark/65 hover:bg-dark/5 transition-all cursor-pointer border-none bg-transparent"
                    >
                      <FiMoreHorizontal className="w-4 h-4" />
                    </button>
                    {actionMenuId === planId && (
                      <div className="absolute right-0 mt-1.5 w-[160px] rounded-xl border border-white/50 bg-white/95 backdrop-blur-xl shadow-xl py-1.5 animate-[fadeInUp_0.15s_ease-out]">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPlan(plan);
                            setShowModal(true);
                            setActionMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-dark/65 hover:bg-dark/5 hover:text-dark transition-all cursor-pointer border-none bg-transparent text-left"
                        >
                          <FiEdit3 className="w-3.5 h-3.5" /> Edit Plan
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(plan)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-dark/65 hover:bg-dark/5 hover:text-dark transition-all cursor-pointer border-none bg-transparent text-left"
                        >
                          <FiCopy className="w-3.5 h-3.5" /> Duplicate
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTogglePopular(planId)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-dark/65 hover:bg-dark/5 hover:text-dark transition-all cursor-pointer border-none bg-transparent text-left"
                        >
                          <FiStar className="w-3.5 h-3.5" /> {plan.popular ? "Unmark Popular" : "Mark Popular"}
                        </button>
                        <div className="h-[1px] bg-dark/5 my-1" />
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingPlan(plan);
                            setActionMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer border-none bg-transparent text-left"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" /> Delete Plan
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 mt-1 pr-6">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-dark">{plan.name}</h3>
                      {!plan.active && (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-dark/10 text-dark/45 tracking-wide uppercase">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-dark/45 font-medium mt-0.5">Duration: {plan.duration}</p>

                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-dark">৳{price.toLocaleString()}</span>
                      {oldPrice && (
                        <span className="text-sm font-semibold text-dark/30 line-through">
                          ৳{typeof oldPrice === "string" ? oldPrice.replace(/[৳,]/g, "") : oldPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-dark/50 leading-relaxed mt-3">{plan.description}</p>
                    {plan.features && plan.features.length > 0 && (
                      <ul className="mt-5 space-y-2">
                        {plan.features.slice(0, 4).map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-dark/65 font-medium">
                            <FiCheck className="w-3.5 h-3.5 text-tertiary shrink-0 mt-0.5 stroke-[3]" />
                            <span className="line-clamp-1">{feat}</span>
                          </li>
                        ))}
                        {plan.features.length > 4 && (
                          <li className="text-[10px] text-tertiary font-bold pl-5">
                            +{plan.features.length - 4} more features
                          </li>
                        )}
                      </ul>
                    )}
                  </div>

                  {/* Toggle Active Bottom */}
                  <div className="mt-6 pt-4 border-t border-dark/5 flex items-center justify-between">
                    <span className="text-xs font-bold text-dark/45">Status</span>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(planId)}
                      className="flex items-center gap-1.5 cursor-pointer text-xs font-bold bg-transparent border-none p-0"
                    >
                      {plan.active ? (
                        <>
                          <span className="text-emerald-600">Active</span>
                          <FiToggleRight className="w-6 h-6 text-emerald-500" />
                        </>
                      ) : (
                        <>
                          <span className="text-dark/35">Inactive</span>
                          <FiToggleLeft className="w-6 h-6 text-dark/20" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
        </>
      ) : (
        /* ─── AI Credit Packages View ─── */
        <div className="space-y-6">
          {/* AI Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Active AI Packages", value: aiPackages.filter(p => p.isActive).length, icon: FiCpu, color: "from-tertiary to-[#8B5CF6]" },
              { label: "Total Managed Tiers", value: aiPackages.length, icon: FiLayers, color: "from-blue-500 to-indigo-500" },
              { label: "Highlighted Package", value: aiPackages.find(p => p.highlight)?.name || "None", icon: FiStar, color: "from-amber-500 to-orange-500" }
            ].map((s, idx) => (
              <div key={idx} className="group relative rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 shadow-lg shadow-dark/3 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg mb-3`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-dark/45 font-semibold">{s.label}</p>
                <h3 className="text-xl font-extrabold text-dark tracking-tight mt-1">{s.value}</h3>
              </div>
            ))}
          </div>

          {/* AI Plans List Header */}
          <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm shadow-lg shadow-dark/3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 sm:px-6 py-5 border-b border-dark/5">
              <div>
                <h2 className="text-base font-bold text-dark">AI Credit Packages</h2>
                <p className="text-xs text-dark/40 font-medium mt-0.5">Manage the add-on AI packages available for school domains</p>
              </div>
              <button
                type="button"
                onClick={openNewPackage}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-tertiary to-[#8B5CF6] px-4 py-2.5 text-white text-xs sm:text-sm font-bold shadow-md shadow-tertiary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border-none cursor-pointer"
              >
                <FiPlus className="w-4 h-4 stroke-[3]" /> Add New AI Plan
              </button>
            </div>

            {/* AI Packages Cards Grid */}
            {aiPackages.length === 0 ? (
              <div className="py-20 text-center">
                <FiCpu className="w-12 h-12 mx-auto text-dark/20 mb-3" />
                <p className="text-dark/50 font-bold">No AI Credit Packages found</p>
                <p className="text-xs text-dark/35 mt-1">Create your first AI package to get started.</p>
              </div>
            ) : (
              <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {aiPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`group relative rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                      pkg.highlight
                        ? "border-tertiary/30 bg-white/80 shadow-lg shadow-tertiary/5 ring-1 ring-tertiary/10"
                        : "border-white/40 bg-white/50 hover:bg-white/80"
                    } ${!pkg.isActive ? "opacity-60" : ""}`}
                  >
                    {pkg.highlight && (
                      <span className="absolute -top-2.5 left-6 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-gradient-to-r from-tertiary to-[#8B5CF6] text-white shadow-sm shadow-tertiary/20 uppercase tracking-widest text-[8px]">
                        Highlighted
                      </span>
                    )}

                    <div className="flex-1 mt-1 pr-6">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-dark">{pkg.name}</h3>
                        {!pkg.isActive && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-dark/10 text-dark/45 tracking-wide uppercase">
                            Disabled
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-dark/45 font-medium mt-0.5">Validity: {pkg.validityDays} Days</p>

                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-dark">৳{pkg.price.toLocaleString()}</span>
                        <span className="text-xs font-semibold text-dark/45">/ {pkg.currency || "BDT"}</span>
                      </div>

                      <div className="mt-5 p-3 rounded-xl bg-tertiary/5 border border-tertiary/10 flex items-center justify-between text-xs font-bold text-tertiary">
                        <span>Total AI Credits</span>
                        <span className="text-sm font-extrabold">{pkg.credits} Credits</span>
                      </div>

                      <ul className="mt-5 space-y-2 p-0 list-none text-xs text-dark/65 font-medium">
                        <li className="flex items-center gap-2">
                          <FiCheck className="text-green-500 h-4 w-4 shrink-0 stroke-[3]" />
                          Shared pool for dynamic domains
                        </li>
                        <li className="flex items-center gap-2">
                          <FiCheck className="text-green-500 h-4 w-4 shrink-0 stroke-[3]" />
                          Presentation & Exam Generators
                        </li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => openEditPackage(pkg)}
                      className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dark/10 hover:bg-dark/[0.03] text-dark/70 hover:text-dark text-xs font-bold transition-all cursor-pointer bg-white"
                    >
                      <FiEdit3 className="h-3.5 w-3.5" /> Modify AI Package
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <PlanModal
          plan={editingPlan}
          saving={saving}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingPlan(null);
          }}
        />
      )}

      {deletingPlan && (
        <DeleteModal
          plan={deletingPlan}
          saving={saving}
          onConfirm={handleDelete}
          onClose={() => setDeletingPlan(null)}
        />
      )}

      {/* AI Package Form Modal */}
      {isPkgModalOpen && (
        <AIPackageModal
          pkg={editingPkg}
          saving={saving}
          onSave={handleSavePackage}
          onClose={() => {
            setIsPkgModalOpen(false);
            setEditingPkg(null);
          }}
        />
      )}
    </div>
  );
}

/* ── AI Package Form Modal ── */
const AIPackageModal = ({ pkg, onSave, onClose, saving }) => {
  const isEdit = !!pkg?.id;
  const [form, setForm] = useState({
    name: pkg?.name || "",
    credits: pkg?.credits || "",
    price: pkg?.price || "",
    validityDays: pkg?.validityDays || 30,
    isActive: pkg?.isActive ?? true,
    highlight: pkg?.highlight || false,
    currency: pkg?.currency || "BDT",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Package name is required";
    if (!form.credits || Number(form.credits) < 1) errs.credits = "Credits must be at least 1";
    if (!form.price || Number(form.price) < 0) errs.price = "Price is required";
    if (!form.validityDays || Number(form.validityDays) < 1) errs.validityDays = "Validity must be at least 1 day";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      id: pkg?.id,
      name: form.name,
      credits: Number(form.credits),
      price: Number(form.price),
      validityDays: Number(form.validityDays),
      currency: form.currency,
      isActive: form.isActive !== false,
      highlight: !!form.highlight,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl animate-[fadeInUp_0.3s_ease-out] z-10">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-dark/5 bg-white/90 backdrop-blur-lg rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-tertiary to-[#8B5CF6] flex items-center justify-center shadow-md shadow-tertiary/20">
              <FiCpu className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-dark">
                {isEdit ? "Edit AI Package" : "Create New AI Package"}
              </h3>
              <p className="text-xs text-dark/40 font-medium">
                {isEdit ? "Modify AI credits add-on details" : "Set up a new AI credit tier"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-dark/30 hover:text-dark/65 hover:bg-dark/5 transition-all duration-200 cursor-pointer border-none bg-transparent"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Package Name */}
          <div>
            <label className="block text-sm font-semibold text-dark/70 mb-2">
              Package Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Starter Pack, Pro Pack"
              className={`w-full px-4 py-3 rounded-xl border ${errors.name ? "border-red-300 bg-red-50/50" : "border-dark/10 bg-white/60"} text-sm font-medium text-dark outline-none focus:border-tertiary/40 focus:ring-2 focus:ring-tertiary/10 transition-all`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500 font-bold">{errors.name}</p>}
          </div>

          {/* Credits & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark/70 mb-2">
                Shared AI Credits *
              </label>
              <input
                type="number"
                min="1"
                value={form.credits}
                onChange={(e) => setForm({ ...form, credits: e.target.value })}
                placeholder="50"
                className={`w-full px-4 py-3 rounded-xl border ${errors.credits ? "border-red-300 bg-red-50/50" : "border-dark/10 bg-white/60"} text-sm font-medium text-dark outline-none focus:border-tertiary/40 focus:ring-2 focus:ring-tertiary/10 transition-all`}
              />
              {errors.credits && <p className="mt-1 text-xs text-red-500 font-bold">{errors.credits}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark/70 mb-2">
                Price (৳) *
              </label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="179"
                className={`w-full px-4 py-3 rounded-xl border ${errors.price ? "border-red-300 bg-red-50/50" : "border-dark/10 bg-white/60"} text-sm font-medium text-dark outline-none focus:border-tertiary/40 focus:ring-2 focus:ring-tertiary/10 transition-all`}
              />
              {errors.price && <p className="mt-1 text-xs text-red-500 font-bold">{errors.price}</p>}
            </div>
          </div>

          {/* Validity Days */}
          <div>
            <label className="block text-sm font-semibold text-dark/70 mb-2">
              Validity (Days) *
            </label>
            <input
              type="number"
              min="1"
              value={form.validityDays}
              onChange={(e) => setForm({ ...form, validityDays: e.target.value })}
              placeholder="30"
              className={`w-full px-4 py-3 rounded-xl border ${errors.validityDays ? "border-red-300 bg-red-50/50" : "border-dark/10 bg-white/60"} text-sm font-medium text-dark outline-none focus:border-tertiary/40 focus:ring-2 focus:ring-tertiary/10 transition-all`}
            />
            {errors.validityDays && <p className="mt-1 text-xs text-red-500 font-bold">{errors.validityDays}</p>}
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <button
                type="button"
                onClick={() => setForm({ ...form, highlight: !form.highlight })}
                className="cursor-pointer bg-transparent border-none p-0 flex items-center"
              >
                {form.highlight ? (
                  <FiToggleRight className="w-7 h-7 text-tertiary" />
                ) : (
                  <FiToggleLeft className="w-7 h-7 text-dark/25" />
                )}
              </button>
              <span className="text-sm font-semibold text-dark/60 group-hover:text-dark/80 transition-colors">
                Popular / Highlighted
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <button
                type="button"
                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                className="cursor-pointer bg-transparent border-none p-0 flex items-center"
              >
                {form.isActive ? (
                  <FiToggleRight className="w-7 h-7 text-emerald-500" />
                ) : (
                  <FiToggleLeft className="w-7 h-7 text-dark/25" />
                )}
              </button>
              <span className="text-sm font-semibold text-dark/60 group-hover:text-dark/80 transition-colors">
                Active
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-dark/5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-dark/50 hover:text-dark/70 hover:bg-dark/5 transition-all duration-200 cursor-pointer border-none bg-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-tertiary to-[#8B5CF6] text-white text-sm font-bold shadow-md shadow-tertiary/25 hover:shadow-lg hover:shadow-tertiary/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer border-none disabled:opacity-50"
            >
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Package"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
