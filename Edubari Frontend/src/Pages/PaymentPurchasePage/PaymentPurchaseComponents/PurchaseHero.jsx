import React from "react";

const PurchaseHero = () => {
    return (
        <section className="relative w-full px-4 sm:px-6 md:px-12 pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24 overflow-hidden">
            {/* Decorative orbs */}
            <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-tertiary/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-10 w-80 h-80 rounded-full bg-[#8B5CF6]/10 blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-tertiary/5 blur-[80px] pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold tracking-wide uppercase mb-5 border border-tertiary/15 backdrop-blur-sm">
                    💳 Payment & Purchase
                </div>

                {/* Headline */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[54px] font-black tracking-tighter text-dark leading-[1.1]">
                    Choose Your Plan &{" "}
                    <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]">
                        Get Started
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="mt-5 sm:mt-6 text-sm sm:text-[15px] lg:text-base leading-7 text-dark/65 max-w-xl mx-auto">
                    Select the perfect plan for your institution, fill in your
                    details, and confirm your order to launch your professional
                    teaching platform with EduBari.
                </p>

                {/* Trust indicators */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-semibold text-dark/50">
                    <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Secure Payment
                    </span>
                    <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Instant Activation
                    </span>
                    <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Cancel Anytime
                    </span>
                </div>
            </div>
        </section>
    );
};

export default PurchaseHero;
