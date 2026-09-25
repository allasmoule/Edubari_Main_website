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
} from "react-icons/fi";
import {
  FaSchool,
  FaUniversity,
  FaMosque,
  FaChalkboardTeacher,
  FaPlay,
} from "react-icons/fa";

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

function splitDomainName(domain) {
  const firstDot = domain.indexOf(".");
  if (firstDot === -1) return { base: domain, tld: "" };
  return {
    base: domain.substring(0, firstDot),
    tld: domain.substring(firstDot),
  };
}

const CATEGORIES = [
  {
    id: "school",
    label: "School",
    icon: FaSchool,
    bgColor: "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100",
    activeColor: "bg-blue-600 text-white border-blue-600 shadow-md",
    placeholder: "myschool",
  },
  {
    id: "college",
    label: "College",
    icon: FaUniversity,
    bgColor: "bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100",
    activeColor: "bg-purple-600 text-white border-purple-600 shadow-md",
    placeholder: "mycollege",
  },
  {
    id: "madrasha",
    label: "Madrasha",
    icon: FaMosque,
    bgColor: "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100",
    activeColor: "bg-emerald-600 text-white border-emerald-600 shadow-md",
    placeholder: "mymadrasha",
  },
  {
    id: "single_teacher",
    label: "Single Teacher",
    icon: FaChalkboardTeacher,
    bgColor: "bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100",
    activeColor: "bg-orange-600 text-white border-orange-600 shadow-md",
    placeholder: "teachername",
  },
];

const DomainSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

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

      const hasAvailable = finalResults.some((r) => r.available);
      if (!hasAvailable) {
        setError(
          "Sorry, no related domains are currently available. Try a different name."
        );
      }
    } catch (error) {
      setError("An error occurred while checking domain availability.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="w-full px-4 sm:px-6 md:px-12 py-10 sm:py-14 bg-slate-50/50 relative overflow-hidden"
    >
      {/* Container matching original centered card layout */}
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
          <span>Video: How to purchase</span>
        </button>

        {/* Centered Main Content */}
        <div className="max-w-3xl mx-auto text-center">
          
          {/* Centered Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 shadow-xs text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            School Availability Checker
          </div>

          {/* Main Title */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Find Your Perfect{" "}
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mt-1">
              School Name
            </span>
          </h2>

          {/* Subtitle */}
          <p className="mt-4 text-base sm:text-lg text-slate-500 font-medium leading-relaxed max-w-xl mx-auto">
            Enter your institution or brand name and we'll suggest available domains instantly.
          </p>

          {/* Search Bar Form - Clean Centered Pill Search matching screenshot */}
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
                    placeholder="Enter a name (e.g., myschool or botbari)"
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
                        <span>Searching</span>
                      </>
                    ) : (
                      <>
                        <FiSearch className="h-5 w-5" />
                        <span>Search</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Centered Category Badges (School, College, Madrasha, Single Teacher - Compact) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {CATEGORIES.map((cat) => {
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

        {/* Loading Skeletons */}
        {isSearching && (
          <div className="mt-12 animate-pulse max-w-4xl mx-auto">
            <div className="h-6 w-36 bg-slate-200 rounded-lg mb-6 mx-auto" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 rounded-2xl bg-slate-100 border border-slate-200/60"
                />
              ))}
            </div>
          </div>
        )}

        {/* Results Grid */}
        {!isSearching && results.length > 0 && (
          <div className="mt-12 max-w-4xl mx-auto border-t border-slate-200/60 pt-10">
            <div className="flex items-center justify-center gap-3 mb-8">
              <p className="text-xl font-black text-slate-800">
                Search <span className="text-blue-600">Results</span>
              </p>
              <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold uppercase">
                {results.length} found
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((result) => {
                const { base, tld } = splitDomainName(result.domain);

                return (
                  <div
                    key={result.domain}
                    className={`rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between gap-4 ${
                      result.isFree
                        ? "border-emerald-300 bg-emerald-50/40 shadow-sm hover:shadow-md"
                        : result.available
                        ? "border-slate-200 bg-white shadow-sm hover:shadow-md"
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
                          {result.isFree ? "Free Domain" : result.available ? "Available" : "Taken"}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      {result.available ? (
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/payment-purchase?preferredDomain=${encodeURIComponent(result.domain)}`
                            )
                          }
                          className={`rounded-xl px-5 py-2 text-xs font-bold text-white shadow-sm transition-all border-none cursor-pointer ${
                            result.isFree
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          Select
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
        )}

      </div>

      {/* Video "How to purchase" Modal Popup */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <FiVideo className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">How to purchase Software</h3>
                  <p className="text-xs text-slate-400">Step-by-step video guide for ordering and setting up EduBari ERP</p>
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
