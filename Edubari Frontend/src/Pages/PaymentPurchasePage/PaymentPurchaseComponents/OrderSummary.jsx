import React from "react";
import { FiShield, FiRefreshCw, FiCheck } from "react-icons/fi";

const OrderSummary = ({ selectedPlan }) => {
    if (!selectedPlan) {
        return (
            <div className="rounded-[24px] border border-white/30 bg-white/50 backdrop-blur-sm p-6 sm:p-8 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-tertiary/10 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-tertiary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-dark/70">No Plan Selected</h3>
                <p className="mt-2 text-sm text-dark/45 leading-6">
                    Choose a plan above to see your order summary here.
                </p>
            </div>
        );
    }

    const discount = selectedPlan.oldPrice
        ? parseInt(selectedPlan.oldPrice.replace(/[৳,]/g, "")) - selectedPlan.price
        : 0;
    const originalPrice = selectedPlan.oldPrice
        ? parseInt(selectedPlan.oldPrice.replace(/[৳,]/g, ""))
        : selectedPlan.price;

    return (
        <div className="rounded-[24px] border border-white/30 bg-white/60 backdrop-blur-sm overflow-hidden shadow-lg shadow-dark/5">
            {/* Header */}
            <div className="bg-linear-to-r from-tertiary to-[#8B5CF6] px-6 py-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Order Summary
                </h3>
            </div>

            <div className="p-6">
                {/* Selected plan */}
                <div className="flex items-center justify-between pb-4 border-b border-dark/8">
                    <div>
                        <p className="text-sm font-bold text-dark">{selectedPlan.name} Plan</p>
                        <p className="text-xs text-dark/50 mt-0.5">{selectedPlan.duration}</p>
                    </div>
                    {selectedPlan.badge && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-linear-to-r from-tertiary to-[#8B5CF6] text-white">
                            {selectedPlan.badge}
                        </span>
                    )}
                </div>

                {/* Price breakdown */}
                <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-dark/60">Subtotal</span>
                        <span className="font-semibold text-dark">
                            ৳{originalPrice.toLocaleString()}
                        </span>
                    </div>

                    {discount > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-green-600">Discount</span>
                            <span className="font-semibold text-green-600">
                                -৳{discount.toLocaleString()}
                            </span>
                        </div>
                    )}

                    <div className="pt-3 border-t border-dark/8 flex items-center justify-between">
                        <span className="text-base font-bold text-dark">Total</span>
                        <span className="text-2xl font-black bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]">
                            ৳{selectedPlan.price.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Features included */}
                <div className="mt-6 pt-5 border-t border-dark/8">
                    <p className="text-xs font-bold text-dark/50 uppercase tracking-wider mb-3">
                        What's Included
                    </p>
                    <ul className="space-y-2">
                        {selectedPlan.features.slice(0, 5).map((feat) => (
                            <li key={feat} className="flex items-center gap-2 text-xs text-dark/65">
                                <FiCheck className="h-3.5 w-3.5 text-tertiary shrink-0 stroke-[3]" />
                                <span className="font-medium">{feat}</span>
                            </li>
                        ))}
                        {selectedPlan.features.length > 5 && (
                            <li className="text-xs text-tertiary font-semibold pl-5">
                                +{selectedPlan.features.length - 5} more features
                            </li>
                        )}
                    </ul>
                </div>

                {/* Trust badges */}
                <div className="mt-6 pt-5 border-t border-dark/8 flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-dark/40">
                        <FiShield className="h-3.5 w-3.5 text-green-500" />
                        SSL Secure
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-dark/40">
                        <FiRefreshCw className="h-3.5 w-3.5 text-tertiary" />
                        Money-Back
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;
