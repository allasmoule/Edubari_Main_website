"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FiSearch,
  FiGlobe,
  FiXCircle,
  FiLoader,
  FiVideo,
  FiX,
  FiArrowRight,
  FiCheckCircle,
} from "react-icons/fi";
import {
  FaSchool,
  FaUniversity,
  FaMosque,
  FaChalkboardTeacher,
  FaPlay,
} from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";

const COMMON_TLDS = [
  ".com",
  ".net",
  ".org",
  ".edu.bd",
  ".academy",
  ".institute",
  ".me",
  ".store",
  ".io",
];

const TLD_PRICES = {
  ".com": 1350,
  ".net": 1300,
  ".org": 1300,
  ".edu.bd": 1000,
  ".academy": 15000,
  ".institute": 25000,
  ".edubari.bd": 200,
  ".me": 1200,
  ".store": 800,
  ".io": 3500,
};

export function getDomainPrice(domain) {
  if (!domain) return 1200;
  if (domain.endsWith(".edubari.bd")) return 200;
  for (const [tld, price] of Object.entries(TLD_PRICES)) {
    if (domain.endsWith(tld)) return price;
  }
  return 1200;
}

function splitDomainName(domain) {
  const firstDot = domain.indexOf(".");
  if (firstDot === -1) return { base: domain, tld: "" };
  return {
    base: domain.substring(0, firstDot),
    tld: domain.substring(firstDot),
  };
}

const DomainSearch = () => {
  const { lang, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [resultsModalOpen, setResultsModalOpen] = useState(false);

  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const animatedWords = [
    { id: "school", word: t("domainSearch.school") },
    { id: "college", word: t("domainSearch.college") },
    { id: "madrasha", word: t("domainSearch.madrasha") },
    { id: "single_teacher", word: t("domainSearch.singleTeacher") },
  ];

  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % animatedWords.length);
    }, 2200);
    return () => clearInterval(timer);
  }, [animatedWords.length]);

  const categories = [
    {
      id: "school",
      label: t("domainSearch.school"),
      icon: FaSchool,
      bgColor: "bg-slate-100/90 border-slate-200 text-slate-700 hover:bg-slate-200/90",
      activeColor: "bg-blue-600 text-white border-blue-600 shadow-md",
      placeholder: "myschool",
    },
    {
      id: "college",
      label: t("domainSearch.college"),
      icon: FaUniversity,
      bgColor: "bg-slate-100/90 border-slate-200 text-slate-700 hover:bg-slate-200/90",
      activeColor: "bg-blue-600 text-white border-blue-600 shadow-md",
      placeholder: "mycollege",
    },
    {
      id: "madrasha",
      label: t("domainSearch.madrasha"),
      icon: FaMosque,
      bgColor: "bg-slate-100/90 border-slate-200 text-slate-700 hover:bg-slate-200/90",
      activeColor: "bg-blue-600 text-white border-blue-600 shadow-md",
      placeholder: "mymadrasha",
    },
    {
      id: "single_teacher",
      label: t("domainSearch.singleTeacher"),
      icon: FaChalkboardTeacher,
      bgColor: "bg-slate-100/90 border-slate-200 text-slate-700 hover:bg-slate-200/90",
      activeColor: "bg-blue-600 text-white border-blue-600 shadow-md",
      placeholder: "teachername",
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat.id);
    const matchedIdx = animatedWords.findIndex((item) => item.id === cat.id);
    if (matchedIdx !== -1) {
      setWordIndex(matchedIdx);
    }
    if (!searchTerm) {
      setSearchTerm(cat.placeholder);
    }
    const inputEl = document.getElementById("domain-search-input");
    if (inputEl) {
      inputEl.focus();
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setResults([]);

    const raw = searchTerm
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "");
    if (!raw) return;

    const cleanTerm = raw.replace(/[^a-z0-9-.]/g, "");

    if (!cleanTerm) {
      setError("Please enter a valid name (e.g., myschool or botbari)");
      return;
    }

    setIsSearching(true);

    try {
      let domainsToCheck = [];

      if (cleanTerm.includes(".")) {
        domainsToCheck = [cleanTerm];
        const baseWithoutTld = cleanTerm.split(".")[0];
        domainsToCheck.push(
          ...COMMON_TLDS.map((tld) => `${baseWithoutTld}${tld}`).filter(
            (d) => d !== cleanTerm
          )
        );
      } else {
        domainsToCheck = COMMON_TLDS.map((tld) => `${cleanTerm}${tld}`);
      }

      const baseName = cleanTerm.includes(".") ? cleanTerm.split(".")[0] : cleanTerm;
      const freeDomain = `${baseName}.edubari.bd`;

      domainsToCheck = domainsToCheck.filter((d) => d !== freeDomain).slice(0, 6);

      const checks = domainsToCheck.map(async (domain) => {
        try {
          const res = await fetch(
            `https://dns.google/resolve?name=${domain}&type=ANY`
          );
          if (!res.ok) return { domain, available: false };
          const data = await res.json();
          return { domain, available: data.Status === 3 };
        } catch {
          return { domain, available: false };
        }
      });

      const checkResults = await Promise.all(checks);

      const finalResults = [
        { domain: freeDomain, available: true, isFree: true },
        ...checkResults,
      ];
      setResults(finalResults);
      setResultsModalOpen(true);

      const hasAvailable = finalResults.some((r) => r.available);
      if (!hasAvailable) {
        setError(
          lang === "bn"
            ? "দুঃখিত, কোনো ডোমেইন খালি নেই। অনুগ্রহ করে অন্য নাম লিখে চেষ্টা করুন।"
            : "Sorry, no related domains are currently available. Try a different name."
        );
      }
    } catch (error) {
      setError("An error occurred while checking domain availability.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectDomain = (result) => {
    const price = getDomainPrice(result.domain);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("selectedDomain", result.domain);
        localStorage.setItem("domainPrice", price);

        const url = new URL(window.location.href);
        url.searchParams.set("preferredDomain", result.domain);
        url.searchParams.set("domainPrice", price);
        window.history.replaceState(null, "", url.toString());
      } catch (_) {}
    }

    setResultsModalOpen(false);

    setTimeout(() => {
      const pricingSection = document.getElementById("pricing");
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: "smooth" });
      } else {
        router.push(
          `/payment-purchase?preferredDomain=${encodeURIComponent(
            result.domain
          )}&domainPrice=${price}#pricing`
        );
      }
    }, 100);
  };

  return (
    <section
      ref={sectionRef}
      className="w-full px-4 sm:px-6 md:px-12 py-10 sm:py-16 bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#EEF2FF] relative overflow-hidden select-none"
    >
      {/* Main Centered Card Container */}
      <div
        className={`transition-all duration-1000 transform ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        } w-full max-w-[1100px] mx-auto rounded-[40px] border border-white/90 bg-white/90 shadow-[0_30px_90px_-20px_rgba(129,140,248,0.15)] backdrop-blur-2xl overflow-hidden relative p-8 sm:p-14 md:p-16`}
      >
        {/* Ambient Top & Bottom Soft Pastel Flows */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#818CF8]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#38BDF8]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Floating Top-Right Video "How to purchase" Button */}
        <button
          type="button"
          onClick={() => setVideoModalOpen(true)}
          className="sm:absolute sm:top-8 sm:right-8 mx-auto mb-6 sm:mb-0 group inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-gradient-to-r from-[#818CF8] to-[#A78BFA] hover:from-[#6366F1] hover:to-[#8B5CF6] text-white shadow-[0_6px_20px_-4px_rgba(129,140,248,0.4)] hover:shadow-[0_10px_25px_-4px_rgba(129,140,248,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 text-xs font-black tracking-wider uppercase border-none cursor-pointer shrink-0"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <FaPlay className="w-2.5 h-2.5 ml-0.5" />
          </div>
          <span>{t("domainSearch.videoBtn")}</span>
        </button>

        {/* Centered Main Content */}
        <div className="max-w-3xl mx-auto text-center">
          {/* Centered Pill Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-white border border-[#818CF8]/30 shadow-[0_2px_8px_rgba(129,140,248,0.12)] text-[#4F46E5] text-[11px] sm:text-xs font-black uppercase tracking-wider mb-6">
            <span className="h-2.5 w-2.5 rounded-full bg-[#4F46E5] shrink-0" />
            {t("domainSearch.badge")}
          </div>

          {/* Main Title with Animated Institution Type */}
          <h2 className="text-[32px] sm:text-[48px] md:text-[56px] font-black tracking-tight text-[#0F172A] leading-tight mb-3 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
            <span>{t("domainSearch.titlePrefix")}</span>
            <span className="inline-block relative min-w-[130px] sm:min-w-[190px] text-center">
              <span
                key={`${wordIndex}-${lang}`}
                className="bg-gradient-to-r from-[#6070FF] via-[#818CF8] to-[#38BDF8] bg-clip-text text-transparent filter drop-shadow-[0_10px_20px_rgba(129,140,248,0.35)] py-1 inline-block animate-fadeInUp"
              >
                {animatedWords[wordIndex]?.word}
              </span>
            </span>
            <span>{t("domainSearch.titleSuffix")}</span>
          </h2>

          {/* Subtitle */}
          <p className="mt-4 text-sm sm:text-base md:text-lg text-slate-500 font-semibold leading-relaxed max-w-xl mx-auto">
            {t("domainSearch.subtitle")}
          </p>

          {/* Search Bar Form */}
          <div className="mt-10 max-w-3xl mx-auto">
            <form onSubmit={handleSearch}>
              <div className="relative rounded-full p-2.5 bg-gradient-to-r from-[#C7D2FE]/60 via-[#E0E7FF]/80 to-[#BAE6FD]/60 border-2 border-[#818CF8]/40 shadow-[0_15px_35px_-5px_rgba(129,140,248,0.25)] transition-all duration-300">
                <div className="relative flex items-center bg-white rounded-full overflow-hidden">
                  <div className="pl-6 text-slate-400">
                    <FiGlobe className="h-6 w-6" />
                  </div>
                  <input
                    id="domain-search-input"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t("domainSearch.placeholder")}
                    className="flex-1 bg-transparent border-none outline-none px-4 sm:px-6 py-4 sm:py-5 text-slate-800 text-base sm:text-lg placeholder:text-slate-400 font-extrabold w-full"
                  />
                  <button
                    id="domain-search-btn"
                    type="submit"
                    disabled={isSearching || !searchTerm.trim()}
                    className="mr-1.5 sm:mr-2 inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#818CF8] to-[#A78BFA] hover:from-[#6366F1] hover:to-[#8B5CF6] px-8 py-3.5 sm:py-4 text-white text-base font-black uppercase tracking-wider shadow-[0_6px_20px_-4px_rgba(129,140,248,0.4)] hover:shadow-[0_10px_25px_-4px_rgba(129,140,248,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none"
                  >
                    {isSearching ? (
                      <>
                        <FiLoader className="h-5 w-5 animate-spin" />
                        <span>{t("domainSearch.searchingBtn")}</span>
                      </>
                    ) : (
                      <>
                        <FiSearch className="h-5 w-5" />
                        <span>{t("domainSearch.searchBtn")}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* 3D Smart Category Badges (School, College, Madrasha, Single Teacher) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border text-xs sm:text-sm font-extrabold transition-all duration-300 cursor-pointer shadow-[0_4px_0_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:shadow-[0_8px_18px_rgba(59,130,246,0.18)] active:translate-y-0.5 active:shadow-none ${
                    isSelected ? cat.activeColor : cat.bgColor
                  }`}
                >
                  <IconComponent className="w-4.5 h-4.5 shrink-0" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-8 max-w-2xl mx-auto text-center">
              <p className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-bold shadow-sm">
                <FiXCircle className="h-5 w-5 shrink-0" />
                {error}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── 3D SMART SEARCH RESULTS FULL POPUP MODAL ── */}
      {resultsModalOpen && (
        <div className="fixed inset-0 z-[200] bg-slate-950/75 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 select-none">
          <div className="bg-white rounded-[36px] border-t-2 border-l border-white/80 border-r border-b-[6px] border-slate-300/80 w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-[0_30px_90px_-20px_rgba(37,99,235,0.35)] relative flex flex-col animate-modal3d">
            
            {/* Ambient Gloss Illumination */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -ml-32 -mb-32" />

            {/* 3D Modal Header */}
            <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white relative z-10">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {t("domainSearch.modalTitle")} <span className="text-blue-600">"{searchTerm}"</span>
                  </h3>
                  <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
                    {results.length} found
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  {t("domainSearch.modalSub")}
                </p>
              </div>

              {/* 3D Cross (Close) Button */}
              <button
                type="button"
                onClick={() => setResultsModalOpen(false)}
                className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_3px_0_rgba(0,0,0,0.08)] cursor-pointer border-none shrink-0"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* 3D Modal Body - Smart 3D Boxes Grid */}
            <div className="p-5 sm:p-8 overflow-y-auto max-h-[68vh] custom-scrollbar relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.map((result, idx) => {
                  const { base, tld } = splitDomainName(result.domain);
                  const price = getDomainPrice(result.domain);

                  return (
                    <div
                      key={result.domain}
                      className={`group relative rounded-2xl p-5 sm:p-6 transition-all duration-400 flex flex-col justify-between gap-5 transform hover:-translate-y-2 hover:rotate-[0.5deg] ${
                        result.isFree
                          ? "border-2 border-emerald-400 border-b-[6px] border-b-emerald-600 bg-gradient-to-b from-emerald-50/80 via-white to-emerald-50/40 shadow-[0_12px_30px_-8px_rgba(16,185,129,0.25)] hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.35)] ring-2 ring-emerald-500/20"
                          : result.available
                          ? "border-2 border-slate-200 border-b-[6px] border-b-blue-600/80 bg-gradient-to-b from-white to-blue-50/20 shadow-[0_10px_25px_-8px_rgba(37,99,235,0.1)] hover:shadow-[0_20px_35px_-10px_rgba(37,99,235,0.22)] hover:border-blue-400"
                          : "border-2 border-slate-200/80 border-b-[4px] border-b-slate-300 bg-slate-100/60 opacity-65"
                      }`}
                      style={{
                        animationDelay: `${idx * 60}ms`,
                      }}
                    >
                      {/* Top Badge for Free domain */}
                      {result.isFree && (
                        <div className="absolute -top-3.5 left-5 px-3 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[9px] font-black uppercase tracking-widest shadow-md shadow-emerald-600/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          100% FREE / ফ্রি ডোমেইন
                        </div>
                      )}

                      <div>
                        {/* Domain Title */}
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-lg sm:text-xl font-black break-all leading-snug ${
                              result.available ? "text-slate-900" : "text-slate-400 line-through"
                            }`}
                          >
                            {base}
                            <span
                              className={
                                result.isFree
                                  ? "text-emerald-600"
                                  : result.available
                                  ? "text-blue-600"
                                  : "text-slate-400"
                              }
                            >
                              {tld}
                            </span>
                          </p>
                        </div>

                        {/* Availability Pill */}
                        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-[11px] font-extrabold shadow-xs">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              result.isFree || result.available ? "bg-emerald-500 animate-pulse" : "bg-rose-400"
                            }`}
                          />
                          <span className={result.isFree || result.available ? "text-emerald-600" : "text-rose-500"}>
                            {result.isFree ? t("domainSearch.freeDomain") : result.available ? t("domainSearch.available") : t("domainSearch.taken")}
                          </span>
                        </div>
                      </div>

                      {/* 3D Price & Action Row */}
                      <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 mt-2">
                        <div>
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block">{t("domainSearch.priceLabel")}</span>
                          <span className="text-base sm:text-lg font-black text-slate-900">
                            ৳{price.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">{t("domainSearch.perYear")}</span>
                          </span>
                        </div>

                        {result.available ? (
                          <button
                            type="button"
                            onClick={() => handleSelectDomain(result)}
                            className={`rounded-xl px-4 py-2.5 text-xs font-black text-white transition-all border-none cursor-pointer flex items-center gap-1.5 ${
                              result.isFree
                                ? "bg-emerald-600 shadow-[0_4px_0_#047857] hover:shadow-[0_2px_0_#047857] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none"
                                : "bg-blue-600 shadow-[0_4px_0_#1d4ed8] hover:shadow-[0_2px_0_#1d4ed8] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none"
                            }`}
                          >
                            <span>{t("domainSearch.selectBtn")}</span>
                            <span className="opacity-90 font-mono text-[10px] bg-black/15 px-1.5 py-0.5 rounded">(৳{price.toLocaleString()})</span>
                          </button>
                        ) : (
                          <span className="rounded-xl bg-slate-200/70 px-4 py-2 text-xs font-extrabold text-slate-400 border-b-2 border-slate-300">
                            Unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3D Modal Footer */}
            <div className="px-6 py-4.5 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between relative z-10">
              <p className="text-xs text-slate-500 font-medium">
                {t("domainSearch.modalSub")}
              </p>
              <button
                type="button"
                onClick={() => setResultsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-black transition-all border-b-2 border-slate-400/60 active:translate-y-0.5 border-none cursor-pointer"
              >
                {t("domainSearch.closeBtn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video "How to purchase" Modal Popup */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 select-none">
          <div className="bg-slate-900 border-t border-l border-white/20 border-b-4 border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-[0_30px_90px_-20px_rgba(0,0,0,0.8)] relative animate-modal3d">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <FiVideo className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">{t("domainSearch.howToPurchaseVideo")}</h3>
                  <p className="text-xs text-slate-400 font-medium">{t("domainSearch.videoSub")}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-500 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer border-none shadow-sm"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="How to purchase EduBari ERP"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-400 text-center sm:text-left font-medium">
                Need extra support? Contact Helpline: <strong className="text-white">+880 1754-958008</strong>
              </p>
              <button
                type="button"
                onClick={() => {
                  setVideoModalOpen(false);
                  router.push("/payment-purchase");
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black uppercase tracking-wider shadow-[0_4px_0_#1d4ed8] hover:shadow-[0_2px_0_#1d4ed8] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all border-none cursor-pointer flex items-center gap-2"
              >
                <span>Proceed to Purchase</span>
                <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default DomainSearch;
