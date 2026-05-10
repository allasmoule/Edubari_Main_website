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
        <section className="w-full px-4 sm:px-6 md:px-12 py-16 sm:py-20 lg:py-24 bg-primary/40">
            <div className="w-full rounded-[28px] border border-white/20 bg-primary/95 backdrop-blur-sm overflow-hidden">
                <div className="px-6 sm:px-8 md:px-10 lg:px-12 py-12 sm:py-14">
                    {/* Header */}
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold tracking-wide uppercase mb-4">
                            📋 Process
                        </div>

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-dark leading-tight">
                            How It{" "}
                            <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]">
                                Works
                            </span>
                        </h2>

                        <p className="mt-5 text-sm sm:text-[15px] lg:text-base leading-7 text-dark/70 max-w-2xl mx-auto">
                            Get started in three simple steps
                        </p>
                    </div>

                    {/* Steps Grid */}
                    <div className="mt-12 lg:mt-14 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
                        {steps.map((step, index) => (
                            <div key={step.number} className="group relative flex">
                                {/* Card */}
                                <div className="relative w-full rounded-2xl border border-white/40 bg-white/50 p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-dark/5 hover:bg-white/80">
                                    {/* Step Number */}
                                    <div
                                        className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${step.accent} text-lg font-black transition-transform duration-300 group-hover:scale-105`}
                                    >
                                        {step.number}
                                    </div>

                                    {/* Title */}
                                    <h3 className="mt-5 text-[17px] font-bold text-dark leading-snug">
                                        {step.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="mt-2 text-sm leading-relaxed text-dark/60">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Connector line (desktop only, not on last) */}
                                {index < steps.length - 1 && (
                                    <div className="hidden md:flex absolute top-1/2 -right-3 w-6 items-center z-10">
                                        <div className="w-full h-[2px] bg-dark/10 rounded-full" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowWorks;
