"use client";

import React, { useEffect, useState } from "react";
import {
  FiArrowRight,
  FiCheck,
  FiAlertCircle,
  FiX,
  FiPackage,
  FiGlobe,
  FiPhone,
  FiMail,
  FiUser,
  FiMapPin,
  FiShield,
  FiBookOpen,
  FiLock,
  FiLayers,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const COMMON_TLDS = [
  ".com",
  ".net",
  ".org",
  ".edu.bd",
  ".academy",
  ".institute",
  ".io",
];

const normalizeDomainInput = (value) => {
  const raw = value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");

  return raw.replace(/[^a-z0-9-.]/g, "");
};

const getDomainsToCheck = (value) => {
  const cleanTerm = normalizeDomainInput(value);
  if (!cleanTerm) return [];
  if (cleanTerm.includes(".")) return [cleanTerm];
  return COMMON_TLDS.map((tld) => `${cleanTerm}${tld}`);
};

const RegistrationForm = ({
  selectedPlan,
  preferredDomain = "",
  institutionName = "",
  isExisting = false,
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    institutionName: institutionName,
    fullName: "",
    email: "",
    phone: "",
    preferredDomain: preferredDomain,
    address: "",
    agreeTerms: true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [domainStatus, setDomainStatus] = useState("idle");
  const [domainCheckMessage, setDomainCheckMessage] = useState("");

  // Sync preferred domain prop if it changes
  useEffect(() => {
    if (preferredDomain) {
      setFormData((prev) => ({ ...prev, preferredDomain }));
      handlePreferredDomainChange(preferredDomain);
    }
  }, [preferredDomain]);

  // Sync institution name prop if it changes
  useEffect(() => {
    if (institutionName) {
      setFormData((prev) => ({ ...prev, institutionName }));
    }
  }, [institutionName]);

  const handlePreferredDomainChange = (rawValue) => {
    const sanitizedValue = normalizeDomainInput(rawValue);
    handleChange("preferredDomain", sanitizedValue);

    const domainsToCheck = getDomainsToCheck(sanitizedValue);

    if (!sanitizedValue) {
      setDomainStatus("idle");
      setDomainCheckMessage("");
      return;
    }

    if (sanitizedValue.length < 3) {
      setDomainStatus("idle");
      setDomainCheckMessage("কমপক্ষে ৩টি অক্ষর লিখুন");
      return;
    }

    if (domainsToCheck.length === 0) {
      setDomainStatus("idle");
      setDomainCheckMessage("সঠিক ডোমেন নাম লিখুন");
      return;
    }

    setDomainStatus("checking");
    setDomainCheckMessage(
      domainsToCheck.length === 1
        ? `${domainsToCheck[0]} যাচাই করা হচ্ছে...`
        : "ডোমেন যাচাই করা হচ্ছে...",
    );
  };

  useEffect(() => {
    if (isExisting && formData.preferredDomain) {
      setDomainStatus("available");
      setDomainCheckMessage("বর্তমান সক্রিয় ডোমেন");
      return;
    }

    const value = formData.preferredDomain;
    if (!value || value.length < 3) {
      return;
    }

    const domainsToCheck = getDomainsToCheck(value);
    if (domainsToCheck.length === 0) {
      return;
    }
    let isCancelled = false;

    const timeoutId = setTimeout(async () => {
      try {
        const checks = domainsToCheck.map(async (domain) => {
          try {
            const res = await fetch(
              `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=ANY`,
            );
            if (!res.ok) return { domain, available: false };
            const data = await res.json();
            return { domain, available: data.Status === 3 };
          } catch {
            return { domain, available: false };
          }
        });

        const results = await Promise.all(checks);
        if (isCancelled) return;

        const availableDomain = results.find((item) => item.available)?.domain;

        if (availableDomain) {
          setDomainStatus("available");
          setDomainCheckMessage(`${availableDomain} পাওয়া গেছে`);
          return;
        }

        setDomainStatus("taken");
        setDomainCheckMessage(
          domainsToCheck.length === 1
            ? `${domainsToCheck[0]} ইতিমধ্যে ব্যবহৃত হচ্ছে`
            : "এই ডোমেন ইতিমধ্যে ব্যবহৃত হচ্ছে",
        );
      } catch {
        if (isCancelled) return;
        setDomainStatus("idle");
        setDomainCheckMessage("ডোমেন যাচাই সম্পন্ন হয়নি");
      }
    }, 600);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [formData.preferredDomain]);

  const validate = () => {
    const newErrors = {};
    if (!formData.institutionName.trim())
      newErrors.institutionName = "প্রতিষ্ঠানের নাম আবশ্যক";
    if (!formData.fullName.trim())
      newErrors.fullName = "পূর্ণ নাম আবশ্যক";
    if (!formData.email.trim()) {
      newErrors.email = "ইমেইল অ্যাড্রেস আবশ্যক";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "সঠিক ইমেইল ফরম্যাট দিন";
    }
    if (!formData.phone.trim())
      newErrors.phone = "ফোন নম্বর আবশ্যক";
    if (!formData.preferredDomain.trim())
      newErrors.preferredDomain = "ডোমেন নাম আবশ্যক";
    if (!formData.address.trim())
      newErrors.address = "ঠিকানা আবশ্যক";
    if (!formData.agreeTerms)
      newErrors.agreeTerms = "শর্তাবলীতে সম্মতি দিন";
    return newErrors;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.submit;
      return copy;
    });

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const planId = selectedPlan?.id || selectedPlan?._id || null;
      const payload = {
        institutionName: formData.institutionName,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        preferredDomain: formData.preferredDomain,
        address: formData.address,
        paymentMethod: "Direct Order (No Advance Payment)",
        transactionId: "N/A",
        selectedPlanId: planId,
        selectedPlanName: selectedPlan?.name || "",
        selectedPlanDuration: selectedPlan?.duration || "",
        selectedPlanPrice: Number(selectedPlan?.price || 0),
        submittedAt: new Date().toISOString(),
      };

      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit subscription");
      }

      const sheetUrl =
        process.env.NEXT_PUBLIC_GOOGLE_SHEET_WEBAPP_URL ||
        "https://script.google.com/macros/s/AKfycbw1mIEzNBLv6YLZpYwhewI5S7MITs1a8BYqId3QQhk30rn6VAN5sbYc8zOZ3cctoiJu/exec";
      if (sheetUrl && sheetUrl.startsWith("http")) {
        try {
          const formDataEncoded = new URLSearchParams();
          Object.entries(payload).forEach(([key, value]) => {
            formDataEncoded.append(key, value);
          });
          formDataEncoded.append("data", JSON.stringify(payload));

          await fetch(sheetUrl, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formDataEncoded.toString(),
          });
        } catch (clientSheetErr) {
          console.warn("Client Google Sheet post note:", clientSheetErr);
        }
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error("Submission error:", err);
      setErrors((prev) => ({
        ...prev,
        submit: "অর্ডার সাবমিট করতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Confirmation Success View (Minimal, clean, no emojis)
  if (isSubmitted) {
    const whatsappMsg = encodeURIComponent(
      `Hello EduBari, I have placed an order for "${formData.institutionName}" (${selectedPlan?.name || "School ERP"}). Phone: ${formData.phone}`,
    );

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
        <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <FiCheck className="h-8 w-8 text-slate-900 stroke-[2.5]" />
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            অর্ডার গৃহীত হয়েছে
          </h3>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            ধন্যবাদ, <strong>{formData.fullName}</strong>। আপনার প্রতিষ্ঠানের (
            <strong>{formData.institutionName}</strong>) অর্ডার রেকর্ড করা হয়েছে। আমাদের প্রতিনিধি দ্রুত আপনার সাথে যোগাযোগ করবেন।
          </p>

          <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200 p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">প্যাকেজ:</span>
              <span className="font-bold text-slate-900">{selectedPlan?.name} Plan</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">ডোমেন:</span>
              <span className="font-bold text-slate-900">{formData.preferredDomain}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">ফোন নম্বর:</span>
              <span className="font-bold text-slate-900">{formData.phone}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <a
              href={`https://wa.me/8801754958008?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors"
            >
              <FaWhatsapp className="w-4 h-4" />
              হোয়াটসঅ্যাপে যোগাযোগ
            </a>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  const inputBase =
    "w-full rounded-xl border border-slate-200 bg-white hover:border-slate-300 focus:border-slate-900 pl-10 pr-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-colors";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        
        {/* Clean Minimal Header (No extra colors, no gradients) */}
        <div className="shrink-0 bg-white px-6 sm:px-8 py-5 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
              <FiPackage className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Complete Institution Order Form
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                কোনো অগ্রিম ফি ছাড়া প্রতিষ্ঠানের অর্ডার সম্পন্ন করুন
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-4">

            {/* Selected Package Card (Clean, neutral styling) */}
            {selectedPlan && (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
                      <FiLayers className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Selected Package
                      </span>
                      <h4 className="text-base font-bold text-slate-900">
                        {selectedPlan.name} Plan
                      </h4>
                    </div>
                  </div>

                  <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                    <span className="text-xl sm:text-2xl font-black text-slate-900">
                      ৳{Number(selectedPlan.price || 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {selectedPlan.duration || "Monthly"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Form Inputs Grid */}
            <div className="space-y-4">
              
              {/* Institution Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Institution Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiBookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="institution-name"
                    type="text"
                    placeholder="e.g. Sunrise School & College"
                    className={`${inputBase} ${
                      errors.institutionName ? "border-red-400 bg-red-50/20" : ""
                    }`}
                    value={formData.institutionName}
                    onChange={(e) => handleChange("institutionName", e.target.value)}
                  />
                </div>
                {errors.institutionName && (
                  <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                    <FiAlertCircle className="h-3.5 w-3.5" /> {errors.institutionName}
                  </p>
                )}
              </div>

              {/* Full Name & Email */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="full-name"
                      type="text"
                      placeholder="Your full name"
                      className={`${inputBase} ${
                        errors.fullName ? "border-red-400 bg-red-50/20" : ""
                      }`}
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                      <FiAlertCircle className="h-3.5 w-3.5" /> {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className={`${inputBase} ${
                        errors.email ? "border-red-400 bg-red-50/20" : ""
                      }`}
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                      <FiAlertCircle className="h-3.5 w-3.5" /> {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone & Address */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="phone"
                      type="tel"
                      placeholder="+880 1XXX-XXXXXX"
                      className={`${inputBase} ${
                        errors.phone ? "border-red-400 bg-red-50/20" : ""
                      }`}
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                      <FiAlertCircle className="h-3.5 w-3.5" /> {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Address / City <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="address"
                      type="text"
                      placeholder="City, District"
                      className={`${inputBase} ${
                        errors.address ? "border-red-400 bg-red-50/20" : ""
                      }`}
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                      <FiAlertCircle className="h-3.5 w-3.5" /> {errors.address}
                    </p>
                  )}
                </div>
              </div>

              {/* Preferred Domain Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  {isExisting ? "Your Domain (Existing)" : "Preferred Domain"}{" "}
                  <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <FiGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="preferred-domain"
                    type="text"
                    readOnly={isExisting}
                    placeholder="e.g. sunrise-school or sunrise-school.com"
                    className={`${inputBase} ${
                      errors.preferredDomain ? "border-red-400 bg-red-50/20" : ""
                    } ${isExisting ? "bg-slate-100 text-slate-500 cursor-not-allowed" : ""}`}
                    value={formData.preferredDomain}
                    onChange={(e) => handlePreferredDomainChange(e.target.value)}
                  />
                </div>

                {formData.preferredDomain.trim() && !errors.preferredDomain && (
                  <div className="mt-2 text-xs font-medium text-slate-600 flex items-center gap-1.5">
                    {domainStatus === "available" && (
                      <span className="text-slate-800 font-semibold flex items-center gap-1">
                        <FiCheck className="w-3.5 h-3.5 text-slate-900" />
                        {domainCheckMessage}
                      </span>
                    )}
                    {domainStatus === "taken" && (
                      <span className="text-red-600 font-semibold flex items-center gap-1">
                        <FiAlertCircle className="w-3.5 h-3.5" />
                        {domainCheckMessage}
                      </span>
                    )}
                    {domainStatus === "checking" && (
                      <span className="text-slate-500 flex items-center gap-1">
                        <svg
                          className="h-3.5 w-3.5 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        {domainCheckMessage}
                      </span>
                    )}
                  </div>
                )}

                {errors.preferredDomain && (
                  <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                    <FiAlertCircle className="h-3.5 w-3.5" /> {errors.preferredDomain}
                  </p>
                )}
              </div>
            </div>

            {/* Clean Notice Box */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex items-start gap-3">
              <FiShield className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                অর্ডার কনফার্ম করার জন্য কোনো পেমেন্ট লাগবে না। অর্ডার সাবমিট করলে আমাদের টিম সরাসরি আপনার সাথে যোগাযোগ করবে।
              </p>
            </div>

            {/* Terms & Conditions Agreement */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleChange("agreeTerms", !formData.agreeTerms)}
                className={`shrink-0 h-4.5 w-4.5 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                  formData.agreeTerms
                    ? "bg-slate-900 border-slate-900"
                    : errors.agreeTerms
                      ? "border-red-400 bg-red-50"
                      : "border-slate-300 bg-white"
                }`}
              >
                {formData.agreeTerms && (
                  <FiCheck className="h-3 w-3 text-white stroke-[3]" />
                )}
              </button>
              <label 
                onClick={() => handleChange("agreeTerms", !formData.agreeTerms)}
                className="text-xs text-slate-600 font-medium cursor-pointer select-none"
              >
                I agree to the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                  className="text-slate-900 font-semibold hover:underline"
                >
                  Terms & Conditions
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                  className="text-slate-900 font-semibold hover:underline"
                >
                  Privacy Policy
                </a>
                .
              </label>
            </div>
            {errors.agreeTerms && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1 -mt-2">
                <FiAlertCircle className="h-3 w-3" /> {errors.agreeTerms}
              </p>
            )}

            {/* Submit Action Button (Clean solid button) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !selectedPlan ||
                  (formData.preferredDomain.trim() && domainStatus === "taken")
                }
                className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-colors cursor-pointer border-none ${
                  selectedPlan
                    ? "bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                } ${isSubmitting ? "opacity-75 pointer-events-none" : ""}`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Submitting Order...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Order (অর্ডার নিশ্চিত করুন)</span>
                    <FiArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
                <FiLock className="w-3.5 h-3.5" />
                <span>আপনার তথ্য সম্পূর্ণ নিরাপদ ও সুরক্ষিত</span>
              </div>
            </div>

            {errors.submit && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1 justify-center p-3 rounded-xl bg-red-50 border border-red-200">
                <FiAlertCircle className="h-4 w-4 shrink-0" /> {errors.submit}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
