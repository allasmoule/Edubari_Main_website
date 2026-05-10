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
      <div className="rounded-3xl border border-white/30 bg-white/60 backdrop-blur-sm p-8 sm:p-10 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-linear-to-r from-green-400 to-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-green-500/25">
          <FiCheck className="h-10 w-10 text-white stroke-[2.5]" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-dark tracking-tight">
          Order Confirmed! 🎉
        </h3>
        <p className="mt-4 text-sm sm:text-[15px] text-dark/60 leading-7 max-w-md mx-auto">
          Thank you, <strong>{formData.fullName}</strong>! Your{" "}
          <strong>{selectedPlan?.name}</strong> plan order has been received.
          We'll reach out to you at <strong>{formData.email}</strong> within 24
          hours.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-green-50 text-green-600 text-xs font-bold border border-green-200">
          <FiCheck className="h-3.5 w-3.5 stroke-3" /> Payment Verification In
          Progress
        </div>
      </div>
    );
  }

  const inputBase =
    "w-full rounded-xl border bg-white/70 backdrop-blur-sm px-4 py-3 text-sm font-medium text-dark placeholder:text-dark/35 outline-none transition-all duration-300 focus:ring-2 focus:ring-tertiary/30 focus:border-tertiary/50 focus:bg-white";

  return (
    <div className="rounded-3xl border border-white/30 bg-white/60 backdrop-blur-sm overflow-hidden shadow-lg shadow-dark/5">
      {/* Header */}
      <div className="bg-linear-to-r from-secondary to-secondary-light px-6 py-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <svg
            className="w-5 h-5"
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

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Institution Name */}
        <div>
          <label className="block text-xs font-bold text-dark/60 mb-1.5 uppercase tracking-wider">
            Institution Name <span className="text-red-400">*</span>
          </label>
          <input
            id="institution-name"
            type="text"
            placeholder="e.g. Sunrise Coaching Center"
            className={`${inputBase} ${errors.institutionName ? "border-red-400 ring-2 ring-red-400/20" : "border-dark/10"}`}
            value={formData.institutionName}
            onChange={(e) => handleChange("institutionName", e.target.value)}
          />
          {errors.institutionName && (
            <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
              <FiAlertCircle className="h-3 w-3" /> {errors.institutionName}
            </p>
          )}
        </div>

        {/* Full Name & Email */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-dark/60 mb-1.5 uppercase tracking-wider">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              id="full-name"
              type="text"
              placeholder="Your full name"
              className={`${inputBase} ${errors.fullName ? "border-red-400 ring-2 ring-red-400/20" : "border-dark/10"}`}
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
            />
            {errors.fullName && (
              <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                <FiAlertCircle className="h-3 w-3" /> {errors.fullName}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-dark/60 mb-1.5 uppercase tracking-wider">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className={`${inputBase} ${errors.email ? "border-red-400 ring-2 ring-red-400/20" : "border-dark/10"}`}
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                <FiAlertCircle className="h-3 w-3" /> {errors.email}
              </p>
            )}
          </div>
        </div>

        {/* Phone & Address */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-dark/60 mb-1.5 uppercase tracking-wider">
              Phone <span className="text-red-400">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+880 1XXX-XXXXXX"
              className={`${inputBase} ${errors.phone ? "border-red-400 ring-2 ring-red-400/20" : "border-dark/10"}`}
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
            {errors.phone && (
              <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                <FiAlertCircle className="h-3 w-3" /> {errors.phone}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-dark/60 mb-1.5 uppercase tracking-wider">
              Address / City <span className="text-red-400">*</span>
            </label>
            <input
              id="address"
              type="text"
              placeholder="City, District"
              className={`${inputBase} ${errors.address ? "border-red-400 ring-2 ring-red-400/20" : "border-dark/10"}`}
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
            {errors.address && (
              <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                <FiAlertCircle className="h-3 w-3" /> {errors.address}
              </p>
            )}
          </div>
        </div>

        {/* Preferred Domain */}
        <div>
          <label className="block text-xs font-bold text-dark/60 mb-1.5 uppercase tracking-wider">
            Preferred Domain <span className="text-red-400">*</span>
          </label>
          <input
            id="preferred-domain"
            type="text"
            placeholder="e.g. sunrise-coaching or sunrise-coaching.com"
            className={`${inputBase} ${errors.preferredDomain ? "border-red-400 ring-2 ring-red-400/20" : "border-dark/10"}`}
            value={formData.preferredDomain}
            onChange={(e) => handlePreferredDomainChange(e.target.value)}
          />
          {formData.preferredDomain.trim() && !errors.preferredDomain && (
            <p
              className={`mt-1.5 text-xs font-medium flex items-center gap-1 ${
                domainStatus === "available"
                  ? "text-green-600"
                  : domainStatus === "taken"
                    ? "text-red-500"
                    : domainStatus === "checking"
                      ? "text-amber-600"
                      : "text-dark/50"
              }`}
            >
              {domainStatus === "available" && (
                <FiCheck className="h-3.5 w-3.5" />
              )}
              {domainStatus === "taken" && (
                <FiAlertCircle className="h-3.5 w-3.5" />
              )}
              {domainStatus === "checking" && (
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
              )}
              <span>{domainCheckMessage}</span>
            </p>
          )}
          {errors.preferredDomain && (
            <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
              <FiAlertCircle className="h-3 w-3" /> {errors.preferredDomain}
            </p>
          )}
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-xs font-bold text-dark/60 mb-2.5 uppercase tracking-wider">
            Payment Method <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {paymentMethods.map((method) => {
              const isActive = formData.paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => handleChange("paymentMethod", method.id)}
                  className={`relative flex flex-col items-center gap-1.5 px-3 py-4 rounded-xl border text-center transition-all duration-300 cursor-pointer hover:-translate-y-0.5 ${
                    isActive ? method.activeColor : method.color
                  }`}
                >
                  <span className="text-xl">{method.icon}</span>
                  <span className="text-xs font-bold">{method.name}</span>
                  {isActive && (
                    <div className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-tertiary flex items-center justify-center">
                      <FiCheck className="h-3 w-3 text-white stroke-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {errors.paymentMethod && (
            <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
              <FiAlertCircle className="h-3 w-3" /> {errors.paymentMethod}
            </p>
          )}
        </div>

        {/* Transaction ID — only show after payment method selected */}
        {formData.paymentMethod && (
          <div className="animate-[fadeInUp_0.3s_ease-out]">
            <label className="block text-xs font-bold text-dark/60 mb-1.5 uppercase tracking-wider">
              Transaction ID <span className="text-red-400">*</span>
            </label>
            <input
              id="transaction-id"
              type="text"
              placeholder={`Enter your ${paymentMethods.find((m) => m.id === formData.paymentMethod)?.name} Transaction ID`}
              className={`${inputBase} ${errors.transactionId ? "border-red-400 ring-2 ring-red-400/20" : "border-dark/10"}`}
              value={formData.transactionId}
              onChange={(e) => handleChange("transactionId", e.target.value)}
            />
            {errors.transactionId && (
              <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                <FiAlertCircle className="h-3 w-3" /> {errors.transactionId}
              </p>
            )}
            <p className="mt-2 text-xs text-dark/40 leading-5">
              Send{" "}
              <strong className="text-tertiary">
                {selectedPlan?.priceLabel || "the total amount"}
              </strong>{" "}
              to our{" "}
              <strong>
                {
                  paymentMethods.find((m) => m.id === formData.paymentMethod)
                    ?.name
                }
              </strong>{" "}
              number <strong className="text-dark/70">01XXXXXXXXX</strong> and
              enter the Transaction ID above.
            </p>
          </div>
        )}

        {/* Terms & Conditions */}
        <div className="flex items-start gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleChange("agreeTerms", !formData.agreeTerms)}
            className={`mt-0.5 shrink-0 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
              formData.agreeTerms
                ? "bg-tertiary border-tertiary"
                : errors.agreeTerms
                  ? "border-red-400"
                  : "border-dark/20 hover:border-tertiary/50"
            }`}
          >
            {formData.agreeTerms && (
              <FiCheck className="h-3 w-3 text-white stroke-3" />
            )}
          </button>
          <p className="text-xs text-dark/55 leading-5">
            I agree to the{" "}
            <a
              href="/terms"
              className="text-tertiary font-semibold hover:underline"
            >
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="text-tertiary font-semibold hover:underline"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
        {errors.agreeTerms && (
          <p className="text-xs text-red-500 font-medium flex items-center gap-1 -mt-2">
            <FiAlertCircle className="h-3 w-3" /> {errors.agreeTerms}
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
          className={`w-full mt-2 inline-flex items-center justify-center gap-2.5 rounded-xl px-6 py-4 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 ${
            selectedPlan
              ? "bg-linear-to-r from-secondary to-secondary-light text-white shadow-lg shadow-secondary/30 hover:shadow-xl hover:shadow-secondary/40 cursor-pointer"
              : "bg-dark/10 text-dark/40 cursor-not-allowed"
          } ${isSubmitting ? "opacity-75 pointer-events-none" : ""}`}
        >
          {isSubmitting ? (
            <>
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
              Processing...
            </>
          ) : (
            <>
              Confirm Order
              <FiArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        {errors.submit && (
          <p className="text-xs text-red-500 font-medium flex items-center gap-1 justify-center">
            <FiAlertCircle className="h-3 w-3" /> {errors.submit}
          </p>
        )}
      </form>
    </div>
  );
};

export default RegistrationForm;
