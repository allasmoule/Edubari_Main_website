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
    <section className="w-full px-4 sm:px-6 md:px-12 py-16 sm:py-20 lg:py-24 bg-white select-none">
      <div className="w-full rounded-[28px] border border-white/20 bg-primary/95 backdrop-blur-sm overflow-hidden">
        <div className="px-6 sm:px-8 md:px-10 lg:px-12 py-12 sm:py-14">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold tracking-wide uppercase mb-4">
              💰 Available Plans
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-dark leading-tight">
              Simple, Transparent{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]">
                Pricing
              </span>
            </h2>

            <p className="mt-5 text-sm sm:text-[15px] lg:text-base leading-7 text-dark/70 max-w-2xl mx-auto">
              Choose the plan that fits your institution and power up with AI capabilities.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="mt-12 lg:mt-14 max-w-5xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <FiLoader className="w-8 h-8 mx-auto text-tertiary animate-spin mb-3" />
                <p className="text-dark/50 font-medium">Loading plans...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 px-6 rounded-xl bg-red-50 border border-red-200/60">
                <p className="text-red-600 font-semibold">Failed to load plans</p>
                <p className="text-sm text-red-500/70 mt-1">{error}</p>
                <button
                  onClick={fetchPlans}
                  className="mt-4 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all cursor-pointer border-none"
                >
                  Retry
                </button>
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-dark/50 font-medium">
                  No active plans available
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                {/* Renders first 2 standard plans */}
                {plans.slice(0, 2).map((plan) => {
                  const planId = plan.id || plan._id;
                  return (
                    <div
                      key={planId}
                      className={`group relative rounded-2xl border p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-dark/5 flex flex-col justify-between ${
                        plan.popular
                          ? "border-tertiary/30 bg-white/80 shadow-lg shadow-tertiary/10 ring-1 ring-tertiary/20"
                          : "border-white/40 bg-white/50 hover:bg-white/80"
                      }`}
                    >
                      <div>
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
                        {plan.popular && (
                          <div className="text-[11px] font-bold text-tertiary uppercase tracking-wider mb-2">
                            Most Popular
                          </div>
                        )}

                        {/* Plan Name */}
                        <h3 className="mt-1 text-lg font-bold text-dark">
                          {plan.name}
                        </h3>

                        {/* Duration */}
                        <p className="mt-1 text-xs font-medium text-dark/45">
                          {plan.duration} {plan.duration_days ? `(${plan.duration_days} Days)` : ""}
                        </p>

                        {/* Price */}
                        <div className="mt-5 flex items-baseline gap-2">
                          <span
                            className={`text-4xl sm:text-5xl font-black tracking-tight ${
                              plan.popular
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

                        {/* Features */}
                        {plan.features &&
                          Array.isArray(plan.features) &&
                          plan.features.length > 0 && (
                            <ul className="mt-6 space-y-2.5 p-0 list-none">
                              {plan.features.map((feat, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2.5 text-sm text-dark/70 animate-[fadeIn_0.3s_ease-out]"
                                >
                                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-tertiary/10 text-tertiary">
                                    <FiCheck className="h-3 w-3 stroke-[3]" />
                                  </span>
                                  <span className="leading-5 font-medium">
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
                        className={`mt-7 w-full block rounded-xl px-6 py-3 text-sm font-bold text-center transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${
                          plan.popular
                            ? "bg-tertiary/10 text-tertiary group-hover:bg-tertiary group-hover:text-white group-hover:shadow-md group-hover:shadow-tertiary/30"
                            : "bg-white/60 text-dark border border-dark/10 group-hover:bg-white/90 shadow-sm group-hover:shadow-md"
                        }`}
                      >
                        Get Started
                      </button>
                    </div>
                  );
                })}

                {/* 3rd Column: DYNAMIC EduBari AI Credits Subscription Card */}
                {selectedAiPkg && (
                  <div className="group relative rounded-2xl border p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-dark/5 border-white/40 bg-white/80 shadow-lg shadow-tertiary/5 ring-1 ring-tertiary/10 flex flex-col justify-between animate-[fadeIn_0.5s_ease-out]">
                    <div>
                      {selectedAiPkg.highlight && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold tracking-wide bg-linear-to-r from-tertiary to-[#8B5CF6] text-white shadow-md shadow-tertiary/30 uppercase tracking-widest text-[10px]">
                          Power Up Add-on
                        </div>
                      )}

                      <div className="text-[11px] font-bold text-tertiary uppercase tracking-wider mb-2 flex items-center gap-1">
                        <FiCpu className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "3s" }} /> EduBari Global AI Plan
                      </div>

                      {/* Plan Name */}
                      <h3 className="mt-1 text-lg font-bold text-dark">
                        SaaS AI Credits
                      </h3>

                      {/* Access Info */}
                      <p className="mt-1 text-xs font-medium text-dark/45">
                        Shared Pool (LMS Teacher Panel Only)
                      </p>

                      {/* Tier Selector Pills */}
                      {aiPackages.length > 0 && (
                        <div className="mt-4 flex gap-1 p-1 rounded-xl bg-dark/[0.04] w-max border border-dark/5">
                          {aiPackages.map((pkg) => (
                            <button
                              key={pkg.id}
                              type="button"
                              onClick={() => setSelectedAiPkg(pkg)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer border-none ${
                                selectedAiPkg.id === pkg.id
                                  ? "bg-white text-tertiary shadow-sm font-black"
                                  : "bg-transparent text-dark/50 hover:text-dark/80"
                              }`}
                            >
                              {pkg.credits} Credits
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Price */}
                      <div className="mt-5 flex items-baseline gap-1.5">
                        <span className="text-4xl sm:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]">
                          ৳{(selectedAiPkg.price || 0).toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-dark/45">
                          / {selectedAiPkg.validityDays} Days
                        </span>
                      </div>

                      {/* AI Features */}
                      <ul className="mt-6 space-y-2.5 p-0 list-none">
                        <li className="flex items-start gap-2.5 text-sm text-dark/70">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-tertiary/10 text-tertiary">
                            <FiCheck className="h-3 w-3 stroke-[3]" />
                          </span>
                          <span className="leading-5 font-semibold">
                            Unified {selectedAiPkg.credits} AI Credits Pool
                          </span>
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-dark/70">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-tertiary/10 text-tertiary">
                            <FiCheck className="h-3 w-3 stroke-[3]" />
                          </span>
                          <span className="leading-5 font-medium">
                            AI Presentation Slides Maker
                          </span>
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-dark/70">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-tertiary/10 text-tertiary">
                            <FiCheck className="h-3 w-3 stroke-[3]" />
                          </span>
                          <span className="leading-5 font-medium">
                            AI Question Paper Generator
                          </span>
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-dark/70">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-tertiary/10 text-tertiary">
                            <FiCheck className="h-3 w-3 stroke-[3]" />
                          </span>
                          <span className="leading-5 font-medium text-amber-600 font-bold">
                            Teacher Dashboard Privileges
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* CTA */}
                    <button
                      type="button"
                      onClick={handleAiPlanPurchase}
                      className="mt-7 w-full block rounded-xl px-6 py-3 text-sm font-bold text-center transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer bg-linear-to-r from-tertiary to-[#8B5CF6] text-white shadow-md shadow-tertiary/20 hover:shadow-lg border-none"
                    >
                      Buy AI Credits
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* View All Plans */}
          <div className="mt-10 text-center">
            <button
              onClick={() => router.push("/payment-purchase")}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/60 border border-dark/10 text-sm font-bold text-dark hover:bg-white/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
            >
              Explore All Plans
              <FiArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Domain Assignment Popup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-dark/40 backdrop-blur-xs flex items-center justify-center z-[150] animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl border border-dark/10 w-full max-w-md overflow-visible shadow-2xl p-6 relative mx-4">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setInputDomain("");
                setSelectedDomain("");
                setFilteredClients([]);
              }}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-dark/5 hover:bg-dark/10 text-dark/50 hover:text-dark flex items-center justify-center transition-all cursor-pointer border-none"
            >
              <FiX className="h-4 w-4" />
            </button>

            <div className="text-center mb-5">
              <div className="h-12 w-12 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center mx-auto mb-3 shadow-inner">
                <FiShield className="h-6 w-6 animate-pulse" />
              </div>
              <h3 className="text-base font-black text-dark tracking-tight">AI Credits Domain Top-up</h3>
              <p className="text-xs text-dark/45 mt-1 leading-5">Search and select your institutional verified domain to buy credits for your Teacher panel.</p>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4 relative">
              <div className="relative">
                <label className="block text-[9px] font-extrabold uppercase tracking-widest text-dark/40 mb-1">Search Institutional Domain</label>
                <input
                  type="text"
                  required
                  placeholder="Type school name or domain (e.g. asif...)"
                  value={inputDomain}
                  onChange={(e) => handleDomainInputChange(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold outline-none text-center bg-dark/[0.01] transition-all ${
                    selectedDomain 
                      ? "border-green-400 bg-green-50/10 text-green-700 font-extrabold" 
                      : "border-dark/10 focus:border-tertiary/50 text-dark"
                  }`}
                />

                {/* Autocomplete Dropdown Search Results */}
                {searchFocused && filteredClients.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-dark/10 shadow-2xl py-2 z-[200] max-h-[220px] overflow-y-auto animate-[fadeInUp_0.15s_ease-out]">
                    <p className="px-4 py-1 text-[8px] font-extrabold uppercase tracking-wider text-dark/30 border-b border-dark/5 mb-1">
                      Matched Client Domains
                    </p>
                    {filteredClients.map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => handleSelectClient(client)}
                        className="w-full px-4 py-2.5 text-left hover:bg-dark/[0.03] flex items-center justify-between transition-colors border-none bg-transparent cursor-pointer"
                      >
                        <div>
                          <p className="text-xs font-bold text-dark">{client.client_name}</p>
                          <code className="text-3xs font-mono font-semibold text-tertiary mt-0.5 block">{client.domain}</code>
                        </div>
                        <span className="text-[10px] font-extrabold text-tertiary bg-tertiary/10 px-2 py-0.5 rounded uppercase">
                          Select
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Status Badge */}
                {selectedDomain && (
                  <div className="mt-2.5 px-3.5 py-2.5 rounded-xl bg-green-500/8 border border-green-200/50 text-green-700 text-3xs font-extrabold text-center flex items-center justify-center gap-1.5 animate-[fadeIn_0.2s_ease-out]">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
                    Verified Domain selected: <code className="font-mono bg-green-100/50 px-1 py-0.5 rounded text-2xs">{selectedDomain}</code>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!selectedDomain}
                className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all shadow-md border-none ${
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
