import React, { useState, useEffect } from "react";
import { FiCheck, FiLoader } from "react-icons/fi";

const API_URL = import.meta.env.VITE_SERVER || "http://localhost:3000";

const PlanSelector = ({ selectedPlan, onSelectPlan, plans = [] }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <section className="w-full px-6 sm:px-12 lg:px-24 pb-12 sm:pb-20 bg-transparent">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black tracking-widest uppercase mb-4 shadow-sm border border-blue-100/50">
            💰 CHOOSE YOUR PLAN
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#1E293B] leading-tight mb-3">
            Simple, Transparent <span className="text-[#3B42F2]">Pricing</span>
          </h2>
          <p className="text-[#64748B] font-medium text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Pick the plan that fits your institution best. All plans include a
            professional website and dedicated domain.
          </p>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-20 bg-white rounded-[40px] border border-slate-50 shadow-sm">
              <FiLoader className="w-8 h-8 animate-spin text-[#3B42F2] mr-3" />
              <span className="text-slate-500 font-bold">Loading plans...</span>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-16 rounded-[40px] bg-red-50/50 border border-red-100">
              <p className="text-[#1E293B] font-black text-xl mb-2">Oops! Connection error</p>
              <p className="text-red-500 font-medium">{error}</p>
              <button
                onClick={fetchPlans}
                className="mt-6 px-8 py-3 rounded-xl bg-red-500 text-white text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-all"
              >
                Retry
              </button>
            </div>
          ) : plans.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-[40px] border border-slate-50">
              <p className="text-slate-400 font-bold text-lg">No active plans available right now.</p>
            </div>
          ) : (
            plans.map((plan) => {
              const isSelected = selectedPlan?._id === plan._id;
              return (
                <button
                  key={plan._id}
                  type="button"
                  onClick={() => onSelectPlan(plan)}
                  className={`group relative rounded-[40px] border-2 p-10 text-left transition-all duration-700 hover:-translate-y-4 cursor-pointer ${isSelected
                      ? "border-[#3B42F2] bg-white shadow-[0_30px_70px_rgba(59,66,242,0.15)] ring-4 ring-[#3B42F2]/5"
                      : plan.popular
                        ? "border-[#3B42F2]/30 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(59,66,242,0.1)] hover:border-[#3B42F2]/50"
                        : "border-slate-100 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(59,66,242,0.1)] hover:border-[#3B42F2]/20"
                    }`}
                >
                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute top-6 right-6 h-8 w-8 rounded-full bg-[#3B42F2] flex items-center justify-center shadow-lg shadow-[#3B42F2]/20">
                      <FiCheck className="h-4 w-4 text-white stroke-[3]" />
                    </div>
                  )}

                  {/* Badge */}
                  {plan.badge && (
                    <div
                      className={`absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${plan.popular
                          ? "bg-[#3B42F2] text-white shadow-lg shadow-[#3B42F2]/20"
                          : "bg-amber-100 text-amber-600 border border-amber-200"
                        }`}
                    >
                      {plan.badge}
                    </div>
                  )}

                  {/* Popular label */}
                  {plan.popular && !isSelected && (
                    <div className="text-[10px] font-black text-[#3B42F2] uppercase tracking-widest mb-4">
                      Most Popular
                    </div>
                  )}

                  {/* Plan Name */}
                  <h3 className="text-2xl font-black text-[#1E293B] mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                    {plan.duration}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-8">
                    <span className="text-5xl font-black text-[#1E293B] tracking-tight">
                      ৳{(plan.price || 0).toLocaleString()}
                    </span>
                    {plan.oldPrice && (
                      <span className="text-lg font-bold text-slate-300 line-through">
                        ৳{(plan.oldPrice || 0).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Feature list */}
                  <ul className="space-y-4 mb-10">
                    {plan.features.map((feat, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-sm font-bold text-slate-600"
                      >
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#3B42F2]">
                          <FiCheck className="h-3 w-3 stroke-[3]" />
                        </div>
                        <span className="leading-tight">{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Select Button */}
                  <div
                    className={`w-full rounded-[20px] py-5 text-[10px] font-black uppercase tracking-widest text-center transition-all duration-300 ${isSelected
                        ? "bg-[#3B42F2] text-white shadow-xl shadow-[#3B42F2]/20"
                        : plan.popular
                          ? "bg-slate-50 text-[#3B42F2] group-hover:bg-[#3B42F2] group-hover:text-white group-hover:shadow-xl group-hover:shadow-[#3B42F2]/20"
                          : "bg-slate-50 text-slate-400 group-hover:bg-[#3B42F2] group-hover:text-white group-hover:shadow-xl group-hover:shadow-[#3B42F2]/20"
                      }`}
                  >
                    {isSelected ? "✓ Selected" : "Select Plan"}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default PlanSelector;
