import React from "react";
import { FiArrowRight, FiSend } from "react-icons/fi";
import { Link } from "react-router";

const WorkProofCTA = () => {
    return (
        <section className="w-full px-4 sm:px-6 md:px-12 py-16 sm:py-20 lg:py-24">
            <div className="w-full rounded-[28px] border border-white/20 bg-primary/95 backdrop-blur-sm overflow-hidden">
                <div className="px-6 sm:px-8 md:px-10 lg:px-12 py-14 sm:py-16">
                    <div className="max-w-3xl mx-auto text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold tracking-wide uppercase mb-5">
                            <FiSend className="h-3.5 w-3.5" />
                            Let's Work Together
                        </div>

                        {/* Heading */}
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-dark leading-tight">
                            Have a Project{" "}
                            <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]">
                                In Mind?
                            </span>
                        </h2>

                        {/* Description */}
                        <p className="mt-5 text-sm sm:text-[15px] lg:text-base leading-7 text-dark/70 max-w-2xl mx-auto">
                            Whether you need a school website, a learning
                            management system, or a complete digital campus
                            solution — let's build something amazing together.
                        </p>

                        {/* CTA Buttons */}
                        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-linear-to-r from-tertiary to-[#8B5CF6] text-sm font-bold text-white shadow-md shadow-tertiary/30 hover:shadow-lg hover:shadow-tertiary/40 hover:-translate-y-0.5 transition-all duration-300"
                            >
                                Get In Touch
                                <FiArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/60 border border-dark/10 text-sm font-bold text-dark hover:bg-white/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
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
