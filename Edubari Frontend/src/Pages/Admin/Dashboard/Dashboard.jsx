import React from "react";
import {
    FiUsers,
    FiDollarSign,
    FiBriefcase,
    FiMessageSquare,
    FiTrendingUp,
    FiTrendingDown,
    FiArrowRight,
    FiPlus,
    FiEdit3,
    FiSend,
    FiEye,
    FiMoreHorizontal,
    FiCalendar,
    FiClock,
} from "react-icons/fi";

/* ── Stat Cards ── */
const stats = [
    {
        label: "Total Users",
        value: "12,845",
        change: "+12.5%",
        up: true,
        icon: FiUsers,
        gradient: "from-tertiary to-[#6366F1]",
        shadow: "shadow-tertiary/20",
    },
    {
        label: "Revenue",
        value: "৳4,52,300",
        change: "+8.2%",
        up: true,
        icon: FiDollarSign,
        gradient: "from-emerald-500 to-teal-500",
        shadow: "shadow-emerald-500/20",
    },
    {
        label: "Projects",
        value: "284",
        change: "+23.1%",
        up: true,
        icon: FiBriefcase,
        gradient: "from-amber-500 to-orange-500",
        shadow: "shadow-amber-500/20",
    },
    {
        label: "Messages",
        value: "1,024",
        change: "-3.4%",
        up: false,
        icon: FiMessageSquare,
        gradient: "from-rose-500 to-pink-500",
        shadow: "shadow-rose-500/20",
    },
];

/* ── Revenue Chart (visual bars) ── */
const revenueData = [
    { month: "Jul", value: 65 },
    { month: "Aug", value: 45 },
    { month: "Sep", value: 80 },
    { month: "Oct", value: 55 },
    { month: "Nov", value: 90 },
    { month: "Dec", value: 70 },
    { month: "Jan", value: 85 },
    { month: "Feb", value: 60 },
    { month: "Mar", value: 95 },
];

/* ── Recent Activity ── */
const activities = [
    {
        id: 1,
        user: "Raihan Ahmed",
        action: "Purchased Pro Plan",
        time: "2 min ago",
        status: "completed",
        avatar: "R",
    },
    {
        id: 2,
        user: "Sara Khan",
        action: "Submitted a new project",
        time: "15 min ago",
        status: "pending",
        avatar: "S",
    },
    {
        id: 3,
        user: "Tanvir Hasan",
        action: "Sent a new message",
        time: "1 hr ago",
        status: "info",
        avatar: "T",
    },
    {
        id: 4,
        user: "Nusrat Jahan",
        action: "Updated profile details",
        time: "3 hrs ago",
        status: "completed",
        avatar: "N",
    },
    {
        id: 5,
        user: "Farhan Labib",
        action: "Requested a refund",
        time: "5 hrs ago",
        status: "warning",
        avatar: "F",
    },
];

const statusStyles = {
    completed:
        "bg-emerald-50 text-emerald-600 border-emerald-200/60",
    pending:
        "bg-amber-50 text-amber-600 border-amber-200/60",
    info: "bg-blue-50 text-blue-600 border-blue-200/60",
    warning:
        "bg-rose-50 text-rose-600 border-rose-200/60",
};

/* ── Quick Actions ── */
const quickActions = [
    { label: "Add User", icon: FiPlus, color: "text-tertiary", bg: "bg-tertiary/8 hover:bg-tertiary/14 border-tertiary/10" },
    { label: "New Post", icon: FiEdit3, color: "text-emerald-600", bg: "bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200/40" },
    { label: "Send Mail", icon: FiSend, color: "text-amber-600", bg: "bg-amber-50 hover:bg-amber-100/80 border-amber-200/40" },
    { label: "View Reports", icon: FiEye, color: "text-rose-600", bg: "bg-rose-50 hover:bg-rose-100/80 border-rose-200/40" },
];

const Dashboard = () => {
    return (
        <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
            {/* ─── Stat Cards ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
                {stats.map((s) => (
                    <div
                        key={s.label}
                        className="group relative rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 sm:p-6 shadow-lg shadow-dark/[0.03] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                    >
                        {/* Icon badge */}
                        <div
                            className={`w-11 h-11 rounded-xl bg-linear-to-br ${s.gradient} flex items-center justify-center shadow-lg ${s.shadow} mb-4`}
                        >
                            <s.icon className="w-5 h-5 text-white" />
                        </div>

                        <p className="text-sm text-dark/45 font-semibold">{s.label}</p>
                        <div className="flex items-end justify-between mt-1">
                            <h3 className="text-2xl font-extrabold text-dark tracking-tight">
                                {s.value}
                            </h3>
                            <span
                                className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-lg ${
                                    s.up
                                        ? "text-emerald-600 bg-emerald-50"
                                        : "text-rose-500 bg-rose-50"
                                }`}
                            >
                                {s.up ? (
                                    <FiTrendingUp className="w-3 h-3" />
                                ) : (
                                    <FiTrendingDown className="w-3 h-3" />
                                )}
                                {s.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ─── Revenue Chart + Quick Actions ─── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
                {/* Revenue Chart */}
                <div className="xl:col-span-2 rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 sm:p-6 shadow-lg shadow-dark/[0.03]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-bold text-dark">Revenue Overview</h3>
                            <p className="text-xs text-dark/40 font-medium mt-0.5 flex items-center gap-1.5">
                                <FiCalendar className="w-3 h-3" />
                                Last 9 months
                            </p>
                        </div>
                        <button className="p-2 rounded-lg text-dark/30 hover:text-dark/60 hover:bg-dark/5 transition-all duration-200 cursor-pointer">
                            <FiMoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Bars */}
                    <div className="flex items-end justify-between gap-2 sm:gap-3 h-[200px]">
                        {revenueData.map((d) => (
                            <div
                                key={d.month}
                                className="flex-1 flex flex-col items-center gap-2"
                            >
                                <div className="w-full relative group/bar">
                                    {/* Tooltip */}
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-dark text-white text-[10px] font-bold whitespace-nowrap opacity-0 group-hover/bar:opacity-100 transition-all duration-200 pointer-events-none shadow-lg">
                                        ৳{(d.value * 500).toLocaleString()}
                                    </span>
                                    <div
                                        className="w-full rounded-t-lg bg-linear-to-t from-tertiary/80 to-[#8B5CF6]/60 hover:from-tertiary hover:to-[#8B5CF6] transition-all duration-300 cursor-pointer"
                                        style={{ height: `${d.value * 1.8}px` }}
                                    />
                                </div>
                                <span className="text-[10px] sm:text-xs text-dark/35 font-semibold">
                                    {d.month}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 sm:p-6 shadow-lg shadow-dark/[0.03]">
                    <h3 className="text-base font-bold text-dark mb-5">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {quickActions.map((a) => (
                            <button
                                key={a.label}
                                className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border ${a.bg} transition-all duration-200 cursor-pointer hover:-translate-y-0.5`}
                            >
                                <a.icon className={`w-5 h-5 ${a.color}`} />
                                <span className={`text-xs font-bold ${a.color}`}>
                                    {a.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Mini Stats */}
                    <div className="mt-5 p-4 rounded-xl bg-linear-to-br from-tertiary/8 to-[#8B5CF6]/5 border border-tertiary/10">
                        <div className="flex items-center gap-2 mb-2">
                            <FiClock className="w-3.5 h-3.5 text-tertiary" />
                            <span className="text-xs font-bold text-dark/70">
                                Today's Summary
                            </span>
                        </div>
                        <div className="space-y-2">
                            {[
                                { label: "New signups", val: "24" },
                                { label: "Orders", val: "18" },
                                { label: "Pending tasks", val: "7" },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-center justify-between"
                                >
                                    <span className="text-xs text-dark/45 font-medium">
                                        {item.label}
                                    </span>
                                    <span className="text-xs font-bold text-dark/70">
                                        {item.val}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Recent Activity ─── */}
            <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 sm:p-6 shadow-lg shadow-dark/[0.03]">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-bold text-dark">Recent Activity</h3>
                    <button className="text-xs font-bold text-tertiary hover:text-tertiary-dark flex items-center gap-1 transition-colors duration-200 cursor-pointer">
                        View All <FiArrowRight className="w-3 h-3" />
                    </button>
                </div>

                {/* Table - Desktop */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-bold text-dark/35 uppercase tracking-wider">
                                <th className="pb-4 pl-1">User</th>
                                <th className="pb-4">Activity</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4 text-right pr-1">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark/5">
                            {activities.map((a) => (
                                <tr
                                    key={a.id}
                                    className="group hover:bg-dark/[0.02] transition-colors duration-150"
                                >
                                    <td className="py-3.5 pl-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-tertiary/20 to-[#8B5CF6]/15 flex items-center justify-center">
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
                                                statusStyles[a.status]
                                            }`}
                                        >
                                            {a.status.charAt(0).toUpperCase() +
                                                a.status.slice(1)}
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

                {/* Cards - Mobile */}
                <div className="sm:hidden space-y-3">
                    {activities.map((a) => (
                        <div
                            key={a.id}
                            className="flex items-start gap-3 p-3 rounded-xl bg-white/50 border border-white/30"
                        >
                            <div className="w-9 h-9 rounded-lg bg-linear-to-br from-tertiary/20 to-[#8B5CF6]/15 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-tertiary">
                                    {a.avatar}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-dark/80 truncate">
                                        {a.user}
                                    </span>
                                    <span
                                        className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                            statusStyles[a.status]
                                        }`}
                                    >
                                        {a.status.charAt(0).toUpperCase() +
                                            a.status.slice(1)}
                                    </span>
                                </div>
                                <p className="text-xs text-dark/45 font-medium mt-0.5">
                                    {a.action}
                                </p>
                                <p className="text-[10px] text-dark/30 font-medium mt-1">
                                    {a.time}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
