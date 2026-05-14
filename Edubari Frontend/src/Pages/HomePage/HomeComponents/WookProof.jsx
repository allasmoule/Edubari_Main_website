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
    <section className="w-full px-4 sm:px-6 md:px-12 py-16 sm:py-20 lg:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-widest uppercase mb-6 shadow-sm border border-blue-100/50">
            <FiLayout className="h-3.5 w-3.5" />
            LIVE IMPLEMENTATIONS
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1E293B] leading-tight mb-4">
            Our Successful <span className="text-[#3B42F2]">Implementations</span>
          </h2>

          <p className="mt-4 text-sm sm:text-base lg:text-lg text-[#64748B] font-medium max-w-2xl mx-auto leading-relaxed">
            Explore live websites and portals we've built for leading educational institutions across the country.
          </p>
        </div>

        {/* Work Proof Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {loading ? (
            <div className="col-span-full py-20 text-center bg-[#F8FAFC] rounded-[40px] border border-slate-100">
              <FiLoader className="w-10 h-10 mx-auto text-[#3B42F2] animate-spin mb-4" />
              <p className="text-[#64748B] font-bold text-lg">Loading successful projects...</p>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-16 px-6 rounded-[40px] bg-red-50/50 border border-red-100">
              <p className="text-[#1E293B] font-black text-xl">Oops! Connection error</p>
              <p className="text-red-500 font-medium mt-2">{error}</p>
            </div>
          ) : liveSites.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-[#F8FAFC] rounded-[40px] border border-slate-100">
              <p className="text-[#64748B] font-bold text-lg">No live projects to display right now.</p>
            </div>
          ) : (
            liveSites.slice(0, 3).map((site) => (
              <div
                key={site._id}
                className="group relative flex flex-col h-full animate-[fadeInUp_0.6s_ease-out_forwards]"
              >
                {/* Browser Mockup */}
                <div className="relative rounded-t-[40px] overflow-hidden bg-white border-2 border-slate-50 shadow-[0_20px_50px_rgba(0,0,0,0.05)] group-hover:shadow-[0_40px_80px_rgba(59,66,242,0.1)] transition-all duration-700 group-hover:-translate-y-4">
                  {/* Browser Bar */}
                  <div className="h-10 bg-slate-100 flex items-center px-4 gap-2 border-b border-slate-200">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="mx-auto bg-white rounded-md px-3 py-1 flex items-center gap-2 max-w-[150px]">
                      <FiGlobe className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] text-slate-400 font-bold truncate">
                        {site.link || "edubari.com"}
                      </span>
                    </div>
                  </div>

                  {/* Preview Content */}
                  <div className="h-56 sm:h-64 relative bg-slate-50">
                    {toPreviewUrl(site.link) ? (
                      <iframe
                        src={toPreviewUrl(site.link)}
                        title={`${site.title} preview`}
                        loading="lazy"
                        scrolling="no"
                        className="w-full h-full border-0 pointer-events-none transform scale-100 origin-top opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                        <FiLayout className="w-12 h-12" />
                      </div>
                    )}
                    {/* Overlay to prevent interaction and add depth */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-40" />
                  </div>
                </div>

                {/* Content Card */}
                <div className="bg-white p-10 rounded-b-[40px] border-x-2 border-b-2 border-slate-50 shadow-[0_20px_50px_rgba(0,0,0,0.05)] group-hover:shadow-[0_40px_80px_rgba(59,66,242,0.1)] transition-all duration-700 group-hover:-translate-y-4 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 rounded-lg bg-[#EFF2FF] text-[#3B42F2] text-[10px] font-black tracking-widest uppercase">
                      {site.type || "Educational"}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-black text-[#1E293B] mb-4 group-hover:text-[#3B42F2] transition-colors duration-300">
                    {site.title}
                  </h3>

                  {/* Features */}
                  <div className="space-y-3 mb-8 flex-1">
                    {(Array.isArray(site.features) ? site.features : []).slice(0, 3).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm font-semibold text-[#64748B]">
                        <FiCheckCircle className="h-4 w-4 text-[#3B42F2] shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <a
                    href={toPreviewUrl(site.link) || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-[#1E293B] text-white font-black text-sm hover:bg-[#3B42F2] shadow-lg shadow-slate-200/50 hover:shadow-[#3B42F2]/20 transition-all duration-300"
                  >
                    Launch Live Project
                    <FiExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* View All CTA */}
        <div className="mt-16 text-center">
          <a
            href="/work-proof"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-white border-2 border-slate-100 text-[#1E293B] font-black shadow-lg shadow-slate-200/50 hover:bg-[#3B42F2] hover:text-white hover:border-[#3B42F2] hover:-translate-y-1 transition-all duration-500 group"
          >
            See More Live Implementations
            <FiExternalLink className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default WookProof;
