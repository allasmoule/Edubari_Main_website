import React from "react";
import { FiClipboard, FiSettings, FiZap } from "react-icons/fi";

const steps = [
    {
        number: "01",
        icon: <FiClipboard className="h-6 w-6" />,
        title: "Choose a Plan",
        description: "Browse our comprehensive plans and select the one that best fits your institution's size and requirements.",
        accent: "text-[#3B42F2] bg-[#EFF2FF]",
        delay: "0",
    },
    {
        number: "02",
        icon: <FiSettings className="h-6 w-6" />,
        title: "We Set Up Everything",
        description: "Our expert team deploys and configures your dedicated instance within 24 hours. No technical skills required.",
        accent: "text-[#1E3A8A] bg-[#EFF2FF]",
        delay: "150",
    },
    {
        number: "03",
        icon: <FiZap className="h-6 w-6" />,
        title: "Start Using",
        description: "Your institution goes digital immediately. Access your dashboard and start managing everything with ease.",
        accent: "text-[#3B42F2] bg-[#EFF2FF]",
        delay: "300",
    },
];

const HowWorks = () => {
    return (
    <section className="w-full px-4 sm:px-6 md:px-12 py-16 sm:py-20 lg:py-28 bg-white relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-[#EFF2FF] rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-[#EFF2FF] rounded-full blur-3xl opacity-50" />

        <div className="max-w-7xl mx-auto relative z-10">
            {/* Header */}
            <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-widest uppercase mb-6 shadow-sm border border-blue-100/50">
                    📋 OUR PROCESS
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1E293B] leading-tight mb-4">
                    How It <span className="text-[#3B42F2]">Works</span>
                </h2>

                <p className="mt-4 text-sm sm:text-base lg:text-lg text-[#64748B] font-medium max-w-2xl mx-auto leading-relaxed">
                    A streamlined, three-step journey to digitally transform your educational institution with Edubari
                </p>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-linear-to-r from-transparent via-slate-200 to-transparent" />

                {steps.map((step, index) => (
                    <div 
                        key={step.number} 
                        className="group relative flex flex-col items-center text-center p-8 rounded-[40px] bg-white border border-slate-50 transition-all duration-500 hover:-translate-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(59,66,242,0.1)]"
                        style={{ animationDelay: `${step.delay}ms` }}
                    >
                        {/* Icon Container */}
                        <div className="relative mb-8">
                            <div className={`h-20 w-20 rounded-[28px] ${step.accent} flex items-center justify-center transition-all duration-500 group-hover:rotate-6 shadow-lg shadow-blue-500/5 group-hover:shadow-blue-500/15`}>
                                <div className="text-[#3B42F2]">
                                    {step.icon}
                                </div>
                            </div>
                            {/* Step Number Badge */}
                            <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-white border-4 border-[#F8FAFC] text-[#1E293B] text-xs font-black flex items-center justify-center shadow-md">
                                {step.number}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-4">
                            <h3 className="text-xl sm:text-2xl font-black text-[#1E293B] mb-4 group-hover:text-[#3B42F2] transition-colors duration-300">
                                {step.title}
                            </h3>
                            <p className="text-[#64748B] font-semibold text-sm sm:text-base leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
    );
};

export default HowWorks;
