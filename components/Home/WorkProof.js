"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiExternalLink,
  FiLayout,
  FiCheckCircle,
  FiLoader,
  FiGlobe,
} from "react-icons/fi";

const toPreviewUrl = (url) => {
  const value = (url || "").trim();
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value}`;
};

const WorkProof = () => {
  const [liveSites, setLiveSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchWorkProofs = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/work-proofs");
        if (!response.ok) throw new Error("Failed to fetch work proof data");

        const data = await response.json();
        const items = Array.isArray(data) ? data : [];
        setLiveSites(items);
      } catch (err) {
        setError(err.message || "Failed to load data");
        setLiveSites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkProofs();
  }, []);

  return (
    <section className="w-full px-4 sm:px-6 md:px-12 py-8 sm:py-10 bg-white">
      <div className="w-full rounded-[32px] border border-white bg-primary-light/80 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.08)] backdrop-blur-md overflow-hidden relative">
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-tertiary/5 rounded-full blur-3xl pointer-events-none -ml-32 -mt-32" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#8B5CF6]/5 rounded-full blur-3xl pointer-events-none -mr-32 -mb-32" />

        <div className="px-6 sm:px-8 md:px-10 lg:px-12 py-10 sm:py-12 relative z-10">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tertiary/8 border border-tertiary/15 text-tertiary text-xs font-bold tracking-wide uppercase mb-4">
              <FiLayout className="h-3.5 w-3.5" />
              Live Examples
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-4.5xl font-black tracking-tight text-dark leading-tight">
              Our Successful{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary via-[#8B5CF6] to-[#7c3aed] drop-shadow-sm">
                Implementations
              </span>
            </h2>

            <p className="mt-4 text-sm sm:text-base leading-relaxed text-dark/70 max-w-2xl mx-auto font-medium">
              Explore websites and portals we've built for educational institutions that are currently live and thriving.
            </p>
          </div>

          {/* Work Proof Cards */}
          <div className="mt-10 lg:mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {loading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-dark/50 font-bold">
                <FiLoader className="w-10 h-10 animate-spin text-tertiary mb-4" />
                <span>Loading live projects...</span>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12 px-6 rounded-2xl bg-red-50 border border-red-200 max-w-md mx-auto shadow-sm">
                <p className="text-red-600 font-extrabold">Failed to load work proofs</p>
                <p className="text-sm text-red-500/80 mt-1">{error}</p>
              </div>
            ) : liveSites.length === 0 ? (
              <div className="col-span-full text-center py-16 rounded-2xl border border-dark/5 bg-white/40">
                <p className="text-dark/45 font-bold">
                  No live projects available at the moment.
                </p>
              </div>
            ) : (
              liveSites.slice(0, 3).map((site, index) => {
                const siteId = site.id || site._id;
                const link = site.project_url || site.link || "";
                return (
                  <div
                    key={siteId}
                    className="group relative rounded-2xl border border-white bg-white/70 backdrop-blur-xs overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-dark/5 hover:bg-white flex flex-col"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: "fadeInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) backwards",
                    }}
                  >
                    {/* Website Browser Header Mock */}
                    <div className="relative h-40 sm:h-44 overflow-hidden bg-dark/5">
                      <div className="absolute top-0 inset-x-0 h-9 bg-white border-b border-dark/5 z-20 flex items-center gap-1.5 px-4 shadow-xs">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                        <div className="ml-3 flex-1 max-w-[70%] bg-dark/[0.03] border border-dark/5 rounded-md py-0.5 px-3 text-[10px] text-dark/45 font-semibold truncate text-center select-none">
                          {link || "website-preview.com"}
                        </div>
                      </div>

                      {/* Webpage iframe Preview */}
                      {toPreviewUrl(link) ? (
                        <iframe
                          src={toPreviewUrl(link)}
                          title={`${site.title} preview`}
                          loading="lazy"
                          scrolling="no"
                          style={{ overflow: "hidden" }}
                          className="absolute inset-0 top-9 w-full h-[calc(100%-2.25rem)] border-0 pointer-events-none"
                        />
                      ) : (
                        <div className="absolute inset-0 top-9 flex items-center justify-center text-dark/40 bg-dark/[0.02]">
                          <div className="flex flex-col items-center gap-2">
                            <FiGlobe className="w-8 h-8 opacity-40 animate-pulse" />
                            <p className="text-2xs font-bold uppercase tracking-wider">
                              Preview unavailable
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Dark gradient overlay on card hover */}
                      <div className="absolute inset-0 z-20 bg-dark/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                        <a
                          href={toPreviewUrl(link) || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-dark text-xs font-black shadow-lg scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300"
                        >
                          Visit Site
                          <FiExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Content Container */}
                    <div className="p-5 sm:p-5.5 flex flex-col grow justify-between">
                      <div>
                        <p className="text-[10px] font-black text-tertiary tracking-widest uppercase mb-1.5">
                          {site.client_name || "Institution Portal"}
                        </p>
                        <h3 className="text-lg font-extrabold text-dark leading-snug tracking-tight mb-3">
                          {site.title}
                        </h3>

                        {/* Features List */}
                        <div className="space-y-1.5 mb-5">
                          {(Array.isArray(site.features) ? site.features : ["Student Portal", "Fee Receipts", "SMS Alerts"]).map(
                            (feature, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2.5 text-xs text-dark/70 font-semibold"
                              >
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8B5CF6]/8 text-[#8B5CF6] ring-1 ring-[#8B5CF6]/10 shrink-0">
                                  <FiCheckCircle className="h-3 w-3 stroke-[2.5]" />
                                </span>
                                <span className="leading-relaxed font-bold text-dark/70">{feature}</span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>

                      {/* CTA */}
                      <a
                        href={toPreviewUrl(link) || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full text-center block rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 bg-dark/5 text-dark hover:bg-dark/10 shadow-xs border border-dark/5"
                      >
                        Visit Live Site
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* View All CTA */}
          <div className="mt-12 text-center">
            <button
              onClick={() => router.push("/work-proof")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-dark/15 text-sm font-bold text-dark hover:bg-dark/5 hover:border-dark/25 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
            >
              View All Projects
              <FiExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkProof;
