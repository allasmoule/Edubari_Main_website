"use client";

import React, { useEffect, useState, useRef } from "react";
import { FiClipboard, FiSettings, FiZap } from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";

const HowWorks = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const steps = [
    {
      number: "1",
      icon: <FiClipboard className="h-6 w-6" />,
      title: t("howWorks.step1Title"),
      description: t("howWorks.step1Desc"),
      accent: "text-tertiary bg-tertiary/10 border-tertiary/20",
      gradient: "from-tertiary to-[#8B5CF6]",
    },
    {
      number: "2",
      icon: <FiSettings className="h-6 w-6" />,
      title: t("howWorks.step2Title"),
      description: t("howWorks.step2Desc"),
      accent: "text-secondary bg-secondary/10 border-secondary/20",
      gradient: "from-secondary to-accent",
    },
    {
      number: "3",
      icon: <FiZap className="h-6 w-6" />,
      title: t("howWorks.step3Title"),
      description: t("howWorks.step3Desc"),
      accent: "text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20",
      gradient: "from-[#8B5CF6] to-tertiary",
    },
  ];

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

  return (
    <section ref={sectionRef} className="w-full px-4 sm:px-6 md:px-12 py-8 sm:py-10 lg:py-12 bg-primary/10 overflow-hidden select-none">
      <div className={`transition-all duration-1000 transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} max-w-7xl mx-auto`}>
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-tertiary/20 shadow-sm text-tertiary text-xs font-bold tracking-wide uppercase mb-4 transition-transform hover:scale-105">
            {t("howWorks.badge")}
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-dark leading-tight">
            {t("howWorks.titleMain")}{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary via-[#8B5CF6] to-secondary drop-shadow-sm animate-pulse">
              {t("howWorks.titleGradient")}
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-base leading-relaxed text-dark/70 max-w-2xl mx-auto font-medium">
            {t("howWorks.subtitle")}
          </p>
        </div>

        {/* Steps Journey Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Desktop Connector Line */}
          <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-[2px] bg-linear-to-r from-tertiary/20 via-[#8B5CF6]/40 to-secondary/20 rounded-full z-0 overflow-hidden">
             <div className="h-full w-1/3 bg-linear-to-r from-transparent via-tertiary to-transparent animate-[marquee_3s_ease-in-out_infinite]" />
          </div>

          {steps.map((step, index) => (
            <div 
              key={step.number} 
              className="group relative flex flex-col items-center z-10"
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Step Circle Header */}
              <div className="relative mb-6 mt-2">
                {/* Outer Pulsing Glow */}
                <div className={`absolute -inset-3 rounded-full bg-linear-to-r ${step.gradient} opacity-0 group-hover:opacity-20 blur-lg transition-all duration-500`} />
                
                {/* Step Number Circle */}
                <div
                  className={`relative z-10 flex items-center justify-center h-16 w-16 rounded-2xl border ${step.accent} bg-white shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-1 group-hover:rotate-6`}
                >
                  <span className={`absolute -top-3 -right-3 h-7 w-7 rounded-full bg-linear-to-r ${step.gradient} text-white text-xs font-black flex items-center justify-center shadow-lg border-2 border-white transform group-hover:scale-110 transition-transform duration-300`}>
                    {step.number}
                  </span>
                  {step.icon}
                </div>
              </div>

              {/* Card Container */}
              <div className="relative w-full rounded-[24px] border border-white/60 bg-white/60 backdrop-blur-md p-6 text-center transition-all duration-500 hover:-translate-y-2 hover:bg-white hover:shadow-[0_20px_40px_-10px_rgba(37,99,235,0.1)] flex flex-col justify-between overflow-hidden">
                <div className={`absolute inset-0 bg-linear-to-br ${step.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none`} />
                <div className="relative z-10">
                  <h3 className="text-xl font-extrabold text-dark tracking-tight leading-snug group-hover:text-tertiary transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-dark/70 font-medium">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowWorks;
