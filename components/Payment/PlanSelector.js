"use client";

import React, { useState } from "react";
import { FiCheck, FiLoader } from "react-icons/fi";

const PlanSelector = ({ selectedPlan, onSelectPlan, plans = [], loading = false, error = null, onRetry }) => {
  const [activeTab, setActiveTab] = useState("school_erp");

  const erpPlans = plans.filter((p) => p.plan_type === "school_erp" || p.planType === "school_erp");
  const singleTeacherPlans = plans.filter((p) => p.plan_type === "single_teacher" || p.planType === "single_teacher" || (!p.plan_type && !p.planType));

  const displayPlans = activeTab === "school_erp" 
    ? (erpPlans.length > 0 ? erpPlans : plans) 
    : (singleTeacherPlans.length > 0 ? singleTeacherPlans : plans);

  return (
    <section className="w-full px-3 sm:px-6 md:px-12 pb-12 select-none">
      <div className="w-full rounded-3xl sm:rounded-[28px] border border-white/20 bg-primary/95 backdrop-blur-sm overflow-hidden">
        <div className="px-4 sm:px-8 md:px-10 lg:px-12 py-8 sm:py-14">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold tracking-wide uppercase mb-3 border border-slate-200">
              Choose Your Plan
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter text-slate-900 leading-tight">
              Simple, Transparent{" "}
              <span className="text-blue-600">
                Pricing
              </span>
            </h2>
            <p className="mt-2 text-xs sm:text-sm leading-6 text-slate-600 max-w-2xl mx-auto font-medium">
              Pick the plan that fits your institution best. All plans include a
              professional website and dedicated domain.
            </p>

            {/* Category Tabs */}
            <div className="mt-6 inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200 max-w-md w-full">
              <button
                type="button"
                onClick={() => setActiveTab("school_erp")}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer border-none ${
                  activeTab === "school_erp"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 bg-transparent"
                }`}
              >
                School ERP Packages
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("single_teacher")}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer border-none ${
                  activeTab === "single_teacher"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 bg-transparent"
                }`}
              >
                Single Teacher Plans
              </button>
            </div>
          </div>

          {/* Plan Cards */}
          <div className={`mt-8 lg:mt-12 grid grid-cols-1 sm:grid-cols-2 ${activeTab === "school_erp" ? "lg:grid-cols-3 xl:grid-cols-6" : "lg:grid-cols-3 xl:grid-cols-5"} gap-4 max-w-7xl mx-auto items-stretch`}>
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
                  type="button"
                  onClick={onRetry}
                  className="mt-4 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : displayPlans.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-dark/50 font-medium">
                  No active plans available
                </p>
              </div>
            ) : (
              displayPlans.map((plan) => {
                const planId = plan.id || plan._id;
                const isSelected = (selectedPlan?.id || selectedPlan?._id) === planId;
                const price = plan.price || 0;
                const oldPrice = plan.oldPrice || plan.old_price;
                return (
                  <button
                    key={planId}
                    type="button"
                    onClick={() => onSelectPlan(plan)}
                    className={`group relative rounded-2xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-tertiary/50 bg-white shadow-xl shadow-tertiary/15 ring-2 ring-tertiary/40"
                        : plan.popular
                          ? "border-tertiary/30 bg-white/90 shadow-lg shadow-tertiary/10 ring-1 ring-tertiary/20 hover:shadow-xl hover:shadow-dark/5"
                          : "border-white/60 bg-white/70 hover:bg-white hover:shadow-xl hover:shadow-dark/5"
                    }`}
                  >
                    <div>
                      {/* Selected indicator */}
                      {isSelected && (
                        <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center shadow-sm">
                          <FiCheck className="h-3.5 w-3.5 text-white stroke-3" />
                        </div>
                      )}

                      {/* Badge */}
                      {plan.badge && (
                        <div
                          className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] font-black tracking-wide whitespace-nowrap uppercase ${
                            plan.popular
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-slate-200 text-slate-800 border border-slate-300"
                          }`}
                        >
                          {plan.badge}
                        </div>
                      )}

                      {/* Popular label */}
                      {plan.popular && !isSelected && (
                        <div className="text-[9px] font-black text-blue-600 uppercase tracking-wider mb-1 mt-1">
                          Most Popular
                        </div>
                      )}

                      {/* Plan Name */}
                      <h3 className="mt-1 text-base font-extrabold text-slate-900">
                        {plan.name}
                      </h3>
                      <p className="mt-0.5 text-[10px] font-bold text-slate-500 uppercase">
                        {plan.badge ? plan.badge : `${plan.duration} ${plan.duration_days ? `(${plan.duration_days} Days)` : ""}`}
                      </p>

                      {/* Price */}
                      <div className="mt-4 flex items-baseline gap-1">
                        <span
                          className={`text-2xl sm:text-3xl font-black tracking-tight ${
                            isSelected || plan.popular
                              ? "text-blue-600"
                              : "text-slate-900"
                          }`}
                        >
                          ৳{price.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">/ mo</span>
                        {oldPrice && (
                          <span className="text-xs font-semibold text-slate-400 line-through">
                            ৳{typeof oldPrice === "string" ? oldPrice.replace(/[৳,]/g, "") : oldPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Feature list */}
                      {plan.features && Array.isArray(plan.features) && (
                        <ul className="mt-4 space-y-1.5 border-t border-slate-200/80 pt-3">
                          {plan.features.map((feat, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-1.5 text-xs text-slate-700"
                            >
                              <FiCheck className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                              <span className="leading-4 font-semibold text-slate-800">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Select indicator */}
                    <div
                      className={`mt-5 w-full rounded-xl px-4 py-2.5 text-xs font-bold text-center transition-all duration-200 ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-sm"
                          : plan.popular
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-700 border border-slate-200 group-hover:bg-slate-200"
                      }`}
                    >
                      {isSelected ? "Selected" : "Select Plan"}
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

