import React, { useState, useEffect } from "react";
import {
  FiUsers,
  FiMonitor,
  FiTrendingUp,
  FiArrowRight,
  FiClock,
  FiUser,
  FiCheckCircle,
  FiActivity,
  FiLayout,
  FiShield,
  FiLoader
} from "react-icons/fi";
import { FaRocket } from "react-icons/fa";

const API_URL = import.meta.env.VITE_SERVER || "http://localhost:3000";

const stats = [
  {
    icon: FiMonitor,
    value: "500+",
    label: "Institutions",
    sub: "Trust EduPro",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    icon: FiUsers,
    value: "50,000+",
    label: "Teachers Using",
    sub: "EduPro",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50"
  },
  {
    icon: FiUser,
    value: "1M+",
    label: "Students' Data",
    sub: "Managed",
    color: "text-violet-600",
    bgColor: "bg-violet-50"
  },
  {
    icon: FiTrendingUp,
    value: "98%",
    label: "Customer",
    sub: "Satisfaction",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50"
  },
];

const WorkProofPage = () => {
  const [activeTab, setActiveTab] = useState("All Cases");
  const [workProofs, setWorkProofs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    "All Cases",
    "Student Management",
    "Attendance",
    "Exam & Result",
    "Communication",
    "Other Solutions",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wpRes, rvRes] = await Promise.all([
        fetch(`${API_URL}/workProof`),
        fetch(`${API_URL}/reviews`)
      ]);

      const wpData = await wpRes.json();
      const rvData = await rvRes.json();

      setWorkProofs(Array.isArray(wpData) ? wpData : []);
      setReviews(Array.isArray(rvData) ? rvData : []);
    } catch (error) {
      console.error("Error fetching work proof data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = activeTab === "All Cases"
    ? workProofs
    : workProofs.filter(item => item.tag === activeTab);

  // Take the first review as primary testimonial
  const primaryReview = reviews.length > 0 ? reviews[0] : {
    quote: "EduPro has transformed the way we manage our institution. It's easy to use, reliable, and the support team is amazing!",
    authorName: "Md. Rahman",
    authorRole: "Principal, Greenfield School",
    authorImage: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Government_Seal_of_Bangladesh.svg/1200px-Government_Seal_of_Bangladesh.svg.png"
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] py-12 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden relative selection:bg-blue-100 selection:text-blue-900">
      {/* Premium Background Glow Effects */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-400/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-indigo-400/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black mb-4 tracking-widest uppercase">
            <FiActivity className="w-3 h-3" />
            <span>OUR SUCCESS STORIES</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-[900] text-[#0F172A] mb-4 tracking-tighter leading-[1.1]">
            Our Work Speaks <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">for Itself</span>
          </h1>
          <p className="max-w-xl mx-auto text-base md:text-lg text-[#64748B] leading-relaxed font-medium">
            See how EduPro is helping schools and institutions manage smarter,
            save time, and achieve better results.
          </p>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex items-center gap-4 lg:border-r last:border-0 border-slate-100 pr-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center ${stat.color} shrink-0`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-black text-[#0F172A] leading-none mb-1 tracking-tight">{stat.value}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-tight">
                  {stat.label} <br /> {stat.sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-6 py-2.5 rounded-xl text-[11px] font-black transition-all duration-300 border ${activeTab === cat
                  ? "bg-[#3B42F2] text-white border-[#3B42F2] shadow-lg shadow-blue-100"
                  : "bg-white text-[#64748B] border-slate-200 hover:border-blue-400 hover:text-blue-600"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Case Study Cards */}
        {loading ? (
          <div className="text-center py-20 bg-white rounded-[40px] border border-slate-100 shadow-sm mb-12">
            <FiLoader className="w-10 h-10 mx-auto text-[#3B42F2] animate-spin mb-4" />
            <p className="text-[#64748B] font-bold text-lg">Loading success stories...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border border-slate-100 shadow-sm mb-12">
            <p className="text-[#64748B] font-bold text-lg">No cases found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {filteredCases.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-[32px] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100 group hover:shadow-[0_20px_40px_rgba(59,66,242,0.05)] transition-all duration-500 overflow-hidden"
              >
                <div className="flex flex-row items-center gap-4 h-full">
                  <div className="flex-1 text-left flex flex-col h-full">
                    <div className="mb-2">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${item.tagColor || "bg-blue-50 text-blue-600"}`}>
                        {item.tag}
                      </span>
                    </div>

                    <a href="#" className="block group/link">
                      <h3 className="text-base font-black text-[#0F172A] mb-2 group-hover:text-blue-600 transition-colors leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-[#64748B] text-[10px] font-medium mb-4 leading-relaxed line-clamp-2">
                        {item.desc || item.description}
                      </p>
                    </a>

                    <div className="space-y-3 mb-4 mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <FiUsers className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-[#0F172A] leading-none">{item.stat1}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">{item.stat1Label}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <FiTrendingUp className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-[#0F172A] leading-none">{item.stat2}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">{item.stat2Label}</p>
                        </div>
                      </div>
                    </div>

                    <a href="#" className="inline-flex items-center gap-1.5 text-blue-600 font-black text-[9px] uppercase tracking-widest hover:translate-x-1 transition-transform">
                      View Details <FiArrowRight className="w-3 h-3" />
                    </a>
                  </div>

                  <a href="#" className="w-[45%] shrink-0 self-center block group/image transition-transform duration-500 hover:scale-[1.02]">
                    <div className="rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-100 bg-white p-1.5">
                      <div className="h-6 bg-slate-50/80 border-b border-slate-100 flex items-center px-3 gap-1.5 mb-1.5 rounded-t-xl">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF5F56]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FFBD2E]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#27C93F]" />
                      </div>
                      <img 
                        src={item.image || item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-auto rounded-lg min-h-[180px] max-h-[210px] object-cover object-top" 
                      />
                    </div>
                  </a>

                </div>
              </div>
            ))}
          </div>
        )}

        {/* Testimonial & Trusted Section */}
        <div className="bg-white rounded-[24px] p-5 lg:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-6 overflow-hidden mb-6">
          <div className="flex items-center gap-4 lg:w-[40%]">
            <div className="text-4xl font-serif text-[#3B42F2] leading-none">“</div>
            <p className="text-xs md:text-sm font-bold text-[#0F172A] leading-tight text-left">
              {primaryReview.quote || primaryReview.message}
            </p>
          </div>

          <div className="hidden lg:block w-[1px] h-8 bg-slate-100" />

          <div className="flex items-center gap-3 lg:px-4">
            <div className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center p-1 bg-white shrink-0">
              <img src={primaryReview.authorImage || "https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Government_Seal_of_Bangladesh.svg/1200px-Government_Seal_of_Bangladesh.svg.png"} alt="crest" className="w-8 h-8 object-contain" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-[#0F172A]">{primaryReview.authorName || primaryReview.name}</p>
              <p className="text-[10px] font-bold text-slate-400 leading-tight">{primaryReview.authorRole || "Customer"}</p>
            </div>
          </div>

          <div className="hidden lg:block w-[1px] h-8 bg-slate-100" />

          <div className="flex items-center gap-4 lg:pl-4">
            <p className="text-[10px] font-bold text-slate-400 text-left">Trusted by leading <br /> schools</p>
            <div className="flex items-center gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full border border-slate-100 bg-white flex items-center justify-center p-1 shadow-sm">
                  <img src="https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Government_Seal_of_Bangladesh.svg/1200px-Government_Seal_of_Bangladesh.svg.png" alt="logo" className="w-5 h-5 object-contain opacity-70" />
                </div>
              ))}
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                <span className="text-[9px] font-black text-blue-600">+500</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-[#3B42F2] rounded-[24px] p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-blue-50">
          <div className="flex items-center gap-6 text-center md:text-left">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md shrink-0">
              <FaRocket className="text-[#3B42F2] text-2xl" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white mb-1 tracking-tight">
                Ready to Achieve Better Results?
              </h2>
              <p className="text-blue-100/90 text-sm font-medium">
                Join hundreds of institutions already growing with EduPro.
              </p>
            </div>
          </div>

          <button className="bg-white text-[#3B42F2] px-8 py-3.5 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-slate-50 transition-all shadow-md">
            Get Started Now
            <FiArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkProofPage;

