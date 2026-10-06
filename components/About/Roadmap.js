"use client";

import React from "react";
import { FiTrendingUp, FiCheckCircle, FiArrowRight, FiRotateCcw } from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";

const Roadmap = () => {
  const { t, lang } = useLanguage();

  const steps = [
    {
      year: t("aboutPage.item2025Year"),
      yearColor: "text-amber-500",
      circleBg: "bg-[#FEF9C3]",
      circleBorder: "border-[#FACC15]",
      outerGlow: "shadow-[0_6px_20px_rgba(250,204,21,0.2)]",
      textColor: "text-[#854d0e]",
      badgeText: t("aboutPage.item2025Badge"),
      title: t("aboutPage.item2025Title"),
      desc: t("aboutPage.item2025Desc"),
      dotColor: "bg-[#FACC15]",
      yOffset: "translate-y-14", // Ascending stair
    },
    {
      year: t("aboutPage.item2026Year"),
      yearColor: "text-[#F97316]",
      circleBg: "bg-[#DCFCE7]",
      circleBorder: "border-[#4ADE80]",
      outerGlow: "shadow-[0_6px_20px_rgba(74,222,128,0.2)]",
      textColor: "text-[#166534]",
      badgeText: t("aboutPage.item2026Badge"),
      title: t("aboutPage.item2026Title"),
      desc: t("aboutPage.item2026Desc"),
      dotColor: "bg-[#F97316]",
      yOffset: "translate-y-9",
    },
    {
      year: t("aboutPage.item2028Year"),
      yearColor: "text-[#F43F5E]",
      circleBg: "bg-[#FFE4E6]",
      circleBorder: "border-[#FB7185]",
      outerGlow: "shadow-[0_6px_20px_rgba(251,113,133,0.2)]",
      textColor: "text-[#9F1239]",
      badgeText: t("aboutPage.item2028Badge"),
      title: t("aboutPage.item2028Title"),
      desc: t("aboutPage.item2028Desc"),
      dotColor: "bg-[#F43F5E]",
      yOffset: "translate-y-4",
    },
    {
      year: t("aboutPage.item2029Year"),
      yearColor: "text-[#8B5CF6]",
      circleBg: "bg-[#F3E8FF]",
      circleBorder: "border-[#C084FC]",
      outerGlow: "shadow-[0_6px_20px_rgba(192,132,252,0.2)]",
      textColor: "text-[#6B21A8]",
      badgeText: t("aboutPage.item2029Badge"),
      title: t("aboutPage.item2029Title"),
      desc: t("aboutPage.item2029Desc"),
      dotColor: "bg-[#8B5CF6]",
      yOffset: "translate-y-0",
    },
    {
      year: t("aboutPage.item2030Year"),
      yearColor: "text-[#0284C7]",
      circleBg: "bg-[#E0F2FE]",
      circleBorder: "border-[#38BDF8]",
      outerGlow: "shadow-[0_6px_20px_rgba(56,189,248,0.25)]",
      textColor: "text-[#075985]",
      badgeText: t("aboutPage.item2030Badge"),
      title: t("aboutPage.item2030Title"),
      desc: t("aboutPage.item2030Desc"),
      dotColor: "bg-[#0284C7]",
      yOffset: "-translate-y-5", // Highest stair
    },
  ];

  return (
    <section className="w-full px-4 sm:px-6 md:px-12 py-6 sm:py-10 bg-white overflow-hidden select-none">
      <div className="max-w-7xl mx-auto">
        {/* Main Banner Header - Matching user's image styling */}
        <div className="rounded-[28px] border border-blue-100 bg-linear-to-br from-slate-50 via-blue-50/40 to-indigo-50/20 p-5 sm:p-8 lg:p-10 shadow-[0_15px_40px_-15px_rgba(37,99,235,0.08)] relative overflow-hidden">
          
          {/* Header text from user's image */}
          <div className="relative z-10 max-w-3xl mb-6 lg:mb-8">
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-[#1E40AF] tracking-tight leading-tight">
              {t("aboutPage.roadmapHeaderTitle")}
            </h2>
            <p className="mt-2 text-xs sm:text-sm lg:text-base font-bold text-dark/70">
              {t("aboutPage.roadmapHeaderSub")}
            </p>
          </div>

          {/* DESKTOP LAYOUT: Ascending Staircase Curves (lg and xl screens) */}
          <div className="hidden lg:block relative min-h-[340px] pt-2 pb-10">
            
            {/* Smooth SVG Curved Connection Line behind circles */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
              viewBox="0 0 1000 340"
              fill="none"
              preserveAspectRatio="none"
            >
              {/* Ascending background arc path */}
              <path
                d="M 50 300 Q 300 290, 650 240 T 950 60"
                stroke="#E2E8F0"
                strokeWidth="3"
                strokeDasharray="5 5"
              />
              <path
                d="M 50 300 Q 300 290, 650 240 T 950 60"
                stroke="url(#roadmapGradient)"
                strokeWidth="2.5"
                strokeOpacity="0.5"
              />
              <defs>
                <linearGradient id="roadmapGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FACC15" />
                  <stop offset="25%" stopColor="#4ADE80" />
                  <stop offset="50%" stopColor="#FB7185" />
                  <stop offset="75%" stopColor="#C084FC" />
                  <stop offset="100%" stopColor="#38BDF8" />
                </linearGradient>
              </defs>
            </svg>

            {/* 5 Year Circles Grid */}
            <div className="relative z-10 grid grid-cols-5 gap-2 items-end h-full">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center text-center transition-all duration-500 hover:scale-105 ${step.yOffset}`}
                >
                  {/* Year Label above circle */}
                  <span className={`text-xl xl:text-2xl font-black tracking-tight mb-2 ${step.yearColor} drop-shadow-xs`}>
                    {step.year}
                  </span>

                  {/* Main Circle Node - Compact dimensions */}
                  <div
                    className={`group relative w-32 h-32 xl:w-36 xl:h-36 rounded-full border-3 ${step.circleBorder} ${step.circleBg} ${step.outerGlow} flex flex-col items-center justify-center p-3 transition-transform duration-300 hover:rotate-2 cursor-pointer shadow-md`}
                  >
                    {/* Top Badge text */}
                    {step.badgeText && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[9px] font-extrabold text-slate-700 shadow-2xs whitespace-nowrap max-w-[95%] truncate">
                        {step.badgeText}
                      </span>
                    )}

                    {/* Title inside circle */}
                    <h3 className={`text-xs xl:text-sm font-extrabold ${step.textColor} leading-tight px-1`}>
                      {step.title}
                    </h3>

                    {/* Hover detail tooltip */}
                    <div className="absolute inset-0 rounded-full bg-dark/95 backdrop-blur-md p-3 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center">
                      <p className="text-[10px] xl:text-xs font-semibold leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  {/* Right Arrow connecting to next circle */}
                  {idx < steps.length - 1 && (
                    <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
                      <div className="h-5 w-5 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-400 shadow-2xs">
                        <FiArrowRight className="h-3 w-3 text-slate-500" />
                      </div>
                    </div>
                  )}

                  {/* Bottom Dot marker on the curve line */}
                  <div className="mt-5 flex flex-col items-center">
                    <div className="w-0.5 h-4 bg-slate-300 border-dashed border-l border-slate-400" />
                    <div className={`h-3 w-3 rounded-full ${step.dotColor} ring-3 ring-white shadow-xs`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Turn Arrow Icon */}
            <div className="absolute bottom-1 left-1 z-10 flex items-center gap-2 text-dark/40 font-bold text-xs">
              <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                <FiRotateCcw className="h-4 w-4 text-dark/70" />
              </div>
            </div>
          </div>

          {/* MOBILE & TABLET LAYOUT: Compact Timeline Cards */}
          <div className="block lg:hidden mt-4 space-y-3">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className={`relative rounded-xl border-2 ${step.circleBorder} ${step.circleBg} p-3.5 sm:p-4 shadow-2xs transition-all duration-300`}
              >
                <div className="flex items-start gap-3">
                  {/* Year badge circle */}
                  <div className={`shrink-0 h-11 w-11 rounded-full border-2 ${step.circleBorder} bg-white flex flex-col items-center justify-center shadow-2xs`}>
                    <span className={`text-xs font-black ${step.yearColor}`}>
                      {step.year}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <h3 className={`text-sm font-extrabold ${step.textColor}`}>
                        {step.title}
                      </h3>
                      {step.badgeText && (
                        <span className="px-1.5 py-0.5 rounded bg-white/80 border border-slate-200 text-[9px] font-bold text-slate-600 truncate max-w-[180px]">
                          {step.badgeText}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-dark/75 font-medium leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Roadmap;
