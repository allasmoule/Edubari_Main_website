import React, { useEffect, useMemo, useState } from "react";
import {
  FiExternalLink,
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

const WorkProofGrid = ({ activeCategory }) => {
  const [projects, setProjects] = useState([]);
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
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load data");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkProofs();
  }, []);

  const filtered = useMemo(() => {
    if (activeCategory === "All") return projects;
    return projects.filter((p) => p.category === activeCategory);
  }, [activeCategory, projects]);

  return (
    <section className="w-full px-4 sm:px-6 md:px-12 pb-10 sm:pb-14">
      {!loading && !error && (
        <div className="max-w-6xl mx-auto mb-4">
          <p className="text-sm font-semibold text-dark/60">
            Showing {filtered.length} projects
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
        ) : (
          filtered.map((site) => (
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
                <h3 className="text-xl font-bold text-dark leading-snug mb-2">
                  {site.title}
                </h3>
                <p className="text-sm text-dark/55 leading-relaxed mb-4">
                  {site.description}
                </p>

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

      {/* Empty State */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 max-w-md mx-auto">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-tertiary/10 text-tertiary mb-5">
            <FiExternalLink className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-bold text-dark mb-2">
            No projects found
          </h3>
          <p className="text-sm text-dark/55">
            We don't have projects in this category yet. Check back soon or
            explore other categories!
          </p>
        </div>
      )}
    </section>
  );
};

export default WorkProofGrid;
