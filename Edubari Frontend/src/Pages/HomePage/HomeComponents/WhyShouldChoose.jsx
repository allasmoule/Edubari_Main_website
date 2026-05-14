import React from "react";
import { useNavigate } from "react-router";
import {
  FiGlobe,
  FiSettings,
  FiUsers,
  FiTrendingUp,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";

const WhyShouldChoose = () => {
  const navigate = useNavigate();
  const features = [
    {
      id: "01",
      icon: <FiGlobe className="h-5 w-5" />,
      title: "Dedicated Domain for Your Brand",
      description:
        "Get your own professional web identity where students can easily find, trust, and connect with your teaching brand.",
      accent: "text-tertiary bg-tertiary/10",
      glow: "from-tertiary/20 to-[#8B5CF6]/10",
    },
    {
      id: "02",
      icon: <FiSettings className="h-5 w-5" />,
      title: "We Handle the Tech, You Focus on Teaching",
      description:
        "We handle the technical side for you, so you can focus on teaching while your platform stays modern, polished, and professional.",
      accent: "text-secondary bg-secondary/10",
      glow: "from-secondary/20 to-sky-400/10",
    },
    {
      id: "03",
      icon: <FiUsers className="h-5 w-5" />,
      title: "Everything Organized in One Place",
      description:
        "Manage your students, study materials, updates, and teaching resources from one organized and easy-to-use system.",
      accent: "text-[#8B5CF6] bg-[#8B5CF6]/10",
      glow: "from-[#8B5CF6]/20 to-tertiary/10",
    },
    {
      id: "04",
      icon: <FiTrendingUp className="h-5 w-5" />,
      title: "Build Trust and Attract More Students",
      description:
        "A branded and structured platform helps you build trust, attract more students, and grow your teaching business with confidence.",
      accent: "text-tertiary bg-tertiary/10",
      glow: "from-tertiary/20 to-secondary/10",
    },
  ];

  return (
    <section className="w-full px-4 sm:px-6 md:px-12 py-16 sm:py-20 lg:py-28 bg-white relative overflow-hidden">
        {/* Background Decorative Gradient */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-blue-50/50 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
            {/* Header */}
            <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-widest uppercase mb-6 shadow-sm border border-blue-100/50">
                    🏆 WHY CHOOSE US
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1E293B] leading-tight mb-4">
                    Why Educators Trust <span className="text-[#3B42F2]">EduBari</span>
                </h2>

                <p className="mt-4 text-sm sm:text-base lg:text-lg text-[#64748B] font-medium max-w-2xl mx-auto leading-relaxed">
                    Build a powerful online identity with a dedicated domain, professional tools, and a team that cares about your growth.
                </p>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch max-w-6xl mx-auto">
                {/* Left Side - Large Highlight Card */}
                <div className="lg:col-span-5 relative group">
                    <div className="h-full rounded-[40px] bg-linear-to-br from-[#1E293B] to-[#0F172A] p-10 flex flex-col justify-between overflow-hidden shadow-[0_30px_70px_rgba(15,23,42,0.3)] relative group-hover:-translate-y-4 transition-all duration-500">
                        {/* Decorative background shape */}
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#3B42F2] rounded-full blur-[100px] opacity-20" />
                        
                        <div className="relative z-10">
                            <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white mb-8 border border-white/10">
                                <FiCheckCircle className="h-8 w-8" />
                            </div>

                            <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-6">
                                More Than Just a Website — It’s Your <span className="text-[#3B42F2]">Brand</span>
                            </h3>

                            <p className="text-slate-400 font-medium text-lg leading-relaxed mb-8">
                                We give you a complete branded platform that looks professional, feels trustworthy, and makes daily operations effortless.
                            </p>

                            <div className="space-y-4 mb-10">
                                {[
                                    "Your own dedicated domain",
                                    "Professional online presence",
                                    "Simple resource management",
                                    "Scalable growth tools",
                                ].map((item) => (
                                    <div key={item} className="flex items-center gap-3 text-slate-300 font-semibold">
                                        <div className="h-5 w-5 rounded-full bg-[#3B42F2]/20 flex items-center justify-center text-[#3B42F2]">
                                            <FiCheckCircle className="h-3.5 w-3.5" />
                                        </div>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => navigate("/payment-purchase")}
                            className="relative z-10 w-full py-4 rounded-2xl bg-[#3B42F2] text-white font-black text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group/btn shadow-xl shadow-blue-500/20"
                        >
                            Start With EduBari
                            <FiArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Right Side - Small Feature Cards */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    {features.map((feature) => (
                        <div
                            key={feature.id}
                            className="group relative rounded-[40px] bg-white border border-slate-50 p-8 transition-all duration-500 hover:-translate-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(59,66,242,0.1)]"
                        >
                            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${feature.accent} mb-6 transition-all duration-500 group-hover:rotate-6 shadow-sm`}>
                                <div className="text-[#3B42F2]">
                                    {feature.icon}
                                </div>
                            </div>

                            <h4 className="text-xl font-black text-[#1E293B] mb-4 group-hover:text-[#3B42F2] transition-colors duration-300">
                                {feature.title}
                            </h4>

                            <p className="text-[#64748B] font-semibold text-sm leading-relaxed">
                                {feature.description}
                            </p>

                            <div className="mt-6 flex items-center gap-2 text-xs font-black text-[#3B42F2] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                                Learn More <FiArrowRight className="h-3 w-3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </section>
  );
};

export default WhyShouldChoose;
