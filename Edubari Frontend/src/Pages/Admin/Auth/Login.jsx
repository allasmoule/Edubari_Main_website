import React, { useContext, useState } from "react";
import {
  FiLock,
  FiMail,
  FiEye,
  FiEyeOff,
  FiLogIn,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router";
import { AuthContext } from "../../../Firebase/AuthContext";

const Login = () => {
  const { signIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | error

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Enter a valid email";
    }
    if (!form.password.trim()) {
      errs.password = "Password is required";
    } else if (form.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setStatus("loading");
    try {
      const result = await signIn(form.email, form.password);
      console.log("Login successful:", result.user);
      setStatus("idle");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const inputBase =
    "w-full rounded-xl border bg-white/60 backdrop-blur-sm pl-11 pr-4 py-3.5 text-sm text-dark placeholder:text-dark/35 font-medium outline-none transition-all duration-300 focus:ring-2 focus:ring-tertiary/30 focus:border-tertiary/40 hover:bg-white/80";
  const inputNormal = "border-white/40";
  const inputError =
    "border-red-400/60 focus:ring-red-400/30 focus:border-red-400/50";

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-10">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-primary via-primary-light to-white" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.08),transparent_60%)]" />

      {/* Decorative Blobs */}
      <div className="absolute top-[-120px] right-[-80px] w-[300px] h-[300px] bg-tertiary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-100px] left-[-60px] w-[250px] h-[250px] bg-[#8B5CF6]/10 rounded-full blur-3xl" />

      {/* Card */}
      <div className="relative w-full max-w-[440px] animate-[fadeInUp_0.5s_ease-out]">
        {/* Glow behind card */}
        <div className="absolute -inset-1 bg-linear-to-r from-tertiary/20 to-[#8B5CF6]/20 rounded-3xl blur-xl opacity-60" />

        <div className="relative rounded-2xl border border-white/40 bg-white/70 backdrop-blur-md p-8 sm:p-10 shadow-xl shadow-dark/5">
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <h1 className="text-3xl font-black tracking-tight text-dark">
                Edu
                <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]">
                  Bari
                </span>
              </h1>
            </Link>
            <p className="mt-2 text-sm text-dark/50 font-medium">
              Sign in to your admin panel
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-bold text-dark/70 uppercase tracking-wide mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-dark/30" />
                <input
                  id="login-email"
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
                  <FiAlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold text-dark/70 uppercase tracking-wide"
                >
                  Password
                </label>
                <Link
                  to="/admin/reset-password"
                  className="text-xs font-semibold text-tertiary hover:text-tertiary-dark transition-colors duration-200"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-dark/30" />
                <input
                  id="login-password"
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
                  {showPassword ? (
                    <FiEyeOff className="h-4 w-4" />
                  ) : (
                    <FiEye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                  <FiAlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-dark/20 text-tertiary focus:ring-tertiary/30 cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="text-sm text-dark/60 font-medium cursor-pointer select-none"
              >
                Remember me
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-tertiary to-[#8B5CF6] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-tertiary/25 hover:shadow-xl hover:shadow-tertiary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
            >
              {status === "loading" ? (
                <FiLoader className="h-4 w-4 animate-spin" />
              ) : (
                <FiLogIn className="h-4 w-4" />
              )}
              {status === "loading" ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Error Toast */}
          {status === "error" && (
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-300/50 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-600 animate-[fadeInUp_0.3s_ease-out]">
              <FiAlertCircle className="h-4 w-4 shrink-0" />
              Invalid credentials. Please try again.
            </div>
          )}

          {/* Divider */}
          <div className="mt-7 flex items-center gap-3">
            <div className="flex-1 h-px bg-dark/8" />
            <span className="text-xs text-dark/35 font-medium">OR</span>
            <div className="flex-1 h-px bg-dark/8" />
          </div>

          {/* Back to site */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm font-semibold text-dark/50 hover:text-dark/80 transition-colors duration-200"
            >
              ← Back to Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
