"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FiAlertCircle,
  FiClock,
  FiGlobe,
  FiLoader,
  FiMail,
  FiPhone,
  FiRefreshCw,
  FiUser,
  FiSearch,
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

const getSubscriptionStatus = (item) => {
  const start = new Date(item?.submitted_at || item?.submittedAt || "");
  if (Number.isNaN(start.getTime())) {
    return { status: "Unknown", expireAt: "-" };
  }

  const durationDays = parseDurationDays(item?.selectedPlanDuration || item?.selected_plan_duration);
  if (!durationDays) {
    return { status: "Unknown", expireAt: "-" };
  }

  const expireDate = new Date(start);
  expireDate.setDate(expireDate.getDate() + durationDays);

  const now = new Date();
  const remainingDays = Math.ceil(
    (expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (remainingDays < 0) {
    return { status: "Expired", expireAt: formatDateTime(expireDate) };
  }

  if (remainingDays <= 7) {
    return { status: "Expiring Soon", expireAt: formatDateTime(expireDate) };
  }

  return { status: "Active", expireAt: formatDateTime(expireDate) };
};

const getStatusBadgeClass = (status) => {
  if (status === "Active") return "bg-emerald-100 text-emerald-700";
  if (status === "Expiring Soon") return "bg-amber-100 text-amber-700";
  if (status === "Expired") return "bg-red-100 text-red-700";
  return "bg-dark/10 text-dark/55";
};

const buildUsersFromSubscriptions = (subscriptions) => {
  const byEmail = new Map();

  subscriptions.forEach((item) => {
    const normalizedEmail = (item?.email || "").trim().toLowerCase();
    const key = normalizedEmail || `missing-${item?.id || item?._id || Math.random()}`;

    if (!byEmail.has(key)) {
      byEmail.set(key, {
        key,
        email: item?.email || "-",
        fullName: item?.full_name || item?.fullName || "-",
        phone: item?.phone || "-",
        institutionNames: new Set(),
        latestDomain: item?.preferred_domain || item?.preferredDomain || "-",
        subscriptionsCount: 0,
        totalSpent: 0,
        plans: new Set(),
        firstSubscribedAt: item?.submitted_at || item?.submittedAt || null,
        lastSubscribedAt: item?.submitted_at || item?.submittedAt || null,
        latestSubscription: item,
      });
    }

    const user = byEmail.get(key);

    user.subscriptionsCount += 1;
    const planPrice = Number(item?.selected_plan_price || item?.selectedPlanPrice || 0);
    user.totalSpent += Number.isFinite(planPrice) ? planPrice : 0;

    const instName = item?.institution_name || item?.institutionName;
    if (instName) {
      user.institutionNames.add(instName);
    }

    const planName = item?.selected_plan_name || item?.selectedPlanName;
    if (planName) {
      user.plans.add(planName);
    }

    const itemTime = new Date(item?.submitted_at || item?.submittedAt || 0).getTime();
    const firstTime = new Date(user.firstSubscribedAt || 0).getTime();
    const lastTime = new Date(user.lastSubscribedAt || 0).getTime();

    if (!user.firstSubscribedAt || itemTime < firstTime) {
      user.firstSubscribedAt = item?.submitted_at || item?.submittedAt || user.firstSubscribedAt;
    }

    if (!user.lastSubscribedAt || itemTime > lastTime) {
      user.lastSubscribedAt = item?.submitted_at || item?.submittedAt || user.lastSubscribedAt;
      user.latestSubscription = item;
      user.fullName = item?.full_name || item?.fullName || user.fullName;
      user.phone = item?.phone || user.phone;
      user.email = item?.email || user.email;
      user.latestDomain = item?.preferred_domain || item?.preferredDomain || user.latestDomain;
    }
  });

  return [...byEmail.values()]
    .map((user) => {
      const latest = user.latestSubscription || {};
      const statusInfo = getSubscriptionStatus(latest);

      return {
        ...user,
        institutionNames: [...user.institutionNames],
        plans: [...user.plans],
        lastPlanName: latest?.selected_plan_name || latest?.selectedPlanName || "-",
        lastPlanDuration: latest?.selected_plan_duration || latest?.selectedPlanDuration || "-",
        status: statusInfo.status,
        expireAt: statusInfo.expireAt,
      };
    })
    .sort((a, b) => {
      const aTime = new Date(a?.lastSubscribedAt || 0).getTime();
      const bTime = new Date(b?.lastSubscribedAt || 0).getTime();
      return bTime - aTime;
    });
};

export default function AdminUsersPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/subscriptions");
      if (!response.ok) {
        throw new Error("Failed to fetch subscriptions");
      }

      const data = await response.json();
      const list = Array.isArray(data) ? data : [];

      setSubscriptions(list);
      setUsers(buildUsersFromSubscriptions(list));
    } catch (err) {
      setSubscriptions([]);
      setUsers([]);
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /* Derived Stats */
  const avgSubscriptionsPerUser = useMemo(() => {
    if (!users.length) return 0;
    return (subscriptions.length / users.length).toFixed(2);
  }, [subscriptions.length, users.length]);

  const totalUserRevenue = useMemo(() => {
    return users.reduce((sum, user) => sum + user.totalSpent, 0);
  }, [users]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const text = u.fullName.toLowerCase() + u.email.toLowerCase() + u.phone.toLowerCase() + u.latestDomain.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [users, search]);

  return (
    <div className="space-y-6 animate-[fadeInUp_0.35s_ease-out]">
      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 sm:p-6 shadow-lg shadow-dark/3">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-dark tracking-tight">
              Users
            </h2>
            <p className="text-xs sm:text-sm text-dark/45 font-medium mt-1">
              Unique users grouped by email from subscription data
            </p>
          </div>

          <button
            type="button"
            onClick={fetchUsers}
            className="px-3 py-2 rounded-xl border border-dark/10 text-sm font-semibold text-dark/60 hover:bg-dark/5 transition-all duration-200 cursor-pointer inline-flex items-center gap-2 border-none bg-transparent"
          >
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <div className="rounded-xl border border-white/40 bg-white/75 p-3">
            <p className="text-xs font-bold text-dark/40">Unique Users</p>
            <p className="text-xl font-extrabold text-dark mt-1">
              {users.length}
            </p>
          </div>
          <div className="rounded-xl border border-white/40 bg-white/75 p-3">
            <p className="text-xs font-bold text-dark/40">Subscriptions</p>
            <p className="text-xl font-extrabold text-dark mt-1">
              {subscriptions.length}
            </p>
          </div>
          <div className="rounded-xl border border-white/40 bg-white/75 p-3">
            <p className="text-xs font-bold text-dark/40">
              Avg Subscriptions/User
            </p>
            <p className="text-xl font-extrabold text-dark mt-1">
              {avgSubscriptionsPerUser}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-white/40 bg-white/75 p-3 mb-5">
          <p className="text-xs font-bold text-dark/40">Total User Revenue</p>
          <p className="text-xl font-extrabold text-dark mt-1">
            BDT {totalUserRevenue.toLocaleString()}
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center border border-dark/10 bg-white/60 rounded-xl px-3 py-2 w-full sm:max-w-xs transition-all focus-within:border-tertiary/50 mb-5">
          <FiSearch className="w-4 h-4 text-dark/30 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-medium bg-transparent outline-none text-dark placeholder:text-dark/30 border-none p-0"
          />
        </div>

        {loading && (
          <div className="py-16 flex items-center justify-center gap-2 text-sm text-dark/50 font-medium">
            <FiLoader className="w-4 h-4 animate-spin" />
            Loading users...
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
            No users found.
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <div className="hidden xl:block overflow-x-auto rounded-2xl border border-dark/8">
              <table className="min-w-full bg-white/80">
                <thead className="bg-dark/3">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-black text-dark/55 uppercase tracking-wide">
                      User
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black text-dark/55 uppercase tracking-wide">
                      Contact
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black text-dark/55 uppercase tracking-wide">
                      Institutions
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black text-dark/55 uppercase tracking-wide">
                      Latest Domain
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black text-dark/55 uppercase tracking-wide">
                      Activity
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black text-dark/55 uppercase tracking-wide">
                      Revenue
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black text-dark/55 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black text-dark/55 uppercase tracking-wide">
                      Last Active
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr key={user.key} className="border-t border-dark/8">
                      <td className="px-4 py-3 align-top">
                        <p className="text-sm font-bold text-dark">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-dark/50 mt-1">
                          Latest Plan: {user.lastPlanName} (
                          {user.lastPlanDuration})
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <p className="text-xs text-dark/60 inline-flex items-center gap-1.5">
                          <FiMail className="w-3.5 h-3.5" />
                          {user.email}
                        </p>
                        <p className="text-xs text-dark/60 inline-flex items-center gap-1.5 mt-1">
                          <FiPhone className="w-3.5 h-3.5" />
                          {user.phone}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <p className="text-xs text-dark/60">
                          {user.institutionNames.length
                            ? user.institutionNames.join(", ")
                            : "-"}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <p className="text-xs text-dark/60 inline-flex items-center gap-1.5 break-all">
                          <FiGlobe className="w-3.5 h-3.5 shrink-0" />
                          {user.latestDomain}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <p className="text-xs font-semibold text-dark/65">
                          {user.subscriptionsCount} subscription
                          {user.subscriptionsCount > 1 ? "s" : ""}
                        </p>
                        <p className="text-[11px] text-dark/45 mt-1">
                          First: {formatDateTime(user.firstSubscribedAt)}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <p className="text-xs font-extrabold text-tertiary">
                          BDT {Number(user.totalSpent || 0).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold ${getStatusBadgeClass(
                            user.status
                          )}`}
                        >
                          {user.status}
                        </span>
                        <p className="text-[11px] text-dark/45 mt-1">
                          Expires: {user.expireAt}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <p className="text-xs text-dark/60 inline-flex items-center gap-1.5">
                          <FiClock className="w-3.5 h-3.5" />
                          {formatDateTime(user.lastSubscribedAt)}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="xl:hidden grid grid-cols-1 gap-3">
              {filtered.map((user) => (
                <div
                  key={user.key}
                  className="rounded-2xl border border-dark/10 bg-white/80 p-4 space-y-2.5"
                >
                  <p className="text-sm font-extrabold text-dark inline-flex items-center gap-2">
                    <FiUser className="w-4 h-4 text-dark/55" />
                    {user.fullName}
                  </p>

                  <p className="text-xs text-dark/60 inline-flex items-center gap-1.5 break-all">
                    <FiMail className="w-3.5 h-3.5" />
                    {user.email}
                  </p>
                  <p className="text-xs text-dark/60 inline-flex items-center gap-1.5">
                    <FiPhone className="w-3.5 h-3.5" />
                    {user.phone}
                  </p>
                  <p className="text-xs text-dark/60 inline-flex items-center gap-1.5 break-all">
                    <FiGlobe className="w-3.5 h-3.5" />
                    {user.latestDomain}
                  </p>

                  <div className="pt-2 border-t border-dark/8 space-y-1">
                    <p className="text-[11px] font-semibold text-dark/55">
                      Institutions: {user.institutionNames.length || 0}
                    </p>
                    <p className="text-[11px] font-semibold text-dark/55">
                      Subscriptions: {user.subscriptionsCount}
                    </p>
                    <p className="text-[11px] font-semibold text-dark/55">
                      Total Spent: BDT{" "}
                      {Number(user.totalSpent || 0).toLocaleString()}
                    </p>
                    <p className="text-[11px] font-semibold text-dark/55">
                      Latest Plan: {user.lastPlanName} ({user.lastPlanDuration})
                    </p>
                    <p className="text-[11px] font-semibold text-dark/55">
                      Status: {user.status}
                    </p>
                    <p className="text-[11px] font-semibold text-dark/55">
                      Expires: {user.expireAt}
                    </p>
                    <p className="text-[11px] font-semibold text-dark/55">
                      Last Active: {formatDateTime(user.lastSubscribedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
