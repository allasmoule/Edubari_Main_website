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
    <section className="w-full px-6 sm:px-12 lg:px-24 pb-8 sm:pb-12 bg-transparent">
      {!loading && !error && (
        <div className="max-w-7xl mx-auto mb-8">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
            Showing {filtered.length} elite projects
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-24 bg-white rounded-[40px] border border-slate-50 shadow-sm">
            <FiLoader className="w-8 h-8 animate-spin text-[#3B42F2] mr-3" />
            <span className="text-slate-500 font-bold">Loading live projects...</span>
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-20 rounded-[40px] bg-red-50/50 border border-red-100">
            <p className="text-[#1E293B] font-black text-xl mb-2">Oops! Connection error</p>
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        ) : (
          filtered.map((site) => (
            <div
              key={site._id}
              className="group relative flex flex-col h-full bg-white rounded-[40px] border border-slate-50 overflow-hidden transition-all duration-700 hover:-translate-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(59,66,242,0.1)]"
            >
              {/* Website Preview / Browser Mockup */}
              <div className="relative h-64 overflow-hidden bg-slate-50">
                {/* Browser Top Bar */}
                <div className="absolute top-0 inset-x-0 h-10 bg-slate-100/80 backdrop-blur-md border-b border-slate-200 z-20 flex items-center gap-1.5 px-4">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="mx-auto bg-white/80 rounded-lg px-3 py-1 flex items-center gap-2 max-w-[150px]">
                    <FiGlobe className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] text-slate-400 font-black truncate">
                      {site.link || "edubari.com"}
                    </span>
                  </div>
                </div>

                {toPreviewUrl(site.link) ? (
                  <iframe
                    src={toPreviewUrl(site.link)}
                    title={`${site.title} preview`}
                    loading="lazy"
                    scrolling="no"
                    className="absolute inset-0 top-10 w-full h-[calc(100%-2.5rem)] border-0 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 top-10 flex items-center justify-center text-slate-200">
                    <FiGlobe className="w-12 h-12" />
                  </div>
                )}

                <div className="absolute inset-0 z-10 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-40" />
              </div>

              {/* Content Container */}
              <div className="p-10 flex flex-col grow">
                <div className="mb-4">
                  <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black tracking-widest uppercase border border-blue-100/50">
                    {site.type || "Educational"}
                  </span>
                </div>
                
                <h3 className="text-2xl font-black text-[#1E293B] mb-4 group-hover:text-[#3B42F2] transition-colors duration-300">
                  {site.title}
                </h3>
                
                <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
                  {site.description}
                </p>

                {/* Features List */}
                <div className="mt-auto space-y-3 mb-10">
                  {(Array.isArray(site.features) ? site.features : []).map(
                    (feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 text-sm font-bold text-slate-600"
                      >
                        <FiCheckCircle className="h-4 w-4 text-[#3B42F2] shrink-0" />
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
                  className="flex items-center justify-center gap-2 w-full py-5 rounded-[20px] bg-[#1E293B] text-white font-black text-xs uppercase tracking-widest hover:bg-[#3B42F2] shadow-xl hover:shadow-[#3B42F2]/20 transition-all duration-300"
                >
                  Visit Live Site
                  <FiExternalLink className="w-4 h-4" />
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
