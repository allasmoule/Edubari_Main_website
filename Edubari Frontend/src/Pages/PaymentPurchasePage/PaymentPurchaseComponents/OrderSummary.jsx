import React from "react";
import { FiShield, FiRefreshCw, FiCheck } from "react-icons/fi";

const OrderSummary = ({ selectedPlan }) => {
    if (!selectedPlan) {
        return (
            <div className="rounded-[40px] border border-slate-100 bg-white p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-[#3B42F2]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <h3 className="text-xl font-black text-[#1E293B]">No Plan Selected</h3>
                <p className="mt-4 text-sm font-semibold text-slate-400 leading-relaxed">
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
        <div className="rounded-[40px] border border-slate-100 bg-white overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.05)]">
            {/* Header */}
            <div className="bg-[#1E293B] px-8 py-6">
                <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest">
                    <svg className="w-5 h-5 text-[#3B42F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Order Summary
                </h3>
            </div>

            <div className="p-10">
                {/* Selected plan */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                    <div>
                        <p className="text-lg font-black text-[#1E293B]">{selectedPlan.name} Plan</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{selectedPlan.duration}</p>
                    </div>
                    {selectedPlan.badge && (
                        <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-blue-50 text-[#3B42F2] border border-blue-100 uppercase tracking-widest">
                            {selectedPlan.badge}
                        </span>
                    )}
                </div>

                {/* Price breakdown */}
                <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-between text-sm font-bold">
                        <span className="text-slate-400">Subtotal</span>
                        <span className="text-[#1E293B]">
                            ৳{originalPrice.toLocaleString()}
                        </span>
                    </div>

                    {discount > 0 && (
                        <div className="flex items-center justify-between text-sm font-bold">
                            <span className="text-emerald-500">Discount</span>
                            <span className="text-emerald-500">
                                -৳{discount.toLocaleString()}
                            </span>
                        </div>
                    )}

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xl font-black text-[#1E293B]">Total</span>
                        <span className="text-3xl font-black text-[#3B42F2]">
                            ৳{selectedPlan.price.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Features included */}
                <div className="mt-8 pt-8 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                        What's Included
                    </p>
                    <ul className="space-y-3">
                        {selectedPlan.features.slice(0, 5).map((feat) => (
                            <li key={feat} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                <FiCheck className="h-4 w-4 text-[#3B42F2] shrink-0 stroke-[3]" />
                                <span>{feat}</span>
                            </li>
                        ))}
                        {selectedPlan.features.length > 5 && (
                            <li className="text-[10px] text-[#3B42F2] font-black uppercase tracking-widest pl-7">
                                +{selectedPlan.features.length - 5} more features
                            </li>
                        )}
                    </ul>
                </div>

                {/* Trust badges */}
                <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <FiShield className="h-4 w-4 text-emerald-500" />
                        SSL Secure
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <FiRefreshCw className="h-4 w-4 text-[#3B42F2]" />
                        Money-Back
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;
