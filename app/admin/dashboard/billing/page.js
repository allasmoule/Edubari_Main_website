"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FiLayers,
  FiUser,
  FiDollarSign,
  FiPlus,
  FiTrash2,
  FiEdit,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
  FiGlobe,
  FiAlertCircle,
  FiCalendar,
  FiActivity,
  FiClock,
  FiSearch,
  FiX,
  FiPlusCircle
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

export default function AdminBillingPage() {
  const [activeTab, setActiveTab] = useState("clients"); // clients, plans, subscriptions
  
  // Data States
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  
  // Real-time Countdown Timer State
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Modals Toggles
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);

  // Form Field States
  // Client Form
  const [clientForm, setClientForm] = useState({ client_name: "", domain: "", status: "active", phone: "", plan_id: "", logo_url: "" });
  // Plan Form
  const [planForm, setPlanForm] = useState({
    plan_name: "",
    duration_days: 30,
    max_students: 200,
    max_instructors: 10,
    price: 1500,
    featuresInput: ""
  });
  // Subscription Form
  const [subForm, setSubForm] = useState({
    client_id: "",
    plan_id: "",
    start_date: "",
    end_date: "",
    grace_end_date: "",
    is_current: true,
    payment_status: "paid"
  });

  // Fetch Data Function
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [clientsRes, plansRes, subsRes] = await Promise.all([
        fetch("/api/billing/clients"),
        fetch("/api/billing/plans"),
        fetch("/api/billing/subscriptions")
      ]);

      if (!clientsRes.ok || !plansRes.ok || !subsRes.ok) {
        throw new Error("Failed to fetch billing data files.");
      }

      const clientsData = await clientsRes.json();
      const plansData = await plansRes.json();
      const subsData = await subsRes.json();

      setClients(Array.isArray(clientsData) ? clientsData : []);
      setPlans(Array.isArray(plansData) ? plansData : []);
      setSubscriptions(Array.isArray(subsData) ? subsData : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load multi-tenant subscription configurations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Client CRUD Handlers
  const handleClientSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const url = selectedClient ? `/api/billing/clients/${selectedClient.id}` : "/api/billing/clients";
      const method = selectedClient ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientForm)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to save client");

      alert(selectedClient ? "Client updated successfully" : "Client registered successfully");
      setClientModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleClientStatus = async (client) => {
    const nextStatus = client.status === "active" ? "suspended" : "active";
    if (!window.confirm(`Are you sure you want to change status to ${nextStatus}?`)) return;
    
    try {
      const response = await fetch(`/api/billing/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!response.ok) throw new Error("Failed to toggle status");
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleClientDelete = async (id) => {
    if (!window.confirm("Danger: Deleting a client will permanently delete all active/past subscription records. Proceed?")) return;
    try {
      const response = await fetch(`/api/billing/clients/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete client");
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Plan CRUD Handlers
  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const url = selectedPlan ? `/api/billing/plans/${selectedPlan.id}` : "/api/billing/plans";
      const method = selectedPlan ? "PATCH" : "POST";

      const featuresArray = planForm.featuresInput
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      const payload = {
        plan_name: planForm.plan_name,
        duration_days: Number(planForm.duration_days),
        max_students: Number(planForm.max_students),
        max_instructors: Number(planForm.max_instructors),
        price: Number(planForm.price),
        features: featuresArray
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to save tier");

      alert(selectedPlan ? "Plan updated successfully" : "Plan created successfully");
      setPlanModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlanDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subscription tier?")) return;
    try {
      const response = await fetch(`/api/billing/plans/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to delete plan");
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Subscription CRUD Handlers
  const handleSubSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const url = selectedSub ? `/api/billing/subscriptions/${selectedSub.id}` : "/api/billing/subscriptions";
      const method = selectedSub ? "PATCH" : "POST";

      const payload = {
        client_id: subForm.client_id,
        plan_id: subForm.plan_id,
        payment_status: subForm.payment_status,
        is_current: subForm.is_current
      };

      if (subForm.start_date) payload.start_date = new Date(subForm.start_date).toISOString();
      if (subForm.end_date) payload.end_date = new Date(subForm.end_date).toISOString();
      if (subForm.grace_end_date) payload.grace_end_date = new Date(subForm.grace_end_date).toISOString();

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to save subscription");

      alert(selectedSub ? "Subscription updated" : "New subscription issued successfully");
      setSubModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this subscription history record?")) return;
    try {
      const response = await fetch(`/api/billing/subscriptions/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete subscription");
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Filter Data based on search queries
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const text = `${c.client_name} ${c.domain} ${c.status}`.toLowerCase();
      return text.includes(searchQuery.toLowerCase());
    });
  }, [clients, searchQuery]);

  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      const text = `${p.plan_name} ${p.price} ${p.features.join(" ")}`.toLowerCase();
      return text.includes(searchQuery.toLowerCase());
    });
  }, [plans, searchQuery]);

  const filteredSubs = useMemo(() => {
    return subscriptions.filter((s) => {
      const text = `${s.clients?.client_name || ""} ${s.clients?.domain || ""} ${s.plans?.plan_name || ""} ${s.payment_status}`.toLowerCase();
      return text.includes(searchQuery.toLowerCase());
    });
  }, [subscriptions, searchQuery]);

  return (
    <div className="space-y-6 animate-[fadeInUp_0.35s_ease-out]">
      {/* Header and Stats */}
      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 sm:p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-dark tracking-tight">
              Tenant Subscriptions & Billing Module
            </h2>
            <p className="text-xs sm:text-sm text-dark/45 font-medium mt-1">
              Administer multi-tenant client instances of EduBari and configure domain checks.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {activeTab === "clients" && (
              <button
                type="button"
                onClick={() => {
                  setSelectedClient(null);
                  setClientForm({ client_name: "", domain: "", status: "active", phone: "", plan_id: plans[0]?.id || "", logo_url: "" });
                  setClientModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-tertiary to-[#8B5CF6] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer inline-flex items-center gap-2 border-none"
              >
                <FiPlus className="w-4 h-4" /> Add Tenant Client
              </button>
            )}
            
            {activeTab === "plans" && (
              <button
                type="button"
                onClick={() => {
                  setSelectedPlan(null);
                  setPlanForm({
                    plan_name: "",
                    duration_days: 30,
                    max_students: 200,
                    max_instructors: 10,
                    price: 1500,
                    featuresInput: ""
                  });
                  setPlanModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-tertiary to-[#8B5CF6] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer inline-flex items-center gap-2 border-none"
              >
                <FiPlus className="w-4 h-4" /> Create Pricing Plan
              </button>
            )}

            {activeTab === "subscriptions" && (
              <button
                type="button"
                disabled={clients.length === 0 || plans.length === 0}
                onClick={() => {
                  setSelectedSub(null);
                  setSubForm({
                    client_id: clients[0]?.id || "",
                    plan_id: plans[0]?.id || "",
                    start_date: "",
                    end_date: "",
                    grace_end_date: "",
                    is_current: true,
                    payment_status: "paid"
                  });
                  setSubModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-tertiary to-[#8B5CF6] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer inline-flex items-center gap-2 border-none disabled:opacity-50"
              >
                <FiPlus className="w-4 h-4" /> Issue Domain Subscription
              </button>
            )}
          </div>
        </div>

        {/* Global Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="rounded-xl border border-white/40 bg-white/75 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-dark/40 uppercase">Total School Tenants</p>
              <FiUser className="w-5 h-5 text-tertiary" />
            </div>
            <p className="text-2xl font-extrabold text-dark mt-2">{clients.length}</p>
          </div>
          
          <div className="rounded-xl border border-white/40 bg-white/75 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-dark/40 uppercase">Active Subscriptions</p>
              <FiCheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-extrabold text-dark mt-2">
              {subscriptions.filter((s) => s.is_current && s.payment_status === "paid").length}
            </p>
          </div>

          <div className="rounded-xl border border-white/40 bg-white/75 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-dark/40 uppercase">Suspended Tenants</p>
              <FiXCircle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl font-extrabold text-red-500 mt-2">
              {clients.filter((c) => c.status === "suspended").length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs, Search & Error Message */}
      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-4 sm:p-5 shadow-lg">
        {/* Navigation Tabs and Search */}
        <div className="flex flex-col md:flex-row gap-4 justify-between border-b border-dark/5 pb-4 mb-5">
          <div className="flex items-center gap-2 overflow-x-auto select-none py-1 shrink-0">
            {[
              { id: "clients", label: "Clients & Domains", icon: FiUser },
              { id: "plans", label: "Subscription Tiers", icon: FiLayers },
              { id: "subscriptions", label: "Subscription Logs", icon: FiDollarSign }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchQuery("");
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer inline-flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-tertiary to-[#8B5CF6] text-white border-transparent shadow-sm"
                      : "bg-white/60 border-dark/10 text-dark/65 hover:bg-white hover:border-tertiary/20"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center border border-dark/10 bg-white/60 rounded-xl px-3 py-2 w-full md:max-w-xs transition-all focus-within:border-tertiary/50">
            <FiSearch className="w-4 h-4 text-dark/30 mr-2 shrink-0" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-medium bg-transparent outline-none text-dark placeholder:text-dark/30 border-none p-0"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-bold px-4 py-3 mb-5 inline-flex items-center gap-2 w-full">
            <FiAlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {loading && (
          <div className="py-24 text-center">
            <FiLoader className="w-8 h-8 mx-auto text-tertiary animate-spin mb-3" />
            <p className="text-dark/50 font-semibold text-sm">Loading billing records...</p>
          </div>
        )}

        {/* Tab 1: Clients Console */}
        {!loading && activeTab === "clients" && (
          <div>
            {filteredClients.length === 0 ? (
              <div className="py-16 text-center border border-dark/5 bg-white/40 rounded-2xl">
                <FiUser className="w-12 h-12 mx-auto text-dark/20 mb-3" />
                <p className="text-dark/50 font-bold">No registered client instances found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-dark/5 bg-white/60 backdrop-blur-xs">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-dark/5 text-xs font-extrabold text-dark/45 uppercase whitespace-nowrap bg-dark/[0.02]">
                      <th className="py-4 px-5">Client Name</th>
                      <th className="py-4 px-5">Contact Phone</th>
                      <th className="py-4 px-5">Mapped Domain</th>
                      <th className="py-4 px-5">Active Plan</th>
                      <th className="py-4 px-5">Time Left</th>
                      <th className="py-4 px-5">Subscription Period</th>
                      <th className="py-4 px-5">Created Date</th>
                      <th className="py-4 px-5">Status</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark/5 text-xs font-semibold text-dark/80 whitespace-nowrap">
                    {filteredClients.map((client) => {
                      const activeSub = client.subscriptions?.find((s) => s.is_current);
                      
                      let timeLeftLabel = "No Active Sub";
                      let timeLeftColor = "text-dark/45 bg-dark/[0.04] border-dark/5";
                      if (activeSub) {
                        const end = new Date(activeSub.end_date);
                        const grace = new Date(activeSub.grace_end_date);
                        
                        if (now < end) {
                          const diffMs = end - now;
                          const diffSec = Math.floor(diffMs / 1000);
                          const days = Math.floor(diffSec / (3600 * 24));
                          
                          if (days >= 2) {
                            timeLeftLabel = `${days} Days Left`;
                          } else {
                            // Under 48 hours: show hours, minutes, and seconds live
                            const hours = Math.floor((diffSec % (3600 * 24)) / 3600);
                            const minutes = Math.floor((diffSec % 3600) / 60);
                            const seconds = diffSec % 60;
                            
                            if (days === 1) {
                              timeLeftLabel = `1 Day, ${hours}h Left`;
                            } else {
                              timeLeftLabel = `${hours}h ${minutes}m ${seconds}s Left`;
                            }
                          }
                          timeLeftColor = "text-emerald-700 bg-emerald-50 border-emerald-100 font-mono tracking-wider";
                        } else if (now >= end && now < grace) {
                          const diffMs = grace - now;
                          const diffSec = Math.floor(diffMs / 1000);
                          const days = Math.floor(diffSec / (3600 * 24));
                          
                          if (days >= 1) {
                            timeLeftLabel = `Grace: ${days} Days Left`;
                          } else {
                            const hours = Math.floor((diffSec % (3600 * 24)) / 3600);
                            const minutes = Math.floor((diffSec % 3600) / 60);
                            const seconds = diffSec % 60;
                            timeLeftLabel = `Grace: ${hours}h ${minutes}m ${seconds}s`;
                          }
                          timeLeftColor = "text-amber-700 bg-amber-50 border-amber-100 font-mono tracking-wider animate-pulse";
                        } else {
                          timeLeftLabel = "Expired";
                          timeLeftColor = "text-red-600 bg-red-50 border-red-100";
                        }
                      }

                      return (
                        <tr key={client.id} className="hover:bg-dark/[0.015] transition-all duration-150">
                          <td className="py-4 px-5 font-extrabold text-dark tracking-tight flex items-center gap-3">
                            {client.logo_url ? (
                              <img
                                src={client.logo_url}
                                alt={`${client.client_name} logo`}
                                className="w-8 h-8 rounded-lg object-contain bg-white border border-dark/10 shadow-xs"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=100&auto=format&fit=crop&q=60";
                                }}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-tertiary font-black text-[10px] tracking-tight">
                                {client.client_name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <span>{client.client_name}</span>
                          </td>
                          <td className="py-4 px-5 font-bold text-dark/65 lining-nums">{client.phone || "No Contact"}</td>
                          <td className="py-4 px-5 font-medium">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-dark/[0.04] text-dark/70 border border-dark/5">
                              <FiGlobe className="w-3.5 h-3.5 text-tertiary" /> {client.domain}
                            </span>
                          </td>
                          <td className="py-4 px-5 font-bold text-tertiary">
                            {activeSub?.plans?.plan_name || "No Subscription"}
                          </td>
                          <td className="py-4 px-5">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold border ${timeLeftColor}`}>
                              {timeLeftLabel}
                            </span>
                          </td>
                          <td className="py-4 px-5 font-medium text-dark/65 lining-nums">
                            {activeSub ? (
                              <span>{formatDateTime(activeSub.start_date)} - {formatDateTime(activeSub.end_date)}</span>
                            ) : (
                              <span className="text-dark/35">-</span>
                            )}
                          </td>
                          <td className="py-4 px-5 font-medium text-dark/45 lining-nums">{formatDateTime(client.created_at)}</td>
                          <td className="py-4 px-5">
                            <button
                              type="button"
                              onClick={() => handleToggleClientStatus(client)}
                              className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold border transition-all duration-200 cursor-pointer ${
                                client.status === "active"
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                  : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                              }`}
                            >
                              {client.status.toUpperCase()}
                            </button>
                          </td>
                          <td className="py-4 px-5 text-right space-x-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedClient(client);
                                setClientForm({
                                  client_name: client.client_name,
                                  domain: client.domain,
                                  status: client.status,
                                  phone: client.phone || "",
                                  plan_id: activeSub?.plan_id || "",
                                  logo_url: client.logo_url || ""
                                });
                                setClientModalOpen(true);
                              }}
                              className="p-2 rounded-lg border border-dark/10 hover:bg-white hover:border-tertiary/20 text-dark/65 cursor-pointer bg-transparent transition-all"
                            >
                              <FiEdit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleClientDelete(client.id)}
                              className="p-2 rounded-lg border border-red-200 hover:bg-red-50 hover:border-red-300 text-red-500 cursor-pointer bg-transparent transition-all"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Subscription Tiers */}
        {!loading && activeTab === "plans" && (
          <div>
            {filteredPlans.length === 0 ? (
              <div className="py-16 text-center border border-dark/5 bg-white/40 rounded-2xl">
                <FiLayers className="w-12 h-12 mx-auto text-dark/20 mb-3" />
                <p className="text-dark/50 font-bold">No operational subscription tiers found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPlans.map((plan) => (
                  <div key={plan.id} className="rounded-2xl border border-white/45 bg-white/45 p-5 shadow-sm hover:shadow-md transition-all space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-dark">{plan.plan_name}</h4>
                        <p className="text-[10px] text-dark/45 font-semibold mt-1">Duration: {plan.duration_days} Days</p>
                      </div>
                      <span className="text-base font-extrabold text-tertiary">
                        ৳{Number(plan.price).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] py-3 border-y border-dark/5 font-semibold">
                      <div className="p-2 rounded-lg bg-dark/[0.02]">
                        <span className="text-dark/45 block">Max Students</span>
                        <span className="text-xs font-bold text-dark">{plan.max_students}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-dark/[0.02]">
                        <span className="text-dark/45 block">Max Instructors</span>
                        <span className="text-xs font-bold text-dark">{plan.max_instructors}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-dark/40 uppercase block mb-1.5">Limits & Features</span>
                      <div className="flex flex-wrap gap-1.5">
                        {plan.features.map((f, i) => (
                          <span key={i} className="px-2 py-1 rounded bg-tertiary/10 text-tertiary text-[9px] font-bold">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-1.5 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPlan(plan);
                          setPlanForm({
                            plan_name: plan.plan_name,
                            duration_days: plan.duration_days,
                            max_students: plan.max_students,
                            max_instructors: plan.max_instructors,
                            price: plan.price,
                            featuresInput: plan.features.join(", ")
                          });
                          setPlanModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-dark/10 hover:bg-white text-[10px] font-bold text-dark/65 cursor-pointer bg-transparent inline-flex items-center gap-1"
                      >
                        <FiEdit className="w-3.5 h-3.5" /> Edit Tier
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handlePlanDelete(plan.id)}
                        className="px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-[10px] font-bold text-red-500 cursor-pointer bg-transparent inline-flex items-center gap-1"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Subscription History Logs */}
        {!loading && activeTab === "subscriptions" && (
          <div>
            {filteredSubs.length === 0 ? (
              <div className="py-16 text-center border border-dark/5 bg-white/40 rounded-2xl">
                <FiDollarSign className="w-12 h-12 mx-auto text-dark/20 mb-3" />
                <p className="text-dark/50 font-bold">No active or historical domain subscription logs exist.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-dark/5 text-xs font-extrabold text-dark/40 uppercase">
                      <th className="py-3 px-4">Client / Domain</th>
                      <th className="py-3 px-4">Subscribed Tier</th>
                      <th className="py-3 px-4">Duration Lifespan</th>
                      <th className="py-3 px-4">Active State</th>
                      <th className="py-3 px-4">Payment Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark/5 text-xs font-semibold text-dark/85">
                    {filteredSubs.map((sub) => {
                      const isExpired = new Date(sub.end_date) < new Date();
                      const isGracePeriod = !isExpired && new Date(sub.grace_end_date) < new Date();

                      return (
                        <tr key={sub.id} className="hover:bg-dark/[0.01] transition-all">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-dark">{sub.clients?.client_name || "Unknown Client"}</div>
                            <div className="text-[10px] text-dark/45 font-medium mt-0.5">{sub.clients?.domain}</div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-tertiary">
                            {sub.plans?.plan_name || "Custom Plan"}
                          </td>
                          <td className="py-3.5 px-4 space-y-1 font-medium text-dark/55 lining-nums">
                            <div className="flex items-center gap-1">
                              <FiCalendar className="w-3.5 h-3.5 shrink-0" />
                              <span>{formatDateTime(sub.start_date)} - {formatDateTime(sub.end_date)}</span>
                            </div>
                            <div className="text-[9px] text-dark/35 flex items-center gap-1 font-bold">
                              <FiClock className="w-3 h-3 text-red-400" /> Grace End: {formatDateTime(sub.grace_end_date)}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {sub.is_current ? (
                              <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100 flex items-center gap-1 w-max">
                                <FiActivity className="w-3 h-3" /> Current Sub
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded bg-dark/[0.04] text-dark/45 text-[10px] font-bold border border-dark/5 flex items-center gap-1 w-max">
                                Past Log
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold border ${
                              sub.payment_status === "paid"
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : sub.payment_status === "pending"
                                ? "bg-amber-50 border-amber-200 text-amber-600"
                                : "bg-red-50 border-red-200 text-red-500"
                            }`}>
                              {sub.payment_status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSub(sub);
                                setSubForm({
                                  client_id: sub.client_id,
                                  plan_id: sub.plan_id,
                                  start_date: sub.start_date.substring(0, 10),
                                  end_date: sub.end_date.substring(0, 10),
                                  grace_end_date: sub.grace_end_date.substring(0, 10),
                                  is_current: sub.is_current,
                                  payment_status: sub.payment_status
                                });
                                setSubModalOpen(true);
                              }}
                              className="p-2 rounded-lg border border-dark/10 hover:bg-white text-dark/65 cursor-pointer bg-transparent"
                            >
                              <FiEdit className="w-3.5 h-3.5" />
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => handleSubDelete(sub.id)}
                              className="p-2 rounded-lg border border-red-200 hover:bg-red-50 text-red-500 cursor-pointer bg-transparent"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: CLIENT MODAL */}
      {clientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark/40 backdrop-blur-sm" onClick={() => setClientModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl p-6 z-10 animate-[fadeInUp_0.3s_ease-out]">
            <div className="flex items-center justify-between pb-3 border-b border-dark/5 mb-5">
              <h3 className="text-base font-bold text-dark inline-flex items-center gap-2">
                <FiUser className="w-5 h-5 text-tertiary" />
                {selectedClient ? "Update Client Profile" : "Register New Client Instance"}
              </h3>
              <button
                type="button"
                onClick={() => setClientModalOpen(false)}
                className="p-1 rounded-lg text-dark/30 hover:text-dark/65 hover:bg-dark/5 border-none bg-transparent cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleClientSubmit} className="space-y-4">
              {/* Premium Logo Preview & Placeholder Box */}
              <div className="flex flex-col items-center justify-center p-4 bg-dark/[0.02] rounded-xl border border-dashed border-dark/10 space-y-3">
                <div className="relative w-20 h-20 rounded-2xl bg-white border border-dark/10 shadow-sm flex items-center justify-center overflow-hidden group">
                  {clientForm.logo_url ? (
                    <img
                      src={clientForm.logo_url}
                      alt="Preview Logo"
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=60";
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-dark/30 space-y-1">
                      <FiPlusCircle className="w-8 h-8 text-tertiary/60 animate-[pulse_2s_infinite]" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-dark/40">No Logo</span>
                    </div>
                  )}
                </div>
                <div className="w-full space-y-1">
                  <label className="block text-[10px] font-bold text-dark/50 uppercase text-center">Institution Logo URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={clientForm.logo_url || ""}
                    onChange={(e) => setClientForm({ ...clientForm, logo_url: e.target.value })}
                    className="w-full rounded-lg border border-dark/10 bg-white px-3 py-2 text-[11px] font-semibold text-dark outline-none focus:border-tertiary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-dark/60 uppercase">Institution / Client Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EduBari Academy"
                  value={clientForm.client_name}
                  onChange={(e) => setClientForm({ ...clientForm, client_name: e.target.value })}
                  className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-xs font-semibold text-dark outline-none focus:border-tertiary focus:ring-2 focus:ring-tertiary/10 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-dark/60 uppercase">App Domain Binding</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. academy.edubari.bd"
                  value={clientForm.domain}
                  onChange={(e) => setClientForm({ ...clientForm, domain: e.target.value.toLowerCase().trim() })}
                  className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-xs font-semibold text-dark outline-none focus:border-tertiary focus:ring-2 focus:ring-tertiary/10 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-dark/60 uppercase">Phone / Contact Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +88017xxxxxxxx"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-xs font-semibold text-dark outline-none focus:border-tertiary focus:ring-2 focus:ring-tertiary/10 transition-all"
                />
              </div>

              {!selectedClient && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-dark/60 uppercase">Activate Pricing Plan</label>
                  <select
                    required
                    value={clientForm.plan_id}
                    onChange={(e) => setClientForm({ ...clientForm, plan_id: e.target.value })}
                    className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-xs font-semibold text-dark outline-none focus:border-tertiary transition-all"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.plan_name} - ৳{Number(p.price).toLocaleString()} ({p.duration_days} Days)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-dark/60 uppercase">Instance Status</label>
                <select
                  value={clientForm.status}
                  onChange={(e) => setClientForm({ ...clientForm, status: e.target.value })}
                  className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-xs font-semibold text-dark outline-none focus:border-tertiary transition-all"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-dark/5">
                <button
                  type="button"
                  onClick={() => setClientModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-dark/10 text-xs font-bold text-dark hover:bg-dark/5 transition-all cursor-pointer bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-tertiary to-[#8B5CF6] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all border-none cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Tenant Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PLAN MODAL */}
      {planModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark/40 backdrop-blur-sm" onClick={() => setPlanModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl p-6 z-10 animate-[fadeInUp_0.3s_ease-out]">
            <div className="flex items-center justify-between pb-3 border-b border-dark/5 mb-5">
              <h3 className="text-base font-bold text-dark inline-flex items-center gap-2">
                <FiLayers className="w-5 h-5 text-tertiary" />
                {selectedPlan ? "Edit Subscription Tier" : "Create Subscription Tier"}
              </h3>
              <button
                type="button"
                onClick={() => setPlanModalOpen(false)}
                className="p-1 rounded-lg text-dark/30 hover:text-dark/65 hover:bg-dark/5 border-none bg-transparent cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlanSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-dark/60 uppercase">Tier / Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Basic Plan, Premium Plan"
                  value={planForm.plan_name}
                  onChange={(e) => setPlanForm({ ...planForm, plan_name: e.target.value })}
                  className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-xs font-semibold text-dark outline-none focus:border-tertiary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-dark/60 uppercase">Duration (Days)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={planForm.duration_days}
                    onChange={(e) => setPlanForm({ ...planForm, duration_days: e.target.value })}
                    className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-xs font-semibold text-dark outline-none focus:border-tertiary transition-all"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-dark/60 uppercase">Price (৳)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                    className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-xs font-semibold text-dark outline-none focus:border-tertiary transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-dark/60 uppercase">Max Students</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={planForm.max_students}
                    onChange={(e) => setPlanForm({ ...planForm, max_students: e.target.value })}
                    className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-xs font-semibold text-dark outline-none focus:border-tertiary transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-dark/60 uppercase">Max Instructors</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={planForm.max_instructors}
                    onChange={(e) => setPlanForm({ ...planForm, max_instructors: e.target.value })}
                    className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-xs font-semibold text-dark outline-none focus:border-tertiary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-dark/60 uppercase">Limits & Features (Comma Separated)</label>
                <textarea
                  rows="2"
                  placeholder="Smart Profiles, SMS Alerts, Advanced Reports"
                  value={planForm.featuresInput}
                  onChange={(e) => setPlanForm({ ...planForm, featuresInput: e.target.value })}
                  className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-xs font-semibold text-dark outline-none focus:border-tertiary transition-all"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-dark/5">
                <button
                  type="button"
                  onClick={() => setPlanModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-dark/10 text-xs font-bold text-dark hover:bg-dark/5 transition-all cursor-pointer bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-tertiary to-[#8B5CF6] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all border-none cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Pricing Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SUBSCRIPTION MODAL */}
      {subModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark/40 backdrop-blur-sm" onClick={() => setSubModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl p-6 z-10 animate-[fadeInUp_0.3s_ease-out]">
            <div className="flex items-center justify-between pb-3 border-b border-dark/5 mb-5">
              <h3 className="text-base font-bold text-dark inline-flex items-center gap-2">
                <FiDollarSign className="w-5 h-5 text-tertiary" />
                {selectedSub ? "Modify Domain Subscription" : "Issue New Domain Subscription"}
              </h3>
              <button
                type="button"
                onClick={() => setSubModalOpen(false)}
                className="p-1 rounded-lg text-dark/30 hover:text-dark/65 hover:bg-dark/5 border-none bg-transparent cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {!selectedSub && (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-dark/60 uppercase">Select School Client</label>
                    <select
                      required
                      value={subForm.client_id}
                      onChange={(e) => setSubForm({ ...subForm, client_id: e.target.value })}
                      className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-xs font-semibold text-dark outline-none focus:border-tertiary transition-all"
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.client_name} ({c.domain})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-dark/60 uppercase">Select Subscription Tier</label>
                    <select
                      required
                      value={subForm.plan_id}
                      onChange={(e) => setSubForm({ ...subForm, plan_id: e.target.value })}
                      className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-xs font-semibold text-dark outline-none focus:border-tertiary transition-all"
                    >
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.plan_name} - ৳{Number(p.price).toLocaleString()} ({p.duration_days} Days)
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-dark/60 uppercase">Start Date (Optional)</label>
                <input
                  type="date"
                  value={subForm.start_date}
                  onChange={(e) => setSubForm({ ...subForm, start_date: e.target.value })}
                  className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-xs font-semibold text-dark outline-none focus:border-tertiary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-dark/60 uppercase">End Date (Optional)</label>
                  <input
                    type="date"
                    value={subForm.end_date}
                    onChange={(e) => setSubForm({ ...subForm, end_date: e.target.value })}
                    className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-xs font-semibold text-dark outline-none focus:border-tertiary transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-dark/60 uppercase">Grace End Date (Optional)</label>
                  <input
                    type="date"
                    value={subForm.grace_end_date}
                    onChange={(e) => setSubForm({ ...subForm, grace_end_date: e.target.value })}
                    className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-xs font-semibold text-dark outline-none focus:border-tertiary transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-dark/60 uppercase">Payment Status</label>
                  <select
                    value={subForm.payment_status}
                    onChange={(e) => setSubForm({ ...subForm, payment_status: e.target.value })}
                    className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-xs font-semibold text-dark outline-none focus:border-tertiary transition-all"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-dark/60 uppercase">Mark Current Active?</label>
                  <select
                    value={subForm.is_current ? "true" : "false"}
                    onChange={(e) => setSubForm({ ...subForm, is_current: e.target.value === "true" })}
                    className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-xs font-semibold text-dark outline-none focus:border-tertiary transition-all"
                  >
                    <option value="true">Active (Deactivates older ones)</option>
                    <option value="false">Past History Only</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-dark/5">
                <button
                  type="button"
                  onClick={() => setSubModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-dark/10 text-xs font-bold text-dark hover:bg-dark/5 transition-all cursor-pointer bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-tertiary to-[#8B5CF6] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all border-none cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Issuing..." : "Issue Domain Subscription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
