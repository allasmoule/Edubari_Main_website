"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FiGlobe,
  FiSettings,
  FiUsers,
  FiTrendingUp,
  FiArrowRight,
} from "react-icons/fi";

const WhyShouldChoose = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  const features = [
    {
      id: "01",
      icon: <FiGlobe className="h-6 w-6" />,
      title: "Dedicated Domain",
      description: "Get your own professional web identity to build trust.",
      accent: "text-tertiary bg-tertiary/10 border-tertiary/20",
      hoverGlow: "group-hover:shadow-[0_0_20px_rgba(14,165,233,0.3)]",
    },
    {
      id: "02",
      icon: <FiSettings className="h-6 w-6" />,
      title: "We Handle Tech",
      description: "Focus on teaching while we manage the platform.",
      accent: "text-secondary bg-secondary/10 border-secondary/20",
      hoverGlow: "group-hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]",
    },
    {
      id: "03",
      icon: <FiUsers className="h-6 w-6" />,
      title: "All in One Place",
      description: "Manage students, materials, and updates easily.",
      accent: "text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20",
      hoverGlow: "group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]",
    },
    {
      id: "04",
      icon: <FiTrendingUp className="h-6 w-6" />,
      title: "Attract Students",
      description: "Grow your teaching business with a structured platform.",
      accent: "text-tertiary bg-tertiary/10 border-tertiary/20",
      hoverGlow: "group-hover:shadow-[0_0_20px_rgba(14,165,233,0.3)]",
    },
  ];

  return (
    <section ref={sectionRef} className="w-full px-4 sm:px-6 md:px-12 py-8 sm:py-10 bg-primary/10 overflow-hidden">
      <div className={`max-w-7xl mx-auto transition-all duration-1000 transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        
        {/* Header - Compact */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-dark leading-tight">
              Why Choose{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6] animate-[pulse_3s_ease-in-out_infinite]">
                EduBari?
              </span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-dark/70 font-medium">
              We help teachers build a strong online identity with a dedicated domain, professional website, and simple tools.
            </p>
          </div>
          <button
            onClick={() => router.push("/payment-purchase")}
            className="shrink-0 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-tertiary to-secondary px-7 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
          >
            Start Now <FiArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Features Grid - Compact & Animated */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, index) => (
            <div 
              key={feature.id} 
              className={`group relative rounded-[20px] border border-white/50 bg-white/70 backdrop-blur-md p-6 transition-all duration-500 hover:-translate-y-2 hover:bg-white ${feature.hoverGlow}`}
              style={{
                transitionDelay: `${index * 100}ms`
              }}
            >
              {/* Animated Background Blob */}
              <div className="absolute -inset-2 bg-linear-to-br from-tertiary/5 to-[#8B5CF6]/5 rounded-[24px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="relative z-10">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border ${feature.accent} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                  {feature.icon}
                </div>
                <h3 className="mt-5 text-[17px] font-extrabold text-dark group-hover:text-tertiary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-dark/70 font-medium leading-relaxed">
                  {feature.description}
                </p>
              </div>
              
              {/* Bottom decorative line */}
              <div className="absolute bottom-0 left-0 h-1.5 w-0 bg-linear-to-r from-tertiary via-[#8B5CF6] to-secondary rounded-b-[20px] transition-all duration-700 ease-out group-hover:w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyShouldChoose;
