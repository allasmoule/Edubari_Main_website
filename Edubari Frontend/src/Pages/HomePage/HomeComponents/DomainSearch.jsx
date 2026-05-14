import React, { useState } from "react";
import { useNavigate } from "react-router";
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
  const navigate = useNavigate();

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

      domainsToCheck = domainsToCheck.slice(0, 6);

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
      setResults(checkResults);

      const hasAvailable = checkResults.some((r) => r.available);
      if (!hasAvailable) {
        setError(
          "Sorry, no related domains are currently available. Try a different name.",
        );
      }
    } catch {
      setError("An error occurred while checking domain availability.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section className="relative z-10 w-full px-0 -mt-8 sm:-mt-12 lg:-mt-16">
      <div className="w-full max-w-[1400px] mx-auto rounded-t-[40px] sm:rounded-t-[50px] lg:rounded-t-[60px] bg-[#EFF2FF] shadow-xl overflow-hidden">
        <div className="px-6 sm:px-12 md:px-20 lg:px-24 py-10 sm:py-12 lg:py-16">
          {/* Header */}
          <div className="max-w-xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#DCE4FF] text-[#3B42F2] text-[10px] font-bold tracking-widest uppercase mb-4 shadow-sm">
              <FiSearch className="h-3 w-3" />
              DOMAIN AVAILABILITY CHECKER
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#1E293B] leading-tight mb-6">
              Find Your Perfect <span className="text-[#3B42F2] inline-block">Domain Name</span>
            </h2>
          </div>

          {/* Search Bar */}
          <div className="mt-6 max-w-4xl mx-auto">
            <form onSubmit={handleSearch}>
              <div className="relative rounded-[20px] border-2 border-white bg-white shadow-[0_12px_35px_rgba(59,66,242,0.08)] overflow-hidden transition-all duration-500 hover:shadow-[0_18px_45px_rgba(59,66,242,0.12)]">
                <div className="flex items-center p-1.5">
                  <div className="pl-4 text-[#94A3B8]">
                    <FiGlobe className="h-5 w-5" />
                  </div>
                  <input
                    id="domain-search-input"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter a name (e.g., myschool or botbari)"
                    className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-[#1E293B] text-base font-bold placeholder:text-[#94A3B8]"
                  />
                  <button
                    id="domain-search-btn"
                    type="submit"
                    disabled={isSearching || !searchTerm.trim()}
                    className="rounded-[14px] bg-linear-to-r from-[#1E3A8A] to-[#3B42F2] px-10 py-3.5 text-white text-base font-black shadow-lg shadow-[#3B42F2]/15 hover:shadow-xl hover:shadow-[#3B42F2]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSearching ? (
                      <FiLoader className="h-5 w-5 animate-spin mx-auto" />
                    ) : (
                      "Search"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Feature Icons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2.5 text-[#64748B] font-black text-xs group hover:text-[#3B42F2] transition-colors">
              <svg className="w-5 h-5 text-[#94A3B8] group-hover:text-[#3B42F2] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              <span>Trust</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#64748B] font-black text-xs group hover:text-[#3B42F2] transition-colors">
              <FiGlobe className="w-5 h-5 text-[#94A3B8] group-hover:text-[#3B42F2] transition-colors" />
              <span>Global Reach</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#64748B] font-black text-xs group hover:text-[#3B42F2] transition-colors">
              <svg className="w-5 h-5 text-[#94A3B8] group-hover:text-[#3B42F2] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span>Speed</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 max-w-3xl mx-auto text-center animate-[fadeInUp_0.3s_ease-out]">
              <p className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-50/80 border border-red-200/50 text-red-600 text-sm font-medium">
                <FiXCircle className="h-4 w-4 shrink-0" />
                {error}
              </p>
            </div>
          )}

          {/* Loading Skeletons */}
          {isSearching && (
            <div className="mt-10 animate-pulse">
              <div className="h-5 w-36 bg-dark/10 rounded-lg mb-5" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-22 rounded-2xl bg-white/30 border border-white/20"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {!isSearching && results.length > 0 && (
            <div className="mt-10 animate-[fadeInUp_0.4s_ease-out]">
              <p className="text-lg sm:text-xl font-bold text-dark mb-5">
                Search <span className="text-tertiary">Results</span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {results.map((result, index) => {
                  const { base, tld } = splitDomainName(result.domain);

                  return (
                    <div
                      key={result.domain}
                      className={`group relative rounded-2xl border p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 ${result.available
                        ? "border-[#10B981]/25 bg-white/55 hover:shadow-xl hover:shadow-[#10B981]/10 hover:border-[#10B981]/40"
                        : "border-white/20 bg-white/25 opacity-70 hover:opacity-80"
                        }`}
                      style={{
                        animationDelay: `${index * 80}ms`,
                        animation: "fadeInUp 0.4s ease-out backwards",
                      }}
                    >
                      {/* Card Content */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                          {/* Domain Name */}
                          <p
                            className={`text-base sm:text-lg font-bold break-all ${result.available
                              ? "text-dark"
                              : "text-dark/45 line-through decoration-1"
                              }`}
                          >
                            {base}
                            <span
                              className={
                                result.available
                                  ? "text-tertiary"
                                  : "text-dark/35"
                              }
                            >
                              {tld}
                            </span>
                          </p>

                          {/* Status Badge */}
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span
                              className={`h-2 w-2 rounded-full ${result.available
                                ? "bg-[#10B981] shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                                : "bg-red-400"
                                }`}
                            />
                            <span
                              className={`text-xs font-semibold ${result.available
                                ? "text-[#10B981]"
                                : "text-red-400"
                                }`}
                            >
                              {result.available ? "Available" : "Taken"}
                            </span>
                          </div>
                        </div>

                        {/* Action */}
                        {result.available ? (
                          <button
                            className="shrink-0 rounded-xl bg-linear-to-r from-tertiary to-[#8B5CF6] px-4 py-2 text-xs font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                            onClick={() =>
                              navigate("/payment-purchase", {
                                state: { preferredDomain: result.domain },
                              })
                            }
                          >
                            Select
                          </button>
                        ) : (
                          <span className="shrink-0 rounded-xl bg-dark/5 px-3 py-2 text-xs font-semibold text-dark/35">
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
      </div>
    </section>
  );
};

export default DomainSearch;
