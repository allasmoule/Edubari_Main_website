"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FiAlertCircle,
  FiCheck,
  FiCreditCard,
  FiEye,
  FiGlobe,
  FiLoader,
  FiMail,
  FiMapPin,
  FiPhone,
  FiRefreshCw,
  FiTrash2,
  FiUser,
  FiX,
  FiSearch,
  FiServer,
  FiWifi,
  FiWifiOff,
  FiClock,
  FiPlus,
  FiCopy,
} from "react-icons/fi";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const parseDurationDays = (duration) => {
  if (!duration) return null;
  const match = duration.toString().match(/(\d+)/);
  if (!match) return null;
  const days = Number(match[1]);
  return Number.isFinite(days) && days > 0 ? days : null;
};

const getSubscriptionMeta = (item) => {
  const start = new Date(item?.submitted_at || item?.submittedAt || "");
  if (Number.isNaN(start.getTime())) {
    return {
      status: "Unknown",
      expireDate: "-",
      recommendation: "Review start date",
    };
  }

  const durationDays = parseDurationDays(item?.selectedPlanDuration || item?.selected_plan_duration);
  if (!durationDays) {
    return {
      status: "Unknown",
      expireDate: "-",
      recommendation: "Review plan duration",
    };
  }

  const expireAt = new Date(start);
  expireAt.setDate(expireAt.getDate() + durationDays);

  const now = new Date();
  const remainingDays = Math.ceil(
    (expireAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (remainingDays < 0) {
    return {
      status: "Expired",
      expireDate: formatDateTime(expireAt),
      recommendation: "Renew immediately",
    };
  }

  if (remainingDays <= 7) {
    return {
      status: "Expiring Soon",
      expireDate: formatDateTime(expireAt),
      recommendation: "Remind for renewal",
    };
  }

  return {
    status: "Active",
    expireDate: formatDateTime(expireAt),
    recommendation:
      remainingDays <= 30 ? "Prepare renewal follow-up" : "No action needed",
  };
};

export default function AdminSubscriptionsPage() {
  const [activeTab, setActiveTab] = useState("requests"); // "requests" | "erp"
  const [subscriptions, setSubscriptions] = useState([]);
  const [erpConnections, setErpConnections] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [erpLoading, setErpLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, verified, pending

  // Add School Modal States
  const [addSchoolModalOpen, setAddSchoolModalOpen] = useState(false);

  // School ERP payment history + manual payment form
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentForm, setPaymentForm] = useState(null); // { client_id, client_name, periods, amount, channel, trx_id, note }
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [plansList, setPlansList] = useState([]);
  const [addSchoolLoading, setAddSchoolLoading] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [newSchoolForm, setNewSchoolForm] = useState({
    client_name: "",
    domain: "",
    phone: "",
    client_type: "school_erp",
    plan_id: "",
    status: "active",
  });

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/plans");
      if (res.ok) {
        const data = await res.json();
        setPlansList(Array.isArray(data) ? data : []);
      }
    } catch (_) {}
  }, []);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/subscriptions");
      if (!response.ok) {
        throw new Error("Failed to fetch subscriptions");
      }

      const data = await response.json();
      const list = Array.isArray(data) ? data : [];

      const sorted = [...list].sort((a, b) => {
        const aTime = new Date(a?.submitted_at || a?.submittedAt || 0).getTime();
        const bTime = new Date(b?.submitted_at || b?.submittedAt || 0).getTime();
        return bTime - aTime;
      });

      setSubscriptions(sorted);
    } catch (err) {
      setSubscriptions([]);
      setError(err.message || "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchErpConnections = useCallback(async () => {
    setErpLoading(true);
    try {
      const res = await fetch("/api/erp/ping");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setErpConnections(Array.isArray(data) ? data : []);
    } catch (_) {
      setErpConnections([]);
    } finally {
      setErpLoading(false);
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    setPaymentsLoading(true);
    try {
      const res = await fetch("/api/billing/payments");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch (_) {
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  }, []);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentForm?.client_id) return;
    setPaymentSaving(true);
    try {
      const res = await fetch("/api/billing/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: paymentForm.client_id,
          periods: Number(paymentForm.periods) || 1,
          amount: paymentForm.amount === "" ? undefined : Number(paymentForm.amount),
          channel: paymentForm.channel,
          trx_id: paymentForm.trx_id,
          note: paymentForm.note,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to record payment");
      alert(`Payment recorded. Subscription now runs until ${formatDateTime(data.period_end)}.`);
      setPaymentForm(null);
      fetchPayments();
      fetchErpConnections();
    } catch (err) {
      alert(err.message);
    } finally {
      setPaymentSaving(false);
    }
  };

  const handleCreateSchool = async (e) => {
    e.preventDefault();
    if (!newSchoolForm.client_name || !newSchoolForm.domain || !newSchoolForm.plan_id) {
      alert("Please fill in School Name, Domain, and Plan.");
      return;
    }

    setAddSchoolLoading(true);
    try {
      const res = await fetch("/api/billing/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSchoolForm),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to register school client");
      }

      const created = await res.json();
      setAddSchoolModalOpen(false);
      setCreatedCredentials(created);
      
      // Reset form
      setNewSchoolForm({
        client_name: "",
        domain: "",
        phone: "",
        client_type: "school_erp",
        plan_id: "",
        status: "active",
      });

      fetchSubscriptions();
      fetchErpConnections();
    } catch (err) {
      alert(err.message);
    } finally {
      setAddSchoolLoading(false);
    }
  };

  useEffect(() => {
    // Start loading after mount instead of setting state inside the effect body itself
    const t = setTimeout(fetchPlans, 0);
    return () => clearTimeout(t);
  }, [fetchPlans]);

  const handleViewDetails = async (id) => {
    setDetailsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/subscriptions/${id}`);
      if (!response.ok) throw new Error("Failed to fetch details");
      const details = await response.json();
      setSelectedSubscription(details);
    } catch (err) {
      setError(err.message || "Failed to load subscription details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleMarkReviewed = async (id) => {
    setActionLoadingId(id);
    setError("");

    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminStatus: "reviewed", verified: true }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update subscription");
      }

      const data = await response.json();
      const updated = data?.subscription || data;

      setSubscriptions((prev) =>
        prev.map((item) => ((item.id === id || item._id === id) ? { ...item, verified: true } : item))
      );

      if (selectedSubscription?.id === id || selectedSubscription?._id === id) {
        setSelectedSubscription((prev) => ({ ...prev, verified: true }));
      }
    } catch (err) {
      setError(err.message || "Failed to update subscription");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleDeleteSubscription = async (id) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this subscription?"
    );
    if (!shouldDelete) return;

    setActionLoadingId(id);
    setError("");

    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete subscription");
      }

      setSubscriptions((prev) => prev.filter((item) => (item.id !== id && item._id !== id)));
      if (selectedSubscription?.id === id || selectedSubscription?._id === id) {
        setSelectedSubscription(null);
      }
    } catch (err) {
      setError(err.message || "Failed to delete subscription");
    } finally {
      setActionLoadingId("");
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      fetchSubscriptions();
      fetchErpConnections();
      fetchPayments();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchSubscriptions, fetchErpConnections, fetchPayments]);

  /* Derived Stats & Filters */
  const totalRevenue = useMemo(() => {
    return subscriptions.reduce((sum, item) => {
      const price = Number(item?.selected_plan_price || item?.selectedPlanPrice || 0);
      return sum + price;
    }, 0);
  }, [subscriptions]);

  const filtered = useMemo(() => {
    return subscriptions
      .filter((item) => {
        if (filter === "verified") return item.verified;
        if (filter === "pending") return !item.verified;
        return true;
      })
      .filter((item) => {
        const text = (item.institution_name || item.institutionName || "").toLowerCase() + 
                     (item.full_name || item.fullName || "").toLowerCase() + 
                     (item.preferred_domain || item.preferredDomain || "").toLowerCase() +
                     (item.email || "").toLowerCase();
        return text.includes(search.toLowerCase());
      });
  }, [subscriptions, filter, search]);

  return (
    <div className="space-y-6 animate-[fadeInUp_0.35s_ease-out]">
      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 sm:p-6 shadow-lg shadow-dark/3">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-dark tracking-tight flex items-center gap-2">
              <FiServer className="w-5 h-5 text-tertiary" />
              School ERP Subscriptions
            </h2>
            <p className="text-xs sm:text-sm text-dark/45 font-medium mt-1">
              Manage School ERP connections and subscription purchase requests
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAddSchoolModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-tertiary to-[#8B5CF6] text-white text-xs font-bold shadow-md hover:shadow-tertiary/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer inline-flex items-center gap-2 border-none"
            >
              <FiPlus className="w-4 h-4" />
              Add School ERP Instance
            </button>
            <button
              type="button"
              onClick={() => { fetchSubscriptions(); fetchErpConnections(); }}
              className="px-3 py-2 rounded-xl border border-dark/10 text-xs font-semibold text-dark/60 hover:bg-dark/5 transition-all duration-200 cursor-pointer inline-flex items-center gap-2 border-none bg-transparent"
            >
              <FiRefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-2xl bg-dark/[0.04] w-max border border-dark/5 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab("requests")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${
              activeTab === "requests"
                ? "bg-white text-tertiary shadow-sm font-extrabold"
                : "bg-transparent text-dark/50 hover:text-dark/80"
            }`}
          >
            <FiCreditCard className="w-4 h-4" /> Subscription Requests
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("erp")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${
              activeTab === "erp"
                ? "bg-white text-tertiary shadow-sm font-extrabold"
                : "bg-transparent text-dark/50 hover:text-dark/80"
            }`}
          >
            <FiServer className="w-4 h-4" /> ERP Connections ({erpConnections.length})
          </button>
        </div>

        {/* ── TAB: Subscription Requests ── */}
        {activeTab === "requests" && (
          <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl border border-white/40 bg-white/75 p-3">
            <p className="text-xs font-bold text-dark/40">Total Requests</p>
            <p className="text-xl font-extrabold text-dark mt-1">
              {subscriptions.length}
            </p>
          </div>
          <div className="rounded-xl border border-white/40 bg-white/75 p-3">
            <p className="text-xs font-bold text-dark/40">Plan Revenue</p>
            <p className="text-xl font-extrabold text-dark mt-1">
              BDT {totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3 py-4 border-b border-dark/5 bg-white/40 backdrop-blur-xs justify-between mb-5 px-3 rounded-xl">
          <div className="flex items-center border border-dark/10 bg-white/60 rounded-xl px-3 py-2 w-full sm:max-w-xs transition-all focus-within:border-tertiary/50">
            <FiSearch className="w-4 h-4 text-dark/30 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs font-medium bg-transparent outline-none text-dark placeholder:text-dark/30 border-none p-0"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto select-none py-1">
            {["all", "verified", "pending"].map((f) => (
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

        {loading && (
          <div className="py-16 flex items-center justify-center gap-2 text-sm text-dark/50 font-medium">
            <FiLoader className="w-4 h-4 animate-spin" />
            Loading subscriptions...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold px-4 py-3 inline-flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-xl border border-dark/10 bg-white/60 text-dark/55 text-sm font-semibold px-4 py-6 text-center">
            No subscriptions found.
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <div className="hidden xl:block overflow-x-auto rounded-2xl border border-dark/8">
              <table className="min-w-full bg-white/80">
                <thead className="bg-dark/3">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-black text-dark/55 uppercase tracking-wide">
                      Institution
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black text-dark/55 uppercase tracking-wide">
                      Contact
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black text-dark/55 uppercase tracking-wide">
                      Domain
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black text-dark/55 uppercase tracking-wide">
                      Plan
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black text-dark/55 uppercase tracking-wide">
                      Payment
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black text-dark/55 uppercase tracking-wide">
                      Submitted
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black text-dark/55 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black text-dark/55 uppercase tracking-wide">
                      Expire Date
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black text-dark/55 uppercase tracking-wide">
                      Recommendation
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black text-dark/55 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const meta = getSubscriptionMeta(item);
                    const planId = item.id || item._id;
                    const price = item.selected_plan_price || item.selectedPlanPrice || 0;
                    const planName = item.selected_plan_name || item.selectedPlanName || "";
                    const duration = item.selected_plan_duration || item.selectedPlanDuration || "";
                    const address = item.address || "";
                    const institutionName = item.institution_name || item.institutionName || "";
                    const fullName = item.full_name || item.fullName || "";
                    const preferredDomain = item.preferred_domain || item.preferredDomain || "";
                    const paymentMethod = item.payment_method || item.paymentMethod || "";
                    const transactionId = item.transaction_id || item.transactionId || "";
                    const submittedAt = item.submitted_at || item.submittedAt || "";

                    return (
                      <tr key={planId} className="border-t border-dark/8">
                        <td className="px-4 py-3 align-top">
                          <p className="text-sm font-bold text-dark">
                            {institutionName || "-"}
                          </p>
                          <p className="text-xs text-dark/45 mt-0.5 inline-flex items-center gap-1">
                            <FiMapPin className="w-3 h-3" />
                            {address || "-"}
                          </p>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="space-y-1.5">
                            <div className="text-sm font-semibold text-dark flex items-center gap-1.5">
                              <FiUser className="w-3.5 h-3.5 text-dark/45" />
                              <span>{fullName || "-"}</span>
                            </div>
                            <div className="text-xs text-dark/55 flex items-center gap-1.5">
                              <FiMail className="w-3.5 h-3.5 text-dark/45" />
                              <span>{item.email || "-"}</span>
                            </div>
                            <div className="text-xs text-dark/55 flex items-center gap-1.5">
                              <FiPhone className="w-3.5 h-3.5 text-dark/45" />
                              <span>{item.phone || "-"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <p className="text-sm font-semibold text-dark inline-flex items-center gap-1.5 break-all">
                            <FiGlobe className="w-3.5 h-3.5 text-dark/45 shrink-0" />
                            {preferredDomain || "-"}
                          </p>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <p className="text-sm font-semibold text-dark">
                            {planName || "-"}
                          </p>
                          <p className="text-xs text-dark/50 mt-1">
                            {duration || "-"}
                          </p>
                          <p className="text-xs font-bold text-tertiary mt-1">
                            BDT {Number(price).toLocaleString()}
                          </p>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <p className="text-sm font-semibold text-dark capitalize inline-flex items-center gap-1.5">
                            <FiCreditCard className="w-3.5 h-3.5 text-dark/45" />
                            {paymentMethod || "-"}
                          </p>
                          <p className="text-xs text-dark/50 mt-1 break-all">
                            Txn: {transactionId || "-"}
                          </p>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <p className="text-xs font-semibold text-dark/65">
                            {formatDateTime(submittedAt)}
                          </p>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                              meta.status === "Active"
                                ? "bg-emerald-100 text-emerald-700"
                                : meta.status === "Expiring Soon"
                                  ? "bg-amber-100 text-amber-700"
                                  : meta.status === "Expired"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-dark/10 text-dark/55"
                            }`}
                          >
                            {meta.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <p className="text-xs font-semibold text-dark/65">
                            {meta.expireDate}
                          </p>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <p className="text-xs font-semibold text-dark/65">
                            {meta.recommendation}
                          </p>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleViewDetails(planId)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-dark/10 text-xs font-bold text-dark/65 hover:bg-dark/5 transition-all duration-150 cursor-pointer border-none bg-transparent"
                            >
                              <FiEye className="w-3.5 h-3.5" />
                              View
                            </button>
                            {!item.verified && (
                              <button
                                type="button"
                                onClick={() => handleMarkReviewed(planId)}
                                disabled={actionLoadingId === planId}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-200 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none bg-transparent"
                              >
                                <FiCheck className="w-3.5 h-3.5" />
                                Review
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteSubscription(planId)}
                              disabled={actionLoadingId === planId}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none bg-transparent"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="xl:hidden grid grid-cols-1 gap-3">
              {filtered.map((item) => {
                const meta = getSubscriptionMeta(item);
                const planId = item.id || item._id;
                const price = item.selected_plan_price || item.selectedPlanPrice || 0;
                const planName = item.selected_plan_name || item.selectedPlanName || "";
                const duration = item.selected_plan_duration || item.selectedPlanDuration || "";
                const institutionName = item.institution_name || item.institutionName || "";
                const fullName = item.full_name || item.fullName || "";
                const preferredDomain = item.preferred_domain || item.preferredDomain || "";
                const paymentMethod = item.payment_method || item.paymentMethod || "";
                const submittedAt = item.submitted_at || item.submittedAt || "";

                return (
                  <div
                    key={planId}
                    className="rounded-2xl border border-dark/10 bg-white/80 p-4 space-y-2.5"
                  >
                    <p className="text-sm font-extrabold text-dark">
                      {institutionName || "-"}
                    </p>

                    <div className="space-y-1.5">
                      <div className="text-xs text-dark/60 flex items-center gap-1.5">
                        <FiUser className="w-3.5 h-3.5" />
                        <span>{fullName || "-"}</span>
                      </div>
                      <div className="text-xs text-dark/60 flex items-center gap-1.5 break-all">
                        <FiMail className="w-3.5 h-3.5" />
                        <span>{item.email || "-"}</span>
                      </div>
                      <div className="text-xs text-dark/60 flex items-center gap-1.5">
                        <FiPhone className="w-3.5 h-3.5" />
                        <span>{item.phone || "-"}</span>
                      </div>
                    </div>
                    <p className="text-xs text-dark/60 inline-flex items-center gap-1.5 break-all">
                      <FiGlobe className="w-3.5 h-3.5" />
                      {preferredDomain || "-"}
                    </p>
                    <p className="text-xs text-dark/60 inline-flex items-center gap-1.5">
                      <FiCreditCard className="w-3.5 h-3.5" />
                      {paymentMethod.toString().toUpperCase()}
                    </p>

                    <div className="pt-2 border-t border-dark/8 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-dark/70">
                          {planName || "-"}
                        </p>
                        <p className="text-[11px] text-dark/50 mt-0.5">
                          {duration || "-"}
                        </p>
                      </div>
                      <p className="text-xs font-extrabold text-tertiary">
                        BDT {Number(price).toLocaleString()}
                      </p>
                    </div>

                    <p className="text-[11px] font-semibold text-dark/45">
                      Submitted: {formatDateTime(submittedAt)}
                    </p>
                    <div className="pt-2 border-t border-dark/8 space-y-1">
                      <p className="text-[11px] font-semibold text-dark/55">
                        Status:{" "}
                        <span className="font-extrabold text-dark/75">
                          {meta.status}
                        </span>
                      </p>
                      <p className="text-[11px] font-semibold text-dark/55">
                        Expire Date:{" "}
                        <span className="font-extrabold text-dark/75">
                          {meta.expireDate}
                        </span>
                      </p>
                      <p className="text-[11px] font-semibold text-dark/55">
                        Recommendation:{" "}
                        <span className="font-extrabold text-dark/75">
                          {meta.recommendation}
                        </span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-dark/8 flex items-center flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleViewDetails(planId)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-dark/10 text-[11px] font-bold text-dark/65 hover:bg-dark/5 transition-all duration-150 cursor-pointer border-none bg-transparent"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                        View
                      </button>
                      {!item.verified && (
                        <button
                          type="button"
                          onClick={() => handleMarkReviewed(planId)}
                          disabled={actionLoadingId === planId}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-200 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none bg-transparent"
                        >
                          <FiCheck className="w-3.5 h-3.5" />
                          Review
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteSubscription(planId)}
                        disabled={actionLoadingId === planId}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-[11px] font-bold text-red-600 hover:bg-red-50 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none bg-transparent"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {detailsLoading && (
              <div className="rounded-xl border border-dark/10 bg-white/70 text-sm font-semibold text-dark/60 px-4 py-3 inline-flex items-center gap-2 mt-5">
                <FiLoader className="w-4 h-4 animate-spin" />
                Loading subscription details...
              </div>
            )}

            {!detailsLoading && selectedSubscription && (
              <div className="rounded-2xl border border-dark/10 bg-white/80 p-4 sm:p-5 mt-5 animate-[fadeInUp_0.3s_ease-out]">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-sm sm:text-base font-extrabold text-dark tracking-tight">
                    Subscription Details
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedSubscription(null)}
                    className="p-1 rounded-lg text-dark/45 hover:text-dark hover:bg-dark/5 transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <p className="text-dark/70">
                    <span className="font-bold text-dark">Institution Name:</span>{" "}
                    {selectedSubscription.institution_name || selectedSubscription.institutionName || "-"}
                  </p>
                  <p className="text-dark/70">
                    <span className="font-bold text-dark">Full Name:</span>{" "}
                    {selectedSubscription.full_name || selectedSubscription.fullName || "-"}
                  </p>
                  <p className="text-dark/70 break-all">
                    <span className="font-bold text-dark">Email Address:</span>{" "}
                    {selectedSubscription.email || "-"}
                  </p>
                  <p className="text-dark/70">
                    <span className="font-bold text-dark">Phone Number:</span>{" "}
                    {selectedSubscription.phone || "-"}
                  </p>
                  <p className="text-dark/70">
                    <span className="font-bold text-dark">Plan Name:</span>{" "}
                    {selectedSubscription.selected_plan_name || selectedSubscription.selectedPlanName || "-"}
                  </p>
                  <p className="text-dark/70">
                    <span className="font-bold text-dark">Plan Duration:</span>{" "}
                    {selectedSubscription.selected_plan_duration || selectedSubscription.selectedPlanDuration || "-"}
                  </p>
                  <p className="text-dark/70">
                    <span className="font-bold text-dark">Plan Price:</span> BDT{" "}
                    {Number(selectedSubscription.selected_plan_price || selectedSubscription.selectedPlanPrice || 0).toLocaleString()}
                  </p>
                  <p className="text-dark/70">
                    <span className="font-bold text-dark">Preferred Domain:</span>{" "}
                    {selectedSubscription.preferred_domain || selectedSubscription.preferredDomain || "-"}
                  </p>
                  <p className="text-dark/70">
                    <span className="font-bold text-dark">Payment Method:</span>{" "}
                    {selectedSubscription.payment_method || selectedSubscription.paymentMethod || "-"}
                  </p>
                  <p className="text-dark/70">
                    <span className="font-bold text-dark">Transaction ID:</span>{" "}
                    {selectedSubscription.transaction_id || selectedSubscription.transactionId || "-"}
                  </p>
                  <p className="text-dark/70">
                    <span className="font-bold text-dark">Submitted At:</span>{" "}
                    {formatDateTime(selectedSubscription.submitted_at || selectedSubscription.submittedAt)}
                  </p>
                  <p className="text-dark/70">
                    <span className="font-bold text-dark">Review Status:</span>{" "}
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${selectedSubscription.verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {selectedSubscription.verified ? "Reviewed" : "Pending"}
                    </span>
                  </p>
                  <p className="text-dark/70 sm:col-span-2">
                    <span className="font-bold text-dark">Address / City:</span>{" "}
                    {selectedSubscription.address || "-"}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
        </>
        )}
        {/* ── END: requests tab ── */}

        {/* ── TAB: ERP Connections ── */}
        {activeTab === "erp" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/40 bg-white/75 p-3">
                <p className="text-xs font-bold text-dark/40">Total ERP Instances</p>
                <p className="text-xl font-extrabold text-dark mt-1">{erpConnections.length}</p>
              </div>
              <div className="rounded-xl border border-white/40 bg-white/75 p-3">
                <p className="text-xs font-bold text-dark/40">Connected</p>
                <p className="text-xl font-extrabold text-emerald-600 mt-1">
                  {erpConnections.filter(e => e.connection_status === "connected").length}
                </p>
              </div>
              <div className="rounded-xl border border-white/40 bg-white/75 p-3">
                <p className="text-xs font-bold text-dark/40">Pending / Disconnected</p>
                <p className="text-xl font-extrabold text-amber-600 mt-1">
                  {erpConnections.filter(e => e.connection_status !== "connected").length}
                </p>
              </div>
            </div>

            {erpLoading && (
              <div className="py-12 flex items-center justify-center gap-2 text-sm text-dark/50 font-medium">
                <FiLoader className="w-4 h-4 animate-spin" /> Loading ERP connections...
              </div>
            )}

            {!erpLoading && erpConnections.length === 0 && (
              <div className="rounded-xl border border-dark/10 bg-white/60 text-dark/55 text-sm font-semibold px-4 py-10 text-center space-y-2">
                <FiServer className="w-10 h-10 mx-auto text-dark/20 mb-2" />
                <p>No School ERP instances connected yet.</p>
                <p className="text-xs font-medium text-dark/40">Use <strong>Add School ERP Instance</strong> to register a school and get its API credentials.</p>
              </div>
            )}

            {!erpLoading && erpConnections.length > 0 && (
              <div className="overflow-x-auto rounded-2xl border border-dark/8">
                <table className="min-w-full bg-white/80">
                  <thead className="bg-dark/3">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-black text-dark/55 uppercase tracking-wide">Institution</th>
                      <th className="text-left px-4 py-3 text-xs font-black text-dark/55 uppercase tracking-wide">Domain</th>
                      <th className="text-left px-4 py-3 text-xs font-black text-dark/55 uppercase tracking-wide">API Token</th>
                      <th className="text-left px-4 py-3 text-xs font-black text-dark/55 uppercase tracking-wide">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-black text-dark/55 uppercase tracking-wide">Last Ping</th>
                      <th className="text-left px-4 py-3 text-xs font-black text-dark/55 uppercase tracking-wide">Laravel Ver</th>
                      <th className="text-left px-4 py-3 text-xs font-black text-dark/55 uppercase tracking-wide">Plan / Expires</th>
                      <th className="text-left px-4 py-3 text-xs font-black text-dark/55 uppercase tracking-wide">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {erpConnections.map((conn) => (
                      <tr key={conn.id} className="border-t border-dark/8 hover:bg-dark/[0.015] transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-bold text-dark">{conn.client_name || "-"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-semibold text-dark/70 flex items-center gap-1">
                            <FiGlobe className="w-3 h-3 text-tertiary" /> {conn.domain}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-[10px] bg-dark/5 px-2 py-1 rounded-lg font-mono text-dark/60 break-all">
                            {conn.erp_api_token ? `${conn.erp_api_token.substring(0, 16)}...` : "-"}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                            conn.connection_status === "connected"
                              ? "bg-emerald-100 text-emerald-700"
                              : conn.connection_status === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                          }`}>
                            {conn.connection_status === "connected" ? <FiWifi className="w-3 h-3" /> : <FiWifiOff className="w-3 h-3" />}
                            {conn.connection_status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-dark/55 flex items-center gap-1">
                            <FiClock className="w-3 h-3" />
                            {conn.last_ping_at ? new Date(conn.last_ping_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "Never"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-dark/55 font-mono">{conn.laravel_version || "-"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-bold text-dark">{conn.plan_name || "-"}</p>
                          <p className={`text-[11px] font-semibold ${
                            conn.subscription_end_date && new Date(conn.subscription_end_date) < new Date() ? "text-red-600" : "text-dark/50"
                          }`}>
                            {conn.subscription_end_date ? formatDateTime(conn.subscription_end_date) : "No subscription"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setPaymentForm({
                              client_id: conn.client_id,
                              client_name: conn.client_name || conn.domain,
                              price: Number(conn.plan_price || 0),
                              periods: 1,
                              amount: "",
                              channel: "cash",
                              trx_id: "",
                              note: "",
                            })}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer border-none"
                          >
                            <FiPlus className="w-3 h-3" /> Add Payment
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Payment history: every School ERP payment (bKash / Nagad / recorded by admin) */}
            <div className="flex items-center justify-between pt-4">
              <h3 className="text-sm font-extrabold text-dark flex items-center gap-2">
                <FiCreditCard className="w-4 h-4 text-tertiary" /> Payment History
              </h3>
              <p className="text-xs font-bold text-dark/50">
                Collected: ৳{payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString()}
              </p>
            </div>
            {paymentsLoading ? (
              <div className="py-8 flex items-center justify-center gap-2 text-sm text-dark/50 font-medium">
                <FiLoader className="w-4 h-4 animate-spin" /> Loading payments...
              </div>
            ) : payments.length === 0 ? (
              <div className="rounded-xl border border-dark/10 bg-white/60 text-dark/55 text-sm font-semibold px-4 py-6 text-center">
                No payments yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-dark/8">
                <table className="min-w-full bg-white/80">
                  <thead className="bg-dark/3">
                    <tr>
                      {["Date", "School", "Plan", "Method", "Amount", "Period", "Trx ID", "Status"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-black text-dark/55 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-t border-dark/8">
                        <td className="px-4 py-3 text-xs text-dark/60">{formatDateTime(p.completed_at || p.created_at)}</td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-bold text-dark">{p.client_name}</p>
                          <p className="text-[11px] text-dark/45">{p.domain}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-dark/70">{p.plan_name || "-"}{p.periods > 1 ? ` ×${p.periods}` : ""}</td>
                        <td className="px-4 py-3 text-xs font-bold text-dark/70 uppercase">
                          {p.method}{p.channel ? <span className="block text-[10px] font-semibold text-dark/40 normal-case">{p.channel}</span> : null}
                        </td>
                        <td className="px-4 py-3 text-xs font-extrabold text-dark">৳{Number(p.amount || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-[11px] text-dark/55">
                          {p.period_start ? `${formatDateTime(p.period_start)} → ${formatDateTime(p.period_end)}` : "-"}
                        </td>
                        <td className="px-4 py-3"><code className="text-[10px] font-mono text-dark/60">{p.trx_id || p.merchant_invoice}</code></td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                            p.status === "completed" ? "bg-emerald-100 text-emerald-700"
                              : p.status === "initiated" ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                          }`} title={p.failure_reason || ""}>
                            {p.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── MODAL: Record a manual payment ── */}
        {paymentForm && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-dark/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
              <button
                type="button"
                onClick={() => setPaymentForm(null)}
                className="absolute top-4 right-4 text-dark/40 hover:text-dark cursor-pointer border-none bg-transparent"
              >
                <FiX className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <FiCreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-dark">Add Payment</h3>
              </div>
              <p className="text-xs text-dark/55 mb-4">
                {paymentForm.client_name} — the subscription is extended at once and the ERP unlocks on its next check.
              </p>
              <form onSubmit={handleRecordPayment} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark/70 mb-1">Terms (plan periods)</label>
                    <input
                      type="number" min="1" max="10" required
                      value={paymentForm.periods}
                      onChange={(e) => setPaymentForm({ ...paymentForm, periods: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-dark/15 text-xs text-dark outline-none focus:border-tertiary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark/70 mb-1">Amount (৳)</label>
                    <input
                      type="number" min="0" step="0.01"
                      placeholder={String((paymentForm.price || 0) * (Number(paymentForm.periods) || 1))}
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-dark/15 text-xs text-dark outline-none focus:border-tertiary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark/70 mb-1">Received via</label>
                    <select
                      value={paymentForm.channel}
                      onChange={(e) => setPaymentForm({ ...paymentForm, channel: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-dark/15 text-xs text-dark outline-none focus:border-tertiary bg-white"
                    >
                      <option value="cash">Cash</option>
                      <option value="bank">Bank</option>
                      <option value="bkash">bKash (send money)</option>
                      <option value="nagad">Nagad (send money)</option>
                      <option value="cheque">Cheque</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark/70 mb-1">Trx ID / Ref</label>
                    <input
                      type="text" maxLength={100}
                      value={paymentForm.trx_id}
                      onChange={(e) => setPaymentForm({ ...paymentForm, trx_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-dark/15 text-xs text-dark outline-none focus:border-tertiary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark/70 mb-1">Note</label>
                  <input
                    type="text" maxLength={500}
                    value={paymentForm.note}
                    onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-dark/15 text-xs text-dark outline-none focus:border-tertiary"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentForm(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-dark/60 hover:bg-dark/5 border-none bg-transparent cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={paymentSaving}
                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer border-none"
                  >
                    {paymentSaving ? "Saving..." : "Save Payment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL: Register New School Client ── */}
        {addSchoolModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-dark/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative animate-[scaleIn_0.2s_ease-out]">
              <button
                type="button"
                onClick={() => setAddSchoolModalOpen(false)}
                className="absolute top-4 right-4 text-dark/40 hover:text-dark transition cursor-pointer border-none bg-transparent"
              >
                <FiX className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2 mb-4">
                <FiServer className="w-5 h-5 text-tertiary" />
                <h3 className="text-lg font-bold text-dark">Register New Client Instance</h3>
              </div>

              <form onSubmit={handleCreateSchool} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-dark/70 mb-1">Institution / Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EduBari Academy"
                    value={newSchoolForm.client_name}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, client_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-dark/15 text-xs text-dark outline-none focus:border-tertiary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark/70 mb-1">App Domain Binding *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. academy.edubari.bd"
                    value={newSchoolForm.domain}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, domain: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-dark/15 text-xs text-dark outline-none focus:border-tertiary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark/70 mb-1">Client Type</label>
                    <p className="w-full px-3 py-2 rounded-xl border border-dark/10 bg-dark/3 text-xs font-semibold text-dark/70">
                      School ERP (Laravel/Blade)
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-dark/70 mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +88017xxxxxxxx"
                      value={newSchoolForm.phone}
                      onChange={(e) => setNewSchoolForm({ ...newSchoolForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-dark/15 text-xs text-dark outline-none focus:border-tertiary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark/70 mb-1">Activate Pricing Plan *</label>
                  <select
                    required
                    value={newSchoolForm.plan_id}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, plan_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-dark/15 text-xs text-dark outline-none focus:border-tertiary bg-white"
                  >
                    <option value="">Select Pricing Plan...</option>
                    {plansList.filter((p) => (p.plan_type || p.planType) === "school_erp").map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.plan_name || p.name} (৳{Number(p.price || 0).toLocaleString()} / {p.duration_days || 30} days)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAddSchoolModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-dark/15 text-xs font-semibold text-dark/60 hover:bg-dark/5 border-none bg-transparent cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addSchoolLoading}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-tertiary to-[#8B5CF6] text-white text-xs font-bold shadow-md hover:shadow-tertiary/20 cursor-pointer border-none"
                  >
                    {addSchoolLoading ? "Creating..." : "Save & Generate API Credentials"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL: Show Generated Credentials ── */}
        {createdCredentials && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-dark/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
              <button
                type="button"
                onClick={() => setCreatedCredentials(null)}
                className="absolute top-4 right-4 text-dark/40 hover:text-dark cursor-pointer border-none bg-transparent"
              >
                <FiX className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <FiCheck className="w-6 h-6" />
                <h3 className="text-lg font-extrabold">Client Instance Registered!</h3>
              </div>
              <p className="text-xs text-dark/60 mb-4">
                Give the following <strong>API Credentials</strong> to the School ERP developer to place in their <code>.env</code> file:
              </p>

              <div className="space-y-3 bg-dark/5 p-4 rounded-xl font-mono text-xs text-dark border border-dark/10">
                <div>
                  <span className="text-dark/50 text-[10px] uppercase font-bold tracking-wider block">EDUBARI_API_URL</span>
                  <p className="font-bold select-all text-tertiary mt-0.5">https://edubari.bd</p>
                </div>
                <div>
                  <span className="text-dark/50 text-[10px] uppercase font-bold tracking-wider block">ERP_API_TOKEN</span>
                  <p className="font-bold select-all text-dark break-all mt-0.5">{createdCredentials.erp_api_token || createdCredentials.erpToken || "Generated Token"}</p>
                </div>
                <div>
                  <span className="text-dark/50 text-[10px] uppercase font-bold tracking-wider block">ERP_API_SECRET</span>
                  <p className="font-bold select-all text-dark break-all mt-0.5">{createdCredentials.erp_secret || createdCredentials.erpSecret || "Generated Secret"}</p>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = `EDUBARI_API_URL=https://edubari.bd\nERP_API_TOKEN=${createdCredentials.erp_api_token || createdCredentials.erpToken}\nERP_API_SECRET=${createdCredentials.erp_secret || createdCredentials.erpSecret}`;
                    navigator.clipboard.writeText(text);
                    alert("Credentials copied to clipboard!");
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer border-none"
                >
                  <FiCopy className="w-4 h-4" /> Copy Credentials (.env Format)
                </button>
                <button
                  type="button"
                  onClick={() => setCreatedCredentials(null)}
                  className="px-4 py-2 rounded-xl border border-dark/15 text-xs font-semibold text-dark/60 cursor-pointer border-none bg-transparent"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
