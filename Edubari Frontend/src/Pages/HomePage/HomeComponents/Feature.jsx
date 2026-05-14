import React from "react";
import {
    FiBookOpen,
    FiUsers,
    FiCheckSquare,
    FiBarChart2,
    FiFileText,
    FiDollarSign,
    FiBell,
    FiTrendingUp,
} from "react-icons/fi";

const features = [
    {
        icon: <FiBookOpen className="h-6 w-6" />,
        title: "Student Management",
        description: "Complete student profiles, enrollment, and digital academic records for easy access.",
        color: "text-blue-600",
        bg: "bg-blue-50",
    },
    {
        icon: <FiUsers className="h-6 w-6" />,
        title: "Teacher Panel",
        description: "Dedicated dashboard for teachers to manage their classes, grades, and attendance.",
        color: "text-indigo-600",
        bg: "bg-indigo-50",
    },
    {
        icon: <FiCheckSquare className="h-6 w-6" />,
        title: "Attendance Tracking",
        description: "Digital attendance system with automated reports and real-time analytics for parents.",
        color: "text-violet-600",
        bg: "bg-violet-50",
    },
    {
        icon: <FiBarChart2 className="h-6 w-6" />,
        title: "Result Management",
        description: "Automated grading system, digital report cards, and instant result publishing.",
        color: "text-rose-600",
        bg: "bg-rose-50",
    },
    {
        icon: <FiFileText className="h-6 w-6" />,
        title: "Online Exam System",
        description: "Create and conduct secure online exams with automated marking and performance tracking.",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
    },
    {
        icon: <FiDollarSign className="h-6 w-6" />,
        title: "Fee Management",
        description: "Track fee collection, generate digital receipts, and manage student payments seamlessly.",
        color: "text-amber-600",
        bg: "bg-amber-50",
    },
    {
        icon: <FiBell className="h-6 w-6" />,
        title: "Notice Board",
        description: "Instant announcements and digital notices for students, parents, and staff members.",
        color: "text-cyan-600",
        bg: "bg-cyan-50",
    },
    {
        icon: <FiTrendingUp className="h-6 w-6" />,
        title: "Reports & Analytics",
        description: "Comprehensive data-driven reports to monitor and improve institutional performance.",
        color: "text-blue-600",
        bg: "bg-blue-50",
    },
];

const Feature = () => {
    return (
    <section className="w-full px-4 sm:px-6 md:px-12 py-16 sm:py-20 lg:py-28 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-widest uppercase mb-6 shadow-sm border border-blue-100/50">
                    🚀 POWERFUL FEATURES
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1E293B] leading-tight mb-4">
                    Everything Your Institution <span className="text-[#3B42F2]">Needs</span>
                </h2>

                <p className="mt-4 text-sm sm:text-base lg:text-lg text-[#64748B] font-medium max-w-2xl mx-auto leading-relaxed">
                    A comprehensive suite of digital tools designed to modernize and empower your educational institution
                </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {features.map((feature, index) => (
                    <div
                        key={feature.title}
                        className="group relative rounded-[40px] bg-white border border-slate-50 p-10 transition-all duration-500 hover:-translate-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(59,66,242,0.1)] overflow-hidden"
                    >
                        {/* Decorative background circle */}
                        <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${feature.bg} opacity-0 group-hover:opacity-20 transition-all duration-700 blur-2xl`} />

                        {/* Icon */}
                        <div
                            className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bg} ${feature.color} transition-all duration-500 group-hover:rotate-6 shadow-sm`}
                        >
                            {feature.icon}
                        </div>

                        {/* Title */}
                        <h3 className="mt-6 text-xl font-black text-[#1E293B] group-hover:text-[#3B42F2] transition-colors duration-300">
                            {feature.title}
                        </h3>

                        {/* Description */}
                        <p className="mt-4 text-[#64748B] font-semibold text-sm leading-relaxed">
                            {feature.description}
                        </p>

                        {/* Subtle indicator */}
                        <div className="mt-6 h-1 w-0 group-hover:w-12 bg-[#3B42F2] rounded-full transition-all duration-500" />
                    </div>
                ))}
            </div>
        </div>
    </section>
    );
};

export default Feature;
