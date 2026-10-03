"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiArrowRight, FiLoader, FiCheck, FiX, FiShield, FiCpu } from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";

const Pricing = () => {
  const { t } = useLanguage();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // AI Packages State
  const [aiPackages, setAiPackages] = useState([]);
  const [selectedAiPkg, setSelectedAiPkg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputDomain, setInputDomain] = useState("");

  // Clients search/sorting state
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    fetchPlans();
    fetchAiPackages();
    fetchClients();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlDomain = params.get("domain");
      if (urlDomain) {
        setInputDomain(urlDomain);
        setSelectedDomain(urlDomain);
      }
    }
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/public/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/plans");
      if (!response.ok) throw new Error("Failed to fetch plans");
      const data = await response.json();
      const activePlans = (data || []).filter((plan) => plan.active !== false && plan.is_active !== false);
      setPlans(activePlans.length > 0 ? activePlans : data || []);
    } catch (err) {
      console.error("Error fetching plans:", err);
      setError(err.message);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiPackages = async () => {
    try {
      const res = await fetch("/api/ai-packages");
      if (res.ok) {
        const data = await res.json();
        const activePkgs = data.filter((p) => p.isActive);
        setAiPackages(activePkgs);
        // Default to highlighted package (Pro) or first active
        const highlighted = activePkgs.find((p) => p.highlight) || activePkgs[0];
        setSelectedAiPkg(highlighted);
      }
    } catch (err) {
      console.error("Error fetching AI packages:", err);
    }
  };

  const handleGetStarted = (planId) => {
    router.push(`/payment-purchase?plan=${planId}`);
  };

  const handleAiPlanPurchase = () => {
    if (selectedDomain) {
      const redirectUrl = selectedDomain.includes("localhost")
        ? `http://${selectedDomain}/admin/exam-management`
        : `https://${selectedDomain}/admin/exam-management`;
      router.push(`/checkout?domain=${selectedDomain}&package_id=${selectedAiPkg.id}&redirect_url=${encodeURIComponent(redirectUrl)}`);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleDomainInputChange = (val) => {
    setInputDomain(val);
    setSelectedDomain(""); // clear selected domain if they type again

    if (!val.trim()) {
      setFilteredClients([]);
      return;
    }

    const query = val.toLowerCase();
    const matches = clients.filter(c => 
      (c.client_name || "").toLowerCase().includes(query) || 
      (c.domain || "").toLowerCase().includes(query)
    );
    setFilteredClients(matches.slice(0, 5)); // limit to top 5 results for clean view
  };

  const handleSelectClient = (client) => {
    setInputDomain(client.domain);
    setSelectedDomain(client.domain);
    setFilteredClients([]);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!selectedDomain) {
      alert("Please search and select your registered domain from the list.");
      return;
    }

    setIsModalOpen(false);
    
    // Redirect to checkout with the verified domain and package details
    const redirectUrl = `https://${selectedDomain}/admin/exam-management`;
    router.push(`/checkout?domain=${selectedDomain}&package_id=${selectedAiPkg.id}&redirect_url=${encodeURIComponent(redirectUrl)}`);
  };

  const [activeTab, setActiveTab] = useState("school_erp"); // "school_erp" or "single_teacher"

  const erpPlans = plans.filter((p) => p.plan_type === "school_erp" || p.planType === "school_erp");
  const singleTeacherPlans = plans.filter((p) => p.plan_type === "single_teacher" || p.planType === "single_teacher" || (!p.plan_type && !p.planType));

  const displayPlans = activeTab === "school_erp" 
    ? (erpPlans.length > 0 ? erpPlans : plans) 
    : (singleTeacherPlans.length > 0 ? singleTeacherPlans : plans);

  return (
    <section id="pricing" className="w-full px-3 sm:px-6 md:px-12 py-8 sm:py-12 lg:py-16 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/80 select-none relative overflow-hidden">
      {/* Background Decorative Ambient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-blue-400/10 via-indigo-500/10 to-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-sky-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full rounded-3xl sm:rounded-[36px] border border-white/80 bg-white/70 shadow-[0_25px_60px_-15px_rgba(37,99,235,0.08)] backdrop-blur-xl overflow-hidden relative">
        {/* Subtle top border highlight */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        <div className="px-4 sm:px-8 md:px-12 lg:px-16 py-10 sm:py-14 lg:py-16 relative z-10">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-tertiary text-xs font-black tracking-widest uppercase shadow-xs">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
              {t("pricing.badge") || "SIMPLE & TRANSPARENT PRICING"}
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              {t("pricing.titleMain") || "Choose the Perfect Plan for"}{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 drop-shadow-xs">
                {t("pricing.titleGradient") || "Your Institution"}
              </span>
            </h2>

            <p className="text-sm sm:text-base leading-relaxed text-slate-600 max-w-2xl mx-auto font-medium">
              {t("pricing.subtitle") || "No hidden fees, no extra charges. Transparent pricing plans tailored to scale with your institution."}
            </p>

            {/* Plan Category Tabs (School ERP vs Single Teacher) */}
            <div className="pt-4 flex justify-center">
              <div className="inline-flex p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/80 shadow-inner max-w-md w-full">
                <button
                  type="button"
                  onClick={() => setActiveTab("school_erp")}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 cursor-pointer border-none flex items-center justify-center gap-2 ${
                    activeTab === "school_erp"
                      ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 scale-[1.02]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60 bg-transparent"
                  }`}
                >
                  🏫 School ERP Packages
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("single_teacher")}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 cursor-pointer border-none flex items-center justify-center gap-2 ${
                    activeTab === "single_teacher"
                      ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 scale-[1.02]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60 bg-transparent"
                  }`}
                >
                  👨‍🏫 Single Teacher Plans
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="mt-10 lg:mt-14 max-w-7xl mx-auto">
            {loading ? (
              <div className="text-center py-20 bg-white/40 rounded-3xl border border-slate-100 backdrop-blur-md">
                <FiLoader className="w-12 h-12 mx-auto text-tertiary animate-spin mb-4" />
                <p className="text-slate-600 font-bold">{t("pricing.loadingPlans") || "Loading pricing plans..."}</p>
              </div>
            ) : error ? (
              <div className="text-center py-14 px-8 rounded-3xl bg-red-50/80 border border-red-200/80 max-w-md mx-auto shadow-md">
                <p className="text-red-700 font-extrabold text-lg">{t("pricing.failedPlans") || "Failed to load plans"}</p>
                <p className="text-xs text-red-600/80 mt-2 leading-relaxed">{error}</p>
                <button
                  onClick={fetchPlans}
                  className="mt-6 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black tracking-wider uppercase shadow-lg shadow-red-500/25 transition-all cursor-pointer border-none"
                >
                  {t("pricing.retry") || "Retry"}
                </button>
              </div>
            ) : displayPlans.length === 0 ? (
              <div className="text-center py-16 bg-white/60 border border-slate-200/60 rounded-3xl shadow-sm">
                <p className="text-slate-500 font-bold">
                  {t("pricing.noPlans") || "No active plans found for this category."}
                </p>
              </div>
            ) : (
              <div className="space-y-12">
                <div>
                  <div className="flex items-center justify-center gap-3 mb-8">
                    <span className="h-px w-12 bg-gradient-to-r from-transparent to-slate-300" />
                    <h3 className="text-center text-xs sm:text-sm font-black text-slate-500 uppercase tracking-widest">
                      {activeTab === "school_erp" ? "School, College & Madrasha Flexible ERP Packages" : t("pricing.lmsTitle") || "Individual Teacher & Coaching Plans"}
                    </h3>
                    <span className="h-px w-12 bg-gradient-to-l from-transparent to-slate-300" />
                  </div>

                  <div className={`grid grid-cols-1 md:grid-cols-2 ${activeTab === "school_erp" ? "lg:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-5"} gap-6 sm:gap-8 items-stretch`}>
                    {displayPlans.map((plan) => {
                      const planId = plan.id || plan._id;
                      const isPopular = plan.popular || plan.plan_tier === 'professional' || plan.plan_tier === 'enterprise';
                      return (
                        <div
                          key={planId}
                          className={`group relative rounded-3xl border p-6 sm:p-7 text-left transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between ${
                            isPopular
                              ? "border-transparent bg-gradient-to-b from-white via-blue-50/40 to-indigo-50/20 shadow-[0_25px_50px_-12px_rgba(59,130,246,0.22)] ring-2 ring-blue-500/80"
                              : "border-slate-200/80 bg-white/90 backdrop-blur-md hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-blue-300"
                          }`}
                        >
                          <div>
                            {/* Badge */}
                            {(plan.badge || isPopular) && (
                              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase whitespace-nowrap shadow-md flex items-center gap-1.5 ${
                                  isPopular
                                    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-blue-500/30"
                                    : "bg-amber-100 text-amber-800 border border-amber-300/60"
                                }`}>
                                  {isPopular && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                                  {plan.badge || t("pricing.recommended") || "MOST POPULAR"}
                                </span>
                              </div>
                            )}

                            {/* Plan Name */}
                            <div className="mt-2">
                              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug group-hover:text-blue-600 transition-colors">
                                {plan.name || plan.plan_name}
                              </h3>

                              {/* Duration / Subtitle */}
                              <p className="mt-1 text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
                                {plan.duration ? plan.duration : `${plan.duration_days ? `${plan.duration_days} Days Validity` : "Monthly Subscription"}`}
                              </p>
                            </div>

                            {/* Price Section */}
                            <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-100 flex items-baseline justify-between">
                              <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Price</span>
                                <div className="flex items-baseline gap-1">
                                  <span
                                    className={`text-3xl sm:text-4xl font-black tracking-tight ${
                                      isPopular
                                        ? "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 drop-shadow-xs"
                                        : "text-slate-900"
                                    }`}
                                  >
                                    ৳{(plan.price || 0).toLocaleString()}
                                  </span>
                                  <span className="text-xs font-bold text-slate-500">
                                    {plan.duration_days >= 300 ? "/ year" : "/ month"}
                                  </span>
                                </div>
                              </div>
                              {plan.old_price && (
                                <div className="text-right">
                                  <span className="text-xs font-bold text-slate-400 line-through block">
                                    ৳{(plan.old_price || 0).toLocaleString()}
                                  </span>
                                  <span className="text-[9px] font-black text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                                    SAVE {Math.round(((plan.old_price - plan.price) / plan.old_price) * 100)}%
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Features list */}
                            {plan.features &&
                              Array.isArray(typeof plan.features === "string" ? JSON.parse(plan.features) : plan.features) && (
                                <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Included Features:</p>
                                  <ul className="space-y-2.5 p-0 list-none">
                                    {(typeof plan.features === "string" ? JSON.parse(plan.features) : plan.features).map((feat, idx) => (
                                      <li
                                        key={idx}
                                        className="flex items-start gap-2.5 text-xs text-slate-700 font-semibold leading-tight"
                                      >
                                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-[10px] shadow-xs">
                                          ✓
                                        </span>
                                        <span className="font-semibold text-slate-800">
                                          {feat}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                          </div>

                          {/* CTA Button */}
                          <div className="mt-6 pt-4 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => handleGetStarted(planId)}
                              className={`w-full flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-md ${
                                isPopular
                                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:shadow-xl hover:shadow-indigo-500/30 border-none hover:-translate-y-0.5 active:translate-y-0"
                                  : "bg-slate-900 hover:bg-blue-600 text-white hover:shadow-lg border-none hover:-translate-y-0.5 active:translate-y-0"
                              }`}
                            >
                              <span>{t("pricing.getStarted") || "Select Package"}</span>
                              <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ERP Poster Details Section (Website Features & Cost/Support Summary) */}
                {activeTab === "school_erp" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
                    {/* Free School Website Banner */}
                    <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-500/10 via-white to-teal-500/10 p-7 sm:p-9 shadow-xl relative overflow-hidden group hover:border-emerald-300 transition-all">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black tracking-widest uppercase mb-4 shadow-md">
                        🎉 FULL FREE WEBSITE
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                        School Website <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">Completely Free</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 font-bold mt-1.5">
                        Get a high-end, responsive professional website for your school completely free with EduBari ERP connection.
                      </p>

                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {[
                          "Modern & Responsive Design",
                          "Notice, Events & Announcements",
                          "Online Admission Portal",
                          "Teacher & Staff Directory",
                          "Photo & Video Gallery",
                          "Contact Form & Map Location",
                          "Mobile Friendly & Auto SEO",
                          "Instant Sync with School ERP",
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2.5 text-xs font-extrabold text-slate-800 bg-white/80 backdrop-blur-xs p-2.5 rounded-xl border border-emerald-100 shadow-xs">
                            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shrink-0 font-black shadow-xs">✓</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cost & Support Summary Panel */}
                    <div className="rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-indigo-500/10 via-white to-purple-500/10 p-7 sm:p-9 shadow-xl relative overflow-hidden group hover:border-indigo-300 transition-all">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black tracking-widest uppercase mb-4 shadow-md">
                        ⚡ TRANSPARENT COSTS
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                        Everything Needed for a <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Smart Institution</span>
                      </h3>

                      <div className="mt-6 space-y-3.5">
                        <div className="p-4 rounded-2xl bg-white/90 border border-indigo-100 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
                          <div>
                            <p className="text-xs font-black text-slate-900">First Install & Setup Cost (One Time)</p>
                            <p className="text-[11px] font-bold text-slate-500 mt-0.5">Complete setup, data import, configuration & staff training</p>
                          </div>
                          <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 shrink-0 ml-3">৳ 5,000</span>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/90 border border-indigo-100 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
                          <div>
                            <p className="text-xs font-black text-slate-900">Annual Management & Server (Yearly)</p>
                            <p className="text-[11px] font-bold text-slate-500 mt-0.5">Custom Domain, Cloud Server, Free SSL, High Speed CDN & 24/7 Tech Support</p>
                          </div>
                          <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 shrink-0 ml-3">৳ 5,000 / yr</span>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/90 border border-indigo-100 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
                          <div>
                            <p className="text-xs font-black text-slate-900">SMS Gateway Charges</p>
                            <p className="text-[11px] font-bold text-slate-500 mt-0.5">Instant Attendance, Exam Result, Fee Alerts & Notices via Non-Masking SMS</p>
                          </div>
                          <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 shrink-0 ml-3">৳ 0.30 / SMS</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Credits Banner Section */}
                {selectedAiPkg && (
                  <div className="max-w-4xl mx-auto rounded-3xl border border-purple-200/80 bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 p-7 sm:p-9 shadow-2xl text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="space-y-4 text-left max-w-lg z-10">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-[10px] font-black uppercase tracking-widest">
                        <FiCpu className="h-4 w-4 animate-spin text-purple-300" style={{ animationDuration: "6s" }} /> {t("pricing.aiAddon") || "AI POWERED ADDON"}
                      </div>
                      <h3 className="text-2xl font-black tracking-tight text-white">
                        {t("pricing.aiTitle") || "Need Extra AI Credits for Question & Presentation Generator?"}
                      </h3>
                      <p className="text-xs sm:text-sm text-purple-200/80 font-medium leading-relaxed">
                        {t("pricing.aiSub") || "Supercharge your classes with instant AI question paper creation, slides & automatic grading."}
                      </p>
                      
                      {/* Tier Selector Pills */}
                      {aiPackages.length > 0 && (
                        <div className="pt-2">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-purple-300 mb-2">
                            {t("pricing.selectAiPack") || "SELECT AI CREDIT PACKAGE"}
                          </label>
                          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 max-w-xs">
                            {aiPackages.map((pkg) => {
                              const isSelected = selectedAiPkg.id === pkg.id;
                              return (
                                <button
                                  key={pkg.id}
                                  type="button"
                                  onClick={() => setSelectedAiPkg(pkg)}
                                  className={`relative py-2 px-2 rounded-xl text-xs font-black tracking-tight transition-all duration-300 cursor-pointer border flex flex-col items-center justify-center ${
                                    isSelected
                                      ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-transparent shadow-lg scale-105"
                                      : "bg-white/5 text-purple-200 hover:bg-white/10 border-transparent"
                                  }`}
                                >
                                  <span className="text-sm font-black">{pkg.credits}</span>
                                  <span className="text-[8px] font-black uppercase tracking-widest text-purple-200/70">
                                    Credits
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex flex-col items-center justify-center p-7 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 min-w-[260px] z-10 w-full md:w-auto">
                      <div className="flex items-baseline gap-1.5 mb-5">
                        <span className="text-4xl font-black tracking-tight text-white drop-shadow-md">
                          ৳{(selectedAiPkg.price || 0).toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-purple-200/70 uppercase">
                          / {selectedAiPkg.validityDays || selectedAiPkg.validity_days || 30} Days
                        </span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={handleAiPlanPurchase}
                        className="w-full py-4 px-8 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-100 cursor-pointer bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white shadow-xl shadow-purple-500/30 border-none"
                      >
                        {t("pricing.buyAiCredits") || "Buy AI Credits Now"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* View All Plans */}
          <div className="mt-12 text-center">
            <button
              onClick={() => router.push("/payment-purchase")}
              className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-slate-900 hover:bg-blue-600 text-white text-xs font-black uppercase tracking-wider shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer border-none"
            >
              <span>{t("pricing.exploreAll") || "Explore All Plans & Custom Quotes"}</span>
              <FiArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Domain Assignment Popup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-dark/50 backdrop-blur-md flex items-center justify-center z-[150] animate-fadeUp">
          <div className="bg-white rounded-3xl border border-dark/5 w-full max-w-md overflow-visible shadow-2xl p-7 relative mx-4 animate-[scaleIn_0.3s_cubic-bezier(0.25,1,0.5,1)]">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setInputDomain("");
                setSelectedDomain("");
                setFilteredClients([]);
              }}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-dark/5 hover:bg-dark/10 text-dark/40 hover:text-dark flex items-center justify-center transition-all cursor-pointer border-none"
            >
              <FiX className="h-4 w-4" />
            </button>

            <div className="text-center mb-6">
              <div className="h-12 w-12 rounded-2xl bg-tertiary/8 text-tertiary flex items-center justify-center mx-auto mb-4.5 shadow-inner">
                <FiShield className="h-6 w-6 animate-pulse" />
              </div>
              <h3 className="text-lg font-black text-dark tracking-tight">{t("pricing.aiModalTitle")}</h3>
              <p className="text-xs text-dark/50 mt-2 leading-relaxed max-w-xs mx-auto">{t("pricing.aiModalSub")}</p>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-5 relative">
              <div className="relative">
                <label className="block text-[10px] font-black uppercase tracking-widest text-dark/40 mb-1.5">{t("pricing.searchDomainLabel")}</label>
                <input
                  type="text"
                  required
                  placeholder={t("pricing.searchDomainPlaceholder")}
                  value={inputDomain}
                  onChange={(e) => handleDomainInputChange(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  className={`w-full rounded-xl border px-4 py-3 text-sm font-extrabold outline-none text-center bg-dark/[0.01] transition-all duration-300 ${
                    selectedDomain 
                      ? "border-green-400 bg-green-50/20 text-green-700 font-extrabold" 
                      : "border-dark/10 focus:border-[#8B5CF6]/50 focus:ring-4 focus:ring-[#8B5CF6]/5 text-dark"
                  }`}
                />

                {/* Autocomplete Dropdown Search Results */}
                {searchFocused && filteredClients.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-dark/10 shadow-2xl py-2.5 z-[200] max-h-[220px] overflow-y-auto animate-fadeUp">
                    <p className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-dark/30 border-b border-dark/5 mb-1.5">
                      {t("pricing.matchedDomains")}
                    </p>
                    {filteredClients.map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => handleSelectClient(client)}
                        className="w-full px-4 py-3 text-left hover:bg-dark/[0.02] flex items-center justify-between transition-colors border-none bg-transparent cursor-pointer"
                      >
                        <div>
                          <p className="text-xs font-black text-dark">{client.client_name}</p>
                          <code className="text-[10px] font-mono font-bold text-tertiary mt-0.5 block">{client.domain}</code>
                        </div>
                        <span className="text-[10px] font-black text-tertiary bg-tertiary/8 px-2.5 py-1 rounded-lg uppercase tracking-wide">
                          {t("pricing.select")}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Status Badge */}
                {selectedDomain && (
                  <div className="mt-3 px-4 py-3 rounded-xl bg-green-500/8 border border-green-200/50 text-green-700 text-xs font-bold text-center flex items-center justify-center gap-2 animate-fadeUp">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
                    {t("pricing.verifiedSelected")} <code className="font-mono bg-white px-2 py-0.5 rounded border border-green-200 text-xs">{selectedDomain}</code>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!selectedDomain}
                className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md border-none ${
                  selectedDomain 
                    ? "bg-linear-to-r from-tertiary to-[#8B5CF6] text-white hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer" 
                    : "bg-dark/5 text-dark/25 cursor-not-allowed"
                }`}
              >
                {selectedDomain ? t("pricing.proceedCheckout") : t("pricing.pleaseSelectDomain")}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Pricing;
