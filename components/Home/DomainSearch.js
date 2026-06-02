"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FiSearch,
  FiGlobe,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
} from "react-icons/fi";

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

const DomainSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
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
            (d) => d !== cleanTerm,
          ),
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
            `https://dns.google/resolve?name=${domain}&type=ANY`,
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
          "Sorry, no related domains are currently available. Try a different name.",
        );
      }
    } catch (error) {
      setError("An error occurred while checking domain availability.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section ref={sectionRef} className="w-full px-4 sm:px-6 md:px-12 py-8 sm:py-10 lg:py-12 bg-white relative overflow-hidden">
      {/* Background Animated Blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-tertiary/5 rounded-full blur-[100px] pointer-events-none animate-[pulse_6s_ease-in-out_infinite]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none animate-[pulse_8s_ease-in-out_infinite]" />

      <div className={`transition-all duration-1000 transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"} w-full max-w-[1200px] mx-auto rounded-[40px] border border-white/80 bg-white/50 shadow-[0_40px_80px_-20px_rgba(37,99,235,0.08)] backdrop-blur-2xl overflow-hidden relative`}>
        
        {/* Inner decorative glows */}
        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-tertiary/20 to-transparent" />
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-tertiary/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-secondary/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="px-6 sm:px-10 md:px-16 lg:px-24 py-16 sm:py-20 relative z-10">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 border border-tertiary/15 shadow-sm text-tertiary text-xs sm:text-sm font-bold tracking-wide uppercase mb-6 backdrop-blur-md hover:scale-105 transition-transform duration-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tertiary"></span>
              </span>
              Domain Availability Checker
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-dark leading-tight">
              Find Your Perfect{" "}
              <span className="relative inline-block mt-2 sm:mt-0">
                <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary via-secondary to-accent drop-shadow-sm animate-pulse">
                  Domain Name
                </span>
                <span className="absolute -bottom-1 left-0 w-full h-2 bg-linear-to-r from-tertiary/0 via-secondary/20 to-accent/0 rounded-full blur-[2px]"></span>
              </span>
            </h2>

            <p className="mt-6 text-base sm:text-lg lg:text-xl leading-relaxed text-dark/60 max-w-2xl mx-auto font-medium">
              Enter your institution or brand name and we'll suggest available domains instantly.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-12 max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="group">
              <div className="relative rounded-[28px] p-1.5 sm:p-2 bg-linear-to-r from-tertiary/20 via-secondary/20 to-accent/20 shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-tertiary/20">
                <div className="absolute inset-0 bg-linear-to-r from-tertiary to-secondary opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500 rounded-[28px]" />
                
                <div className="relative flex items-center bg-white rounded-[22px] overflow-hidden">
                  <div className="pl-6 sm:pl-8 text-dark/30 group-focus-within:text-tertiary group-focus-within:scale-110 transition-all duration-300">
                    <FiGlobe className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                  <input
                    id="domain-search-input"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter a name (e.g., myschool or botbari)"
                    className="flex-1 bg-transparent border-none outline-none px-4 sm:px-6 py-5 sm:py-6 text-dark text-base sm:text-xl placeholder:text-dark/30 font-bold w-full"
                  />
                  <button
                    id="domain-search-btn"
                    type="submit"
                    disabled={isSearching || !searchTerm.trim()}
                    className="mr-2 sm:mr-3 inline-flex items-center gap-2.5 rounded-[18px] bg-linear-to-r from-tertiary to-secondary hover:from-tertiary-dark hover:to-secondary-light px-6 sm:px-10 py-4 sm:py-5 text-white text-base sm:text-lg font-bold shadow-lg shadow-tertiary/30 hover:shadow-xl hover:shadow-tertiary/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative group/btn cursor-pointer border-none"
                  >
                    <span className="absolute inset-0 w-full h-full -translate-x-full bg-white/20 group-hover/btn:animate-[marquee_1.5s_ease-in-out_infinite]" />
                    {isSearching ? (
                      <>
                       <FiLoader className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                        <span>Searching</span>
                      </>
                    ) : (
                      <>
                        <FiSearch className="h-5 w-5 sm:h-6 sm:w-6 group-hover/btn:scale-110 transition-transform" />
                        <span>Search</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-8 max-w-3xl mx-auto text-center animate-fadeUp">
              <p className="inline-flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-600 text-sm sm:text-base font-bold shadow-sm">
                <FiXCircle className="h-5 w-5 shrink-0" />
                {error}
              </p>
            </div>
          )}

          {/* Loading Skeletons */}
          {isSearching && (
            <div className="mt-16 animate-pulse max-w-5xl mx-auto">
              <div className="h-8 w-48 bg-dark/5 rounded-xl mb-8 mx-auto" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-32 rounded-2xl bg-dark/[0.02] border border-dark/5"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {!isSearching && results.length > 0 && (
            <div className="mt-16 max-w-5xl mx-auto animate-fadeUp">
              <div className="flex items-center justify-center gap-4 mb-10">
                <div className="h-px w-12 sm:w-24 bg-linear-to-r from-transparent to-tertiary/30" />
                <p className="text-xl sm:text-2xl font-black text-dark">
                  Search <span className="text-tertiary">Results</span>
                </p>
                <span className="px-3 py-1 rounded-full bg-tertiary/10 border border-tertiary/20 text-tertiary text-xs font-extrabold uppercase shadow-inner">
                  {results.length} found
                </span>
                <div className="h-px w-12 sm:w-24 bg-linear-to-l from-transparent to-tertiary/30" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.map((result, index) => {
                  const { base, tld } = splitDomainName(result.domain);

                  return (
                    <div
                      key={result.domain}
                      className={`group relative rounded-[24px] p-6 transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between overflow-hidden backdrop-blur-sm ${
                        result.isFree
                          ? "border border-[#10B981]/30 bg-linear-to-br from-[#10B981]/5 to-white shadow-lg shadow-[#10B981]/5 hover:shadow-xl hover:shadow-[#10B981]/20 hover:border-[#10B981]/50"
                          : result.available
                            ? "border border-tertiary/15 bg-white shadow-lg shadow-dark/5 hover:shadow-xl hover:shadow-tertiary/15 hover:border-tertiary/40"
                            : "border border-dark/5 bg-dark/[0.02] opacity-75 hover:opacity-100"
                      }`}
                      style={{
                        animationDelay: `${index * 80}ms`,
                        animation: "fadeInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) backwards",
                      }}
                    >
                      {/* Glossy overlay on hover */}
                      <div className="absolute inset-0 bg-linear-to-br from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      {/* Card Content */}
                      <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                        <div>
                          {/* Domain Name */}
                          <p
                            className={`text-xl sm:text-2xl font-extrabold break-all leading-tight ${
                              result.available
                                ? "text-dark"
                                : "text-dark/40 line-through decoration-2 decoration-dark/20"
                            }`}
                          >
                            {base}
                            <span
                              className={
                                result.available
                                  ? "text-tertiary font-black"
                                  : "text-dark/30"
                              }
                            >
                              {tld}
                            </span>
                          </p>

                          {/* Status Badge */}
                          <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-dark/5 shadow-xs">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                result.isFree
                                  ? "bg-[#10B981] animate-ping"
                                  : result.available
                                    ? "bg-[#10B981] animate-pulse"
                                    : "bg-red-400"
                              }`}
                            />
                            <span
                              className={`text-[10px] sm:text-xs font-black uppercase tracking-wider ${
                                result.isFree
                                  ? "text-[#10B981]"
                                  : result.available
                                    ? "text-[#10B981]"
                                    : "text-red-500"
                              }`}
                            >
                              {result.isFree ? "Free Domain" : result.available ? "Available" : "Taken"}
                            </span>
                          </div>
                        </div>

                        {/* Action */}
                        <div className="flex justify-end">
                          {result.available ? (
                            <button
                              className={`rounded-[14px] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border-none ${
                                result.isFree
                                  ? "bg-linear-to-br from-[#10B981] to-emerald-600 shadow-[#10B981]/30"
                                  : "bg-linear-to-br from-tertiary to-secondary shadow-tertiary/30"
                              }`}
                              onClick={() =>
                                router.push(`/payment-purchase?preferredDomain=${encodeURIComponent(result.domain)}`)
                              }
                            >
                              Select
                            </button>
                          ) : (
                            <span className="rounded-[14px] bg-dark/5 px-5 py-2 text-xs font-bold text-dark/40">
                              Unavailable
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DomainSearch;
