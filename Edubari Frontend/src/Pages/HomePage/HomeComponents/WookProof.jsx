import React, { useEffect, useState } from "react";
import {
  FiExternalLink,
  FiLayout,
  FiCheckCircle,
  FiLoader,
  FiGlobe,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_SERVER || "http://localhost:3000";

const toPreviewUrl = (url) => {
  const value = (url || "").trim();
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value}`;
};

const WookProof = () => {
  const [liveSites, setLiveSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWorkProofs = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_URL}/workProof`);
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
    <section className="w-full px-4 sm:px-6 md:px-12 py-16 sm:py-20 lg:py-24 bg-white">
      <div className="w-full rounded-[28px] border border-white/20 bg-primary/95 backdrop-blur-sm overflow-hidden">
        <div className="px-6 sm:px-8 md:px-10 lg:px-12 py-12 sm:py-14">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold tracking-wide uppercase mb-4">
              <FiLayout className="h-3.5 w-3.5" />
              Live Examples
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-dark leading-tight">
              Our Successful{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]">
                Implementations
              </span>
            </h2>

            <p className="mt-5 text-sm sm:text-[15px] lg:text-base leading-7 text-dark/70 max-w-2xl mx-auto">
              Explore websites and portals we've built for educational
              institutions that are currently live and thriving.
            </p>
          </div>

          {/* Work Proof Cards */}
          <div className="mt-12 lg:mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-12 text-dark/60 font-medium">
                <FiLoader className="w-5 h-5 animate-spin mr-2" />
                Loading live projects...
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-10 rounded-xl bg-red-50 border border-red-200/70">
                <p className="text-red-600 font-semibold">
                  Failed to load work proofs
                </p>
                <p className="text-sm text-red-500/80 mt-1">{error}</p>
              </div>
            ) : liveSites.length === 0 ? (
              <div className="col-span-full text-center py-10 rounded-xl border border-dark/10 bg-white/65">
                <p className="text-dark/60 font-semibold">
                  No live projects available
                </p>
              </div>
            ) : (
              liveSites.slice(0, 3).map((site) => (
                <div
                  key={site._id}
                  className="group relative rounded-2xl border border-white/40 bg-white/50 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-dark/5 hover:bg-white/80 flex flex-col"
                >
                  {/* Website Preview */}
                  <div className="relative h-48 sm:h-52 overflow-hidden bg-dark/5">
                    <div className="absolute top-0 inset-x-0 h-8 bg-white border-b border-dark/10 z-20 flex items-center gap-1.5 px-3">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="ml-2 text-[10px] text-dark/45 font-semibold truncate">
                        {site.link || "No website link"}
                      </span>
                    </div>

                    {toPreviewUrl(site.link) ? (
                      <iframe
                        src={toPreviewUrl(site.link)}
                        title={`${site.title} preview`}
                        loading="lazy"
                        scrolling="no"
                        style={{ overflow: "hidden" }}
                        className="absolute inset-0 top-8 w-full h-[calc(100%-2rem)] border-0 pointer-events-none"
                      />
                    ) : (
                      <div className="absolute inset-0 top-8 flex items-center justify-center text-dark/40">
                        <div className="flex flex-col items-center gap-2">
                          <FiGlobe className="w-8 h-8" />
                          <p className="text-xs font-semibold">
                            Website preview unavailable
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-0 z-20 bg-linear-to-t from-dark/25 via-transparent to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-30" />
                  </div>

                  {/* Content Container */}
                  <div className="p-6 flex flex-col grow">
                    <p className="text-xs font-bold text-tertiary tracking-wide uppercase mb-2">
                      {site.type}
                    </p>
                    <h3 className="text-xl font-bold text-dark leading-snug mb-4">
                      {site.title}
                    </h3>

                    {/* Features List */}
                    <div className="mt-auto space-y-2 mb-6">
                      {(Array.isArray(site.features) ? site.features : []).map(
                        (feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm text-dark/70"
                          >
                            <FiCheckCircle className="h-4 w-4 text-[#8B5CF6] shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ),
                      )}
                    </div>

                    {/* CTA */}
                    <a
                      href={toPreviewUrl(site.link) || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-7 w-full block rounded-xl px-6 py-3 text-sm font-bold text-center transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 bg-white/60 text-dark border border-dark/10 group-hover:bg-white/90 shadow-sm group-hover:shadow-md"
                    >
                      Visit Live Site
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* View All CTA */}
          <div className="mt-12 text-center">
            <a
              href="/work-proof"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/60 border border-dark/10 text-sm font-bold text-dark hover:bg-white/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              View All Projects
              <FiExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WookProof;
