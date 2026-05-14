import React from "react";

const PurchaseHero = () => {
    return (
        <section className="relative w-full px-6 sm:px-12 lg:px-24 pt-6 pb-6 sm:pt-12 sm:pb-10 overflow-hidden bg-transparent">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-[120px] opacity-40" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-100 rounded-full blur-[120px] opacity-40" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black tracking-widest uppercase mb-8 shadow-sm border border-blue-100/50">
                    💳 PAYMENT & PURCHASE
                </div>

                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-[#1E293B] leading-tight mb-6">
                    Choose Your Plan & <span className="text-[#3B42F2]">Get Started</span>
                </h1>

                {/* Subtitle */}
                <p className="text-[#64748B] font-medium text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
                    Select the perfect plan for your institution, fill in your
                    details, and confirm your order to launch your professional
                    teaching platform with EduBari.
                </p>

                {/* Trust indicators */}
                <div className="flex flex-wrap items-center justify-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        Secure Payment
                    </span>
                    <span className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        Instant Activation
                    </span>
                    <span className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        Cancel Anytime
                    </span>
                </div>
            </div>
        </section>
    );
};

export default PurchaseHero;
