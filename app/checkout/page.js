"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FiCheck,
  FiArrowLeft,
  FiArrowRight,
  FiShield,
  FiInfo,
  FiAlertCircle,
  FiPackage,
  FiCheckCircle
} from "react-icons/fi";

const HARDCODED_GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbw1mIEzNBLv6YLZpYwhewI5S7MITs1a8BYqId3QQhk30rn6VAN5sbYc8zOZ3cctoiJu/exec";

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

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const safeRedirectUrl = (() => {
    try {
      if (redirectUrl.startsWith("/")) return redirectUrl;
      const parsed = new URL(redirectUrl);
      if (parsed.hostname === domain || parsed.hostname.endsWith("." + domain) || domain === "localhost" || parsed.hostname === "localhost" || domain.includes("localhost")) {
        return redirectUrl;
      }
    } catch (e) {}
    return domain.includes("localhost") || domain === "localhost"
      ? `http://${domain}/admin/ai-board`
      : `https://${domain}/admin/ai-board`;
  })();

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
        const matched = data.find((p) => p.id === packageId);
        if (matched) {
          setSelectedPkg(matched);
        } else if (data.length > 0) {
          setSelectedPkg(data[0]);
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

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.email.trim()) newErrors.email = "Email address is required";
    return newErrors;
  };

  // Submit Order Form (Direct Order - No Payment)
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    const valErrors = validate();
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        institutionName: domain,
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        preferredDomain: domain,
        address: formData.address || "N/A",
        paymentMethod: "Direct Order (No Payment)",
        transactionId: "N/A",
        selectedPlanId: selectedPkg.id,
        selectedPlanName: selectedPkg.name,
        selectedPlanDuration: `${selectedPkg.validityDays || 30} Days (${selectedPkg.credits || 0} AI Credits)`,
        selectedPlanPrice: Number(selectedPkg.price || 0),
        submittedAt: new Date().toISOString(),
      };

      // 1. Submit to Subscriptions API (which saves & posts to Google Sheets)
      fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(err => console.warn("Subscriptions post:", err));

      // 2. Direct client-side push to Google Sheets Web App
      const sheetUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_WEBAPP_URL || HARDCODED_GOOGLE_SHEET_URL;
      fetch(sheetUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      }).catch(err => console.warn("Google sheet client post:", err));

      setIsSuccess(true);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !selectedPkg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-primary-light/30 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tertiary mx-auto mb-4"></div>
          <p className="text-dark/50 font-semibold text-sm">Initializing order session...</p>
        </div>
      </div>
    );
  }

  const inputBase =
    "w-full rounded-xl border bg-white/70 backdrop-blur-sm px-4 py-3 text-sm font-medium text-dark placeholder:text-dark/35 outline-none transition-all duration-300 focus:ring-2 focus:ring-tertiary/30 focus:border-tertiary/50 focus:bg-white";

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-primary-light/20 to-white py-16 px-4 flex items-center justify-center">
        <div className="w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 border border-dark/10 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <FiCheckCircle className="h-10 w-10 text-green-600 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-dark tracking-tight">Order Confirmed! 🎉</h2>
            <p className="text-xs sm:text-sm text-dark/60 font-medium mt-2 leading-relaxed">
              ধন্যবাদ <strong>{formData.name}</strong>! আপনার <strong>{selectedPkg.name}</strong> প্ল্যানের অর্ডারটি সফলতা সহকারে সাবমিট করা হয়েছে। 
              আমাদের টিম খুব দ্রুত আপনার ডোমেইন <code>{domain}</code> এক্টিভেশন সংক্রান্ত বিষয় নিয়ে যোগাযোগ করবে।
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-2xl border border-green-200 text-green-700 text-xs font-bold">
            ✓ Order recorded and synced to system
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.href = safeRedirectUrl}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-tertiary text-white font-extrabold text-xs uppercase tracking-wider hover:bg-tertiary-dark transition-all cursor-pointer border-none shadow-md"
            >
              Return to LMS
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 text-dark font-extrabold text-xs uppercase tracking-wider hover:bg-slate-200 transition-all cursor-pointer border-none"
            >
              Go to Home Page
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          {/* Package details overview (5cols) */}
          <div className="md:col-span-5 bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-dark/10 shadow-sm space-y-6">
            <div>
              <span className="px-2.5 py-1 bg-tertiary/10 text-tertiary text-3xs font-extrabold uppercase tracking-wider rounded-full">
                Selected AI Credits Package
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
            </div>

            <div className="flex gap-2.5 items-center bg-blue-50/50 p-3.5 rounded-xl border border-blue-200 text-blue-600 text-3xs font-bold leading-5">
              <FiShield className="h-4.5 w-4.5 shrink-0" />
              This single pool of credits is shared by all teachers under your domain for generating slides and mock exams.
            </div>
          </div>

          {/* Direct Order Form (No Payment Required) (7cols) */}
          <div className="md:col-span-7 bg-white/80 backdrop-blur-md rounded-3xl border border-dark/10 shadow-sm overflow-hidden">
            <div className="bg-linear-to-r from-tertiary to-[#8B5CF6] px-6 py-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 m-0">
                <FiPackage className="h-4 w-4" /> Order Details Form (পেমেন্ট লাগবে না)
              </h3>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-dark/50 mb-1">
                    Full Name (আপনার নাম) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Professor Arian Kabir"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`${inputBase} ${errors.name ? "border-red-400" : "border-dark/10"}`}
                  />
                  {errors.name && <p className="text-3xs text-red-500 font-bold mt-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-dark/50 mb-1">
                      Phone Number (মোবাইল নম্বর) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="017XXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className={`${inputBase} ${errors.phone ? "border-red-400" : "border-dark/10"}`}
                    />
                    {errors.phone && <p className="text-3xs text-red-500 font-bold mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-dark/50 mb-1">
                      Email (ইমেইল ঠিকানা) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`${inputBase} ${errors.email ? "border-red-400" : "border-dark/10"}`}
                    />
                    {errors.email && <p className="text-3xs text-red-500 font-bold mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-dark/50 mb-1">
                    Address / District (ঠিকানা)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dhaka, Bangladesh"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className={`${inputBase} border-dark/10`}
                  />
                </div>

                <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 text-xs text-blue-700 leading-relaxed flex items-center gap-2 font-medium">
                  <FiInfo className="h-4 w-4 shrink-0 text-blue-500" />
                  অর্ডার কনফার্ম করার জন্য কোনো পেমেন্ট লাগবে না। অর্ডার সাবমিট করলে আমাদের টিম সরাসরি আপনার সাথে যোগাযোগ করবে।
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-tertiary to-[#8B5CF6] hover:shadow-lg text-white font-bold text-sm py-4 transition-all cursor-pointer border-none shadow-md shadow-tertiary/20"
                >
                  {submitting ? "Submitting order..." : "Confirm Order (অর্ডার নিশ্চিত করুন)"} <FiArrowRight className="h-4.5 w-4.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
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
