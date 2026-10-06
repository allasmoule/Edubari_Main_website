"use client";

import React from "react";
import { FiTarget, FiEye, FiCheckCircle, FiCompass, FiStar } from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";

const MissionVision = () => {
  const { t } = useLanguage();

  return (
    <section className="w-full px-4 sm:px-6 md:px-12 py-6 sm:py-10 bg-linear-to-b from-white via-primary/10 to-white select-none">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-tertiary/10 border border-tertiary/20 text-tertiary text-xs font-bold tracking-wide uppercase mb-3 shadow-2xs">
            <FiCompass className="h-3.5 w-3.5 text-tertiary animate-spin-slow" />
            {t("aboutPage.badge")}
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-dark leading-tight">
            {t("aboutPage.titleMain")}{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary via-[#8B5CF6] to-secondary drop-shadow-2xs">
              {t("aboutPage.titleGradient")}
            </span>
          </h2>

          <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-dark/70 font-medium max-w-2xl mx-auto">
            {t("aboutPage.subtitle")}
          </p>
        </div>

        {/* Mission & Vision 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Mission Card */}
          <div className="group relative rounded-[24px] border border-tertiary/20 bg-linear-to-br from-white via-blue-50/40 to-sky-50/30 p-6 sm:p-7 shadow-[0_10px_30px_-10px_rgba(14,165,233,0.1)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-10px_rgba(14,165,233,0.18)] overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-tertiary/15 blur-3xl group-hover:bg-tertiary/25 transition-all duration-700 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                {/* Badge & Icon Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/15 border border-tertiary/30 text-tertiary font-extrabold text-[11px] tracking-wider uppercase">
                    <FiTarget className="h-3.5 w-3.5 text-tertiary animate-pulse" />
                    {t("aboutPage.missionBadge")}
                  </div>

                  <div className="h-11 w-11 rounded-xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-tertiary shadow-2xs group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                    <FiTarget className="h-5 w-5" />
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-xl sm:text-2xl font-extrabold text-dark tracking-tight leading-snug mb-2.5 group-hover:text-tertiary transition-colors duration-300">
                  {t("aboutPage.missionTitle")}
                </h3>

                <p className="text-xs sm:text-sm leading-relaxed text-dark/80 font-medium mb-5">
                  {t("aboutPage.missionDesc")}
                </p>
              </div>

              {/* Key Bullet Points */}
              <div className="space-y-2.5 pt-3.5 border-t border-tertiary/15">
                {[
                  t("aboutPage.missionPoint1"),
                  t("aboutPage.missionPoint2"),
                  t("aboutPage.missionPoint3"),
                ].map((point, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div className="shrink-0 h-5 w-5 rounded-full bg-tertiary/15 border border-tertiary/30 flex items-center justify-center text-tertiary">
                      <FiCheckCircle className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-bold text-dark/90">
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 h-1 w-0 bg-linear-to-r from-tertiary to-sky-400 transition-all duration-700 ease-out group-hover:w-full" />
          </div>

          {/* Vision Card */}
          <div className="group relative rounded-[24px] border border-[#8B5CF6]/20 bg-linear-to-br from-white via-purple-50/40 to-indigo-50/30 p-6 sm:p-7 shadow-[0_10px_30px_-10px_rgba(139,92,246,0.1)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-10px_rgba(139,92,246,0.18)] overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[#8B5CF6]/15 blur-3xl group-hover:bg-[#8B5CF6]/25 transition-all duration-700 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                {/* Badge & Icon Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#8B5CF6] font-extrabold text-[11px] tracking-wider uppercase">
                    <FiEye className="h-3.5 w-3.5 text-[#8B5CF6] animate-pulse" />
                    {t("aboutPage.visionBadge")}
                  </div>

                  <div className="h-11 w-11 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] shadow-2xs group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                    <FiEye className="h-5 w-5" />
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-xl sm:text-2xl font-extrabold text-dark tracking-tight leading-snug mb-2.5 group-hover:text-[#8B5CF6] transition-colors duration-300">
                  {t("aboutPage.visionTitle")}
                </h3>

                <p className="text-xs sm:text-sm leading-relaxed text-dark/80 font-medium mb-5">
                  {t("aboutPage.visionDesc")}
                </p>
              </div>

              {/* Key Bullet Points */}
              <div className="space-y-2.5 pt-3.5 border-t border-[#8B5CF6]/15">
                {[
                  t("aboutPage.visionPoint1"),
                  t("aboutPage.visionPoint2"),
                  t("aboutPage.visionPoint3"),
                ].map((point, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div className="shrink-0 h-5 w-5 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
                      <FiStar className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-bold text-dark/90">
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 h-1 w-0 bg-linear-to-r from-[#8B5CF6] to-purple-600 transition-all duration-700 ease-out group-hover:w-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionVision;
