import React, { useContext, useState } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiLock,
  FiMail,
  FiRefreshCw,
  FiUser,
  FiUserPlus,
} from "react-icons/fi";
import { useForm, useWatch } from "react-hook-form";
import { AuthContext } from "../../../Firebase/AuthContext";

const defaultValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const resetPasswordDefaultValues = {
  resetEmail: "",
};

const CreateUser = () => {
  const [showResetToast, setShowResetToast] = useState(false);
  const [showCreateToast, setShowCreateToast] = useState(false);
  const [createToastType, setCreateToastType] = useState(null); // 'success' | 'error'
  const [createToastMsg, setCreateToastMsg] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false); // can be removed if not used elsewhere
  const [submittedUser, setSubmittedUser] = useState(null); // can be removed if not used elsewhere
  const [submitError, setSubmitError] = useState(""); // can be removed if not used elsewhere
  const [isResetSubmitted, setIsResetSubmitted] = useState(false);
  const [resetTargetEmail, setResetTargetEmail] = useState("");
  const [resetSubmitError, setResetSubmitError] = useState("");
  // Removed duplicate declaration of showResetToast
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
    defaultValues,
  });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    reset: resetResetForm,
    formState: { errors: resetErrors, isSubmitting: isResetSubmitting },
  } = useForm({
    mode: "onBlur",
    defaultValues: resetPasswordDefaultValues,
  });

  const inputBase =
    "w-full rounded-xl border bg-white/60 backdrop-blur-sm pl-11 pr-4 py-3.5 text-sm text-dark placeholder:text-dark/35 font-medium outline-none transition-all duration-300 focus:ring-2 focus:ring-tertiary/30 focus:border-tertiary/40 hover:bg-white/80";
  const inputNormal = "border-white/40";
  const inputError =
    "border-red-400/60 focus:ring-red-400/30 focus:border-red-400/50";

  const currentPassword = useWatch({
    control,
    name: "password",
  });

  const resetForm = () => {
    reset(defaultValues);
    setIsSubmitted(false);
    setSubmittedUser(null);
    setSubmitError("");
  };

  const onSubmit = async (formData) => {
    const name = formData.name.trim();
    const email = formData.email.trim();
    try {
      const userCredential = await createUser(email, formData.password);
      await updateUserProfile(name, "");
      setCreateToastType("success");
      setCreateToastMsg("User created successfully.");
      setShowCreateToast(true);
      setTimeout(() => {
        setShowCreateToast(false);
        reset(defaultValues);
      }, 3000);
    } catch (error) {
      setCreateToastType("error");
      setCreateToastMsg(error?.message || "Failed to create user. Please try again.");
      setShowCreateToast(true);
      setTimeout(() => setShowCreateToast(false), 3000);
    }
  };

  const onResetPasswordSubmit = async (formData, e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    setIsResetSubmitted(false);
    setResetSubmitError("");

    const email = formData.resetEmail.trim();

    try {
      await resetPassword(email);
      setResetTargetEmail(email);
      setIsResetSubmitted(true);
      setShowResetToast(true);
      resetResetForm(resetPasswordDefaultValues);
      setTimeout(() => setShowResetToast(false), 3000);
    } catch (error) {
      setIsResetSubmitted(false);
      setResetTargetEmail("");
      setResetSubmitError(
        error?.message ||
          "Failed to send password reset email. Please try again.",
      );
    }
  };

  const { createUser, updateUserProfile, resetPassword } =
    useContext(AuthContext);

  return (
    <div className="space-y-6 animate-[fadeInUp_0.35s_ease-out]">
      {/* Toast notification for password reset */}
      {showResetToast && (
        <div className="fixed top-6 right-6 z-[9999] animate-[fadeInUp_0.3s_ease-out] rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 shadow-lg flex items-center gap-2">
          <FiCheckCircle className="h-5 w-5 shrink-0" />
          Password reset email sent successfully to {resetTargetEmail}.
        </div>
      )}
      {/* Toast notification for create user */}
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
              Create user form design with client-side validation only.
            </p>
          </div>

          <div className="rounded-xl bg-tertiary/10 text-tertiary px-3 py-2 text-xs font-semibold inline-flex items-center gap-2">
            <FiUserPlus className="w-3.5 h-3.5" />
            Raw Form
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  type="text"
                  placeholder="John Doe"
                  {...register("name", {
                    required: "Full name is required.",
                    validate: (value) =>
                      value.trim().length > 0 || "Full name is required.",
                  })}
                  className={`${inputBase} ${errors.name ? inputError : inputNormal}`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                  <FiAlertCircle className="h-3 w-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

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
                  type="email"
                  placeholder="user@example.com"
                  {...register("email", {
                    required: "Email is required.",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address.",
                    },
                  })}
                  className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                  <FiAlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

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
                  type="password"
                  placeholder="Minimum 6 characters"
                  {...register("password", {
                    required: "Password is required.",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters.",
                    },
                  })}
                  className={`${inputBase} ${errors.password ? inputError : inputNormal}`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                  <FiAlertCircle className="h-3 w-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

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
                  type="password"
                  placeholder="Re-enter password"
                  {...register("confirmPassword", {
                    required: "Please confirm the password.",
                    validate: (value) =>
                      value === currentPassword || "Passwords do not match.",
                  })}
                  className={`${inputBase} ${errors.confirmPassword ? inputError : inputNormal}`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                  <FiAlertCircle className="h-3 w-3" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-tertiary to-[#8B5CF6] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-tertiary/20 hover:shadow-xl hover:shadow-tertiary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
            >
              <FiUserPlus className="h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-dark/10 px-5 py-3 text-sm font-semibold text-dark/60 hover:bg-dark/5 transition-all duration-200 cursor-pointer"
            >
              <FiRefreshCw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </form>

        {/* Success and error messages for create user are now shown as toast notifications */}
      </div>

      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 sm:p-6 shadow-lg shadow-dark/3">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-dark tracking-tight">
              Reset Password
            </h2>
            <p className="text-xs sm:text-sm text-dark/45 font-medium mt-1">
              Send a password reset link to any existing user email.
            </p>
          </div>

          <div className="rounded-xl bg-tertiary/10 text-tertiary px-3 py-2 text-xs font-semibold inline-flex items-center gap-2">
            <FiMail className="w-3.5 h-3.5" />
            Password Reset
          </div>
        </div>

        <form
          onSubmit={handleResetSubmit((data, e) => onResetPasswordSubmit(data, e))}
          noValidate
          className="space-y-4"
        >
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
                {...registerReset("resetEmail", {
                  required: "Email is required.",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address.",
                  },
                })}
                className={`${inputBase} ${resetErrors.resetEmail ? inputError : inputNormal}`}
              />
            </div>
            {resetErrors.resetEmail && (
              <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                <FiAlertCircle className="h-3 w-3" />
                {resetErrors.resetEmail.message}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={isResetSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-tertiary to-[#8B5CF6] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-tertiary/20 hover:shadow-xl hover:shadow-tertiary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
            >
              <FiMail className="h-4 w-4" />
              {isResetSubmitting ? "Sending..." : "Send Reset Email"}
            </button>

            <button
              type="button"
              onClick={() => {
                resetResetForm(resetPasswordDefaultValues);
                setIsResetSubmitted(false);
                setResetTargetEmail("");
                setResetSubmitError("");
              }}
              disabled={isResetSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-dark/10 px-5 py-3 text-sm font-semibold text-dark/60 hover:bg-dark/5 transition-all duration-200 cursor-pointer"
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

        {resetSubmitError && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 inline-flex items-start gap-2">
            <FiAlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{resetSubmitError}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateUser;
