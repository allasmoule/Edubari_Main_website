"use client";

import React from "react";
import { FiHeart, FiTarget, FiShield, FiZap } from "react-icons/fi";

const About = () => {
  return (
    <section
      id="about"
      className="w-full px-4 sm:px-6 md:px-12 py-10 sm:py-12 lg:py-14 bg-primary/20"
    >
      <div className="w-full rounded-[32px] border border-white bg-primary-light/80 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.08)] backdrop-blur-md overflow-hidden relative">
        {/* Glow decoration */}
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-tertiary/5 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />

        <div className="px-6 sm:px-8 md:px-10 lg:px-16 py-8 sm:py-10 lg:py-12 relative z-10">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tertiary/8 border border-tertiary/15 text-tertiary text-xs font-bold tracking-wide uppercase mb-4">
              <FiHeart className="h-3.5 w-3.5 text-red-500 animate-pulse" />
              About Us
            </div>

            <h2 className="text-3xl sm:text-4 sm:text-4.5xl lg:text-5xl font-black tracking-tight text-dark leading-tight">
              Who We{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary via-[#8B5CF6] to-[#7c3aed] drop-shadow-sm">
                Are
              </span>
            </h2>

            <p className="mt-4 text-sm sm:text-base leading-relaxed text-dark/70 max-w-2xl mx-auto font-medium">
              EduBari is a complete digital management platform built for educational institutions in Bangladesh — helping teachers, schools, and coaching centers run smarter every day.
            </p>
          </div>

          {/* Two-column content */}
          <div className="mt-8 lg:mt-10 grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto items-center">
            {/* Left — narrative */}
            <div className="space-y-4 text-sm sm:text-base leading-relaxed text-dark/70 font-semibold">
              <p>
                We started with a simple observation: thousands of dedicated educators across Bangladesh were still relying on paper registers, scattered WhatsApp groups, and manual fee tracking.
              </p>
              <p>
                EduBari was built to solve that. We give every institution its own branded website, a complete management dashboard, and tools for attendance, exams, results, and fee collection — all set up within 24 hours.
              </p>
              <p>
                Today, we proudly serve{" "}
                <span className="font-extrabold text-tertiary">50+ institutions</span> and{" "}
                <span className="font-extrabold text-[#8B5CF6]">5,000+ students</span>, with a team that believes great technology should be accessible to everyone.
              </p>
            </div>

            {/* Right — stats inline */}
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: <FiTarget className="h-5 w-5" />,
                  value: "50+",
                  label: "Institutions",
                  accent: "text-tertiary bg-tertiary/10 ring-1 ring-tertiary/20",
                },
                {
                  icon: <FiZap className="h-5 w-5" />,
                  value: "24h",
                  label: "Setup Time",
                  accent: "text-[#8B5CF6] bg-[#8B5CF6]/10 ring-1 ring-[#8B5CF6]/20",
                },
                {
                  icon: <FiShield className="h-5 w-5" />,
                  value: "99.9%",
                  label: "Uptime",
                  accent: "text-secondary bg-secondary/10 ring-1 ring-secondary/20",
                },
                {
                  icon: <FiHeart className="h-5 w-5" />,
                  value: "100%",
                  label: "Satisfaction",
                  accent: "text-tertiary bg-tertiary/10 ring-1 ring-tertiary/20",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="group rounded-2xl border border-white bg-white/70 backdrop-blur-xs p-4 sm:p-5 text-center transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-tertiary/5 hover:bg-white"
                >
                  <div
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${stat.accent} mb-3 transition-transform duration-500 group-hover:scale-110`}
                  >
                    {stat.icon}
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-dark tracking-tight">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs font-bold text-dark/45 uppercase tracking-wide">
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
