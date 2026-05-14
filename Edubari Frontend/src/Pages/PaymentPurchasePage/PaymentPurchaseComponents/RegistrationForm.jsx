import React, { useEffect, useState } from "react";
import { FiArrowRight, FiCheck, FiAlertCircle } from "react-icons/fi";

const API_URL = import.meta.env.VITE_SERVER || "http://localhost:3000";

const paymentMethods = [
  {
    id: "bkash",
    name: "bKash",
    color: "bg-[#E2136E]/10 border-[#E2136E]/30 text-[#E2136E]",
    activeColor: "bg-[#E2136E]/15 border-[#E2136E]/50 ring-2 ring-[#E2136E]/30",
    icon: "📱",
  },
  {
    id: "nagad",
    name: "Nagad",
    color: "bg-[#F6921E]/10 border-[#F6921E]/30 text-[#F6921E]",
    activeColor: "bg-[#F6921E]/15 border-[#F6921E]/50 ring-2 ring-[#F6921E]/30",
    icon: "📲",
  },
  {
    id: "bank",
    name: "Bank Transfer",
    color: "bg-tertiary/10 border-tertiary/30 text-tertiary",
    activeColor: "bg-tertiary/15 border-tertiary/50 ring-2 ring-tertiary/30",
    icon: "🏦",
  },
];

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

const RegistrationForm = ({ selectedPlan, preferredDomain = "" }) => {
  const [formData, setFormData] = useState({
    institutionName: "",
    fullName: "",
    email: "",
    phone: "",
    preferredDomain: preferredDomain,
    address: "",
    paymentMethod: "",
    transactionId: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [domainStatus, setDomainStatus] = useState("idle");
  const [domainCheckMessage, setDomainCheckMessage] = useState("");

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
      setDomainCheckMessage(
        "Type at least 3 characters to check availability.",
      );
      return;
    }

    if (domainsToCheck.length === 0) {
      setDomainStatus("idle");
      setDomainCheckMessage("Please enter a valid domain name.");
      return;
    }

    setDomainStatus("checking");
    setDomainCheckMessage(
      domainsToCheck.length === 1
        ? `Checking ${domainsToCheck[0]}...`
        : "Checking availability for common TLDs...",
    );
  };

  useEffect(() => {
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
          setDomainCheckMessage(`${availableDomain} is available.`);
          return;
        }

        setDomainStatus("taken");
        setDomainCheckMessage(
          domainsToCheck.length === 1
            ? `${domainsToCheck[0]} is already taken.`
            : "No available domains found for common TLDs.",
        );
      } catch {
        if (isCancelled) return;
        setDomainStatus("error");
        setDomainCheckMessage("Could not verify availability right now.");
      }
    }, 550);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [formData.preferredDomain]);

  const validate = () => {
    const newErrors = {};
    if (!formData.institutionName.trim())
      newErrors.institutionName = "Institution name is required";
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\d+\-() ]{7,15}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid phone number";
    }
    if (!formData.preferredDomain.trim()) {
      newErrors.preferredDomain = "Preferred domain is required";
    } else if (domainStatus === "checking") {
      newErrors.preferredDomain = "Please wait until domain check is complete";
    } else if (domainStatus === "taken") {
      newErrors.preferredDomain = "This domain is not available";
    } else if (domainStatus === "error") {
      newErrors.preferredDomain =
        "Could not verify domain right now. Please try again.";
    } else if (domainStatus !== "available") {
      newErrors.preferredDomain = "Please select an available domain";
    }
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.paymentMethod)
      newErrors.paymentMethod = "Please select a payment method";
    if (formData.paymentMethod && !formData.transactionId.trim())
      newErrors.transactionId = "Transaction ID is required";
    if (!formData.agreeTerms)
      newErrors.agreeTerms = "You must agree to the terms";
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
      const payload = {
        ...formData,
        selectedPlanId: selectedPlan?._id || null,
        selectedPlanName: selectedPlan?.name || "",
        selectedPlanDuration: selectedPlan?.duration || "",
        selectedPlanPrice: selectedPlan?.price || 0,
        submittedAt: new Date().toISOString(),
      };

      const response = await fetch(`${API_URL}/subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit subscription");
      }

      setIsSubmitted(true);
    } catch {
      setErrors((prev) => ({
        ...prev,
        submit: "Could not submit your request. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="rounded-[40px] border border-slate-100 bg-white p-12 text-center shadow-[0_30px_70px_rgba(0,0,0,0.05)]">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500 flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/20">
          <FiCheck className="h-10 w-10 text-white stroke-[3]" />
        </div>
        <h3 className="text-3xl font-black text-[#1E293B] tracking-tight mb-4">
          Order Confirmed! 🎉
        </h3>
        <p className="text-slate-500 font-medium text-base leading-relaxed max-w-md mx-auto mb-8">
          Thank you, <strong>{formData.fullName}</strong>! Your{" "}
          <strong>{selectedPlan?.name}</strong> plan order has been received.
          We'll reach out to you at <strong>{formData.email}</strong> within 24
          hours.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
          <FiCheck className="h-3.5 w-3.5" /> Payment Verification In
          Progress
        </div>
      </div>
    );
  }

  const inputBase =
    "w-full rounded-2xl border bg-slate-50 px-6 py-4 text-sm font-bold text-[#1E293B] placeholder:text-slate-400 outline-none transition-all duration-300 focus:ring-4 focus:ring-[#3B42F2]/5 focus:border-[#3B42F2] focus:bg-white";

  return (
    <div className="rounded-[40px] border border-slate-100 bg-white overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="bg-[#1E293B] px-8 py-6">
        <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest">
          <svg
            className="w-5 h-5 text-[#3B42F2]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Registration Details
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-8">
        {/* Institution Name */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
            Institution Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="institution-name"
            type="text"
            placeholder="e.g. Sunrise Coaching Center"
            className={`${inputBase} ${errors.institutionName ? "border-rose-400 ring-4 ring-rose-400/5 bg-rose-50/10" : "border-slate-100"}`}
            value={formData.institutionName}
            onChange={(e) => handleChange("institutionName", e.target.value)}
          />
          {errors.institutionName && (
            <p className="mt-2 text-xs text-rose-500 font-bold flex items-center gap-1.5">
              <FiAlertCircle className="h-3.5 w-3.5" /> {errors.institutionName}
            </p>
          )}
        </div>

        {/* Full Name & Email */}
        <div className="grid sm:grid-cols-2 gap-8">
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="full-name"
              type="text"
              placeholder="Your full name"
              className={`${inputBase} ${errors.fullName ? "border-rose-400 ring-4 ring-rose-400/5 bg-rose-50/10" : "border-slate-100"}`}
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
            />
            {errors.fullName && (
              <p className="mt-2 text-xs text-rose-500 font-bold flex items-center gap-1.5">
                <FiAlertCircle className="h-3.5 w-3.5" /> {errors.fullName}
              </p>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
              Email <span className="text-rose-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className={`${inputBase} ${errors.email ? "border-rose-400 ring-4 ring-rose-400/5 bg-rose-50/10" : "border-slate-100"}`}
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            {errors.email && (
              <p className="mt-2 text-xs text-rose-500 font-bold flex items-center gap-1.5">
                <FiAlertCircle className="h-3.5 w-3.5" /> {errors.email}
              </p>
            )}
          </div>
        </div>

        {/* Phone & Address */}
        <div className="grid sm:grid-cols-2 gap-8">
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
              Phone <span className="text-rose-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+880 1XXX-XXXXXX"
              className={`${inputBase} ${errors.phone ? "border-rose-400 ring-4 ring-rose-400/5 bg-rose-50/10" : "border-slate-100"}`}
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
            {errors.phone && (
              <p className="mt-2 text-xs text-rose-500 font-bold flex items-center gap-1.5">
                <FiAlertCircle className="h-3.5 w-3.5" /> {errors.phone}
              </p>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
              Address / City <span className="text-rose-500">*</span>
            </label>
            <input
              id="address"
              type="text"
              placeholder="City, District"
              className={`${inputBase} ${errors.address ? "border-rose-400 ring-4 ring-rose-400/5 bg-rose-50/10" : "border-slate-100"}`}
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
            {errors.address && (
              <p className="mt-2 text-xs text-rose-500 font-bold flex items-center gap-1.5">
                <FiAlertCircle className="h-3.5 w-3.5" /> {errors.address}
              </p>
            )}
          </div>
        </div>

        {/* Preferred Domain */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
            Preferred Domain <span className="text-rose-500">*</span>
          </label>
          <input
            id="preferred-domain"
            type="text"
            placeholder="e.g. sunrise-coaching or sunrise-coaching.com"
            className={`${inputBase} ${errors.preferredDomain ? "border-rose-400 ring-4 ring-rose-400/5 bg-rose-50/10" : "border-slate-100"}`}
            value={formData.preferredDomain}
            onChange={(e) => handlePreferredDomainChange(e.target.value)}
          />
          {formData.preferredDomain.trim() && !errors.preferredDomain && (
            <p
              className={`mt-2 text-xs font-bold flex items-center gap-1.5 ${domainStatus === "available"
                ? "text-emerald-500"
                : domainStatus === "taken"
                  ? "text-rose-500"
                  : domainStatus === "checking"
                    ? "text-amber-500"
                    : "text-slate-400"
                }`}
            >
              {domainStatus === "available" && (
                <FiCheck className="h-4 w-4" />
              )}
              {domainStatus === "taken" && (
                <FiAlertCircle className="h-4 w-4" />
              )}
              {domainStatus === "checking" && (
                <svg
                  className="h-4 w-4 animate-spin"
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
              )}
              <span>{domainCheckMessage}</span>
            </p>
          )}
          {errors.preferredDomain && (
            <p className="mt-2 text-xs text-rose-500 font-bold flex items-center gap-1.5">
              <FiAlertCircle className="h-3.5 w-3.5" /> {errors.preferredDomain}
            </p>
          )}
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 mb-4 uppercase tracking-widest">
            Payment Method <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-4">
            {paymentMethods.map((method) => {
              const isActive = formData.paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => handleChange("paymentMethod", method.id)}
                  className={`relative flex flex-col items-center gap-3 px-4 py-6 rounded-2xl border-2 text-center transition-all duration-300 cursor-pointer hover:-translate-y-1 ${isActive ? "border-[#3B42F2] bg-blue-50/50 shadow-lg shadow-[#3B42F2]/5" : "border-slate-100 bg-slate-50/50"
                    }`}
                >
                  <span className="text-2xl">{method.icon}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? "text-[#3B42F2]" : "text-slate-500"}`}>{method.name}</span>
                  {isActive && (
                    <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-[#3B42F2] flex items-center justify-center shadow-lg shadow-[#3B42F2]/20">
                      <FiCheck className="h-3 w-3 text-white stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {errors.paymentMethod && (
            <p className="mt-2 text-xs text-rose-500 font-bold flex items-center gap-1.5">
              <FiAlertCircle className="h-3.5 w-3.5" /> {errors.paymentMethod}
            </p>
          )}
        </div>

        {/* Transaction ID — only show after payment method selected */}
        {formData.paymentMethod && (
          <div className="animate-[fadeInUp_0.3s_ease-out] p-6 rounded-3xl bg-blue-50/30 border border-blue-100/50">
            <label className="block text-[10px] font-black text-[#3B42F2] mb-3 uppercase tracking-widest">
              Transaction ID <span className="text-rose-500">*</span>
            </label>
            <input
              id="transaction-id"
              type="text"
              placeholder={`Enter your ${paymentMethods.find((m) => m.id === formData.paymentMethod)?.name} Transaction ID`}
              className={`${inputBase} ${errors.transactionId ? "border-rose-400 ring-4 ring-rose-400/5" : "border-blue-100"}`}
              value={formData.transactionId}
              onChange={(e) => handleChange("transactionId", e.target.value)}
            />
            {errors.transactionId && (
              <p className="mt-2 text-xs text-rose-500 font-bold flex items-center gap-1.5">
                <FiAlertCircle className="h-3.5 w-3.5" /> {errors.transactionId}
              </p>
            )}
            <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
              Send{" "}
              <strong className="text-[#3B42F2]">
                {selectedPlan?.priceLabel || "the total amount"}
              </strong>{" "}
              to our{" "}
              <strong className="text-[#3B42F2]">
                {
                  paymentMethods.find((m) => m.id === formData.paymentMethod)
                    ?.name
                }
              </strong>{" "}
              number <strong className="text-[#1E293B]">01XXXXXXXXX</strong> and
              enter the Transaction ID above.
            </p>
          </div>
        )}

        {/* Terms & Conditions */}
        <div className="flex items-start gap-4 pt-2">
          <button
            type="button"
            onClick={() => handleChange("agreeTerms", !formData.agreeTerms)}
            className={`mt-0.5 shrink-0 h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 cursor-pointer ${formData.agreeTerms
              ? "bg-[#3B42F2] border-[#3B42F2] shadow-lg shadow-[#3B42F2]/20"
              : errors.agreeTerms
                ? "border-rose-400"
                : "border-slate-200 hover:border-[#3B42F2]/50"
              }`}
          >
            {formData.agreeTerms && (
              <FiCheck className="h-3.5 w-3.5 text-white stroke-[3]" />
            )}
          </button>
          <p className="text-xs font-bold text-slate-500 leading-relaxed">
            I agree to the{" "}
            <a
              href="/terms"
              className="text-[#3B42F2] hover:underline"
            >
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="text-[#3B42F2] hover:underline"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
        {errors.agreeTerms && (
          <p className="text-xs text-rose-500 font-bold flex items-center gap-1.5 -mt-4">
            <FiAlertCircle className="h-3.5 w-3.5" /> {errors.agreeTerms}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            isSubmitting ||
            !selectedPlan ||
            (formData.preferredDomain.trim() && domainStatus !== "available")
          }
          className={`w-full rounded-[20px] py-6 text-xs font-black uppercase tracking-widest transition-all duration-500 hover:-translate-y-1 ${selectedPlan
            ? "bg-[#3B42F2] text-white shadow-xl shadow-[#3B42F2]/20 hover:bg-blue-600 cursor-pointer"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
            } ${isSubmitting ? "opacity-75 pointer-events-none" : ""}`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-3">
              <svg
                className="animate-spin h-4 w-4"
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
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <span>Confirm Order</span>
              <FiArrowRight className="h-4 w-4" />
            </div>
          )}
        </button>

        {errors.submit && (
          <p className="text-xs text-rose-500 font-bold flex items-center gap-1.5 justify-center">
            <FiAlertCircle className="h-3.5 w-3.5" /> {errors.submit}
          </p>
        )}
      </form>
    </div>
  );
};

export default RegistrationForm;
