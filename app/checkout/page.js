"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FiCheck,
  FiArrowLeft,
  FiArrowRight,
  FiSmartphone,
  FiCreditCard,
  FiAlertCircle,
  FiShield,
  FiInfo
} from "react-icons/fi";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL Params
  const domain = searchParams.get("domain") || "demo.edubari.bd";
  const packageId = searchParams.get("package_id") || "pkg_pro";
  const redirectUrl = searchParams.get("redirect_url") || "https://lms.edubari.bd/student/ai-tutor";

  // State
  const [packages, setPackages] = useState([]);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [paymentMethod, setPaymentMethod] = useState("manual_bkash"); // manual_bkash, manual_nagad, sandbox_wallet, sandbox_card
  const [formData, setFormData] = useState({
    name: "Professor Arian Kabir", // default mock name
    phone: "01712345678",
    transactionId: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Simulated Gateway Modal State
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [gatewayStep, setGatewayStep] = useState(1); // 1: input, 2: otp, 3: pin/success, 4: processing
  const [gatewayPhone, setGatewayPhone] = useState("");
  const [gatewayOtp, setGatewayOtp] = useState("");
  const [gatewayPin, setGatewayPin] = useState("");
  
  // Card specific
  const [cardData, setCardData] = useState({ number: "", expiry: "", cvc: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai-packages");
      if (res.ok) {
        const data = await res.json();
        setPackages(data);
        
        // Find matching package
        const matched = data.find((p) => p.id === packageId);
        if (matched) {
          setSelectedPkg(matched);
        } else if (data.length > 0) {
          setSelectedPkg(data[0]); // default fallback
        }
      }
    } catch (err) {
      console.error("Error fetching packages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validateManual = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.transactionId.trim()) newErrors.transactionId = "Transaction ID is required";
    return newErrors;
  };

  // Submit Manual review request
  const handleSubmitManual = async (e) => {
    e.preventDefault();
    const valErrors = validateManual();
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        domain, // Bound to customer domain
        userName: formData.name,
        userPhone: formData.phone,
        packageId: selectedPkg.id,
        packageName: selectedPkg.name,
        credits: selectedPkg.credits,
        price: selectedPkg.price,
        currency: selectedPkg.currency || "BDT",
        paymentMethod: paymentMethod === "manual_bkash" ? "bkash" : "nagad",
        transactionId: formData.transactionId,
        status: "pending",
      };

      const res = await fetch("/api/ai-purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to submit purchase request");

      // Redirect back to LMS with pending status
      const lmsRedirect = `${redirectUrl}${redirectUrl.includes("?") ? "&" : "?"}payment=pending&txn_id=${formData.transactionId}`;
      router.push(lmsRedirect);
    } catch (err) {
      alert(`Error: ${err.message}`);
      setSubmitting(false);
    }
  };

  // Simulated Webhook IPN Callback Caller (for sandboxes)
  const triggerAutomatedCallback = async (methodType, txnId) => {
    setGatewayStep(4); // show processing loader
    
    try {
      const payload = {
        domain, // Bound to customer domain
        userName: formData.name || "Sandbox Customer",
        userPhone: gatewayPhone || formData.phone || "01700000000",
        packageId: selectedPkg.id,
        packageName: selectedPkg.name,
        credits: selectedPkg.credits,
        price: selectedPkg.price,
        currency: selectedPkg.currency || "BDT",
        paymentMethod: methodType,
        transactionId: txnId,
        status: "approved", // instantly approved
      };

      // Call checkout API callback handler to instantly credit Supabase
      const res = await fetch("/api/checkout/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to process transaction callback");

      // Delay slightly for natural feel
      setTimeout(() => {
        const lmsRedirect = `${redirectUrl}${redirectUrl.includes("?") ? "&" : "?"}payment=success&txn_id=${txnId}`;
        router.push(lmsRedirect);
      }, 2000);
    } catch (err) {
      alert(`Callback Error: ${err.message}`);
      setGatewayStep(1);
    }
  };

  const startSandboxGateway = () => {
    if (paymentMethod === "sandbox_wallet") {
      setGatewayPhone(formData.phone);
      setGatewayStep(1);
      setIsGatewayOpen(true);
    } else if (paymentMethod === "sandbox_card") {
      setGatewayStep(1);
      setIsGatewayOpen(true);
    }
  };

  const handleSandboxSubmitPhone = (e) => {
    e.preventDefault();
    if (gatewayPhone.length < 10) {
      alert("Please enter a valid mobile number.");
      return;
    }
    setGatewayStep(2); // move to OTP
  };

  const handleSandboxSubmitOtp = (e) => {
    e.preventDefault();
    if (gatewayOtp !== "123456" && gatewayOtp.length < 4) {
      alert("Invalid verification code. Use 123456 for testing.");
      return;
    }
    setGatewayStep(3); // move to PIN
  };

  const handleSandboxSubmitPin = (e) => {
    e.preventDefault();
    if (gatewayPin.length < 4) {
      alert("PIN must be at least 4 digits.");
      return;
    }
    
    const mockTxn = `TXN_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    triggerAutomatedCallback("bkash_api", mockTxn);
  };

  const handleSandboxSubmitCard = (e) => {
    e.preventDefault();
    if (cardData.number.length < 12) {
      alert("Please enter a valid card number.");
      return;
    }
    const mockTxn = `ST_TXN_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    triggerAutomatedCallback("stripe_gateway", mockTxn);
  };

  if (loading || !selectedPkg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-primary-light/30 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tertiary mx-auto mb-4"></div>
          <p className="text-dark/50 font-semibold text-sm">Initializing secure checkout session...</p>
        </div>
      </div>
    );
  }

  const inputBase =
    "w-full rounded-xl border bg-white/70 backdrop-blur-sm px-4 py-3 text-sm font-medium text-dark placeholder:text-dark/35 outline-none transition-all duration-300 focus:ring-2 focus:ring-tertiary/30 focus:border-tertiary/50 focus:bg-white";

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-primary-light/20 to-white py-12 px-4 relative select-none">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.04),transparent_60%)] pointer-events-none z-0" />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Back Link */}
        <button
          onClick={() => router.push(redirectUrl)}
          className="inline-flex items-center gap-2 text-xs font-bold text-dark/50 hover:text-dark transition-colors mb-6 border-none bg-transparent cursor-pointer"
        >
          <FiArrowLeft className="h-4 w-4" /> Cancel & Return to LMS
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Package details overview (4cols) */}
          <div className="md:col-span-5 bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-dark/10 shadow-sm space-y-6">
            <div>
              <span className="px-2.5 py-1 bg-tertiary/10 text-tertiary text-3xs font-extrabold uppercase tracking-wider rounded-full">
                SaaS AI Credits
              </span>
              <h2 className="text-2xl font-black text-dark tracking-tight mt-2">{selectedPkg.name}</h2>
              <p className="text-xs font-medium text-dark/45 mt-1">Unified AI Assistant Plan</p>
            </div>

            <div className="bg-dark/[0.02] p-4 rounded-2xl border border-dark/5 space-y-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-dark">৳{selectedPkg.price}</span>
                <span className="text-xs font-bold text-dark/45">/ {selectedPkg.validityDays} Days</span>
              </div>
              <div className="h-[1px] bg-dark/5 my-2" />
              <div>
                <p className="text-3xs font-extrabold text-dark/40 uppercase tracking-widest">Applying to Domain</p>
                <code className="text-xs font-mono font-bold text-tertiary tracking-wide">{domain}</code>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-dark/60">
                <span>Total Shared AI Credits</span>
                <span className="text-tertiary font-extrabold">+{selectedPkg.credits} Credits</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-dark/60">
                <span>Usage Access</span>
                <span className="text-dark/70 font-semibold">Presentation & Question Maker</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-dark/60">
                <span>Access Scope</span>
                <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded text-3xs border border-amber-200">Teacher Panel Only</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-dark/60">
                <span>Validity Period</span>
                <span>{selectedPkg.validityDays} Days</span>
              </div>
              <div className="h-[1px] bg-dark/10 my-2" />
              <div className="flex items-center justify-between text-sm font-black text-dark">
                <span>Total Amount Due</span>
                <span className="text-dark">৳{selectedPkg.price}</span>
              </div>
            </div>

            <div className="flex gap-2.5 items-center bg-blue-50/50 p-3.5 rounded-xl border border-blue-200 text-blue-600 text-3xs font-bold leading-5">
              <FiShield className="h-4.5 w-4.5 shrink-0" />
              This single pool of credits is shared by all teachers under your domain for both generating slides and mock exams.
            </div>
          </div>

          {/* Form & Selection (7cols) */}
          <div className="md:col-span-7 bg-white/80 backdrop-blur-md rounded-3xl border border-dark/10 shadow-sm overflow-hidden">
            <div className="bg-linear-to-r from-secondary to-secondary-light px-6 py-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 m-0">
                <FiCreditCard className="h-4 w-4" /> Secure checkout gateway
              </h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Payment Method Selector */}
              <div>
                <label className="block text-3xs font-extrabold uppercase tracking-widest text-dark/50 mb-3">
                  Select payment gateway
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("manual_bkash")}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === "manual_bkash"
                        ? "bg-[#E2136E]/10 border-[#E2136E]/40 text-[#E2136E] ring-2 ring-[#E2136E]/10"
                        : "bg-white border-dark/10 text-dark hover:-translate-y-0.5"
                    }`}
                  >
                    <span className="text-lg mb-1">📱</span>
                    <span className="text-2xs font-extrabold">bKash Manual</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("manual_nagad")}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === "manual_nagad"
                        ? "bg-[#F6921E]/10 border-[#F6921E]/40 text-[#F6921E] ring-2 ring-[#F6921E]/10"
                        : "bg-white border-dark/10 text-dark hover:-translate-y-0.5"
                    }`}
                  >
                    <span className="text-lg mb-1">📲</span>
                    <span className="text-2xs font-extrabold">Nagad Manual</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("sandbox_wallet")}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === "sandbox_wallet"
                        ? "bg-tertiary/10 border-tertiary/40 text-tertiary ring-2 ring-tertiary/10"
                        : "bg-white border-dark/10 text-dark hover:-translate-y-0.5"
                    }`}
                  >
                    <span className="text-lg mb-1">⚡</span>
                    <span className="text-2xs font-extrabold">Auto Gateway Wallet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("sandbox_card")}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === "sandbox_card"
                        ? "bg-tertiary/10 border-tertiary/40 text-tertiary ring-2 ring-tertiary/10"
                        : "bg-white border-dark/10 text-dark hover:-translate-y-0.5"
                    }`}
                  >
                    <span className="text-lg mb-1">💳</span>
                    <span className="text-2xs font-extrabold">Auto Credit Card</span>
                  </button>
                </div>
              </div>

              {/* Checkout Forms */}
              {paymentMethod.startsWith("manual_") ? (
                // MANUAL review form
                <form onSubmit={handleSubmitManual} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-dark/50 mb-1">Customer name</label>
                      <input
                        type="text"
                        placeholder="Professor Arian Kabir"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className={`${inputBase} ${errors.name ? "border-red-400" : "border-dark/10"}`}
                      />
                      {errors.name && <p className="text-3xs text-red-500 font-bold mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-dark/50 mb-1">Customer phone</label>
                      <input
                        type="tel"
                        placeholder="017XXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className={`${inputBase} ${errors.phone ? "border-red-400" : "border-dark/10"}`}
                      />
                      {errors.phone && <p className="text-3xs text-red-500 font-bold mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-dark/50 mb-1">Transaction ID</label>
                    <input
                      type="text"
                      placeholder="e.g. 9B8C7D6E5F"
                      value={formData.transactionId}
                      onChange={(e) => handleInputChange("transactionId", e.target.value)}
                      className={`${inputBase} ${errors.transactionId ? "border-red-400" : "border-dark/10"}`}
                    />
                    {errors.transactionId && <p className="text-3xs text-red-500 font-bold mt-1">{errors.transactionId}</p>}
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-[11px] text-amber-700 leading-5">
                    <div className="flex gap-2 font-bold mb-1">
                      <FiInfo className="h-4 w-4 shrink-0 text-amber-500" />
                      Manual review instructions
                    </div>
                    Cash out <strong className="text-amber-900">৳{selectedPkg.price}</strong> to our personal{" "}
                    <strong>{paymentMethod === "manual_bkash" ? "bKash" : "Nagad"}</strong> number{" "}
                    <strong className="text-amber-900">01700000000</strong>. Input your Transaction ID above and submit. Credits are credited to the customer account <strong className="text-amber-955">{domain}</strong> within 1-2 hours upon manual verification.
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-secondary to-secondary-light hover:shadow-lg text-white font-bold text-sm py-4 transition-all cursor-pointer border-none"
                  >
                    {submitting ? "Submitting order..." : "Submit manual transaction"} <FiArrowRight className="h-4.5 w-4.5" />
                  </button>
                </form>
              ) : (
                // AUTOMATED gateway triggers
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-[11px] text-blue-700 leading-5">
                    <div className="flex gap-2 font-bold mb-1">
                      <FiShield className="h-4 w-4 shrink-0 text-blue-500" />
                      Automated checkout sandbox
                    </div>
                    You selected the **Automated Sandbox Gateway** (incorporating mock {paymentMethod === "sandbox_wallet" ? "bKash API" : "Stripe Credit Card"} operations).
                    Click below to open the payment portal, complete verification, and instantly activate credits for <strong className="text-blue-900">{domain}</strong>.
                  </div>

                  <button
                    onClick={startSandboxGateway}
                    className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-tertiary hover:bg-tertiary-dark text-white font-bold text-sm py-4 transition-all cursor-pointer border-none shadow-md shadow-tertiary/10"
                  >
                    Launch payment portal <FiArrowRight className="h-4.5 w-4.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Payment Portal Overlay Modal */}
      {isGatewayOpen && (
        <div className="fixed inset-0 bg-dark/70 backdrop-blur-xs flex items-center justify-center z-[200]">
          <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative mx-4 animate-[fadeIn_0.2s_ease-out]">
            {/* Wallet Simulated Portal (bKash themed) */}
            {paymentMethod === "sandbox_wallet" && (
              <div className="bg-[#E2136E] text-white p-6 relative flex flex-col items-center select-none">
                <button
                  onClick={() => setIsGatewayOpen(false)}
                  className="absolute top-5 right-5 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border-none cursor-pointer"
                >
                  <FiX className="h-4 w-4" />
                </button>
                
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md mb-3">
                  <span className="text-3xl text-[#E2136E]">📱</span>
                </div>
                <h3 className="text-base font-black tracking-tight text-white mb-0">bKash Payment Gateway</h3>
                <p className="text-[10px] text-white/70 mt-1 font-semibold">Domain: {domain}</p>

                {gatewayStep === 1 && (
                  <form onSubmit={handleSandboxSubmitPhone} className="w-full mt-6 space-y-4">
                    <div>
                      <label className="block text-[9px] font-extrabold uppercase text-white/75 mb-1.5">Enter bKash Account Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 017XXXXXXXX"
                        value={gatewayPhone}
                        onChange={(e) => setGatewayPhone(e.target.value)}
                        className="w-full bg-white text-dark rounded-xl px-4 py-3 outline-none border-none text-sm text-center font-bold"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-white hover:bg-white/95 text-[#E2136E] font-black text-xs transition-colors border-none cursor-pointer"
                    >
                      Send Verification Code
                    </button>
                  </form>
                )}

                {gatewayStep === 2 && (
                  <form onSubmit={handleSandboxSubmitOtp} className="w-full mt-6 space-y-4">
                    <div>
                      <label className="block text-[9px] font-extrabold uppercase text-white/75 mb-1 text-center">Verification OTP Code</label>
                      <p className="text-[10px] text-white/70 text-center mb-2 font-semibold">Enter 123456 to bypass simulation</p>
                      <input
                        type="text"
                        required
                        placeholder="OTP Code"
                        maxLength={6}
                        value={gatewayOtp}
                        onChange={(e) => setGatewayOtp(e.target.value)}
                        className="w-full bg-white text-dark rounded-xl px-4 py-3 outline-none border-none text-sm text-center font-bold tracking-widest"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-white hover:bg-white/95 text-[#E2136E] font-black text-xs transition-colors border-none cursor-pointer"
                    >
                      Verify OTP Code
                    </button>
                  </form>
                )}

                {gatewayStep === 3 && (
                  <form onSubmit={handleSandboxSubmitPin} className="w-full mt-6 space-y-4">
                    <div>
                      <label className="block text-[9px] font-extrabold uppercase text-white/75 mb-1 text-center">Enter bKash PIN</label>
                      <p className="text-[10px] text-white/70 text-center mb-2 font-semibold">Amount to Charge: ৳{selectedPkg.price}</p>
                      <input
                        type="password"
                        required
                        maxLength={5}
                        placeholder="••••"
                        value={gatewayPin}
                        onChange={(e) => setGatewayPin(e.target.value)}
                        className="w-full bg-white text-dark rounded-xl px-4 py-3 outline-none border-none text-sm text-center font-bold tracking-widest"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-white hover:bg-white/95 text-[#E2136E] font-black text-xs transition-colors border-none cursor-pointer"
                    >
                      Confirm Payment of ৳{selectedPkg.price}
                    </button>
                  </form>
                )}

                {gatewayStep === 4 && (
                  <div className="w-full py-12 text-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto"></div>
                    <p className="text-xs font-bold text-white/90">Processing secure transaction...</p>
                  </div>
                )}

                <div className="w-full mt-6 border-t border-white/20 pt-3 flex items-center justify-between text-[8px] text-white/50 font-bold uppercase">
                  <span>SSL SECURE PAY</span>
                  <span>IPN AUTO SYNC</span>
                </div>
              </div>
            )}

            {/* Credit Card Simulated Portal (Stripe/Card themed) */}
            {paymentMethod === "sandbox_card" && (
              <div className="bg-slate-900 text-white p-6 relative flex flex-col select-none">
                <button
                  onClick={() => setIsGatewayOpen(false)}
                  className="absolute top-5 right-5 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border-none cursor-pointer"
                >
                  <FiX className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-5">
                  <div className="h-9 w-9 bg-tertiary rounded-xl flex items-center justify-center text-white">
                    <FiCreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Stripe Payment Gateway</h3>
                    <p className="text-[9px] text-white/40 mt-0.5">Secure Checkout for {domain}</p>
                  </div>
                </div>

                {gatewayStep === 1 && (
                  <form onSubmit={handleSandboxSubmitCard} className="space-y-4">
                    <div>
                      <label className="block text-[9px] font-extrabold uppercase text-white/45 mb-1.5">Card Number</label>
                      <input
                        type="text"
                        required
                        placeholder="4242 •••• •••• 4242"
                        value={cardData.number}
                        onChange={(e) => setCardData((prev) => ({ ...prev, number: e.target.value }))}
                        className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-3 outline-none text-sm font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-extrabold uppercase text-white/45 mb-1.5">Expiry Date</label>
                        <input
                          type="text"
                          required
                          placeholder="MM/YY"
                          value={cardData.expiry}
                          onChange={(e) => setCardData((prev) => ({ ...prev, expiry: e.target.value }))}
                          className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-3 outline-none text-sm font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-extrabold uppercase text-white/45 mb-1.5">CVC / CVV</label>
                        <input
                          type="password"
                          required
                          maxLength={3}
                          placeholder="•••"
                          value={cardData.cvc}
                          onChange={(e) => setCardData((prev) => ({ ...prev, cvc: e.target.value }))}
                          className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-3 outline-none text-sm font-bold"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-4 py-3 rounded-xl bg-tertiary hover:bg-tertiary-dark text-white font-black text-xs transition-colors border-none cursor-pointer shadow-md shadow-tertiary/10"
                    >
                      Authorize Payment of ৳{selectedPkg.price}
                    </button>
                  </form>
                )}

                {gatewayStep === 4 && (
                  <div className="py-12 text-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-tertiary mx-auto"></div>
                    <p className="text-xs font-bold text-white/60">Processing stripe authorization...</p>
                  </div>
                )}

                <div className="mt-6 border-t border-white/5 pt-3 flex items-center justify-between text-[8px] text-white/30 font-bold uppercase">
                  <span>SSL ENCRYPTED</span>
                  <span>CARD-SANDBOX-PORTAL</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-tertiary"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
