import React from "react";
import { FiHeart, FiTarget, FiShield, FiZap, FiUsers } from "react-icons/fi";

const About = () => {
    return (
    <section id="about" className="w-full px-4 sm:px-6 md:px-12 py-16 sm:py-20 lg:py-28 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-widest uppercase mb-6 shadow-sm border border-blue-100/50">
                    <FiHeart className="h-3.5 w-3.5" />
                    OUR STORY
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1E293B] leading-tight mb-4">
                    Empowering Education Through <span className="text-[#3B42F2]">Innovation</span>
                </h2>

                <p className="mt-4 text-sm sm:text-base lg:text-lg text-[#64748B] font-medium max-w-2xl mx-auto leading-relaxed">
                    EduBari is more than just a software — it's a digital ecosystem built to transform how institutions manage, teach, and grow in the modern era.
                </p>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
                {/* Left - Narrative */}
                <div className="relative">
                    <div className="space-y-6 text-[#475569] font-medium text-base sm:text-lg leading-relaxed">
                        <p className="relative">
                            <span className="absolute -left-4 top-0 h-full w-1 bg-[#3B42F2] rounded-full opacity-20" />
                            We started with a vision to bridge the digital gap in Bangladesh's education sector. We noticed that dedicated educators were often overwhelmed by manual paperwork and administrative tasks.
                        </p>
                        <p>
                            EduBari was built to solve this. We provide every institution with their own <span className="text-[#3B42F2] font-black underline decoration-blue-100 decoration-4 underline-offset-4">branded website</span>, a complete management dashboard, and automated tools for attendance, exams, and finance.
                        </p>
                        <p>
                            Today, we are proud to be the trusted partner for <span className="text-[#1E293B] font-black">50+ institutions</span> and <span className="text-[#1E293B] font-black">5,000+ students</span>, delivering reliability and excellence every single day.
                        </p>
                    </div>

                    {/* Decorative Element */}
                    <div className="mt-10 p-6 rounded-[32px] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-[#EFF2FF] flex items-center justify-center text-[#3B42F2]">
                            <FiTarget className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-[#1E293B] font-black text-lg">Our Mission</p>
                            <p className="text-[#64748B] text-sm font-semibold">To make world-class education management technology accessible to every school in Bangladesh.</p>
                        </div>
                    </div>
                </div>

                {/* Right - Stats Grid */}
                <div className="grid grid-cols-2 gap-6 sm:gap-8">
                    {[
                        {
                            icon: <FiUsers className="h-6 w-6" />,
                            value: "50+",
                            label: "Institutions",
                            color: "text-blue-600",
                            bg: "bg-blue-50",
                        },
                        {
                            icon: <FiZap className="h-6 w-6" />,
                            value: "24h",
                            label: "Setup Time",
                            color: "text-indigo-600",
                            bg: "bg-indigo-50",
                        },
                        {
                            icon: <FiShield className="h-6 w-6" />,
                            value: "99.9%",
                            label: "Uptime",
                            color: "text-emerald-600",
                            bg: "bg-emerald-50",
                        },
                        {
                            icon: <FiHeart className="h-6 w-6" />,
                            value: "100%",
                            label: "Satisfaction",
                            color: "text-rose-600",
                            bg: "bg-rose-50",
                        },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="group relative bg-white rounded-[32px] border border-slate-100 p-6 sm:p-8 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200"
                        >
                            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg} ${stat.color} mb-6 transition-all duration-500 group-hover:rotate-6 shadow-sm`}>
                                {stat.icon}
                            </div>
                            <h4 className="text-3xl sm:text-4xl font-black text-[#1E293B] tracking-tight mb-2">
                                {stat.value}
                            </h4>
                            <p className="text-[#64748B] font-black text-[10px] sm:text-xs uppercase tracking-widest">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </section>
    );
};

export default About;
