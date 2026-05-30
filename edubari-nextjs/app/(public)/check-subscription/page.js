"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiSearch,
  FiGlobe,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiActivity,
  FiArrowRight,
  FiArrowLeft,
  FiRefreshCw
} from "react-icons/fi";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

export default function CheckSubscriptionPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name_asc");
  const [selectedClient, setSelectedClient] = useState(null);
  const [now, setNow] = useState(new Date());

  // Dynamic live countdown updates
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch clients & subscription data
  useEffect(() => {
    async function loadClients() {
      try {
        const res = await fetch("/api/billing/clients");
        if (!res.ok) throw new Error("Failed to load institution directory.");
        const data = await res.json();
        setClients(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Unable to retrieve subscriptions. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    loadClients();
  }, []);

  // Filter & Sort clients based on search query and sort state
  const filteredAndSortedClients = React.useMemo(() => {
    let list = clients;
    
    // 1. Filtering
    if (searchQuery.trim() !== "") {
      list = list.filter((c) => {
        const nameText = c?.client_name || "";
        const domainText = c?.domain || "";
        const matchText = `${nameText} ${domainText}`.toLowerCase();
        return matchText.includes(searchQuery.toLowerCase());
      });
    }
    
    // 2. Sorting
    return [...list].sort((a, b) => {
      const nameA = String(a?.client_name || "").trim();
      const nameB = String(b?.client_name || "").trim();
      const domainA = String(a?.domain || "").trim();
      const domainB = String(b?.domain || "").trim();

      if (sortBy === "name_asc") {
        return nameA.localeCompare(nameB, undefined, { sensitivity: "base", numeric: true });
      }
      if (sortBy === "name_desc") {
        return nameB.localeCompare(nameA, undefined, { sensitivity: "base", numeric: true });
      }
      if (sortBy === "domain_asc") {
        return domainA.localeCompare(domainB, undefined, { sensitivity: "base", numeric: true });
      }
      if (sortBy === "domain_desc") {
        return domainB.localeCompare(domainA, undefined, { sensitivity: "base", numeric: true });
      }
      return 0;
    });
  }, [clients, searchQuery, sortBy]);

  // Compute subscription details
  const getSubscriptionDetails = (client) => {
    if (!client) return null;
    const activeSub = client.subscriptions?.find((s) => s.is_current);
    
    let statusLabel = "No Subscription";
    let statusColor = "text-dark/50 bg-dark/[0.04] border-dark/10";
    let timeLeftLabel = "Expired";
    let timeLeftColor = "text-red-600 bg-red-50 border-red-200";
    let isExpired = true;
    let isGrace = false;
    let daysRemaining = 0;
    
    if (activeSub) {
      const end = new Date(activeSub.end_date);
      const grace = new Date(activeSub.grace_end_date);
      
      if (now < end) {
        isExpired = false;
        const diffMs = end - now;
        const diffSec = Math.floor(diffMs / 1000);
        const days = Math.floor(diffSec / (3600 * 24));
        daysRemaining = days;

        if (days >= 2) {
          timeLeftLabel = `${days} Days Left`;
        } else {
          const hours = Math.floor((diffSec % (3600 * 24)) / 3600);
          const minutes = Math.floor((diffSec % 3600) / 60);
          const seconds = diffSec % 60;
          timeLeftLabel = days === 1 ? `1 Day, ${hours}h Left` : `${hours}h ${minutes}m ${seconds}s Left`;
        }
        statusLabel = "Active";
        statusColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
        timeLeftColor = "text-emerald-700 bg-emerald-50 border-emerald-100 font-mono";
      } else if (now >= end && now < grace) {
        isExpired = false;
        isGrace = true;
        const diffMs = grace - now;
        const diffSec = Math.floor(diffMs / 1000);
        const days = Math.floor(diffSec / (3600 * 24));
        daysRemaining = days;

        if (days >= 1) {
          timeLeftLabel = `Grace: ${days} Days`;
        } else {
          const hours = Math.floor((diffSec % (3600 * 24)) / 3600);
          const minutes = Math.floor((diffSec % 3600) / 60);
          const seconds = diffSec % 60;
          timeLeftLabel = `Grace: ${hours}h ${minutes}m ${seconds}s`;
        }
        statusLabel = "Grace Period";
        statusColor = "text-amber-700 bg-amber-50 border-amber-200";
        timeLeftColor = "text-amber-700 bg-amber-50 border-amber-100 font-mono animate-pulse";
      } else {
        statusLabel = "Expired";
        statusColor = "text-red-600 bg-red-50 border-red-200";
      }
    }

    if (client.status === "suspended") {
      statusLabel = "Suspended";
      statusColor = "text-red-700 bg-red-100 border-red-300";
    }

    return {
      activeSub,
      statusLabel,
      statusColor,
      timeLeftLabel,
      timeLeftColor,
      isExpired,
      isGrace,
      daysRemaining
    };
  };

  return (
    <main className="min-h-screen bg-primary/45 py-12 px-4 sm:px-6 md:px-12 flex flex-col items-center">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#8B5CF6]/10 to-transparent -z-10 blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-3xl space-y-8 animate-[fadeInUp_0.4s_ease-out]">
        
        {/* Header Section */}
        <div className="text-center space-y-3">
          <span className="px-3.5 py-1.5 rounded-full bg-tertiary/10 text-tertiary text-xs font-extrabold uppercase tracking-widest border border-tertiary/20">
            Tenant Lookup Portal
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-dark tracking-tight leading-none mt-2">
            Check Institution Subscription
          </h2>
          <p className="text-xs sm:text-sm text-dark/50 max-w-md mx-auto font-medium">
            Search your institution domain name or username to review current limits, expiration dates, and license options.
          </p>
        </div>

        {/* Selected Client Profile Display (Detail Mode) */}
        {selectedClient ? (
          (() => {
            const details = getSubscriptionDetails(selectedClient);
            const { activeSub } = details;
            
            return (
              <div className="rounded-2xl border border-white/50 bg-white/80 backdrop-blur-md p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden animate-[fadeInUp_0.3s_ease-out]">
                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => setSelectedClient(null)}
                  className="flex items-center gap-1.5 text-xs font-bold text-dark/50 hover:text-tertiary transition-colors border-none bg-transparent cursor-pointer mb-2"
                >
                  <FiArrowLeft className="w-4 h-4" /> Back to Search
                </button>

                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 pb-5 border-b border-dark/5">
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    {selectedClient.logo_url ? (
                      <img
                        src={selectedClient.logo_url}
                        alt={`${selectedClient.client_name} logo`}
                        className="w-16 h-16 rounded-2xl object-contain bg-white border border-dark/10 p-1 shadow-md shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=60";
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-tertiary font-black text-xl shadow-inner shrink-0">
                        {selectedClient.client_name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-extrabold text-dark tracking-tight">
                        {selectedClient.client_name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-dark/45 font-semibold mt-1 justify-center sm:justify-start">
                        <FiGlobe className="w-3.5 h-3.5 text-tertiary shrink-0" />
                        <span>{selectedClient.domain}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-4 py-2 rounded-full text-xs font-extrabold border ${details.statusColor}`}>
                    {details.statusLabel.toUpperCase()}
                  </span>
                </div>

                {/* Main Stats Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Subscription Countdown */}
                  <div className="rounded-xl border border-white bg-white/60 p-5 shadow-sm space-y-1.5">
                    <span className="text-[10px] font-bold text-dark/40 uppercase block tracking-wider">Days / Lifespan Left</span>
                    <span className={`px-2.5 py-1 rounded inline-block text-xs font-extrabold border leading-none ${details.timeLeftColor}`}>
                      {details.timeLeftLabel}
                    </span>
                    <p className="text-[10px] text-dark/40 font-semibold mt-2.5 flex items-center gap-1">
                      <FiClock className="w-3.5 h-3.5 text-tertiary shrink-0" /> Live Ticking Countdown
                    </p>
                  </div>

                  {/* Pricing Plan Details */}
                  <div className="rounded-xl border border-white bg-white/60 p-5 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-dark/40 uppercase block tracking-wider">Current Enabled Plan</span>
                    <span className="text-base font-extrabold text-tertiary block">
                      {activeSub?.plans?.plan_name || "No Plan Associated"}
                    </span>
                    {activeSub?.plans && (
                      <p className="text-[10px] text-dark/50 font-bold lining-nums">
                        ৳{Number(activeSub.plans.price).toLocaleString()} / {activeSub.plans.duration_days} Days
                      </p>
                    )}
                  </div>
                </div>

                {/* Sub quotas & parameters */}
                {activeSub?.plans && (
                  <div className="rounded-xl border border-dark/5 bg-dark/[0.015] p-5 space-y-4">
                    <span className="text-[10px] font-bold text-dark/40 uppercase block tracking-wider">Resource Allocation & Quotas</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white border border-dark/5 rounded-xl">
                        <span className="text-[10px] text-dark/45 block font-bold">Max Student Threshold</span>
                        <span className="text-lg font-black text-dark lining-nums">{activeSub.plans.max_students}</span>
                      </div>
                      <div className="p-3 bg-white border border-dark/5 rounded-xl">
                        <span className="text-[10px] text-dark/45 block font-bold">Max Instructor Threshold</span>
                        <span className="text-lg font-black text-dark lining-nums">{activeSub.plans.max_instructors}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dates Span */}
                {activeSub && (
                  <div className="flex flex-col sm:flex-row justify-between gap-4 text-xs font-semibold text-dark/60 bg-white/50 border border-white p-4 rounded-xl lining-nums">
                    <div className="flex items-center gap-1.5">
                      <FiCalendar className="w-4 h-4 text-tertiary" />
                      <span>Last Subscription Date: <strong className="text-dark font-extrabold">{formatDateTime(activeSub.start_date)}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FiAlertCircle className="w-4 h-4 text-red-400" />
                      <span>Expiration Date: <strong className="text-dark font-extrabold">{formatDateTime(activeSub.end_date)}</strong></span>
                    </div>
                  </div>
                )}

                {/* Expiry Action Button */}
                <div className="pt-4 border-t border-dark/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left text-xs font-medium text-dark/45">
                    {details.isExpired ? (
                      <span className="text-red-500 font-bold">Your instance has expired. Please renew immediately to restore services.</span>
                    ) : details.isGrace ? (
                      <span className="text-amber-600 font-bold">Your instance is in grace mode. Renew now to avoid suspension.</span>
                    ) : (
                      <span>Need resources upgrade? Select a new plan to scale your features dynamically.</span>
                    )}
                  </div>

                  <Link
                    href={`/payment-purchase?name=${encodeURIComponent(selectedClient.client_name)}&preferredDomain=${encodeURIComponent(selectedClient.domain)}${activeSub ? `&plan=${activeSub.plan_id}` : ""}&existing=true`}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-gradient-to-r from-tertiary to-[#8B5CF6] text-white text-xs font-bold text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 border-none"
                  >
                    Renew / Buy Subscription <FiArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })()
        ) : (
          /* Search, Sort, and Selecting Dashboard UI */
          <div className="space-y-6">
            
            {/* Control Panel: Sorting, Filtering, and Selecting Options */}
            <div className="rounded-2xl border border-white/50 bg-white/80 backdrop-blur-md shadow-lg p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4 items-center">
                {/* Search / Filter Input */}
                <div className="relative flex items-center border border-dark/10 bg-white rounded-xl px-4 py-3.5 focus-within:border-tertiary/50 transition-all">
                  <FiSearch className="w-5 h-5 text-dark/30 mr-3 shrink-0" />
                  <input
                    type="text"
                    placeholder="Type to filter by name or domain..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-sm font-semibold bg-transparent outline-none text-dark placeholder:text-dark/30 border-none p-0"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="p-1 rounded-lg text-dark/30 hover:text-dark/65 border-none bg-transparent cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Sort Option Control */}
                <div className="relative flex items-center border border-dark/10 bg-white rounded-xl px-3 py-3 focus-within:border-tertiary/50 transition-all bg-white">
                  <span className="text-[10px] font-bold text-dark/40 uppercase mr-2 shrink-0">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full text-xs font-bold bg-transparent outline-none text-dark border-none p-0 cursor-pointer"
                  >
                    <option value="name_asc">Name (A-Z)</option>
                    <option value="name_desc">Name (Z-A)</option>
                    <option value="domain_asc">Domain (A-Z)</option>
                    <option value="domain_desc">Domain (Z-A)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Loading Spinner */}
            {loading && (
              <div className="py-20 text-center bg-white/40 border border-white rounded-2xl">
                <FiRefreshCw className="w-8 h-8 mx-auto text-tertiary animate-spin mb-3" />
                <p className="text-dark/50 font-bold text-xs">Loading institution directory...</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold flex items-center gap-2">
                <FiAlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            {/* Filtered Search Directory Results */}
            {!loading && !error && (
              <div className="space-y-4">
                {filteredAndSortedClients.length === 0 ? (
                  /* Zero results matched */
                  <div className="py-20 text-center rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xs space-y-2">
                    <FiAlertCircle className="w-12 h-12 mx-auto text-red-400/50" />
                    <p className="text-dark/50 text-sm font-bold">No Match Found</p>
                    <p className="text-dark/35 text-xs max-w-xs mx-auto font-medium">
                      The searched account does not exist. Ensure your spelling is correct or use the dropdown to select from registered clients.
                    </p>
                  </div>
                ) : (
                  /* Match listing cards */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-[fadeInUp_0.3s_ease-out]">
                    {filteredAndSortedClients.map((client) => {
                      const details = getSubscriptionDetails(client);
                      return (
                        <div
                          key={client.id}
                          onClick={() => setSelectedClient(client)}
                          className="rounded-2xl border border-white/50 bg-white/70 backdrop-blur-xs p-5 shadow-xs hover:shadow-md hover:bg-white hover:border-tertiary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer flex items-center gap-4 group"
                        >
                          {client.logo_url ? (
                            <img
                              src={client.logo_url}
                              alt={`${client.client_name} logo`}
                              className="w-12 h-12 rounded-xl object-contain bg-white border border-dark/10 p-0.5 shadow-xs shrink-0"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=100&auto=format&fit=crop&q=60";
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-tertiary font-bold text-sm shrink-0">
                              {client.client_name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="grow min-w-0">
                            <h4 className="text-sm font-bold text-dark group-hover:text-tertiary transition-colors truncate">
                              {client.client_name}
                            </h4>
                            <p className="text-[10px] text-dark/45 font-semibold mt-0.5 truncate flex items-center gap-1">
                              <FiGlobe className="w-3 h-3 text-tertiary" /> {client.domain}
                            </p>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border mt-2 ${details.statusColor}`}>
                              {details.statusLabel.toUpperCase()}
                            </span>
                          </div>
                          <FiArrowRight className="w-4 h-4 text-dark/35 group-hover:text-tertiary group-hover:translate-x-1 transition-all shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
