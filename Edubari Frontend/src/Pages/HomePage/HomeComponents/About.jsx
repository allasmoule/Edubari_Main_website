import React from "react";
import { FiHeart, FiTarget, FiShield, FiZap } from "react-icons/fi";

const About = () => {
    return (
        <section
            id="about"
            className="w-full px-4 sm:px-6 md:px-12 py-16 sm:py-20 lg:py-24 bg-primary/40"
        >
            <div className="w-full rounded-[28px] border border-white/20 bg-primary/95 backdrop-blur-sm overflow-hidden">
                <div className="px-6 sm:px-8 md:px-10 lg:px-12 py-12 sm:py-14">
                    {/* ── Header ── */}
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold tracking-wide uppercase mb-4">
                            <FiHeart className="h-3.5 w-3.5" />
                            About Us
                        </div>

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-dark leading-tight">
                            Who We{" "}
                            <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]">
                                Are
                            </span>
                        </h2>

                        <p className="mt-5 text-sm sm:text-[15px] lg:text-base leading-7 text-dark/70 max-w-2xl mx-auto">
                            EduBari is a complete digital management platform
                            built for educational institutions in Bangladesh —
                            helping teachers, schools, and coaching centers run
                            smarter every day.
                        </p>
                    </div>

                    {/* ── Two-column content ── */}
                    <div className="mt-12 lg:mt-14 grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto items-start">
                        {/* Left — narrative */}
                        <div className="space-y-5 text-sm sm:text-[15px] leading-7 text-dark/70">
                            <p>
                                We started with a simple observation: thousands
                                of dedicated educators across Bangladesh were
                                still relying on paper registers, scattered
                                WhatsApp groups, and manual fee tracking.
                            </p>
                            <p>
                                EduBari was built to solve that. We give every
                                institution its own branded website, a complete
                                management dashboard, and tools for attendance,
                                exams, results, and fee collection — all set up
                                within 24 hours.
                            </p>
                            <p>
                                Today, we proudly serve{" "}
                                <span className="font-bold text-dark">
                                    50+ institutions
                                </span>{" "}
                                and{" "}
                                <span className="font-bold text-dark">
                                    5,000+ students
                                </span>
                                , with a team that believes great technology
                                should be accessible to everyone.
                            </p>
                        </div>

                        {/* Right — stats inline */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                {
                                    icon: <FiTarget className="h-5 w-5" />,
                                    value: "50+",
                                    label: "Institutions",
                                    accent: "text-tertiary bg-tertiary/10",
                                },
                                {
                                    icon: <FiZap className="h-5 w-5" />,
                                    value: "24h",
                                    label: "Setup Time",
                                    accent: "text-[#8B5CF6] bg-[#8B5CF6]/10",
                                },
                                {
                                    icon: <FiShield className="h-5 w-5" />,
                                    value: "99.9%",
                                    label: "Uptime",
                                    accent: "text-secondary bg-secondary/10",
                                },
                                {
                                    icon: <FiHeart className="h-5 w-5" />,
                                    value: "100%",
                                    label: "Satisfaction",
                                    accent: "text-tertiary bg-tertiary/10",
                                },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="group rounded-2xl border border-white/40 bg-white/50 p-5 sm:p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-dark/5 hover:bg-white/80"
                                >
                                    <div
                                        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${stat.accent} mb-3 transition-transform duration-300 group-hover:scale-110`}
                                    >
                                        {stat.icon}
                                    </div>
                                    <p className="text-2xl sm:text-3xl font-black text-dark tracking-tight">
                                        {stat.value}
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-dark/50">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
