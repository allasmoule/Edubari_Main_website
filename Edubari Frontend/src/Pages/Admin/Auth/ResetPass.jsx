import React, { useState } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff, FiKey, FiLoader, FiAlertCircle, FiCheck, FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router";

const ResetPass = () => {
    const [step, setStep] = useState(1); // 1: email, 2: code+newpass, 3: success
    const [form, setForm] = useState({ email: "", code: "", password: "", confirmPassword: "" });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [status, setStatus] = useState("idle"); // idle | loading | error

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    // Step 1 — Send Reset Code
    const handleSendCode = async (e) => {
        e.preventDefault();
        const errs = {};
        if (!form.email.trim()) {
            errs.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errs.email = "Enter a valid email";
        }
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setStatus("loading");
        try {
            await new Promise((res) => setTimeout(res, 1500));
            setStatus("idle");
            setStep(2);
        } catch {
            setStatus("error");
            setTimeout(() => setStatus("idle"), 3000);
        }
    };

    // Step 2 — Verify Code & Set New Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        const errs = {};
        if (!form.code.trim()) errs.code = "Verification code is required";
        if (!form.password.trim()) {
            errs.password = "Password is required";
        } else if (form.password.length < 6) {
            errs.password = "Password must be at least 6 characters";
        }
        if (!form.confirmPassword.trim()) {
            errs.confirmPassword = "Please confirm your password";
        } else if (form.password !== form.confirmPassword) {
            errs.confirmPassword = "Passwords do not match";
        }
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setStatus("loading");
        try {
            await new Promise((res) => setTimeout(res, 1500));
            setStatus("idle");
            setStep(3);
        } catch {
            setStatus("error");
            setTimeout(() => setStatus("idle"), 3000);
        }
    };

    const inputBase =
        "w-full rounded-xl border bg-white/60 backdrop-blur-sm pl-11 pr-4 py-3.5 text-sm text-dark placeholder:text-dark/35 font-medium outline-none transition-all duration-300 focus:ring-2 focus:ring-tertiary/30 focus:border-tertiary/40 hover:bg-white/80";
    const inputNormal = "border-white/40";
    const inputError = "border-red-400/60 focus:ring-red-400/30 focus:border-red-400/50";

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-10">
            {/* Background */}
            <div className="absolute inset-0 bg-linear-to-br from-primary via-primary-light to-white" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.12),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.08),transparent_60%)]" />

            {/* Decorative Blobs */}
            <div className="absolute top-[-120px] left-[-80px] w-[300px] h-[300px] bg-[#8B5CF6]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[-100px] right-[-60px] w-[250px] h-[250px] bg-tertiary/10 rounded-full blur-3xl" />

            {/* Card */}
            <div className="relative w-full max-w-[440px] animate-[fadeInUp_0.5s_ease-out]">
                <div className="absolute -inset-1 bg-linear-to-r from-tertiary/20 to-[#8B5CF6]/20 rounded-3xl blur-xl opacity-60" />

                <div className="relative rounded-2xl border border-white/40 bg-white/70 backdrop-blur-md p-8 sm:p-10 shadow-xl shadow-dark/5">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-block">
                            <h1 className="text-3xl font-black tracking-tight text-dark">
                                Edu<span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]">Bari</span>
                            </h1>
                        </Link>

                        {/* Step Indicator */}
                        <div className="mt-4 flex items-center justify-center gap-2">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="flex items-center gap-2">
                                    <div className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                                        step >= s
                                            ? "bg-linear-to-r from-tertiary to-[#8B5CF6] scale-110"
                                            : "bg-dark/15"
                                    }`} />
                                    {s < 3 && (
                                        <div className={`h-0.5 w-6 rounded-full transition-all duration-300 ${
                                            step > s ? "bg-tertiary/50" : "bg-dark/10"
                                        }`} />
                                    )}
                                </div>
                            ))}
                        </div>

                        <p className="mt-3 text-sm text-dark/50 font-medium">
                            {step === 1 && "Enter your email to receive a reset code"}
                            {step === 2 && "Enter the code and set your new password"}
                            {step === 3 && "Your password has been reset!"}
                        </p>
                    </div>

                    {/* ── Step 1: Email ── */}
                    {step === 1 && (
                        <form onSubmit={handleSendCode} noValidate className="space-y-5">
                            <div>
                                <label htmlFor="reset-email" className="block text-xs font-bold text-dark/70 uppercase tracking-wide mb-1.5">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-dark/30" />
                                    <input
                                        id="reset-email"
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                                        <FiAlertCircle className="h-3 w-3" />{errors.email}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-tertiary to-[#8B5CF6] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-tertiary/25 hover:shadow-xl hover:shadow-tertiary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
                            >
                                {status === "loading" ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiMail className="h-4 w-4" />}
                                {status === "loading" ? "Sending Code..." : "Send Reset Code"}
                            </button>
                        </form>
                    )}

                    {/* ── Step 2: Code + New Password ── */}
                    {step === 2 && (
                        <form onSubmit={handleResetPassword} noValidate className="space-y-5">
                            {/* Code */}
                            <div>
                                <label htmlFor="reset-code" className="block text-xs font-bold text-dark/70 uppercase tracking-wide mb-1.5">
                                    Verification Code
                                </label>
                                <div className="relative">
                                    <FiKey className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-dark/30" />
                                    <input
                                        id="reset-code"
                                        name="code"
                                        type="text"
                                        placeholder="Enter 6-digit code"
                                        value={form.code}
                                        onChange={handleChange}
                                        className={`${inputBase} ${errors.code ? inputError : inputNormal}`}
                                    />
                                </div>
                                {errors.code && (
                                    <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                                        <FiAlertCircle className="h-3 w-3" />{errors.code}
                                    </p>
                                )}
                            </div>

                            {/* New Password */}
                            <div>
                                <label htmlFor="reset-password" className="block text-xs font-bold text-dark/70 uppercase tracking-wide mb-1.5">
                                    New Password
                                </label>
                                <div className="relative">
                                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-dark/30" />
                                    <input
                                        id="reset-password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={handleChange}
                                        className={`${inputBase} pr-11 ${errors.password ? inputError : inputNormal}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-dark/30 hover:text-dark/60 transition-colors duration-200 cursor-pointer"
                                    >
                                        {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                                        <FiAlertCircle className="h-3 w-3" />{errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="reset-confirm" className="block text-xs font-bold text-dark/70 uppercase tracking-wide mb-1.5">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-dark/30" />
                                    <input
                                        id="reset-confirm"
                                        name="confirmPassword"
                                        type={showConfirm ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        className={`${inputBase} pr-11 ${errors.confirmPassword ? inputError : inputNormal}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-dark/30 hover:text-dark/60 transition-colors duration-200 cursor-pointer"
                                    >
                                        {showConfirm ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                                        <FiAlertCircle className="h-3 w-3" />{errors.confirmPassword}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-tertiary to-[#8B5CF6] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-tertiary/25 hover:shadow-xl hover:shadow-tertiary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
                            >
                                {status === "loading" ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiKey className="h-4 w-4" />}
                                {status === "loading" ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>
                    )}

                    {/* ── Step 3: Success ── */}
                    {step === 3 && (
                        <div className="text-center py-4">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#10B981]/10 text-[#10B981] mb-5">
                                <FiCheck className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-dark mb-2">Password Reset!</h3>
                            <p className="text-sm text-dark/55 mb-7">
                                Your password has been updated successfully. You can now sign in with your new password.
                            </p>
                            <Link
                                to="/admin/login"
                                className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-linear-to-r from-tertiary to-[#8B5CF6] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-tertiary/25 hover:shadow-xl hover:shadow-tertiary/30 hover:-translate-y-0.5 transition-all duration-300"
                            >
                                <FiArrowLeft className="h-4 w-4" />
                                Back to Sign In
                            </Link>
                        </div>
                    )}

                    {/* Error Toast */}
                    {status === "error" && (
                        <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-300/50 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-600 animate-[fadeInUp_0.3s_ease-out]">
                            <FiAlertCircle className="h-4 w-4 shrink-0" />
                            Something went wrong. Please try again.
                        </div>
                    )}

                    {/* Back to login */}
                    {step !== 3 && (
                        <>
                            <div className="mt-7 flex items-center gap-3">
                                <div className="flex-1 h-px bg-dark/8" />
                                <span className="text-xs text-dark/35 font-medium">OR</span>
                                <div className="flex-1 h-px bg-dark/8" />
                            </div>
                            <div className="mt-6 text-center">
                                <Link
                                    to="/admin/login"
                                    className="text-sm font-semibold text-dark/50 hover:text-dark/80 transition-colors duration-200"
                                >
                                    ← Back to Sign In
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPass;
