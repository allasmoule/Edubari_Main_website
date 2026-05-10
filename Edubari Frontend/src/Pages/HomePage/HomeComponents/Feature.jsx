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
        icon: <FiBookOpen className="h-5 w-5" />,
        title: "Student Management",
        description:
            "Complete student profiles, enrollment, and academic records",
        color: "text-tertiary",
        bg: "bg-tertiary/8",
        border: "group-hover:border-tertiary/25",
    },
    {
        icon: <FiUsers className="h-5 w-5" />,
        title: "Teacher Panel",
        description:
            "Dedicated dashboard for teachers to manage classes and grades",
        color: "text-secondary",
        bg: "bg-secondary/8",
        border: "group-hover:border-secondary/25",
    },
    {
        icon: <FiCheckSquare className="h-5 w-5" />,
        title: "Attendance Tracking",
        description:
            "Digital attendance system with reports and analytics",
        color: "text-[#8B5CF6]",
        bg: "bg-[#8B5CF6]/8",
        border: "group-hover:border-[#8B5CF6]/25",
    },
    {
        icon: <FiBarChart2 className="h-5 w-5" />,
        title: "Result & Grade Management",
        description:
            "Automated grading, report cards, and result publishing",
        color: "text-tertiary",
        bg: "bg-tertiary/8",
        border: "group-hover:border-tertiary/25",
    },
    {
        icon: <FiFileText className="h-5 w-5" />,
        title: "Online Exam System",
        description:
            "Create and conduct online exams with auto-marking",
        color: "text-[#10B981]",
        bg: "bg-[#10B981]/8",
        border: "group-hover:border-[#10B981]/25",
    },
    {
        icon: <FiDollarSign className="h-5 w-5" />,
        title: "Fee Management",
        description:
            "Track fee collection, generate receipts, and manage payments",
        color: "text-[#F59E0B]",
        bg: "bg-[#F59E0B]/8",
        border: "group-hover:border-[#F59E0B]/25",
    },
    {
        icon: <FiBell className="h-5 w-5" />,
        title: "Notice Board",
        description:
            "Publish announcements and notices for students and parents",
        color: "text-secondary",
        bg: "bg-secondary/8",
        border: "group-hover:border-secondary/25",
    },
    {
        icon: <FiTrendingUp className="h-5 w-5" />,
        title: "Reports & Analytics",
        description:
            "Comprehensive reports to track institutional performance",
        color: "text-tertiary",
        bg: "bg-tertiary/8",
        border: "group-hover:border-tertiary/25",
    },
];

const Feature = () => {
    return (
        <section className="w-full px-4 sm:px-6 md:px-12 py-16 sm:py-20 lg:py-24 bg-primary/40">
            <div className="w-full rounded-[28px] border border-white/20 bg-primary/95 backdrop-blur-sm overflow-hidden">
                <div className="px-6 sm:px-8 md:px-10 lg:px-12 py-12 sm:py-14">
                    {/* Header */}
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold tracking-wide uppercase mb-4">
                            🚀 Features
                        </div>

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-dark leading-tight">
                            Everything Your Institution{" "}
                            <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]">
                                Needs
                            </span>
                        </h2>

                        <p className="mt-5 text-sm sm:text-[15px] lg:text-base leading-7 text-dark/70 max-w-2xl mx-auto">
                            A comprehensive suite of tools designed to digitize
                            and streamline your educational institution
                        </p>
                    </div>

                    {/* Feature Cards Grid */}
                    <div className="mt-12 lg:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className={`group relative rounded-2xl border border-white/40 bg-white/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-dark/5 hover:bg-white/80 ${feature.border}`}
                            >
                                {/* Icon */}
                                <div
                                    className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.bg} ${feature.color} transition-transform duration-300 group-hover:scale-110`}
                                >
                                    {feature.icon}
                                </div>

                                {/* Title */}
                                <h3 className="mt-4 text-[17px] font-bold text-dark leading-snug">
                                    {feature.title}
                                </h3>

                                {/* Description */}
                                <p className="mt-2 text-sm leading-relaxed text-dark/60">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Feature;
