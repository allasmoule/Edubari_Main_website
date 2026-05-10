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
    <section className="w-full px-4 sm:px-6 md:px-12 py-16 sm:py-20 lg:py-24 bg-white">
      <div className="w-full rounded-[28px] border border-white/20 bg-primary/95 backdrop-blur-sm overflow-hidden">
        <div className="px-6 sm:px-8 md:px-10 lg:px-12 py-12 sm:py-14">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold tracking-wide uppercase mb-4">
              <FiSearch className="h-3.5 w-3.5" />
              Domain Availability Checker
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-dark leading-tight">
              Find Your Perfect{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]">
                Domain Name
              </span>
            </h2>

            <p className="mt-5 text-sm sm:text-[15px] lg:text-base leading-7 text-dark/70 max-w-2xl mx-auto">
              Enter your institution or brand name and we'll suggest available
              domains instantly.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-10 max-w-3xl mx-auto">
            <form onSubmit={handleSearch}>
              <div className="relative rounded-2xl border border-white/30 bg-white/60 backdrop-blur-sm shadow-lg shadow-dark/5 overflow-hidden transition-all duration-300 focus-within:shadow-xl focus-within:shadow-tertiary/10 focus-within:border-tertiary/30">
                <div className="flex items-center">
                  <div className="pl-5 text-dark/40">
                    <FiGlobe className="h-5 w-5" />
                  </div>
                  <input
                    id="domain-search-input"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter a name (e.g., myschool or botbari)"
                    className="flex-1 bg-transparent border-none outline-none px-4 py-4 sm:py-5 text-dark text-sm sm:text-base placeholder:text-dark/40 font-medium"
                  />
                  <button
                    id="domain-search-btn"
                    type="submit"
                    disabled={isSearching || !searchTerm.trim()}
                    className="mr-2 sm:mr-3 inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-tertiary to-[#8B5CF6] px-5 sm:px-7 py-2.5 sm:py-3 text-white text-sm font-bold shadow-md shadow-tertiary/30 hover:shadow-lg hover:shadow-tertiary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {isSearching ? (
                      <>
                        <FiLoader className="h-4 w-4 animate-spin" />
                        <span className="hidden sm:inline">Searching…</span>
                      </>
                    ) : (
                      <>
                        <FiSearch className="h-4 w-4" />
                        <span className="hidden sm:inline">Search</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
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
                      className={`group relative rounded-2xl border p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 ${
                        result.available
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
                            className={`text-base sm:text-lg font-bold break-all ${
                              result.available
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
                              className={`h-2 w-2 rounded-full ${
                                result.available
                                  ? "bg-[#10B981] shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                                  : "bg-red-400"
                              }`}
                            />
                            <span
                              className={`text-xs font-semibold ${
                                result.available
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
