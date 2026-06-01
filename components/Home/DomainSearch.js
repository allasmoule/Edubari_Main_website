"use client";

import React, { useState } from "react";
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

      // Filter out freeDomain from DNS check if it happens to be there
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
      
      // Prepend the free domain (always available and free)
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
    <section className="w-full px-4 sm:px-6 md:px-12 py-16 sm:py-20 lg:py-24 bg-white">
      <div className="w-full rounded-[32px] border border-white bg-primary-light/80 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.08)] backdrop-blur-md overflow-hidden relative">
        {/* Decorative corner glows */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-tertiary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#8B5CF6]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="px-6 sm:px-8 md:px-10 lg:px-16 py-12 sm:py-16 relative z-10">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tertiary/8 border border-tertiary/15 text-tertiary text-xs font-bold tracking-wide uppercase mb-5">
              <FiSearch className="h-3.5 w-3.5 animate-pulse" />
              Domain Availability Checker
            </div>

            <h2 className="text-3xl sm:text-4.5xl lg:text-5xl font-black tracking-tight text-dark leading-tight">
              Find Your Perfect{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary via-[#8B5CF6] to-[#7c3aed] drop-shadow-sm">
                Domain Name
              </span>
            </h2>

            <p className="mt-5 text-sm sm:text-base leading-relaxed text-dark/70 max-w-2xl mx-auto font-medium">
              Enter your institution or brand name and we'll suggest available domains instantly.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-10 max-w-3xl mx-auto">
            <form onSubmit={handleSearch}>
              <div className="relative rounded-2xl border border-white bg-white shadow-xl shadow-dark/5 overflow-hidden transition-all duration-500 focus-within:shadow-2xl focus-within:shadow-tertiary/10 focus-within:border-tertiary/40 focus-within:ring-4 focus-within:ring-tertiary/5">
                <div className="flex items-center">
                  <div className="pl-5 text-dark/30 group-focus-within:text-tertiary transition-colors duration-300">
                    <FiGlobe className="h-5 w-5" />
                  </div>
                  <input
                    id="domain-search-input"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter a name (e.g., myschool or botbari)"
                    className="flex-1 bg-transparent border-none outline-none px-4 py-4 sm:py-5 text-dark text-sm sm:text-base placeholder:text-dark/45 font-bold"
                  />
                  <button
                    id="domain-search-btn"
                    type="submit"
                    disabled={isSearching || !searchTerm.trim()}
                    className="mr-2 sm:mr-3 inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-tertiary to-[#8B5CF6] hover:from-tertiary-dark hover:to-[#7c3aed] px-5 sm:px-8 py-2.5 sm:py-3.5 text-white text-sm font-bold shadow-md shadow-tertiary/20 hover:shadow-lg hover:shadow-tertiary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
                  >
                    {isSearching ? (
                      <>
                       <FiLoader className="h-4 w-4 animate-spin" />
                        <span>Searching…</span>
                      </>
                    ) : (
                      <>
                        <FiSearch className="h-4 w-4" />
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
            <div className="mt-6 max-w-3xl mx-auto text-center animate-fadeUp">
              <p className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm font-bold shadow-sm">
                <FiXCircle className="h-4 w-4 shrink-0" />
                {error}
              </p>
            </div>
          )}

          {/* Loading Skeletons */}
          {isSearching && (
            <div className="mt-12 animate-pulse max-w-5xl mx-auto">
              <div className="h-6 w-44 bg-dark/10 rounded-lg mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-28 rounded-2xl bg-white/50 border border-white"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {!isSearching && results.length > 0 && (
            <div className="mt-12 max-w-5xl mx-auto animate-fadeUp">
              <div className="flex items-center gap-2 mb-6">
                <p className="text-lg sm:text-xl font-black text-dark">
                  Search <span className="text-tertiary">Results</span>
                </p>
                <span className="px-2 py-0.5 rounded-md bg-tertiary/10 text-tertiary text-2xs font-extrabold uppercase">
                  {results.length} found
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((result, index) => {
                  const { base, tld } = splitDomainName(result.domain);

                  return (
                    <div
                      key={result.domain}
                      className={`group relative rounded-2xl border p-5 transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between ${
                        result.isFree
                          ? "border-green-500/25 bg-linear-to-b from-green-500/5 to-white hover:shadow-xl hover:shadow-green-500/10 hover:border-green-500/50"
                          : result.available
                            ? "border-white bg-white hover:shadow-xl hover:shadow-tertiary/5 hover:border-tertiary/30"
                            : "border-dark/5 bg-dark/[0.02] opacity-65 hover:opacity-80"
                      }`}
                      style={{
                        animationDelay: `${index * 80}ms`,
                        animation: "fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) backwards",
                      }}
                    >
                      {/* Card Content */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          {/* Domain Name */}
                          <p
                            className={`text-base sm:text-lg font-extrabold break-all ${
                              result.available
                                ? "text-dark"
                                : "text-dark/40 line-through decoration-1 decoration-dark/30"
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
                            {result.isFree && (
                              <span className="ml-1 px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 font-black text-[10px] uppercase tracking-wide">
                                free
                              </span>
                            )}
                          </p>

                          {/* Status Badge */}
                          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-dark/5 shadow-xs">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                result.isFree
                                  ? "bg-green-500 animate-ping"
                                  : result.available
                                    ? "bg-[#10B981] animate-pulse"
                                    : "bg-red-400"
                              }`}
                            />
                            <span
                              className={`text-[10px] font-black uppercase tracking-wider ${
                                result.isFree
                                  ? "text-green-600"
                                  : result.available
                                    ? "text-[#10B981]"
                                    : "text-red-400"
                              }`}
                            >
                              {result.isFree ? "Free Subdomain" : result.available ? "Available" : "Taken"}
                            </span>
                          </div>
                        </div>

                        {/* Action */}
                        {result.available ? (
                          <button
                            className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-black text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer border-none ${
                              result.isFree
                                ? "bg-linear-to-r from-green-500 to-emerald-600 shadow-green-500/20 hover:shadow-green-500/30"
                                : "bg-linear-to-r from-tertiary to-[#8B5CF6] shadow-tertiary/20"
                            }`}
                            onClick={() =>
                              router.push(`/payment-purchase?preferredDomain=${encodeURIComponent(result.domain)}`)
                            }
                          >
                            Select
                          </button>
                        ) : (
                          <span className="shrink-0 rounded-xl bg-dark/5 px-3.5 py-2 text-xs font-bold text-dark/30 border border-dark/5">
                            Taken
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
      </div>
    </section>
  );
};

export default DomainSearch;
