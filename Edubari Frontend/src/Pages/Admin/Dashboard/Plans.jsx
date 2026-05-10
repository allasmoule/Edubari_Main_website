import React, { useState, useEffect, useContext } from "react";
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
  FiMoreVertical,
  FiCopy,
  FiEye,
  FiEyeOff,
  FiArrowUp,
  FiArrowDown,
  FiPackage,
  FiPercent,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";
import { AuthContext } from "../../../Firebase/AuthContext";

const API_URL = import.meta.env.VITE_SERVER || "http://localhost:3000";

/* ── Default Plans Data ── */
const defaultPlans = [
  {
    id: 1,
    name: "Monthly",
    duration: "30 days",
    durationDays: 30,
    price: 500,
    oldPrice: null,
    badge: null,
    popular: false,
    active: true,
    subscribers: 245,
    revenue: 122500,
    features: ["Full Access", "Email Support", "1 Institution"],
    createdAt: "2025-11-15",
  },
  {
    id: 2,
    name: "6 Months",
    duration: "180 days",
    durationDays: 180,
    price: 2400,
    oldPrice: 3000,
    badge: "20% OFF",
    popular: true,
    active: true,
    subscribers: 512,
    revenue: 1228800,
    features: [
      "Full Access",
      "Priority Support",
      "3 Institutions",
      "Analytics Dashboard",
    ],
    createdAt: "2025-11-15",
  },
  {
    id: 3,
    name: "1 Year",
    duration: "365 days",
    durationDays: 365,
    price: 3600,
    oldPrice: 6000,
    badge: "40% OFF",
    popular: false,
    active: true,
    subscribers: 189,
    revenue: 680400,
    features: [
      "Full Access",
      "24/7 Support",
      "Unlimited Institutions",
      "Advanced Analytics",
      "Custom Branding",
    ],
    createdAt: "2025-11-15",
  },
];

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
          className="px-4 py-2.5 rounded-xl bg-tertiary/10 text-tertiary text-sm font-bold hover:bg-tertiary/20 transition-all duration-200 cursor-pointer"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {features.map((f, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tertiary/8 text-tertiary text-xs font-bold border border-tertiary/10"
          >
            {f}
            <button
              type="button"
              onClick={() => removeFeature(idx)}
              className="hover:text-red-500 transition-colors duration-150 cursor-pointer"
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
  const isEdit = !!plan?._id;
  const [form, setForm] = useState({
    _id: plan?._id || undefined,
    name: plan?.name || "",
    durationDays: plan?.durationDays || 30,
    price: plan?.price || "",
    oldPrice: plan?.oldPrice || "",
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
    if (!form.price || form.price < 0) errs.price = "Price is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const durationLabel =
      form.durationDays <= 1
        ? "1 day"
        : form.durationDays <= 30
          ? `${form.durationDays} days`
          : form.durationDays <= 90
            ? `${Math.round(form.durationDays / 30)} months`
            : form.durationDays <= 365
              ? `${Math.round(form.durationDays / 30)} months`
              : `${Math.round(form.durationDays / 365)} year(s)`;

    onSave({
      ...plan,
      ...form,
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      durationDays: Number(form.durationDays),
      duration: durationLabel,
      badge: form.badge.trim() || null,
    });
  };

  const discountPercent =
    form.oldPrice && form.price
      ? Math.round(((form.oldPrice - form.price) / form.oldPrice) * 100)
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl shadow-dark/10 animate-[fadeInUp_0.3s_ease-out]">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-dark/5 bg-white/90 backdrop-blur-lg rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-tertiary to-[#8B5CF6] flex items-center justify-center shadow-md shadow-tertiary/20">
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
                {isEdit
                  ? "Modify plan details"
                  : "Set up a new subscription plan"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-dark/30 hover:text-dark/60 hover:bg-dark/5 transition-all duration-200 cursor-pointer"
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
                className="cursor-pointer"
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
                className="cursor-pointer"
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
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-dark/50 hover:text-dark/70 hover:bg-dark/5 transition-all duration-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-linear-to-r from-tertiary to-[#8B5CF6] text-white text-sm font-bold shadow-md shadow-tertiary/25 hover:shadow-lg hover:shadow-tertiary/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
const DeleteModal = ({ plan, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-dark/40 backdrop-blur-sm"
      onClick={onClose}
    />
    <div className="relative w-full max-w-sm rounded-2xl border border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl p-6 text-center animate-[fadeInUp_0.3s_ease-out]">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <FiTrash2 className="w-6 h-6 text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-dark">Delete Plan</h3>
      <p className="mt-2 text-sm text-dark/50 font-medium leading-relaxed">
        Are you sure you want to delete{" "}
        <strong className="text-dark/80">"{plan.name}"</strong>? This action
        cannot be undone.
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
          onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-dark/50 hover:text-dark/70 bg-dark/4 hover:bg-dark/8 transition-all duration-200 cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold shadow-md shadow-red-500/25 hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
        >
          Delete Plan
        </button>
      </div>
    </div>
  </div>
);

/* ── Main Plans Page ── */
const Plans = () => {
  const { user } = useContext(AuthContext);
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

  /* Fetch plans from API on mount */
  useEffect(() => {
    fetchPlans();
  }, []);

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

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/plans`);
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

  /* Derived */
  const totalSubscribers = plans.reduce((s, p) => s + p.subscribers, 0);
  const totalRevenue = plans.reduce((s, p) => s + p.revenue, 0);
  const activePlans = plans.filter((p) => p.active).length;

  const filtered = plans
    .filter((p) => {
      if (filter === "active") return p.active;
      if (filter === "inactive") return !p.active;
      return true;
    })
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  /* ID counter */
  const nextIdRef = React.useRef(100);

  /* Handlers */
  const handleSave = async (data) => {
    try {
      setSaving(true);

      if (data._id) {
        // Update existing plan - exclude _id and immutable fields
        const { _id, createdAt, subscribers, revenue, ...updateData } = data;
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/plans/${_id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(updateData),
        });
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(
            `Failed to update plan: ${response.status} ${errText}`,
          );
        }

        setPlans((prev) => prev.map((p) => (p._id === _id ? data : p)));
      } else {
        // Create new plan - exclude _id and timestamps
        const { _id, createdAt, subscribers, revenue, ...createData } = data;
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/plans`, {
          method: "POST",
          headers,
          body: JSON.stringify(createData),
        });
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(
            `Failed to create plan: ${response.status} ${errText}`,
          );
        }
        const result = await response.json();

        const newPlan = {
          ...data,
          _id: result.planId,
          subscribers: 0,
          revenue: 0,
          createdAt: new Date().toISOString().split("T")[0],
        };
        setPlans((prev) => [...prev, newPlan]);
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
      const headers = await getAuthHeaders(false);
      const response = await fetch(`${API_URL}/plans/${deletingPlan._id}`, {
        method: "DELETE",
        headers,
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to delete plan: ${response.status} ${errText}`);
      }

      setPlans((prev) => prev.filter((p) => p._id !== deletingPlan._id));
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
      const plan = plans.find((p) => p._id === planId);
      if (!plan) return;

      const { _id, createdAt, subscribers, revenue, ...updateData } = plan;
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/plans/${planId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ ...updateData, active: !plan.active }),
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to update plan: ${response.status} ${errText}`);
      }

      setPlans((prev) =>
        prev.map((p) => (p._id === planId ? { ...p, active: !p.active } : p)),
      );
    } catch (err) {
      console.error("Error toggling active status:", err);
      setError(err.message);
    }
  };

  const handleTogglePopular = async (planId) => {
    try {
      const plan = plans.find((p) => p._id === planId);
      if (!plan) return;

      const { _id, createdAt, subscribers, revenue, ...updateData } = plan;
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/plans/${planId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ ...updateData, popular: !plan.popular }),
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to update plan: ${response.status} ${errText}`);
      }

      setPlans((prev) =>
        prev.map((p) => (p._id === planId ? { ...p, popular: !p.popular } : p)),
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
      const { _id, createdAt, subscribers, revenue, ...dupPlanData } = plan;
      const dupPlan = {
        ...dupPlanData,
        name: `${plan.name} (Copy)`,
      };

      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/plans`, {
        method: "POST",
        headers,
        body: JSON.stringify(dupPlan),
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(
          `Failed to duplicate plan: ${response.status} ${errText}`,
        );
      }
      const result = await response.json();

      const newPlan = {
        ...dupPlan,
        _id: result.planId,
        subscribers: 0,
        revenue: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setPlans((prev) => [...prev, newPlan]);
      setActionMenuId(null);
    } catch (err) {
      console.error("Error duplicating plan:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      {/* Error Alert */}
      {error && (
        <div className="px-5 py-4 rounded-xl bg-red-50 border border-red-200/60 flex items-center gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm font-medium text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-600 transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── Summary Stats ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {[
          {
            label: "Total Plans",
            value: plans.length,
            sub: `${plans.filter((p) => p.active).length} active`,
            icon: FiPackage,
            gradient: "from-tertiary to-[#6366F1]",
            shadow: "shadow-tertiary/20",
          },
          {
            label: "Total Subscribers",
            value: plans
              .reduce((s, p) => s + (p.subscribers || 0), 0)
              .toLocaleString(),
            sub: "Across all plans",
            icon: FiUsers,
            gradient: "from-emerald-500 to-teal-500",
            shadow: "shadow-emerald-500/20",
          },
          {
            label: "Total Revenue",
            value: `৳${plans.reduce((s, p) => s + (p.revenue || 0), 0).toLocaleString()}`,
            sub: "Lifetime earnings",
            icon: FiDollarSign,
            gradient: "from-amber-500 to-orange-500",
            shadow: "shadow-amber-500/20",
          },
          {
            label: "Most Popular",
            value:
              plans.reduce(
                (best, p) =>
                  (p.subscribers || 0) > (best?.subscribers || 0) ? p : best,
                null,
              )?.name || "—",
            sub: `${plans.reduce((best, p) => ((p.subscribers || 0) > (best?.subscribers || 0) ? p : best), null)?.subscribers || 0} subscribers`,
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
              className={`w-11 h-11 rounded-xl bg-linear-to-br ${s.gradient} flex items-center justify-center shadow-lg ${s.shadow} mb-4`}
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 sm:px-6 py-5">
          <div>
            <h2 className="text-base font-bold text-dark">
              Subscription Plans
            </h2>
            <p className="text-xs text-dark/40 font-medium mt-0.5">
              Manage your pricing and subscription tiers
            </p>
          </div>
          <button
            onClick={() => {
              setEditingPlan(null);
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-tertiary to-[#8B5CF6] text-white text-sm font-bold shadow-md shadow-tertiary/25 hover:shadow-lg hover:shadow-tertiary/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            Add Plan
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-5 sm:px-6 pb-5">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/25" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plans..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-dark/10 bg-white/60 text-sm font-medium text-dark placeholder:text-dark/30 outline-none focus:border-tertiary/40 focus:ring-2 focus:ring-tertiary/10 transition-all duration-200"
            />
          </div>
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-dark/4 border border-dark/5">
            {[
              { key: "all", label: "All" },
              { key: "active", label: "Active" },
              { key: "inactive", label: "Inactive" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  filter === f.key
                    ? "bg-white text-dark shadow-sm"
                    : "text-dark/40 hover:text-dark/60"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Plan Cards Grid ─── */}
        <div className="px-5 sm:px-6 pb-6">
          {loading ? (
            <div className="text-center py-16">
              <FiLoader className="w-8 h-8 mx-auto text-tertiary animate-spin mb-4" />
              <h3 className="text-base font-bold text-dark/50">
                Loading plans...
              </h3>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-dark/4 flex items-center justify-center mb-4">
                <FiPackage className="w-7 h-7 text-dark/20" />
              </div>
              <h3 className="text-base font-bold text-dark/50">
                No plans found
              </h3>
              <p className="text-sm text-dark/35 font-medium mt-1">
                {search
                  ? "Try a different search term"
                  : "Create your first plan to get started"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {filtered.map((plan) => (
                <div
                  key={plan._id}
                  className={`group relative rounded-2xl border p-5 sm:p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
                    !plan.active
                      ? "border-dark/10 bg-dark/2 opacity-70"
                      : plan.popular
                        ? "border-tertiary/25 bg-white/90 shadow-lg shadow-tertiary/8 ring-1 ring-tertiary/15"
                        : "border-white/40 bg-white/80 shadow-md shadow-dark/4"
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div
                      className={`absolute -top-2.5 left-5 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                        plan.popular
                          ? "bg-linear-to-r from-tertiary to-[#8B5CF6] text-white shadow-md shadow-tertiary/25"
                          : "bg-amber-100 text-amber-700 border border-amber-200/60"
                      }`}
                    >
                      {plan.badge}
                    </div>
                  )}

                  {/* Action Menu */}
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() =>
                        setActionMenuId(
                          actionMenuId === plan._id ? null : plan._id,
                        )
                      }
                      className="p-1.5 rounded-lg text-dark/25 hover:text-dark/50 hover:bg-dark/5 transition-all duration-200 cursor-pointer"
                    >
                      <FiMoreVertical className="w-4 h-4" />
                    </button>

                    {actionMenuId === plan._id && (
                      <div className="absolute right-0 mt-1 w-[160px] rounded-xl border border-white/50 bg-white/95 backdrop-blur-xl shadow-xl shadow-dark/10 py-1.5 z-20 animate-[fadeInUp_0.15s_ease-out]">
                        <button
                          onClick={() => {
                            setEditingPlan(plan);
                            setShowModal(true);
                            setActionMenuId(null);
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-dark/60 hover:bg-dark/4 hover:text-dark transition-all cursor-pointer"
                        >
                          <FiEdit3 className="w-3.5 h-3.5" /> Edit Plan
                        </button>
                        <button
                          onClick={() => handleDuplicate(plan)}
                          disabled={saving}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-dark/60 hover:bg-dark/[0.04] hover:text-dark transition-all cursor-pointer disabled:opacity-50"
                        >
                          <FiCopy className="w-3.5 h-3.5" /> Duplicate
                        </button>
                        <button
                          onClick={() => handleTogglePopular(plan._id)}
                          disabled={saving}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-dark/60 hover:bg-dark/[0.04] hover:text-dark transition-all cursor-pointer disabled:opacity-50"
                        >
                          <FiStar className="w-3.5 h-3.5" />
                          {plan.popular ? "Remove Popular" : "Mark Popular"}
                        </button>
                        <div className="h-px bg-dark/5 my-1" />
                        <button
                          onClick={() => {
                            setDeletingPlan(plan);
                            setActionMenuId(null);
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-red-500/80 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Plan Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                        plan.popular
                          ? "bg-linear-to-br from-tertiary to-[#8B5CF6] shadow-tertiary/25"
                          : "bg-linear-to-br from-slate-600 to-slate-800 shadow-slate-500/15"
                      }`}
                    >
                      <FiPackage className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-dark truncate">
                          {plan.name}
                        </h3>
                        {plan.popular && (
                          <span className="shrink-0 px-2 py-0.5 rounded-md bg-tertiary/10 text-tertiary text-[10px] font-bold">
                            POPULAR
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-dark/40 font-medium mt-0.5 flex items-center gap-1.5">
                        <FiClock className="w-3 h-3" />
                        {plan.duration || "Not specified"}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span
                      className={`text-3xl font-black tracking-tight ${
                        plan.popular
                          ? "bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]"
                          : "text-dark"
                      }`}
                    >
                      ৳{(plan.price || 0).toLocaleString()}
                    </span>
                    {plan.oldPrice && (
                      <span className="text-sm font-semibold text-dark/25 line-through">
                        ৳{(plan.oldPrice || 0).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Features */}
                  {plan.features &&
                    Array.isArray(plan.features) &&
                    plan.features.length > 0 && (
                      <div className="mb-4 space-y-1.5">
                        {plan.features.slice(0, 3).map((f, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <FiCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="text-xs text-dark/55 font-medium">
                              {f}
                            </span>
                          </div>
                        ))}
                        {plan.features.length > 3 && (
                          <p className="text-[10px] text-dark/30 font-bold pl-5.5">
                            +{plan.features.length - 3} more
                          </p>
                        )}
                      </div>
                    )}

                  {/* Divider */}
                  <div className="h-px bg-dark/5 mb-4" />

                  {/* Stats Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5">
                      <FiUsers className="w-3.5 h-3.5 text-dark/30" />
                      <span className="text-xs font-bold text-dark/60">
                        {(plan.subscribers || 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-dark/30 font-medium">
                        subscribers
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FiTrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs font-bold text-dark/60">
                        ৳{(plan.revenue || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(plan._id)}
                      disabled={saving}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer disabled:opacity-50 ${
                        plan.active
                          ? "border-emerald-200/60 bg-emerald-50 text-emerald-600 hover:bg-emerald-100/80"
                          : "border-dark/10 bg-dark/3 text-dark/40 hover:bg-dark/6"
                      }`}
                    >
                      {plan.active ? (
                        <>
                          <FiEye className="w-3.5 h-3.5" /> Active
                        </>
                      ) : (
                        <>
                          <FiEyeOff className="w-3.5 h-3.5" /> Inactive
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingPlan(plan);
                        setShowModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border border-tertiary/15 bg-tertiary/5 text-tertiary hover:bg-tertiary/10 transition-all duration-200 cursor-pointer"
                    >
                      <FiEdit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Modals ─── */}
      {showModal && (
        <PlanModal
          plan={editingPlan}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingPlan(null);
          }}
          saving={saving}
        />
      )}

      {deletingPlan && (
        <DeleteModal
          plan={deletingPlan}
          onConfirm={handleDelete}
          onClose={() => setDeletingPlan(null)}
        />
      )}
    </div>
  );
};

export default Plans;
