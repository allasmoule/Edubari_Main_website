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

  const categories = [
    {
      id: "school",
      label: t("domainSearch.school"),
      icon: FaSchool,
      bgColor: "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100",
      activeColor: "bg-blue-600 text-white border-blue-600 shadow-md",
      placeholder: "myschool",
    },
    {
      id: "college",
      label: t("domainSearch.college"),
      icon: FaUniversity,
      bgColor: "bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100",
      activeColor: "bg-purple-600 text-white border-purple-600 shadow-md",
      placeholder: "mycollege",
    },
    {
      id: "madrasha",
      label: t("domainSearch.madrasha"),
      icon: FaMosque,
      bgColor: "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100",
      activeColor: "bg-emerald-600 text-white border-emerald-600 shadow-md",
      placeholder: "mymadrasha",
    },
    {
      id: "single_teacher",
      label: t("domainSearch.singleTeacher"),
      icon: FaChalkboardTeacher,
      bgColor: "bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100",
      activeColor: "bg-orange-600 text-white border-orange-600 shadow-md",
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
      className="w-full px-4 sm:px-6 md:px-12 py-10 sm:py-14 bg-slate-50/50 relative overflow-hidden"
    >
      {/* Main Centered Card Container */}
      <div
        className={`transition-all duration-1000 transform ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        } w-full max-w-[1100px] mx-auto rounded-[36px] border border-blue-100/80 bg-gradient-to-b from-white via-slate-50/30 to-blue-50/20 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.07)] backdrop-blur-xl overflow-hidden relative p-8 sm:p-14 md:p-16`}
      >
        {/* Floating Top-Right Video "How to purchase" Button */}
        <button
          type="button"
          onClick={() => setVideoModalOpen(true)}
          className="sm:absolute sm:top-8 sm:right-8 mx-auto mb-6 sm:mb-0 group inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 text-xs font-bold border-none cursor-pointer shrink-0"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <FaPlay className="w-2.5 h-2.5 ml-0.5" />
          </div>
          <span>{t("domainSearch.videoBtn")}</span>
        </button>

        {/* Centered Main Content */}
        <div className="max-w-3xl mx-auto text-center">
          {/* Centered Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 shadow-xs text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            {t("domainSearch.badge")}
          </div>

          {/* Main Title */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            {t("domainSearch.titleMain")}{" "}
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mt-1">
              {t("domainSearch.titleGradient")}
            </span>
          </h2>

          {/* Subtitle */}
          <p className="mt-4 text-base sm:text-lg text-slate-500 font-medium leading-relaxed max-w-xl mx-auto">
            {t("domainSearch.subtitle")}
          </p>

          {/* Search Bar Form */}
          <div className="mt-10 max-w-3xl mx-auto">
            <form onSubmit={handleSearch}>
              <div className="relative rounded-full p-1.5 sm:p-2 bg-gradient-to-r from-blue-200/60 via-indigo-200/60 to-purple-200/60 shadow-lg transition-all duration-300 hover:shadow-blue-500/10 border border-blue-200/50">
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
                    className="flex-1 bg-transparent border-none outline-none px-4 sm:px-6 py-4 sm:py-5 text-slate-800 text-base sm:text-lg placeholder:text-slate-400 font-semibold w-full"
                  />
                  <button
                    id="domain-search-btn"
                    type="submit"
                    disabled={isSearching || !searchTerm.trim()}
                    className="mr-1.5 sm:mr-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3.5 sm:py-4 text-white text-base font-bold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none"
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

          {/* Centered Category Badges (School, College, Madrasha, Single Teacher) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                    isSelected ? cat.activeColor : cat.bgColor
                  }`}
                >
                  <IconComponent className="w-4 h-4 shrink-0" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-8 max-w-2xl mx-auto text-center">
              <p className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-bold">
                <FiXCircle className="h-5 w-5 shrink-0" />
                {error}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── SEARCH RESULTS FULL POPUP MODAL ── */}
      {resultsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col animate-[scaleIn_0.25s_ease-out]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-white">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl font-black text-slate-900">
                    {t("domainSearch.modalTitle")} <span className="text-blue-600">"{searchTerm}"</span>
                  </h3>
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase">
                    {results.length} found
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {t("domainSearch.modalSub")}
                </p>
              </div>

              {/* Cross (Close) Button */}
              <button
                type="button"
                onClick={() => setResultsModalOpen(false)}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center transition cursor-pointer border-none"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Results Grid */}
            <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((result) => {
                  const { base, tld } = splitDomainName(result.domain);
                  const price = getDomainPrice(result.domain);

                  return (
                    <div
                      key={result.domain}
                      className={`rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between gap-4 ${
                        result.isFree
                          ? "border-emerald-300 bg-emerald-50/40 shadow-xs hover:shadow-md"
                          : result.available
                          ? "border-slate-200 bg-white shadow-xs hover:shadow-md hover:border-blue-300"
                          : "border-slate-200/60 bg-slate-50/60 opacity-60"
                      }`}
                    >
                      <div>
                        <p
                          className={`text-lg font-bold break-all ${
                            result.available ? "text-slate-800" : "text-slate-400 line-through"
                          }`}
                        >
                          {base}
                          <span className={result.available ? "text-blue-600" : "text-slate-400"}>
                            {tld}
                          </span>
                        </p>

                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-bold">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              result.isFree || result.available ? "bg-emerald-500" : "bg-rose-400"
                            }`}
                          />
                          <span className={result.isFree || result.available ? "text-emerald-600" : "text-rose-500"}>
                            {result.isFree ? t("domainSearch.freeDomain") : result.available ? t("domainSearch.available") : t("domainSearch.taken")}
                          </span>
                        </div>
                      </div>

                      {/* Price & Action Button */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{t("domainSearch.priceLabel")}</span>
                          <span className="text-sm font-black text-slate-900">
                            ৳{price.toLocaleString()} <span className="text-[10px] font-semibold text-slate-400">{t("domainSearch.perYear")}</span>
                          </span>
                        </div>

                        {result.available ? (
                          <button
                            type="button"
                            onClick={() => handleSelectDomain(result)}
                            className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition-all border-none cursor-pointer flex items-center gap-1.5 ${
                              result.isFree
                                ? "bg-emerald-600 hover:bg-emerald-700"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                          >
                            <span>{t("domainSearch.selectBtn")}</span>
                            <span className="opacity-90 font-mono text-[11px]">(৳{price.toLocaleString()})</span>
                          </button>
                        ) : (
                          <span className="rounded-xl bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-400">
                            Unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                {t("domainSearch.modalSub")}
              </p>
              <button
                type="button"
                onClick={() => setResultsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition border-none cursor-pointer"
              >
                {t("domainSearch.closeBtn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video "How to purchase" Modal Popup */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative animate-[scaleIn_0.2s_ease-out]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <FiVideo className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{t("domainSearch.howToPurchaseVideo")}</h3>
                  <p className="text-xs text-slate-400">{t("domainSearch.videoSub")}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer border-none"
              >
                <FiX className="w-4 h-4" />
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

            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-400 text-center sm:text-left">
                Need extra support? Contact Helpline: <strong className="text-white">+880 1700-000000</strong>
              </p>
              <button
                type="button"
                onClick={() => {
                  setVideoModalOpen(false);
                  router.push("/payment-purchase");
                }}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition border-none cursor-pointer flex items-center gap-2"
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
