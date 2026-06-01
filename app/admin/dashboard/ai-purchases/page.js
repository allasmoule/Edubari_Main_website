"use client";

import React, { useState, useEffect } from "react";
import {
  FiCheck,
  FiX,
  FiSearch,
  FiCreditCard,
  FiPlus,
  FiSmartphone,
  FiUser,
  FiTrendingUp,
  FiCalendar,
  FiLayers,
  FiInfo,
  FiActivity,
  FiEdit,
  FiAlertCircle,
  FiClock,
  FiTrendingDown,
  FiCpu,
  FiLoader
} from "react-icons/fi";

export default function AIPurchasesDashboard() {
  const [activeTab, setActiveTab] = useState("pending"); // pending, all, balances, transactions, packages
  const [requests, setRequests] = useState([]);
  const [packages, setPackages] = useState([]);
  const [balances, setBalances] = useState([]);
  const [transactions, setTransactions] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Package Form Modal
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [pkgFormData, setPkgFormData] = useState({
    name: "",
    credits: "",
    price: "",
    validityDays: "30",
    currency: "BDT",
    isActive: true,
    highlight: false,
  });

  // Action Loading
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchCoreData();
  }, []);

  useEffect(() => {
    if (activeTab === "balances") {
      fetchBalances();
    } else if (activeTab === "transactions") {
      fetchTransactions();
    }
  }, [activeTab]);

  const fetchCoreData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reqsRes, pkgsRes] = await Promise.all([
        fetch("/api/ai-purchases"),
        fetch("/api/ai-packages"),
      ]);

      if (!reqsRes.ok || !pkgsRes.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const reqsData = await reqsRes.json();
      const pkgsData = await pkgsRes.json();

      setRequests(reqsData);
      setPackages(pkgsData);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data. Please make sure the API endpoints are functioning.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBalances = async () => {
    setTabLoading(true);
    try {
      const res = await fetch("/api/ai-purchases?type=balances");
      if (res.ok) {
        const data = await res.json();
        setBalances(data);
      }
    } catch (e) {
      console.error("Error fetching balances:", e);
    } finally {
      setTabLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setTabLoading(true);
    try {
      const res = await fetch("/api/ai-purchases?type=transactions");
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (e) {
      console.error("Error fetching transactions:", e);
    } finally {
      setTabLoading(false);
    }
  };

  // Approve / Reject Handlers
  const handleAction = async (requestId, status) => {
    setProcessingId(requestId);
    try {
      const res = await fetch("/api/ai-purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update request");
      }

      // Update state locally
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status, processedAt: new Date().toISOString() }
            : r
        )
      );

      // Reload extra admin details if approvals occurred
      if (activeTab === "pending" || activeTab === "all") {
        fetchCoreData();
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Save Package Handler
  const handleSavePackage = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...pkgFormData,
        id: editingPkg?.id || undefined,
        credits: Number(pkgFormData.credits),
        price: Number(pkgFormData.price),
        validityDays: Number(pkgFormData.validityDays),
      };

      const res = await fetch("/api/ai-packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save package");

      await fetchCoreData(); // reload both pkgs and reqs
      setIsPkgModalOpen(false);
      setEditingPkg(null);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const openEditPackage = (pkg) => {
    setEditingPkg(pkg);
    setPkgFormData({
      name: pkg.name,
      credits: pkg.credits.toString(),
      price: pkg.price.toString(),
      validityDays: pkg.validityDays.toString(),
      currency: pkg.currency,
      isActive: pkg.isActive,
      highlight: pkg.highlight || false,
    });
    setIsPkgModalOpen(true);
  };

  const openNewPackage = () => {
    setEditingPkg(null);
    setPkgFormData({
      name: "",
      credits: "",
      price: "",
      validityDays: "30",
      currency: "BDT",
      isActive: true,
      highlight: false,
    });
    setIsPkgModalOpen(true);
  };

  // Filter lists based on queries
  const getFilteredRequests = () => {
    return requests.filter((r) => {
      const matchesSearch =
        r.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.packageName?.toLowerCase().includes(searchQuery.toLowerCase());

      if (activeTab === "pending") {
        return r.status === "pending" && matchesSearch;
      }

      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesStatus && matchesSearch;
    });
  };

  const getFilteredBalances = () => {
    return balances.filter((b) =>
      b.domain?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilteredTransactions = () => {
    return transactions.filter((t) =>
      t.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredRequests = getFilteredRequests();
  const filteredBalances = getFilteredBalances();
  const filteredTransactions = getFilteredTransactions();
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6 select-none">
      {/* Overview stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <FiClock className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-bold text-dark/45 uppercase tracking-wider">Pending Reviews</p>
            <h4 className="text-2xl font-black text-dark mt-1">{pendingCount}</h4>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
            <FiCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-dark/45 uppercase tracking-wider">Approved Requests</p>
            <h4 className="text-2xl font-black text-dark mt-1">
              {requests.filter((r) => r.status === "approved").length}
            </h4>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
            <FiLayers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-dark/45 uppercase tracking-wider">Active Packages</p>
            <h4 className="text-2xl font-black text-dark mt-1">
              {packages.filter((p) => p.isActive).length}
            </h4>
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-dark/10 gap-6 flex-wrap">
        <button
          onClick={() => {
            setActiveTab("pending");
            setStatusFilter("pending");
            setSearchQuery("");
          }}
          className={`pb-4 text-sm font-bold transition-all relative border-none bg-transparent cursor-pointer ${
            activeTab === "pending" ? "text-tertiary font-black" : "text-dark/40 hover:text-dark/70"
          }`}
        >
          Pending Review
          {pendingCount > 0 && (
            <span className="ml-1.5 px-2 py-0.5 text-2xs font-extrabold bg-amber-500 text-white rounded-full">
              {pendingCount}
            </span>
          )}
          {activeTab === "pending" && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-tertiary rounded-full" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab("all");
            setStatusFilter("all");
            setSearchQuery("");
          }}
          className={`pb-4 text-sm font-bold transition-all relative border-none bg-transparent cursor-pointer ${
            activeTab === "all" ? "text-tertiary font-black" : "text-dark/40 hover:text-dark/70"
          }`}
        >
          All Requests
          {activeTab === "all" && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-tertiary rounded-full" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab("balances");
            setSearchQuery("");
          }}
          className={`pb-4 text-sm font-bold transition-all relative border-none bg-transparent cursor-pointer ${
            activeTab === "balances" ? "text-tertiary font-black" : "text-dark/40 hover:text-dark/70"
          }`}
        >
          School Balance Overview
          {activeTab === "balances" && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-tertiary rounded-full" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab("transactions");
            setSearchQuery("");
          }}
          className={`pb-4 text-sm font-bold transition-all relative border-none bg-transparent cursor-pointer ${
            activeTab === "transactions" ? "text-tertiary font-black" : "text-dark/40 hover:text-dark/70"
          }`}
        >
          Unified Audit Log
          {activeTab === "transactions" && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-tertiary rounded-full" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab("packages");
            setSearchQuery("");
          }}
          className={`pb-4 text-sm font-bold transition-all relative border-none bg-transparent cursor-pointer ${
            activeTab === "packages" ? "text-tertiary font-black" : "text-dark/40 hover:text-dark/70"
          }`}
        >
          Subscription Packages
          {activeTab === "packages" && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-tertiary rounded-full" />
          )}
        </button>
      </div>

      {/* Conditional Rendering */}
      {loading ? (
        <div className="bg-white/50 backdrop-blur-sm p-12 rounded-3xl border border-white/20 text-center animate-pulse">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tertiary mx-auto mb-4"></div>
          <p className="text-dark/50 text-sm font-bold">Fetching latest data from database...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-6 rounded-2xl border border-red-200 text-center animate-[fadeInUp_0.3s_ease-out]">
          <FiAlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h4 className="text-lg font-bold text-red-700">Error Encountered</h4>
          <p className="text-sm text-red-600 mt-1">{error}</p>
          <button
            onClick={fetchCoreData}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer border-none"
          >
            Retry Connection
          </button>
        </div>
      ) : activeTab === "packages" ? (
        // Packages Panel
        <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black tracking-tight text-dark">EduBari Global AI Credit Packages</h3>
              <p className="text-xs text-dark/50 mt-1">Configure packages that appear inside the Teacher LMS dashboard. These credits are shared globally for AI Presentation and AI Question Maker.</p>
            </div>
            <button
              onClick={openNewPackage}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-tertiary hover:bg-tertiary-dark text-white font-bold text-xs transition-all shadow-md shadow-tertiary/10 cursor-pointer border-none"
            >
              <FiPlus className="h-4 w-4" /> Add Package
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white/80 backdrop-blur-md rounded-3xl p-6 border transition-all relative flex flex-col justify-between ${
                  pkg.highlight
                    ? "border-tertiary/50 ring-2 ring-tertiary/10 shadow-lg shadow-tertiary/5"
                    : "border-dark/10"
                } ${!pkg.isActive ? "opacity-60" : ""}`}
              >
                {pkg.highlight && (
                  <span className="absolute -top-3 left-6 px-3 py-1 bg-tertiary text-white text-3xs font-extrabold rounded-full tracking-wider uppercase">
                    Highlighted Pack
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-black text-dark">{pkg.name}</h4>
                    <span
                      className={`px-2 py-0.5 text-3xs font-bold rounded-full ${
                        pkg.isActive ? "bg-green-50 text-green-600" : "bg-dark/5 text-dark/40"
                      }`}
                    >
                      {pkg.isActive ? "Active" : "Disabled"}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5 mb-5">
                    <span className="text-3xl font-black text-dark">৳{pkg.price}</span>
                    <span className="text-xs font-bold text-dark/45">/ {pkg.validityDays} Days</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-dark/65 font-medium mb-6 p-0 list-none">
                    <li className="flex items-center gap-2">
                      <FiCheck className="text-green-500 h-4.5 w-4.5 shrink-0" />
                      <strong>{pkg.credits} Shared AI Credits</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <FiCheck className="text-green-500 h-4.5 w-4.5 shrink-0" />
                      Valid for Presentation & Question Maker
                    </li>
                    <li className="flex items-center gap-2">
                      <FiCheck className="text-green-500 h-4.5 w-4.5 shrink-0" />
                      Accessible only from LMS Teacher Panel
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => openEditPackage(pkg)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dark/10 hover:bg-dark/[0.03] text-dark/70 hover:text-dark text-xs font-bold transition-all cursor-pointer bg-white"
                >
                  <FiEdit className="h-3.5 w-3.5" /> Modify Package
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === "balances" ? (
        // School Balances Panel
        <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark/40">
                <FiSearch className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search school subdomain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-dark/10 bg-white/70 text-sm outline-none transition-all focus:ring-2 focus:ring-tertiary/20 focus:border-tertiary/40"
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-dark/50 px-2">
              <FiActivity className="h-4 w-4 text-tertiary" /> Total Managed Schools: {balances.length}
            </div>
          </div>

          {tabLoading ? (
            <div className="bg-white/50 backdrop-blur-sm p-12 rounded-3xl border border-white/20 text-center animate-pulse">
              <FiLoader className="h-6 w-6 text-tertiary animate-spin mx-auto mb-2" />
              <p className="text-dark/40 text-xs font-bold">Querying credit balances...</p>
            </div>
          ) : filteredBalances.length === 0 ? (
            <div className="bg-white/40 backdrop-blur-sm p-12 rounded-3xl border border-white/20 text-center">
              <FiInfo className="h-8 w-8 text-dark/30 mx-auto mb-3" />
              <p className="text-dark/40 text-sm font-bold">No active school domains found.</p>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-dark/10 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-dark/[0.02] border-b border-dark/10">
                      <th className="px-6 py-4 text-xs font-bold text-dark/40 uppercase tracking-wider">Active Domain</th>
                      <th className="px-6 py-4 text-xs font-bold text-dark/40 uppercase tracking-wider">Remaining Credits</th>
                      <th className="px-6 py-4 text-xs font-bold text-dark/40 uppercase tracking-wider">Total Purchased</th>
                      <th className="px-6 py-4 text-xs font-bold text-dark/40 uppercase tracking-wider">Expires At</th>
                      <th className="px-6 py-4 text-xs font-bold text-dark/40 uppercase tracking-wider">Last Sync</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark/5">
                    {filteredBalances.map((item) => {
                      const isExpired = item.expiresAt && new Date(item.expiresAt) < new Date();
                      return (
                        <tr key={item.domain} className="hover:bg-dark/[0.01] transition-colors">
                          <td className="px-6 py-4 font-bold text-dark font-mono text-xs">{item.domain}</td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-extrabold ${item.remainingCredits > 10 ? "text-tertiary" : "text-amber-500"}`}>
                              {item.remainingCredits} Credits
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-dark/60">{item.totalCredits || item.remainingCredits} Credits</td>
                          <td className="px-6 py-4 text-xs">
                            {item.expiresAt ? (
                              <span className={`font-bold ${isExpired ? "text-red-500" : "text-dark/60"}`}>
                                {new Date(item.expiresAt).toLocaleDateString()} {isExpired && "(Expired)"}
                              </span>
                            ) : (
                              <span className="text-dark/40">Never Expire</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-2xs font-bold text-dark/40">
                            {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "N/A"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : activeTab === "transactions" ? (
        // Unified Audit Log Panel
        <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark/40">
                <FiSearch className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search audit trail by school subdomain or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-dark/10 bg-white/70 text-sm outline-none transition-all focus:ring-2 focus:ring-tertiary/20 focus:border-tertiary/40"
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-dark/50 px-2">
              <FiActivity className="h-4 w-4 text-tertiary" /> Unified Entries: {transactions.length}
            </div>
          </div>

          {tabLoading ? (
            <div className="bg-white/50 backdrop-blur-sm p-12 rounded-3xl border border-white/20 text-center animate-pulse">
              <FiLoader className="h-6 w-6 text-tertiary animate-spin mx-auto mb-2" />
              <p className="text-dark/40 text-xs font-bold">Querying audit logs...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="bg-white/40 backdrop-blur-sm p-12 rounded-3xl border border-white/20 text-center">
              <FiInfo className="h-8 w-8 text-dark/30 mx-auto mb-3" />
              <p className="text-dark/40 text-sm font-bold">No transaction records found.</p>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-dark/10 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-dark/[0.02] border-b border-dark/10">
                      <th className="px-6 py-4 text-xs font-bold text-dark/40 uppercase tracking-wider">School Domain</th>
                      <th className="px-6 py-4 text-xs font-bold text-dark/40 uppercase tracking-wider">Event / Action</th>
                      <th className="px-6 py-4 text-xs font-bold text-dark/40 uppercase tracking-wider">Credits</th>
                      <th className="px-6 py-4 text-xs font-bold text-dark/40 uppercase tracking-wider">System Description</th>
                      <th className="px-6 py-4 text-xs font-bold text-dark/40 uppercase tracking-wider">Operator</th>
                      <th className="px-6 py-4 text-xs font-bold text-dark/40 uppercase tracking-wider">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark/5">
                    {filteredTransactions.map((t, idx) => {
                      const isDeduction = t.type === "deduction" || t.description.toLowerCase().includes("used") || t.description.toLowerCase().includes("deduct");
                      return (
                        <tr key={t.id || idx} className="hover:bg-dark/[0.01] transition-colors">
                          <td className="px-6 py-4 font-bold text-dark font-mono text-xs">{t.domain}</td>
                          <td className="px-6 py-4 text-xs font-bold">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-3xs font-extrabold uppercase ${
                              isDeduction 
                                ? "bg-red-50 text-red-500 border border-red-150" 
                                : "bg-green-50 text-green-600 border border-green-150"
                            }`}>
                              {isDeduction ? <FiTrendingDown className="h-3 w-3" /> : <FiTrendingUp className="h-3 w-3" />}
                              {t.type?.toUpperCase() || (isDeduction ? "DEDUCTION" : "PURCHASE")}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-black ${isDeduction ? "text-red-500" : "text-green-600"}`}>
                              {isDeduction ? "-" : "+"}{t.amount} Credits
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-dark/70 font-semibold">{t.description}</td>
                          <td className="px-6 py-4 text-2xs font-bold text-dark/50">{t.teacherName || "Central System"}</td>
                          <td className="px-6 py-4 text-2xs font-bold text-dark/40">
                            {t.createdAt ? new Date(t.createdAt).toLocaleString() : "N/A"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Requests Panel (Pending / All)
        <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark/40">
                <FiSearch className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search requests by Account Domain, Name, Txn ID, or package..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-dark/10 bg-white/70 text-sm outline-none transition-all focus:ring-2 focus:ring-tertiary/20 focus:border-tertiary/40"
              />
            </div>

            {activeTab === "all" && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-dark/50">Status Filter:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-dark/10 bg-white/70 text-xs font-bold text-dark/70 outline-none focus:border-tertiary/40"
                >
                  <option value="all">All Requests</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}
          </div>

          {/* Requests Grid / Table */}
          {filteredRequests.length === 0 ? (
            <div className="bg-white/40 backdrop-blur-sm p-12 rounded-3xl border border-white/20 text-center">
              <FiInfo className="h-8 w-8 text-dark/30 mx-auto mb-3" />
              <p className="text-dark/40 text-sm font-bold">No matching purchase requests found.</p>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-dark/10 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-dark/[0.02] border-b border-dark/10">
                      <th className="px-6 py-4 text-xs font-bold text-dark/40 uppercase tracking-wider">Account / Domain</th>
                      <th className="px-6 py-4 text-xs font-bold text-dark/40 uppercase tracking-wider">Credits & Pack</th>
                      <th className="px-6 py-4 text-xs font-bold text-dark/40 uppercase tracking-wider">Payment / Txn ID</th>
                      <th className="px-6 py-4 text-xs font-bold text-dark/40 uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-4 text-xs font-bold text-dark/40 uppercase tracking-wider">Status</th>
                      {activeTab === "pending" && (
                        <th className="px-6 py-4 text-xs font-bold text-dark/40 uppercase tracking-wider text-right">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark/5">
                    {filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-dark/[0.01] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-linear-to-br from-tertiary/10 to-primary/30 flex items-center justify-center text-tertiary font-bold text-xs">
                              {req.domain?.charAt(0).toUpperCase() || "D"}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-dark">{req.userName}</p>
                              <code className="text-3xs font-mono font-bold text-tertiary mt-0.5 block">{req.domain}</code>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-bold text-dark">{req.packageName}</p>
                            <p className="text-2xs font-extrabold text-tertiary mt-0.5">+{req.credits} Global Credits</p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div>
                            <p className="text-xs font-bold text-dark flex items-center gap-1.5">
                              <span className="text-base">
                                {req.paymentMethod === "bkash" ? "📱" : req.paymentMethod === "nagad" ? "📲" : "🏦"}
                              </span>
                              {req.paymentMethod?.toUpperCase()} (৳{req.price})
                            </p>
                            <code className="text-3xs font-mono font-bold text-dark/45 mt-0.5 block tracking-wider bg-dark/[0.03] px-1.5 py-0.5 rounded w-max select-all">
                              {req.transactionId}
                            </code>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-2xs font-bold text-dark/50 flex items-center gap-1">
                            <FiCalendar className="h-3 w-3 shrink-0" />
                            {new Date(req.submittedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-3xs font-extrabold tracking-wider uppercase border ${
                              req.status === "approved"
                                ? "bg-green-50 border-green-200 text-green-600"
                                : req.status === "rejected"
                                  ? "bg-red-50 border-red-200 text-red-500"
                                  : "bg-amber-50 border-amber-200 text-amber-600 animate-[pulse_2s_infinite]"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              req.status === "approved" ? "bg-green-500" : req.status === "rejected" ? "bg-red-500" : "bg-amber-500"
                            }`} />
                            {req.status}
                          </span>
                        </td>

                        {activeTab === "pending" && (
                          <td className="px-6 py-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleAction(req.id, "rejected")}
                                disabled={processingId !== null}
                                className="h-8 w-8 rounded-lg border border-red-200 hover:bg-red-50 text-red-500 flex items-center justify-center transition-all cursor-pointer bg-white"
                                title="Reject Payment"
                              >
                                <FiX className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleAction(req.id, "approved")}
                                disabled={processingId !== null}
                                className="h-8 w-8 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 text-green-600 flex items-center justify-center transition-all cursor-pointer"
                                title="Approve Request & Credit Wallet"
                              >
                                {processingId === req.id ? (
                                  <svg className="animate-spin h-3.5 w-3.5 text-green-600" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                ) : (
                                  <FiCheck className="h-4 w-4 stroke-[2.5]" />
                                )}
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Package Form Modal */}
      {isPkgModalOpen && (
        <div className="fixed inset-0 bg-dark/40 backdrop-blur-xs flex items-center justify-center z-[150] animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl border border-dark/10 w-full max-w-md overflow-hidden shadow-2xl p-6 relative mx-4">
            <button
              onClick={() => setIsPkgModalOpen(false)}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-dark/5 hover:bg-dark/10 text-dark/50 hover:text-dark flex items-center justify-center transition-all cursor-pointer border-none"
            >
              <FiX className="h-4 w-4" />
            </button>

            <h3 className="text-lg font-black text-dark mb-1">
              {editingPkg ? "Modify Package" : "Create New Package"}
            </h3>
            <p className="text-xs text-dark/45 mb-5">Fill in the fields to configure the subscription package tier.</p>

            <form onSubmit={handleSavePackage} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-dark/40 mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pro Package"
                  value={pkgFormData.name}
                  onChange={(e) => setPkgFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-dark/10 text-sm outline-none transition focus:border-tertiary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-dark/40 mb-1">Credits (Shared Pool)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 10"
                    value={pkgFormData.credits}
                    onChange={(e) => setPkgFormData((prev) => ({ ...prev, credits: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-dark/10 text-sm outline-none transition focus:border-tertiary/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-dark/40 mb-1">Price (BDT)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 199"
                    value={pkgFormData.price}
                    onChange={(e) => setPkgFormData((prev) => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-dark/10 text-sm outline-none transition focus:border-tertiary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-dark/40 mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 30"
                    value={pkgFormData.validityDays}
                    onChange={(e) => setPkgFormData((prev) => ({ ...prev, validityDays: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-dark/10 text-sm outline-none transition focus:border-tertiary/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-dark/40 mb-1">Currency</label>
                  <input
                    type="text"
                    required
                    placeholder="BDT"
                    value={pkgFormData.currency}
                    onChange={(e) => setPkgFormData((prev) => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-dark/10 text-sm outline-none transition focus:border-tertiary/50 bg-dark/[0.02] text-dark/50 cursor-not-allowed"
                    readOnly
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={pkgFormData.isActive}
                    onChange={(e) => setPkgFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 rounded text-tertiary focus:ring-tertiary"
                  />
                  <span className="text-xs font-bold text-dark/70">Active & Published</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={pkgFormData.highlight}
                    onChange={(e) => setPkgFormData((prev) => ({ ...prev, highlight: e.target.checked }))}
                    className="h-4 w-4 rounded text-tertiary focus:ring-tertiary"
                  />
                  <span className="text-xs font-bold text-dark/70">Highlight in LMS</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-dark/10">
                <button
                  type="button"
                  onClick={() => setIsPkgModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-dark/10 text-dark/65 hover:bg-dark/[0.02] text-xs font-bold transition-all cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-tertiary hover:bg-tertiary-dark text-white text-xs font-bold transition-all shadow-md shadow-tertiary/10 cursor-pointer border-none"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
