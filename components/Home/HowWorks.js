"use client";

import React from "react";
import { FiClipboard, FiSettings, FiZap } from "react-icons/fi";

const steps = [
  {
    number: "1",
    icon: <FiClipboard className="h-5 w-5" />,
    title: "Choose a Plan",
    description: "Select the plan that fits your institution",
    accent: "text-tertiary bg-tertiary/10",
  },
  {
    number: "2",
    icon: <FiSettings className="h-5 w-5" />,
    title: "We Set Up Everything",
    description: "We deploy and configure your app within 24 hours",
    accent: "text-secondary bg-secondary/10",
  },
  {
    number: "3",
    icon: <FiZap className="h-5 w-5" />,
    title: "Start Using",
    description: "Your institution goes digital immediately",
    accent: "text-[#8B5CF6] bg-[#8B5CF6]/10",
  },
];

const HowWorks = () => {
  return (
    <section className="w-full px-4 sm:px-6 md:px-12 py-16 sm:py-20 lg:py-24 bg-primary/20">
      <div className="w-full rounded-[32px] border border-white bg-primary-light/80 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.08)] backdrop-blur-md overflow-hidden relative">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-tertiary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-[#8B5CF6]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

        <div className="px-6 sm:px-8 md:px-10 lg:px-16 py-12 sm:py-16 relative z-10">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tertiary/8 border border-tertiary/15 text-tertiary text-xs font-bold tracking-wide uppercase mb-5">
              📋 Process
            </div>

            <h2 className="text-3xl sm:text-4.5xl lg:text-5xl font-black tracking-tight text-dark leading-tight">
              How It{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary via-[#8B5CF6] to-[#7c3aed] drop-shadow-sm">
                Works
              </span>
            </h2>

            <p className="mt-5 text-sm sm:text-base leading-relaxed text-dark/70 max-w-2xl mx-auto font-medium">
              Get started in three simple steps
            </p>
          </div>

          {/* Steps Journey Grid */}
          <div className="mt-12 lg:mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Desktop Connector Line */}
            <div className="hidden md:block absolute top-16 left-[15%] right-[15%] h-[3px] bg-linear-to-r from-tertiary/20 via-[#8B5CF6]/30 to-tertiary/20 rounded-full z-0" />

            {steps.map((step, index) => (
              <div key={step.number} className="group relative flex flex-col items-center z-10">
                {/* Step Circle Header */}
                <div className="relative mb-6">
                  {/* Outer Pulsing Glow */}
                  <div className="absolute -inset-2 rounded-full bg-white opacity-0 group-hover:opacity-100 group-hover:bg-linear-to-r group-hover:from-tertiary/15 group-hover:to-[#8B5CF6]/15 blur-md transition-all duration-500 scale-105" />
                  
                  {/* Step Number Circle */}
                  <div
                    className={`relative z-10 inline-flex items-center justify-center h-16 w-16 rounded-full border-2 border-white bg-white text-base font-black shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:border-tertiary ${
                      step.number === "1"
                        ? "text-tertiary shadow-tertiary/10"
                        : step.number === "2"
                          ? "text-secondary shadow-secondary/10"
                          : "text-[#8B5CF6] shadow-[#8B5CF6]/10"
                    }`}
                  >
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-linear-to-r from-tertiary to-[#8B5CF6] text-white text-[9px] font-black flex items-center justify-center shadow-md border border-white">
                      {step.number}
                    </span>
                    {step.icon}
                  </div>
                </div>

                {/* Card Container */}
                <div className="relative w-full rounded-2xl border border-white bg-white/70 backdrop-blur-xs p-6 text-center transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-tertiary/5 hover:border-tertiary/20 hover:bg-white flex flex-col justify-between h-full">
                  <div>
                    {/* Title */}
                    <h3 className="text-lg font-extrabold text-dark tracking-tight leading-snug">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-3 text-sm leading-relaxed text-dark/60 font-medium">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowWorks;
