import React from "react";
import { FiMapPin } from "react-icons/fi";

const ContactHero = () => {
    return (
        <section className="relative w-full overflow-hidden">
            {/* Background — matching blog hero style */}
            <div className="absolute inset-0 bg-linear-to-br from-primary via-primary-light to-white" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.12),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.08),transparent_60%)]" />

            <div className="relative px-4 sm:px-6 md:px-12 pt-12 sm:pt-16 pb-10 sm:pb-14">
                <div className="max-w-3xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold tracking-wide uppercase mb-5">
                        <FiMapPin className="h-3.5 w-3.5" />
                        Contact Us
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-dark leading-[1.1]">
                        Get In{" "}
                        <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]">
                            Touch
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="mt-5 text-sm sm:text-base lg:text-lg leading-7 text-dark/60 max-w-2xl mx-auto">
                        Have a question, suggestion, or just want to say hello? We'd love
                        to hear from you. Get in touch and we'll get back to you shortly.
                    </p>

                    {/* Decorative Dots */}
                    <div className="mt-8 flex items-center justify-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-tertiary/60" />
                        <span className="h-1.5 w-8 rounded-full bg-linear-to-r from-tertiary to-[#8B5CF6]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6]/60" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactHero;
