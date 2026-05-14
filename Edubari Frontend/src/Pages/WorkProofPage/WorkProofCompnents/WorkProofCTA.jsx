import React from "react";
import { FiArrowRight, FiSend } from "react-icons/fi";
import { Link } from "react-router";

const WorkProofCTA = () => {
    return (
        <section className="w-full px-6 sm:px-12 lg:px-24 py-8 sm:py-12">
            <div className="w-full rounded-[40px] bg-[#1E293B] overflow-hidden relative shadow-[0_30px_70px_rgba(30,41,59,0.3)]">
                {/* Decorative background shape */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B42F2] rounded-full blur-[100px] opacity-20" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-10" />

                <div className="relative z-10 px-8 sm:px-12 lg:px-16 py-16 sm:py-20">
                    <div className="max-w-3xl mx-auto text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-[10px] font-black tracking-widest uppercase mb-8 border border-white/10 backdrop-blur-md">
                            <FiSend className="h-3.5 w-3.5 text-[#3B42F2]" />
                            LET'S WORK TOGETHER
                        </div>

                        {/* Heading */}
                        <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black tracking-tight text-white leading-tight mb-6">
                            Have a Project <span className="text-[#3B42F2]">In Mind?</span>
                        </h2>

                        {/* Description */}
                        <p className="text-slate-400 font-medium text-lg leading-relaxed mb-12 max-w-2xl mx-auto">
                            Whether you need a school website, a learning
                            management system, or a complete digital campus
                            solution — let's build something amazing together.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link
                                to="/contact"
                                className="group inline-flex items-center gap-3 px-10 py-5 rounded-[20px] bg-[#3B42F2] text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-[#3B42F2]/20 hover:bg-blue-600 hover:-translate-y-1 transition-all duration-300"
                            >
                                Get In Touch
                                <FiArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/"
                                className="inline-flex items-center gap-3 px-10 py-5 rounded-[20px] bg-white/10 text-white font-black text-xs uppercase tracking-widest border border-white/10 hover:bg-white/20 hover:-translate-y-1 transition-all duration-300"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WorkProofCTA;
