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
      const activePlans = data.filter((plan) => plan.active);
      setPlans(activePlans || []);
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
    <section id="pricing" className="w-full px-3 sm:px-6 md:px-12 py-4 sm:py-6 lg:py-8 bg-white select-none">
      <div className="w-full rounded-3xl sm:rounded-[32px] border border-white bg-primary-light/85 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.08)] backdrop-blur-md overflow-hidden relative">
        {/* Ambient glows */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-tertiary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#8B5CF6]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="px-4 sm:px-6 md:px-10 lg:px-12 py-8 sm:py-10 relative z-10">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/8 border border-tertiary/15 text-tertiary text-[10px] font-black tracking-wider uppercase mb-3">
              {t("pricing.badge")}
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4.5xl font-black tracking-tight text-dark leading-tight">
              {t("pricing.titleMain")}{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-500 drop-shadow-sm">
                {t("pricing.titleGradient")}
              </span>
            </h2>

            <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-dark/65 max-w-2xl mx-auto font-medium">
              {t("pricing.subtitle")}
            </p>

            {/* Plan Category Tabs (School ERP vs Single Teacher) */}
            <div className="mt-6 inline-flex p-1.5 rounded-2xl bg-slate-200/70 border border-slate-300/60 shadow-inner max-w-md w-full">
              <button
                type="button"
                onClick={() => setActiveTab("school_erp")}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 cursor-pointer border-none ${
                  activeTab === "school_erp"
                    ? "bg-linear-to-r from-tertiary to-[#8B5CF6] text-white shadow-md shadow-tertiary/20"
                    : "text-slate-600 hover:text-slate-900 bg-transparent"
                }`}
              >
                🏫 School ERP Packages
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("single_teacher")}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 cursor-pointer border-none ${
                  activeTab === "single_teacher"
                    ? "bg-linear-to-r from-tertiary to-[#8B5CF6] text-white shadow-md shadow-tertiary/20"
                    : "text-slate-600 hover:text-slate-900 bg-transparent"
                }`}
              >
                👨‍🏫 Single Teacher Plans
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="mt-8 max-w-6xl mx-auto">
            {loading ? (
              <div className="text-center py-16">
                <FiLoader className="w-10 h-10 mx-auto text-tertiary animate-spin mb-4" />
                <p className="text-dark/50 font-bold">{t("pricing.loadingPlans")}</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 px-6 rounded-2xl bg-red-50 border border-red-200 max-w-md mx-auto shadow-sm">
                <p className="text-red-600 font-extrabold">{t("pricing.failedPlans")}</p>
                <p className="text-sm text-red-500/80 mt-1.5 leading-relaxed">{error}</p>
                <button
                  onClick={fetchPlans}
                  className="mt-5 px-6 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-black tracking-wider uppercase shadow-md shadow-red-500/20 transition-all cursor-pointer border-none"
                >
                  {t("pricing.retry")}
                </button>
              </div>
            ) : displayPlans.length === 0 ? (
              <div className="text-center py-16 bg-white/40 border border-white rounded-2xl">
                <p className="text-dark/45 font-bold">
                  {t("pricing.noPlans")}
                </p>
              </div>
            ) : (
              <div className="space-y-10">
                <div>
                  <h3 className="text-center text-xs sm:text-sm font-black text-dark/50 mb-6 uppercase tracking-widest">
                    {activeTab === "school_erp" ? "School, College & Madrasha Flexible ERP Packages" : t("pricing.lmsTitle")}
                  </h3>

                  <div className={`grid grid-cols-1 sm:grid-cols-2 ${activeTab === "school_erp" ? "lg:grid-cols-3 xl:grid-cols-6" : "lg:grid-cols-3 xl:grid-cols-5"} gap-4 items-stretch`}>
                    {displayPlans.map((plan) => {
                      const planId = plan.id || plan._id;
                      const isPopular = plan.popular || plan.plan_tier === 'professional';
                      return (
                        <div
                          key={planId}
                          className={`group relative rounded-2xl border p-4 sm:p-5 text-left transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between ${
                            isPopular
                              ? "border-transparent bg-white shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] ring-2 ring-tertiary/40"
                              : "border-white bg-white/70 backdrop-blur-xs hover:shadow-xl hover:shadow-dark/5 hover:border-tertiary/20"
                          }`}
                        >
                          <div>
                            {/* Badge */}
                            {(plan.badge || isPopular) && (
                              <div
                                className={`absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black tracking-widest uppercase whitespace-nowrap shadow-md ${
                                  isPopular
                                    ? "bg-linear-to-r from-tertiary to-[#8B5CF6] text-white shadow-tertiary/25"
                                    : "bg-[#F59E0B]/15 text-[#D97706] border border-[#F59E0B]/30"
                                }`}
                              >
                                {plan.badge || t("pricing.recommended")}
                              </div>
                            )}

                            {/* Popular label */}
                            {isPopular && (
                              <div className="text-[8px] font-black text-tertiary uppercase tracking-widest mb-1 mt-1">
                                {t("pricing.mostPopular")}
                              </div>
                            )}

                            {/* Plan Name */}
                            <h3 className="mt-1 text-base sm:text-lg font-extrabold text-dark tracking-tight leading-snug">
                              {plan.name}
                            </h3>

                            {/* Duration */}
                            <p className="mt-0.5 text-[9px] font-bold text-dark/40 uppercase tracking-wide">
                              {plan.badge ? plan.badge : `${plan.duration} ${plan.duration_days ? `(${plan.duration_days} Days)` : ""}`}
                            </p>

                            {/* Price */}
                            <div className="mt-3 flex items-baseline gap-1">
                              <span
                                className={`text-xl sm:text-2xl font-black tracking-tight ${
                                  isPopular
                                    ? "bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6] drop-shadow-sm"
                                    : "text-dark"
                                }`}
                              >
                                ৳{(plan.price || 0).toLocaleString()}
                              </span>
                              <span className="text-[10px] font-bold text-dark/50">/ mo</span>
                              {plan.oldPrice && (
                                <span className="text-[11px] font-bold text-dark/30 line-through ml-1">
                                  ৳{(plan.oldPrice || 0).toLocaleString()}
                                </span>
                              )}
                            </div>

                            {/* Features */}
                            {plan.features &&
                              Array.isArray(plan.features) &&
                              plan.features.length > 0 && (
                                <ul className="mt-3 space-y-1.5 p-0 list-none border-t border-dark/5 pt-3">
                                  {plan.features.map((feat, idx) => (
                                    <li
                                      key={idx}
                                      className="flex items-start gap-1.5 text-[11px] text-dark/75"
                                    >
                                      <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold">
                                        ✓
                                      </span>
                                      <span className="leading-3.5 font-bold text-dark/80">
                                        {feat}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                          </div>

                          {/* CTA */}
                          <button
                            type="button"
                            onClick={() => handleGetStarted(planId)}
                            className={`mt-4 w-full block rounded-xl px-3 py-2.5 text-[10px] font-black text-center uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-md ${
                              isPopular
                                ? "bg-linear-to-r from-tertiary to-[#8B5CF6] text-white hover:shadow-lg hover:shadow-tertiary/30 border-none"
                                : "bg-white hover:bg-tertiary/5 text-tertiary border border-tertiary/30 hover:border-tertiary/50 hover:shadow-sm"
                            }`}
                          >
                            {t("pricing.getStarted")}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ERP Poster Details Section (Website Features & Cost/Support Summary) */}
                {activeTab === "school_erp" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                    {/* Free School Website Banner */}
                    <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/50 p-6 sm:p-8 shadow-lg relative overflow-hidden">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black tracking-wider uppercase mb-3 shadow-sm">
                        🎉 FULL FREE WEBSITE
                      </div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        School Website <span className="text-emerald-600">Full Free</span>
                      </h3>
                      <p className="text-xs text-slate-600 font-bold mt-1">
                        Get a Professional Website for Your School Completely Free with EduBari
                      </p>

                      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          "Modern & Responsive Design",
                          "School Info & History",
                          "Notice, Events & Announcements",
                          "Online Admission Info",
                          "Teacher & Staff Details",
                          "Gallery (Photos & Videos)",
                          "Contact Form & Location Map",
                          "Mobile Friendly & SEO Google Ranking (Free)",
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
                            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shrink-0 font-black">✓</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cost & Support Summary Panel */}
                    <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/50 p-6 sm:p-8 shadow-lg relative overflow-hidden">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black tracking-wider uppercase mb-3 shadow-sm">
                        ⚙️ COST & SUPPORT
                      </div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        Everything You Need for a <span className="text-indigo-600">Smarter School</span>
                      </h3>

                      <div className="mt-4 space-y-3">
                        <div className="p-3.5 rounded-2xl bg-white border border-indigo-100 shadow-xs flex items-center justify-between">
                          <div>
                            <p className="text-xs font-black text-slate-900">First Install Cost (One Time Only)</p>
                            <p className="text-[11px] font-bold text-slate-500">Complete setup, configuration & training support</p>
                          </div>
                          <span className="text-lg font-black text-indigo-600 shrink-0">৳ 5,000</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white border border-indigo-100 shadow-xs flex items-center justify-between">
                          <div>
                            <p className="text-xs font-black text-slate-900">Annual Management Cost (Yearly)</p>
                            <p className="text-[11px] font-bold text-slate-500">Domain, High Perf Server, Website, Free SEO & Tech Support</p>
                          </div>
                          <span className="text-lg font-black text-indigo-600 shrink-0">৳ 5,000 / yr</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white border border-indigo-100 shadow-xs flex items-center justify-between">
                          <div>
                            <p className="text-xs font-black text-slate-900">SMS Cost (Notifications)</p>
                            <p className="text-[11px] font-bold text-slate-500">Admission, Notice, Results, Fee Alerts & Attendance</p>
                          </div>
                          <span className="text-lg font-black text-indigo-600 shrink-0">৳ 0.30 / SMS</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Credits Banner Section */}
                {selectedAiPkg && (
                  <div className="max-w-3xl mx-auto rounded-3xl border border-white/60 bg-white/70 backdrop-blur-md p-6 sm:p-8 shadow-xl shadow-dark/3 flex flex-col md:flex-row items-center justify-between gap-6 ring-1 ring-[#8B5CF6]/20">
                    <div className="space-y-4 text-left max-w-md">
                      <div className="text-[9px] font-black text-[#8B5CF6] uppercase tracking-widest flex items-center gap-1.5">
                        <FiCpu className="h-4.5 w-4.5 animate-spin text-[#8B5CF6]" style={{ animationDuration: "4s" }} /> {t("pricing.aiAddon")}
                      </div>
                      <h3 className="text-xl font-extrabold text-dark tracking-tight">
                        {t("pricing.aiTitle")}
                      </h3>
                      <p className="text-xs text-dark/60 font-medium leading-relaxed">
                        {t("pricing.aiSub")}
                      </p>
                      
                      {/* Tier Selector Pills */}
                      {aiPackages.length > 0 && (
                        <div className="pt-2">
                          <label className="block text-[9px] font-black uppercase tracking-widest text-[#8B5CF6] mb-1.5">
                            {t("pricing.selectAiPack")}
                          </label>
                          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100/70 border border-slate-200/50 max-w-xs">
                            {aiPackages.map((pkg) => {
                              const isSelected = selectedAiPkg.id === pkg.id;
                              return (
                                <button
                                  key={pkg.id}
                                  type="button"
                                  onClick={() => setSelectedAiPkg(pkg)}
                                  className={`relative py-1 px-0.5 rounded-lg text-xs font-black tracking-tight transition-all duration-300 cursor-pointer border flex flex-col items-center justify-center ${
                                    isSelected
                                      ? "bg-linear-to-r from-tertiary to-[#8B5CF6] text-white border-transparent shadow-md scale-102"
                                      : "bg-white text-dark/70 hover:text-dark border-gray-200/80 hover:border-tertiary/30"
                                  }`}
                                >
                                  <span className="text-[11px] font-extrabold">{pkg.credits}</span>
                                  <span className={`text-[7px] font-black uppercase tracking-widest ${isSelected ? "text-white/80" : "text-dark/45"}`}>
                                    Credits
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex flex-col items-center justify-center p-6 bg-linear-to-br from-[#8B5CF6]/5 to-[#7c3aed]/5 rounded-2xl border border-[#8B5CF6]/15 min-w-[240px]">
                      <div className="flex items-baseline gap-1.5 mb-4">
                        <span className="text-3.5xl sm:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6] drop-shadow-sm">
                          ৳{(selectedAiPkg.price || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-black text-dark/40 uppercase tracking-wider">
                          / {selectedAiPkg.validityDays} Days
                        </span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={handleAiPlanPurchase}
                        className="w-full py-3.5 px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer bg-linear-to-r from-[#8B5CF6] to-[#7c3aed] text-white shadow-md shadow-[#8B5CF6]/20 hover:shadow-lg border-none"
                      >
                        {t("pricing.buyAiCredits")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* View All Plans */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push("/payment-purchase")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-dark/15 text-xs font-bold text-dark hover:bg-dark/5 hover:border-dark/25 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
            >
              {t("pricing.exploreAll")}
              <FiArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
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
