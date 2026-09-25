"use client";

import React, { useState, useEffect } from "react";
import { FiCheckCircle, FiShield, FiGlobe, FiAward } from "react-icons/fi";
import { FaSchool, FaUniversity, FaMosque, FaGraduationCap } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";

const DEFAULT_CLIENTS = [
  {
    id: "c1",
    name: "Dhaka Model High School & College",
    domain: "dhakamodel.edu.bd",
    type: "School & College",
    icon: FaUniversity,
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    id: "c2",
    name: "Al-Azhar Comprehensive Madrasha",
    domain: "alazhar.edubari.bd",
    type: "Madrasha",
    icon: FaMosque,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    id: "c3",
    name: "Chittagong Cantonment Public School",
    domain: "ccps.edu.bd",
    type: "Public School",
    icon: FaSchool,
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
  },
  {
    id: "c4",
    name: "Sylhet Ideal Cadet Academy",
    domain: "sylhetcadet.edubari.bd",
    type: "Cadet Academy",
    icon: FaGraduationCap,
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  {
    id: "c5",
    name: "Rajshahi Central City College",
    domain: "rcc.edu.bd",
    type: "Higher Secondary",
    icon: FaUniversity,
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    id: "c6",
    name: "Khulna Public Model Institute",
    domain: "khulnamodel.edu.bd",
    type: "Institute",
    icon: FaSchool,
    color: "text-cyan-600 bg-cyan-50 border-cyan-200",
  },
  {
    id: "c7",
    name: "Comilla Scholars Academic Care",
    domain: "scholars.edubari.bd",
    type: "Single Teacher Care",
    icon: FaGraduationCap,
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  {
    id: "c8",
    name: "Barisal Govt. Girls High School",
    domain: "barisalggs.edu.bd",
    type: "High School",
    icon: FaSchool,
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
];

const TrustedClients = () => {
  const { t } = useLanguage();
  const [clients, setClients] = useState(DEFAULT_CLIENTS);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch("/api/billing/clients");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const formatted = data.map((item, idx) => ({
              id: item.id || `fetched-${idx}`,
              name: item.client_name || item.domain,
              domain: item.domain || "client.edubari.bd",
              logo_url: item.logo_url,
              type: item.client_type === "school_erp" ? "School ERP" : "Educational Institution",
              icon: idx % 3 === 0 ? FaUniversity : idx % 3 === 1 ? FaSchool : FaMosque,
              color: "text-blue-600 bg-blue-50 border-blue-200",
            }));
            // Merge with default list for rich slider
            setClients([...formatted, ...DEFAULT_CLIENTS]);
          }
        }
      } catch (err) {
        console.error("Failed to load clients:", err);
      }
    };

    fetchClients();
  }, []);

  // Double the list for seamless infinite looping marquee
  const marqueeList = [...clients, ...clients];

  return (
    <section className="w-full py-10 sm:py-14 bg-gradient-to-b from-white via-slate-50/60 to-blue-50/20 overflow-hidden select-none border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 text-center mb-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#818CF8]/30 shadow-xs text-[#4F46E5] text-[11px] sm:text-xs font-black uppercase tracking-wider mb-4">
          <FiShield className="h-3.5 w-3.5 text-[#4F46E5]" />
          {t("trustedClients.badge")}
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
          {t("trustedClients.titleMain")}{" "}
          <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
            {t("trustedClients.titleGradient")}
          </span>
        </h2>

        {/* Subtitle */}
        <p className="mt-2.5 text-xs sm:text-sm md:text-base text-slate-500 font-semibold leading-relaxed max-w-xl mx-auto">
          {t("trustedClients.subtitle")}
        </p>
      </div>

      {/* Auto-sliding Marquee Container */}
      <div className="relative w-full overflow-hidden py-4 flex items-center">
        {/* Left & Right Gradient Fade Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

        {/* Infinite Marquee Track */}
        <div className="flex items-center gap-6 animate-[marquee_35s_linear_infinite] hover:[animation-play-state:paused] w-max shrink-0 cursor-pointer">
          {marqueeList.map((client, index) => {
            const IconComp = client.icon || FaSchool;

            return (
              <div
                key={`${client.id}-${index}`}
                className="group shrink-0 rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md px-6 py-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_rgba(37,99,235,0.15)] hover:border-blue-400 hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 min-w-[280px] max-w-[340px]"
              >
                {/* Logo / Icon Box */}
                {client.logo_url ? (
                  <img
                    src={client.logo_url}
                    alt={client.name}
                    className="w-12 h-12 rounded-xl object-contain border border-slate-100 p-1 bg-slate-50 shadow-xs"
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 shadow-xs ${client.color}`}>
                    <IconComp className="w-6 h-6" />
                  </div>
                )}

                {/* Client Details */}
                <div className="text-left overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-extrabold text-slate-900 truncate leading-snug group-hover:text-blue-600 transition-colors">
                      {client.name}
                    </h3>
                    <FiCheckCircle className="w-4 h-4 text-blue-500 shrink-0" title="Verified Client" />
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 truncate bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                      {client.domain}
                    </span>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      {t("trustedClients.verifiedBadge")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustedClients;
