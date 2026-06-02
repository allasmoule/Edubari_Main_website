"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiArrowRight, FiLoader, FiCheck, FiX, FiShield, FiCpu } from "react-icons/fi";

const Pricing = () => {
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
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/billing/clients");
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
    setIsModalOpen(true);
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

  return (
    <section className="w-full px-4 sm:px-6 md:px-12 py-4 sm:py-6 lg:py-8 bg-white select-none">
      <div className="w-full rounded-[32px] border border-white bg-primary-light/85 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.08)] backdrop-blur-md overflow-hidden relative">
        {/* Ambient glows */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-tertiary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#8B5CF6]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="px-4 sm:px-6 md:px-10 lg:px-12 py-8 sm:py-10 relative z-10">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/8 border border-tertiary/15 text-tertiary text-[10px] font-black tracking-wider uppercase mb-3">
              💰 Available Plans
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4.5xl font-black tracking-tight text-dark leading-tight">
              Simple, Transparent{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary via-[#8B5CF6] to-[#7c3aed] drop-shadow-sm">
                Pricing
              </span>
            </h2>

            <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-dark/65 max-w-2xl mx-auto font-medium">
              Choose the plan that fits your institution and power up with AI capabilities.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="mt-8 max-w-5xl mx-auto">
            {loading ? (
              <div className="text-center py-16">
                <FiLoader className="w-10 h-10 mx-auto text-tertiary animate-spin mb-4" />
                <p className="text-dark/50 font-bold">Loading plans...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 px-6 rounded-2xl bg-red-50 border border-red-200 max-w-md mx-auto shadow-sm">
                <p className="text-red-600 font-extrabold">Failed to load plans</p>
                <p className="text-sm text-red-500/80 mt-1.5 leading-relaxed">{error}</p>
                <button
                  onClick={fetchPlans}
                  className="mt-5 px-6 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-black tracking-wider uppercase shadow-md shadow-red-500/20 transition-all cursor-pointer border-none"
                >
                  Retry
                </button>
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-16 bg-white/40 border border-white rounded-2xl">
                <p className="text-dark/45 font-bold">
                  No active plans available right now.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {/* Renders first 2 standard plans */}
                {plans.slice(0, 2).map((plan) => {
                  const planId = plan.id || plan._id;
                  return (
                    <div
                      key={planId}
                      className={`group relative rounded-2xl border p-6 text-left transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between ${
                        plan.popular
                          ? "border-transparent bg-white shadow-[0_20px_40px_-15px_rgba(37,99,235,0.12)] ring-2 ring-tertiary/40"
                          : "border-white bg-white/70 backdrop-blur-xs hover:shadow-xl hover:shadow-dark/5 hover:border-tertiary/20"
                      }`}
                    >
                      <div>
                        {/* Badge */}
                        {plan.badge && (
                          <div
                            className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase shadow-md ${
                              plan.popular
                                ? "bg-linear-to-r from-tertiary to-[#8B5CF6] text-white shadow-tertiary/25"
                                : "bg-[#F59E0B]/10 text-[#D97706] border border-[#F59E0B]/20"
                            }`}
                          >
                            {plan.badge}
                          </div>
                        )}

                        {/* Popular label */}
                        {plan.popular && (
                          <div className="text-[9px] font-black text-tertiary uppercase tracking-widest mb-1.5">
                            Most Popular
                          </div>
                        )}

                        {/* Plan Name */}
                        <h3 className="mt-1 text-xl font-extrabold text-dark tracking-tight">
                          {plan.name}
                        </h3>

                        {/* Duration */}
                        <p className="mt-1 text-xs font-bold text-dark/40 uppercase tracking-wide">
                          {plan.duration} {plan.duration_days ? `(${plan.duration_days} Days)` : ""}
                        </p>

                        {/* Price */}
                        <div className="mt-4 flex items-baseline gap-1.5">
                          <span
                            className={`text-3.5xl sm:text-4xl font-black tracking-tight ${
                              plan.popular
                                ? "bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6] drop-shadow-sm"
                                : "text-dark"
                            }`}
                          >
                            ৳{(plan.price || 0).toLocaleString()}
                          </span>
                          {plan.oldPrice && (
                            <span className="text-sm font-bold text-dark/30 line-through decoration-1 decoration-dark/20">
                              ৳{(plan.oldPrice || 0).toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Features */}
                        {plan.features &&
                          Array.isArray(plan.features) &&
                          plan.features.length > 0 && (
                            <ul className="mt-4 space-y-2 p-0 list-none border-t border-dark/5 pt-4">
                              {plan.features.map((feat, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2.5 text-xs text-dark/70 animate-fadeUp"
                                  style={{ animationDelay: `${idx * 40}ms` }}
                                >
                                  <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-tertiary/8 text-tertiary ring-1 ring-tertiary/10">
                                    <FiCheck className="h-3 w-3 stroke-[3.5]" />
                                  </span>
                                  <span className="leading-4 font-bold text-dark/75">
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
                        className={`mt-5 w-full block rounded-xl px-5 py-3 text-xs font-black text-center uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-md ${
                          plan.popular
                            ? "bg-linear-to-r from-tertiary to-[#8B5CF6] text-white hover:shadow-lg hover:shadow-tertiary/30 border-none"
                            : "bg-white hover:bg-tertiary/5 text-tertiary border border-tertiary/30 hover:border-tertiary/50 hover:shadow-sm"
                        }`}
                      >
                        Get Started
                      </button>
                    </div>
                  );
                })}

                {/* 3rd Column: DYNAMIC EduBari AI Credits Subscription Card */}
                {selectedAiPkg && (
                  <div className="group relative rounded-2xl border p-6 text-left transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between border-transparent bg-white shadow-[0_20px_40px_-15px_rgba(139,92,246,0.10)] ring-1 ring-[#8B5CF6]/30">
                    <div>
                      {selectedAiPkg.highlight && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] font-black tracking-widest bg-linear-to-r from-tertiary to-[#8B5CF6] text-white shadow-md shadow-tertiary/25 uppercase">
                          Power Up Add-on
                        </div>
                      )}

                      <div className="text-[9px] font-black text-[#8B5CF6] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <FiCpu className="h-3.5 w-3.5 animate-spin text-[#8B5CF6]" style={{ animationDuration: "4s" }} /> EduBari Global AI Plan
                      </div>

                      {/* Plan Name */}
                      <h3 className="mt-1 text-xl font-extrabold text-dark tracking-tight">
                        SaaS AI Credits
                      </h3>

                      {/* Access Info */}
                      <p className="mt-0.5 text-[10px] font-bold text-dark/40 uppercase tracking-wide">
                        Shared Pool (LMS Teacher Panel Only)
                      </p>

                      {/* Tier Selector Pills */}
                      {aiPackages.length > 0 && (
                        <div className="mt-4">
                          <label className="block text-[9px] font-black uppercase tracking-widest text-[#8B5CF6] mb-1.5">
                            Select Credits Package:
                          </label>
                          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100/70 border border-slate-200/50">
                            {aiPackages.map((pkg) => {
                              const isSelected = selectedAiPkg.id === pkg.id;
                              return (
                                <button
                                  key={pkg.id}
                                  type="button"
                                  onClick={() => setSelectedAiPkg(pkg)}
                                  className={`relative py-1.5 px-0.5 rounded-lg text-xs font-black tracking-tight transition-all duration-300 cursor-pointer border flex flex-col items-center justify-center ${
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

                      {/* Price */}
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-3.5xl sm:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6] drop-shadow-sm">
                          ৳{(selectedAiPkg.price || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-black text-dark/40 uppercase tracking-wider">
                          / {selectedAiPkg.validityDays} Days
                        </span>
                      </div>

                      {/* AI Features */}
                      <ul className="mt-4 space-y-2 p-0 list-none border-t border-dark/5 pt-4">
                        <li className="flex items-start gap-2.5 text-xs text-dark/70">
                          <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#8B5CF6]/8 text-[#8B5CF6] ring-1 ring-[#8B5CF6]/10">
                            <FiCheck className="h-3 w-3 stroke-[3.5]" />
                          </span>
                          <span className="leading-4 font-bold text-dark/80">
                            Unified {selectedAiPkg.credits} AI Credits Pool
                          </span>
                        </li>
                        <li className="flex items-start gap-2.5 text-xs text-dark/70">
                          <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#8B5CF6]/8 text-[#8B5CF6] ring-1 ring-[#8B5CF6]/10">
                            <FiCheck className="h-3 w-3 stroke-[3.5]" />
                          </span>
                          <span className="leading-4 font-bold text-dark/75">
                            AI Presentation Slides Maker
                          </span>
                        </li>
                        <li className="flex items-start gap-2.5 text-xs text-dark/70">
                          <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#8B5CF6]/8 text-[#8B5CF6] ring-1 ring-[#8B5CF6]/10">
                            <FiCheck className="h-3 w-3 stroke-[3.5]" />
                          </span>
                          <span className="leading-4 font-bold text-dark/75">
                            AI Question Paper Generator
                          </span>
                        </li>
                        <li className="flex items-start gap-2.5 text-xs text-dark/70">
                          <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-green-500/8 text-green-600 ring-1 ring-green-500/10">
                            <FiCheck className="h-3 w-3 stroke-[3.5]" />
                          </span>
                          <span className="leading-4 font-black text-green-600">
                            Teacher Dashboard Privileges
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* CTA */}
                    <button
                      type="button"
                      onClick={handleAiPlanPurchase}
                      className="mt-5 w-full block rounded-xl px-5 py-3 text-xs font-black text-center transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer bg-linear-to-r from-[#8B5CF6] to-[#7c3aed] text-white shadow-md shadow-[#8B5CF6]/20 hover:shadow-lg border-none uppercase tracking-wider"
                    >
                      Buy AI Credits
                    </button>
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
              Explore All Plans
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
              <h3 className="text-lg font-black text-dark tracking-tight">AI Credits Domain Top-up</h3>
              <p className="text-xs text-dark/50 mt-2 leading-relaxed max-w-xs mx-auto">Search and select your institutional verified domain to buy credits for your Teacher panel.</p>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-5 relative">
              <div className="relative">
                <label className="block text-[10px] font-black uppercase tracking-widest text-dark/40 mb-1.5">Search Institutional Domain</label>
                <input
                  type="text"
                  required
                  placeholder="Type school name or domain (e.g. asif...)"
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
                      Matched Client Domains
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
                          Select
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Status Badge */}
                {selectedDomain && (
                  <div className="mt-3 px-4 py-3 rounded-xl bg-green-500/8 border border-green-200/50 text-green-700 text-xs font-bold text-center flex items-center justify-center gap-2 animate-fadeUp">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
                    Verified Domain selected: <code className="font-mono bg-white px-2 py-0.5 rounded border border-green-200 text-xs">{selectedDomain}</code>
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
                {selectedDomain ? "Proceed to Checkout" : "Please select your domain above"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Pricing;
