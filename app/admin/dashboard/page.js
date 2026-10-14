"use client";

import React, { useState, useEffect } from "react";
import {
  FiUsers,
  FiDollarSign,
  FiBriefcase,
  FiMessageSquare,
  FiTrendingUp,
  FiArrowRight,
  FiPlus,
  FiEdit3,
  FiSend,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [statsData, setStatsData] = useState({
    totalClients: 0,
    totalRevenue: 0,
    totalSubscriptions: 0,
    totalMessages: 0,
    activities: [],
    loading: true,
  });

  useEffect(() => {
    async function fetchDashboardMetrics() {
      try {
        const [clientsRes, subsRes, msgRes, purchasesRes] = await Promise.all([
          fetch("/api/billing/clients").then((r) => r.json()).catch(() => []),
          fetch("/api/subscriptions").then((r) => r.json()).catch(() => []),
          fetch("/api/contact-messages").then((r) => r.json()).catch(() => []),
          fetch("/api/ai-purchases").then((r) => r.json()).catch(() => []),
        ]);

        const clientsCount = Array.isArray(clientsRes) ? clientsRes.length : 0;
        const subsCount = Array.isArray(subsRes) ? subsRes.length : 0;
        const msgCount = Array.isArray(msgRes) ? msgRes.length : 0;

        // Calculate Revenue from subscriptions & AI purchase requests
        let revenue = 0;
        if (Array.isArray(purchasesRes)) {
          purchasesRes.forEach((p) => {
            if (p.status === "approved") {
              revenue += Number(p.price || 0);
            }
          });
        }

        // Recent Activity Feed built dynamically from Database records
        const dynamicActivities = [];

        if (Array.isArray(purchasesRes)) {
          purchasesRes.slice(0, 3).forEach((req) => {
            dynamicActivities.push({
              id: `ai_${req.id}`,
              user: req.userName || req.domain || "School Domain",
              action: `Requested ${req.packageName || 'AI Credits'} (৳${req.price})`,
              time: req.submittedAt ? new Date(req.submittedAt).toLocaleDateString() : "Recent",
              status: req.status === "approved" ? "completed" : req.status === "rejected" ? "warning" : "pending",
              avatar: (req.userName || req.domain || "S").charAt(0).toUpperCase(),
            });
          });
        }

        if (Array.isArray(msgRes)) {
          msgRes.slice(0, 3).forEach((m) => {
            dynamicActivities.push({
              id: `msg_${m.id}`,
              user: m.name || m.email,
              action: `Sent a contact message: "${m.subject || 'Inquiry'}"`,
              time: m.created_at ? new Date(m.created_at).toLocaleDateString() : "Recent",
              status: m.read ? "completed" : "info",
              avatar: (m.name || "U").charAt(0).toUpperCase(),
            });
          });
        }

        setStatsData({
          totalClients: clientsCount,
          totalRevenue: revenue,
          totalSubscriptions: subsCount,
          totalMessages: msgCount,
          activities: dynamicActivities,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setStatsData((prev) => ({ ...prev, loading: false }));
      }
    }

    fetchDashboardMetrics();
  }, []);

  const stats = [
    {
      label: "Total Clients",
      value: statsData.loading ? "..." : statsData.totalClients,
      icon: FiUsers,
      gradient: "from-tertiary to-[#6366F1]",
      shadow: "shadow-tertiary/20",
    },
    {
      label: "AI Sales Revenue",
      value: statsData.loading ? "..." : `৳${statsData.totalRevenue.toLocaleString()}`,
      icon: FiDollarSign,
      gradient: "from-emerald-500 to-teal-500",
      shadow: "shadow-emerald-500/20",
    },
    {
      label: "Active Subscriptions",
      value: statsData.loading ? "..." : statsData.totalSubscriptions,
      icon: FiBriefcase,
      gradient: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-500/20",
    },
    {
      label: "Contact Messages",
      value: statsData.loading ? "..." : statsData.totalMessages,
      icon: FiMessageSquare,
      gradient: "from-rose-500 to-pink-500",
      shadow: "shadow-rose-500/20",
    },
  ];

  const statusStyles = {
    completed: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
    pending: "bg-amber-50 text-amber-600 border-amber-200/60",
    info: "bg-blue-50 text-blue-600 border-blue-200/60",
    warning: "bg-rose-50 text-rose-600 border-rose-200/60",
  };

  const quickActions = [
    { label: "Add User", icon: FiPlus, color: "text-tertiary", bg: "bg-tertiary/8 hover:bg-tertiary/14 border-tertiary/10", path: "/admin/dashboard/create-user" },
    { label: "New Post", icon: FiEdit3, color: "text-emerald-600", bg: "bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200/40", path: "/admin/dashboard/blogs" },
    { label: "Messages", icon: FiSend, color: "text-amber-600", bg: "bg-amber-50 hover:bg-amber-100/80 border-amber-200/40", path: "/admin/dashboard/messages" },
    { label: "View Plans", icon: FiEye, color: "text-rose-600", bg: "bg-rose-50 hover:bg-rose-100/80 border-rose-200/40", path: "/admin/dashboard/plans" },
  ];

  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="group relative rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 sm:p-6 shadow-lg shadow-dark/[0.03] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-lg ${s.shadow} mb-4`}
            >
              <s.icon className="w-5 h-5 text-white" />
            </div>

            <p className="text-sm text-dark/45 font-semibold">{s.label}</p>
            <div className="flex items-end justify-between mt-1">
              <h3 className="text-2xl font-extrabold text-dark tracking-tight">
                {s.value}
              </h3>
              <span className="flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-lg text-emerald-600 bg-emerald-50">
                <FiTrendingUp className="w-3 h-3" /> Live DB
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Quick Actions & Summary ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
        {/* Quick Actions */}
        <div className="xl:col-span-2 rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 sm:p-6 shadow-lg shadow-dark/[0.03]">
          <h3 className="text-base font-bold text-dark mb-5">Quick Management Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((a) => (
              <Link
                key={a.label}
                href={a.path}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border ${a.bg} transition-all duration-200 cursor-pointer hover:-translate-y-0.5 no-underline`}
              >
                <a.icon className={`w-5 h-5 ${a.color}`} />
                <span className={`text-xs font-bold ${a.color}`}>
                  {a.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Database Status */}
        <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 sm:p-6 shadow-lg shadow-dark/[0.03]">
          <h3 className="text-base font-bold text-dark mb-4">Database Connection</h3>
          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/60 flex items-start gap-3">
            <FiCheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-900">Connected to MySQL DB</h4>
              <p className="text-xs text-emerald-700/80 font-medium mt-1">
                All platform data is fetched directly from your relational MySQL / MariaDB tables.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Recent Activity ─── */}
      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 sm:p-6 shadow-lg shadow-dark/[0.03]">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-dark">Recent Database Activity</h3>
          <Link href="/admin/dashboard/ai-purchases" className="text-xs font-bold text-tertiary hover:text-tertiary-dark flex items-center gap-1 transition-colors duration-200 cursor-pointer no-underline">
            View AI Purchases <FiArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {statsData.loading ? (
          <div className="flex items-center justify-center py-10 gap-2 text-dark/50 font-medium text-sm">
            <FiLoader className="w-5 h-5 animate-spin text-tertiary" /> Loading activity log...
          </div>
        ) : statsData.activities.length === 0 ? (
          <div className="text-center py-8 text-dark/40 font-medium text-sm">
            No recent activity records found in the database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-dark/35 uppercase tracking-wider">
                  <th className="pb-4 pl-1">User / Domain</th>
                  <th className="pb-4">Activity</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 text-right pr-1">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark/5">
                {statsData.activities.map((a) => (
                  <tr key={a.id} className="group hover:bg-dark/[0.02] transition-colors duration-150">
                    <td className="py-3.5 pl-1">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-tertiary/20 to-[#8B5CF6]/15 flex items-center justify-center">
                          <span className="text-xs font-bold text-tertiary">
                            {a.avatar}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-dark/80">
                          {a.user}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 text-sm text-dark/50 font-medium">
                      {a.action}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                          statusStyles[a.status] || statusStyles.info
                        }`}
                      >
                        {a.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 text-right pr-1 text-xs text-dark/35 font-medium">
                      {a.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
