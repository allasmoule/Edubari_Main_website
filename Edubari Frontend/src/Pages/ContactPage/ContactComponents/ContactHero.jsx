import React from "react";
import { FiMapPin } from "react-icons/fi";

const ContactHero = () => {
    return (
        <section className="relative w-full overflow-hidden bg-white pt-20 pb-8 sm:pt-28 sm:pb-12">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-[120px] opacity-40" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-100 rounded-full blur-[120px] opacity-40" />
            </div>

            <div className="relative px-6 sm:px-12 lg:px-24 z-10">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-widest uppercase mb-8 shadow-sm border border-blue-100/50">
                        <FiMapPin className="h-3.5 w-3.5" />
                        GET IN TOUCH
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-[#1E293B] leading-tight mb-6">
                        Let's Start a <span className="text-[#3B42F2]">Conversation</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-[#64748B] font-medium text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
                        Have a question, suggestion, or just want to say hello? We'd love
                        to hear from you. Our team is here to help you every step of the way.
                    </p>

                    {/* Decorative Divider */}
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                        <div className="h-1.5 w-16 rounded-full bg-[#3B42F2]" />
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactHero;
