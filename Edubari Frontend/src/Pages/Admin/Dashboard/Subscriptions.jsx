import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
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
} from "react-icons/fi";
import { AuthContext } from "../../../Firebase/AuthContext";

const API_URL = import.meta.env.VITE_SERVER || "http://localhost:3000";

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
  const start = new Date(item?.submittedAt || "");
  if (Number.isNaN(start.getTime())) {
    return {
      status: "Unknown",
      expireDate: "-",
      recommendation: "Review start date",
    };
  }

  const durationDays = parseDurationDays(item?.selectedPlanDuration);
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
    (expireAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
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

const Subscriptions = () => {
  const { user } = useContext(AuthContext);
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getAuthHeaders = useCallback(
    async (withJson = false) => {
      const token = await user?.getIdToken?.();
      if (!token) {
        throw new Error("Unauthorized access");
      }

      return withJson
        ? {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        : {
            Authorization: `Bearer ${token}`,
          };
    },
    [user],
  );

  const totalSubscriptions = useMemo(
    () => subscriptions.length,
    [subscriptions],
  );

  const totalRevenue = useMemo(() => {
    return subscriptions.reduce((sum, item) => {
      const price = Number(item?.selectedPlanPrice);
      return Number.isFinite(price) ? sum + price : sum;
    }, 0);
  }, [subscriptions]);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/subscriptions`, {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch subscriptions");
      }

      const data = await response.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.subscriptions)
          ? data.subscriptions
          : [];

      const sorted = [...list].sort((a, b) => {
        const aTime = new Date(a?.submittedAt || 0).getTime();
        const bTime = new Date(b?.submittedAt || 0).getTime();
        return bTime - aTime;
      });

      setSubscriptions(sorted);
    } catch (err) {
      setSubscriptions([]);
      setError(err.message || "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const fetchSubscriptionById = useCallback(
    async (id) => {
      const response = await fetch(`${API_URL}/subscriptions/${id}`, {
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch subscription details");
      }

      const data = await response.json();
      return data?.subscription || data;
    },
    [getAuthHeaders],
  );

  const handleViewDetails = async (id) => {
    setDetailsLoading(true);
    setError("");

    try {
      const details = await fetchSubscriptionById(id);
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
      const response = await fetch(`${API_URL}/subscriptions/${id}`, {
        method: "PATCH",
        headers: await getAuthHeaders(true),
        body: JSON.stringify({ adminStatus: "reviewed" }),
      });

      if (!response.ok) {
        throw new Error("Failed to update subscription");
      }

      const data = await response.json();
      const updated = data?.subscription || data;

      setSubscriptions((prev) =>
        prev.map((item) => (item._id === id ? { ...item, ...updated } : item)),
      );

      if (selectedSubscription?._id === id) {
        setSelectedSubscription((prev) => ({ ...prev, ...updated }));
      }
    } catch (err) {
      setError(err.message || "Failed to update subscription");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleDeleteSubscription = async (id) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this subscription?",
    );
    if (!shouldDelete) return;

    setActionLoadingId(id);
    setError("");

    try {
      const response = await fetch(`${API_URL}/subscriptions/${id}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to delete subscription");
      }

      setSubscriptions((prev) => prev.filter((item) => item._id !== id));
      if (selectedSubscription?._id === id) {
        setSelectedSubscription(null);
      }
    } catch (err) {
      setError(err.message || "Failed to delete subscription");
    } finally {
      setActionLoadingId("");
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  return (
    <div className="space-y-6 animate-[fadeInUp_0.35s_ease-out]">
      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 sm:p-6 shadow-lg shadow-dark/3">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-dark tracking-tight">
              Subscriptions
            </h2>
            <p className="text-xs sm:text-sm text-dark/45 font-medium mt-1">
              All submitted subscription requests from the purchase form
            </p>
          </div>

          <button
            onClick={fetchSubscriptions}
            className="px-3 py-2 rounded-xl border border-dark/10 text-sm font-semibold text-dark/60 hover:bg-dark/5 transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
          >
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl border border-white/40 bg-white/75 p-3">
            <p className="text-xs font-bold text-dark/40">Total Requests</p>
            <p className="text-xl font-extrabold text-dark mt-1">
              {totalSubscriptions}
            </p>
          </div>
          <div className="rounded-xl border border-white/40 bg-white/75 p-3">
            <p className="text-xs font-bold text-dark/40">Plan Revenue</p>
            <p className="text-xl font-extrabold text-dark mt-1">
              BDT {totalRevenue.toLocaleString()}
            </p>
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

        {!loading && !error && subscriptions.length === 0 && (
          <div className="rounded-xl border border-dark/10 bg-white/60 text-dark/55 text-sm font-semibold px-4 py-6 text-center">
            No subscriptions found.
          </div>
        )}

        {!loading && !error && subscriptions.length > 0 && (
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
                  {subscriptions.map((item) => {
                    const meta = getSubscriptionMeta(item);

                    return (
                      <tr key={item._id} className="border-t border-dark/8">
                        <td className="px-4 py-3 align-top">
                          <p className="text-sm font-bold text-dark">
                            {item.institutionName || "-"}
                          </p>
                          <p className="text-xs text-dark/45 mt-0.5 inline-flex items-center gap-1">
                            <FiMapPin className="w-3 h-3" />
                            {item.address || "-"}
                          </p>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="space-y-1.5">
                            <div className="text-sm font-semibold text-dark flex items-center gap-1.5">
                              <FiUser className="w-3.5 h-3.5 text-dark/45" />
                              <span>{item.fullName || "-"}</span>
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
                            {item.preferredDomain || "-"}
                          </p>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <p className="text-sm font-semibold text-dark">
                            {item.selectedPlanName || "-"}
                          </p>
                          <p className="text-xs text-dark/50 mt-1">
                            {item.selectedPlanDuration || "-"}
                          </p>
                          <p className="text-xs font-bold text-tertiary mt-1">
                            BDT{" "}
                            {Number(
                              item.selectedPlanPrice || 0,
                            ).toLocaleString()}
                          </p>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <p className="text-sm font-semibold text-dark capitalize inline-flex items-center gap-1.5">
                            <FiCreditCard className="w-3.5 h-3.5 text-dark/45" />
                            {item.paymentMethod || "-"}
                          </p>
                          <p className="text-xs text-dark/50 mt-1 break-all">
                            Txn: {item.transactionId || "-"}
                          </p>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <p className="text-xs font-semibold text-dark/65">
                            {formatDateTime(item.submittedAt)}
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
                              onClick={() => handleViewDetails(item._id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-dark/10 text-xs font-bold text-dark/65 hover:bg-dark/5 transition-all duration-150 cursor-pointer"
                            >
                              <FiEye className="w-3.5 h-3.5" />
                              View
                            </button>
                            <button
                              onClick={() => handleMarkReviewed(item._id)}
                              disabled={actionLoadingId === item._id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-200 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FiCheck className="w-3.5 h-3.5" />
                              Reviewed
                            </button>
                            <button
                              onClick={() => handleDeleteSubscription(item._id)}
                              disabled={actionLoadingId === item._id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
              {subscriptions.map((item) => {
                const meta = getSubscriptionMeta(item);

                return (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-dark/10 bg-white/80 p-4 space-y-2.5"
                  >
                    <p className="text-sm font-extrabold text-dark">
                      {item.institutionName || "-"}
                    </p>

                    <div className="space-y-1.5">
                      <div className="text-xs text-dark/60 flex items-center gap-1.5">
                        <FiUser className="w-3.5 h-3.5" />
                        <span>{item.fullName || "-"}</span>
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
                      {item.preferredDomain || "-"}
                    </p>
                    <p className="text-xs text-dark/60 inline-flex items-center gap-1.5">
                      <FiCreditCard className="w-3.5 h-3.5" />
                      {(item.paymentMethod || "-").toString().toUpperCase()}
                    </p>

                    <div className="pt-2 border-t border-dark/8 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-dark/70">
                          {item.selectedPlanName || "-"}
                        </p>
                        <p className="text-[11px] text-dark/50 mt-0.5">
                          {item.selectedPlanDuration || "-"}
                        </p>
                      </div>
                      <p className="text-xs font-extrabold text-tertiary">
                        BDT{" "}
                        {Number(item.selectedPlanPrice || 0).toLocaleString()}
                      </p>
                    </div>

                    <p className="text-[11px] font-semibold text-dark/45">
                      Submitted: {formatDateTime(item.submittedAt)}
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
                        onClick={() => handleViewDetails(item._id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-dark/10 text-[11px] font-bold text-dark/65 hover:bg-dark/5 transition-all duration-150 cursor-pointer"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                        View
                      </button>
                      <button
                        onClick={() => handleMarkReviewed(item._id)}
                        disabled={actionLoadingId === item._id}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-200 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiCheck className="w-3.5 h-3.5" />
                        Reviewed
                      </button>
                      <button
                        onClick={() => handleDeleteSubscription(item._id)}
                        disabled={actionLoadingId === item._id}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-[11px] font-bold text-red-600 hover:bg-red-50 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="rounded-xl border border-dark/10 bg-white/70 text-sm font-semibold text-dark/60 px-4 py-3 inline-flex items-center gap-2">
                <FiLoader className="w-4 h-4 animate-spin" />
                Loading subscription details...
              </div>
            )}

            {!detailsLoading && selectedSubscription?._id && (
              <div className="rounded-2xl border border-dark/10 bg-white/80 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-dark tracking-tight">
                    Subscription Details
                  </h3>
                  <button
                    onClick={() => setSelectedSubscription(null)}
                    className="text-xs font-bold text-dark/45 hover:text-dark transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                  <p className="text-dark/70">
                    <span className="font-bold text-dark">Institution:</span>{" "}
                    {selectedSubscription.institutionName || "-"}
                  </p>
                  <p className="text-dark/70 break-all">
                    <span className="font-bold text-dark">Email:</span>{" "}
                    {selectedSubscription.email || "-"}
                  </p>
                  <p className="text-dark/70">
                    <span className="font-bold text-dark">Phone:</span>{" "}
                    {selectedSubscription.phone || "-"}
                  </p>
                  <p className="text-dark/70">
                    <span className="font-bold text-dark">Plan:</span>{" "}
                    {selectedSubscription.selectedPlanName || "-"}
                  </p>
                  <p className="text-dark/70">
                    <span className="font-bold text-dark">Duration:</span>{" "}
                    {selectedSubscription.selectedPlanDuration || "-"}
                  </p>
                  <p className="text-dark/70">
                    <span className="font-bold text-dark">Submitted:</span>{" "}
                    {formatDateTime(selectedSubscription.submittedAt)}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;
