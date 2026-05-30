"use client";

import React, { useState } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiLock,
  FiMail,
  FiRefreshCw,
  FiUser,
  FiUserPlus,
} from "react-icons/fi";
import { supabase } from "@/lib/supabase";

export default function AdminCreateUserPage() {
  // Create user state
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [createErrors, setCreateErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateToast, setShowCreateToast] = useState(false);
  const [createToastType, setCreateToastType] = useState(null); // 'success' | 'error'
  const [createToastMsg, setCreateToastMsg] = useState("");

  // Reset password state
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isResetSubmitted, setIsResetSubmitted] = useState(false);
  const [resetTargetEmail, setResetTargetEmail] = useState("");
  const [showResetToast, setShowResetToast] = useState(false);

  const inputBase =
    "w-full rounded-xl border bg-white/60 backdrop-blur-sm pl-11 pr-4 py-3.5 text-sm text-dark placeholder:text-dark/35 font-medium outline-none transition-all duration-300 focus:ring-2 focus:ring-tertiary/30 focus:border-tertiary/40 hover:bg-white/80";
  const inputNormal = "border-white/40";
  const inputError =
    "border-red-400/60 focus:ring-red-400/30 focus:border-red-400/50";

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
    if (createErrors[name]) {
      setCreateErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateCreate = () => {
    const errs = {};
    if (!createForm.name.trim()) errs.name = "Full name is required";
    if (!createForm.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)) {
      errs.email = "Enter a valid email address";
    }
    if (!createForm.password.trim()) {
      errs.password = "Password is required";
    } else if (createForm.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    if (createForm.password !== createForm.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    return errs;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const errs = validateCreate();
    if (Object.keys(errs).length > 0) {
      setCreateErrors(errs);
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: createForm.email.trim(),
          password: createForm.password,
          name: createForm.name.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      setCreateToastType("success");
      setCreateToastMsg("User created successfully.");
      setShowCreateToast(true);
      setCreateForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => setShowCreateToast(false), 3000);
    } catch (error) {
      setCreateToastType("error");
      setCreateToastMsg(error.message || "Failed to create user.");
      setShowCreateToast(true);
      setTimeout(() => setShowCreateToast(false), 3000);
    } finally {
      setIsCreating(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      setResetError("Enter a valid email address.");
      return;
    }

    setResetError("");
    setIsResetting(true);
    setIsResetSubmitted(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/admin/login`,
      });

      if (error) throw error;

      setResetTargetEmail(resetEmail.trim());
      setIsResetSubmitted(true);
      setShowResetToast(true);
      setResetEmail("");
      setTimeout(() => setShowResetToast(false), 3000);
    } catch (error) {
      setResetError(error.message || "Failed to send reset email.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetForm = () => {
    setCreateForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setCreateErrors({});
  };

  return (
    <div className="space-y-6 animate-[fadeInUp_0.35s_ease-out]">
      {/* Toast notifications */}
      {showResetToast && (
        <div className="fixed top-6 right-6 z-[9999] animate-[fadeInUp_0.3s_ease-out] rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 shadow-lg flex items-center gap-2">
          <FiCheckCircle className="h-5 w-5 shrink-0" />
          Password reset email sent successfully to {resetTargetEmail}.
        </div>
      )}

      {showCreateToast && (
        <div className={`fixed top-20 right-6 z-[9999] animate-[fadeInUp_0.3s_ease-out] rounded-xl border px-5 py-3 text-sm font-semibold shadow-lg flex items-center gap-2 ${createToastType === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {createToastType === "success" ? <FiCheckCircle className="h-5 w-5 shrink-0" /> : <FiAlertCircle className="h-5 w-5 shrink-0" />}
          {createToastMsg}
        </div>
      )}

      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 sm:p-6 shadow-lg shadow-dark/3">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-dark tracking-tight">
              Create Auth User
            </h2>
            <p className="text-xs sm:text-sm text-dark/45 font-medium mt-1">
              Create new administrative users within your organization.
            </p>
          </div>

          <div className="rounded-xl bg-tertiary/10 text-tertiary px-3 py-2 text-xs font-semibold inline-flex items-center gap-2">
            <FiUserPlus className="w-3.5 h-3.5" />
            Supabase Auth
          </div>
        </div>

        <form onSubmit={handleCreateSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="create-user-name"
                className="block text-xs font-bold text-dark/70 uppercase tracking-wide mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-dark/30" />
                <input
                  id="create-user-name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={createForm.name}
                  onChange={handleCreateChange}
                  className={`${inputBase} ${createErrors.name ? inputError : inputNormal}`}
                />
              </div>
              {createErrors.name && (
                <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                  <FiAlertCircle className="h-3 w-3" />
                  {createErrors.name}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="create-user-email"
                className="block text-xs font-bold text-dark/70 uppercase tracking-wide mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-dark/30" />
                <input
                  id="create-user-email"
                  name="email"
                  type="email"
                  placeholder="user@example.com"
                  value={createForm.email}
                  onChange={handleCreateChange}
                  className={`${inputBase} ${createErrors.email ? inputError : inputNormal}`}
                />
              </div>
              {createErrors.email && (
                <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                  <FiAlertCircle className="h-3 w-3" />
                  {createErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="create-user-password"
                className="block text-xs font-bold text-dark/70 uppercase tracking-wide mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-dark/30" />
                <input
                  id="create-user-password"
                  name="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={createForm.password}
                  onChange={handleCreateChange}
                  className={`${inputBase} ${createErrors.password ? inputError : inputNormal}`}
                />
              </div>
              {createErrors.password && (
                <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                  <FiAlertCircle className="h-3 w-3" />
                  {createErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="create-user-confirm-password"
                className="block text-xs font-bold text-dark/70 uppercase tracking-wide mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-dark/30" />
                <input
                  id="create-user-confirm-password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={createForm.confirmPassword}
                  onChange={handleCreateChange}
                  className={`${inputBase} ${createErrors.confirmPassword ? inputError : inputNormal}`}
                />
              </div>
              {createErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                  <FiAlertCircle className="h-3 w-3" />
                  {createErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-tertiary to-[#8B5CF6] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-tertiary/20 hover:shadow-xl hover:shadow-tertiary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none cursor-pointer border-none"
            >
              <FiUserPlus className="h-4 w-4" />
              {isCreating ? "Creating User..." : "Submit"}
            </button>

            <button
              type="button"
              onClick={handleResetForm}
              disabled={isCreating}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-dark/10 px-5 py-3 text-sm font-semibold text-dark/60 hover:bg-dark/5 transition-all duration-200 cursor-pointer bg-transparent"
            >
              <FiRefreshCw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 sm:p-6 shadow-lg shadow-dark/3">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-dark tracking-tight">
              Reset Password
            </h2>
            <p className="text-xs sm:text-sm text-dark/45 font-medium mt-1">
              Send a password reset link to any existing administrative email.
            </p>
          </div>

          <div className="rounded-xl bg-tertiary/10 text-tertiary px-3 py-2 text-xs font-semibold inline-flex items-center gap-2">
            <FiMail className="w-3.5 h-3.5" />
            Password Reset
          </div>
        </div>

        <form onSubmit={handleResetSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="reset-password-email"
              className="block text-xs font-bold text-dark/70 uppercase tracking-wide mb-1.5"
            >
              User Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-dark/30" />
              <input
                id="reset-password-email"
                type="email"
                placeholder="user@example.com"
                value={resetEmail}
                onChange={(e) => {
                  setResetEmail(e.target.value);
                  if (resetError) setResetError("");
                }}
                className={`${inputBase} ${resetError ? inputError : inputNormal}`}
              />
            </div>
            {resetError && (
              <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                <FiAlertCircle className="h-3 w-3" />
                {resetError}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={isResetting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-tertiary to-[#8B5CF6] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-tertiary/20 hover:shadow-xl hover:shadow-tertiary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none cursor-pointer border-none"
            >
              <FiMail className="h-4 w-4" />
              {isResetting ? "Sending..." : "Send Reset Email"}
            </button>

            <button
              type="button"
              onClick={() => {
                setResetEmail("");
                setIsResetSubmitted(false);
                setResetTargetEmail("");
                setResetError("");
              }}
              disabled={isResetting}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-dark/10 px-5 py-3 text-sm font-semibold text-dark/60 hover:bg-dark/5 transition-all duration-200 cursor-pointer bg-transparent"
            >
              <FiRefreshCw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </form>

        {!showResetToast && isResetSubmitted && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 inline-flex items-start gap-2">
            <FiCheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              Password reset email sent successfully to {resetTargetEmail}.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
