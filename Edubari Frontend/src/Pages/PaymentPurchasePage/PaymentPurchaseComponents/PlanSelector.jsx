import React, { useState, useEffect } from "react";
import { FiCheck, FiLoader } from "react-icons/fi";

const API_URL = import.meta.env.VITE_SERVER || "http://localhost:3000";

const PlanSelector = ({ selectedPlan, onSelectPlan, plans = [] }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <section className="w-full px-4 sm:px-6 md:px-12 pb-12">
      <div className="w-full rounded-[28px] border border-white/20 bg-primary/95 backdrop-blur-sm overflow-hidden">
        <div className="px-6 sm:px-8 md:px-10 lg:px-12 py-12 sm:py-14">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold tracking-wide uppercase mb-4">
              💰 Choose Your Plan
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter text-dark leading-tight">
              Simple, Transparent{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]">
                Pricing
              </span>
            </h2>
            <p className="mt-4 text-sm sm:text-[15px] leading-7 text-dark/70 max-w-2xl mx-auto">
              Pick the plan that fits your institution best. All plans include a
              professional website and dedicated domain.
            </p>
          </div>

          {/* Plan Cards */}
          <div className="mt-12 lg:mt-14 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto items-stretch">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <FiLoader className="w-8 h-8 mx-auto text-tertiary animate-spin mb-3" />
                <p className="text-dark/50 font-medium">Loading plans...</p>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12 px-6 rounded-xl bg-red-50 border border-red-200/60">
                <p className="text-red-600 font-semibold">
                  Failed to load plans
                </p>
                <p className="text-sm text-red-500/70 mt-1">{error}</p>
                <button
                  onClick={fetchPlans}
                  className="mt-4 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all"
                >
                  Retry
                </button>
              </div>
            ) : plans.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-dark/50 font-medium">
                  No active plans available
                </p>
              </div>
            ) : (
              plans.map((plan) => {
                const isSelected = selectedPlan?._id === plan._id;
                return (
                  <button
                    key={plan._id}
                    type="button"
                    onClick={() => onSelectPlan(plan)}
                    className={`group relative rounded-2xl border p-7 text-left transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
                      isSelected
                        ? "border-tertiary/50 bg-white/90 shadow-xl shadow-tertiary/15 ring-2 ring-tertiary/40"
                        : plan.popular
                          ? "border-tertiary/30 bg-white/80 shadow-lg shadow-tertiary/10 ring-1 ring-tertiary/20 hover:shadow-xl hover:shadow-dark/5"
                          : "border-white/40 bg-white/50 hover:bg-white/80 hover:shadow-xl hover:shadow-dark/5"
                    }`}
                  >
                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute top-4 right-4 h-7 w-7 rounded-full bg-linear-to-r from-tertiary to-[#8B5CF6] flex items-center justify-center shadow-md shadow-tertiary/30">
                        <FiCheck className="h-4 w-4 text-white stroke-3" />
                      </div>
                    )}

                    {/* Badge */}
                    {plan.badge && (
                      <div
                        className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold tracking-wide ${
                          plan.popular
                            ? "bg-linear-to-r from-tertiary to-[#8B5CF6] text-white shadow-md shadow-tertiary/30"
                            : "bg-[#F59E0B]/15 text-[#D97706]"
                        }`}
                      >
                        {plan.badge}
                      </div>
                    )}

                    {/* Popular label */}
                    {plan.popular && !isSelected && (
                      <div className="text-[11px] font-bold text-tertiary uppercase tracking-wider mb-2">
                        Most Popular
                      </div>
                    )}

                    {/* Plan Name */}
                    <h3 className="mt-1 text-lg font-bold text-dark">
                      {plan.name}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-dark/45">
                      {plan.duration}
                    </p>

                    {/* Price */}
                    <div className="mt-5 flex items-baseline gap-2">
                      <span
                        className={`text-4xl sm:text-5xl font-black tracking-tight ${
                          isSelected || plan.popular
                            ? "bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]"
                            : "text-dark"
                        }`}
                      >
                        ৳{(plan.price || 0).toLocaleString()}
                      </span>
                      {plan.oldPrice && (
                        <span className="text-base font-semibold text-dark/30 line-through decoration-1">
                          ৳{(plan.oldPrice || 0).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Feature list */}
                    <ul className="mt-6 space-y-2.5">
                      {plan.features.map((feat, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-sm text-dark/70"
                        >
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-tertiary/10 text-tertiary">
                            <FiCheck className="h-3 w-3 stroke-3" />
                          </span>
                          <span className="leading-5 font-medium">{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Select indicator */}
                    <div
                      className={`mt-7 w-full rounded-xl px-6 py-3 text-sm font-bold text-center transition-all duration-300 ${
                        isSelected
                          ? "bg-linear-to-r from-tertiary to-[#8B5CF6] text-white shadow-md shadow-tertiary/30"
                          : plan.popular
                            ? "bg-tertiary/10 text-tertiary group-hover:bg-tertiary group-hover:text-white group-hover:shadow-md group-hover:shadow-tertiary/30"
                            : "bg-white/60 text-dark border border-dark/10 group-hover:bg-white/90 shadow-sm group-hover:shadow-md"
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
      </div>
    </section>
  );
};

export default PlanSelector;
