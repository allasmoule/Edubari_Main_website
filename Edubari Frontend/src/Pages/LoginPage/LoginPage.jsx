import React, { useContext, useState } from "react";
import { FiArrowLeft, FiAlertCircle, FiLoader } from "react-icons/fi";
import { Link, useNavigate } from "react-router";
import { AuthContext } from "../../Firebase/AuthContext";

const LoginPage = () => {
  const { signInWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      navigate("/"); // Redirect to home after login
    } catch (err) {
      console.error("Google Login Error:", err);
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Background with animated gradient */}
      <div className="absolute inset-0 bg-[#F8FAFC]" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-blue-50/50 to-transparent pointer-events-none" />
      
      {/* Decorative Blobs */}
      <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-blue-100/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-3xl animate-pulse" />

      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-[#3B42F2] font-bold text-sm mb-8 transition-colors group"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-[0_30px_70px_rgba(0,0,0,0.05)] p-10 text-center relative overflow-hidden">
          {/* Subtle glow effect */}
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-[#3B42F2] to-indigo-400" />

          {/* Icon/Logo area */}
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm border border-blue-100/50">
            <h2 className="text-3xl font-black text-[#3B42F2]">E</h2>
          </div>

          <h1 className="text-3xl font-black text-[#1E293B] mb-3 tracking-tight">
            Welcome Back!
          </h1>
          <p className="text-[#64748B] font-medium mb-10 text-sm leading-relaxed">
            Please sign in to access your platform dashboard and manage your institution.
          </p>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-4 bg-white border-2 border-slate-100 hover:border-[#3B42F2]/30 hover:bg-slate-50 text-[#1E293B] font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md group active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
          >
            {loading ? (
              <FiLoader className="w-5 h-5 animate-spin text-[#3B42F2]" />
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.13-.45-4.63H24v9.06h12.94c-.58 2.86-2.22 5.27-4.56 6.96l7.73 6.02c4.51-4.18 7.12-10.36 7.12-17.41z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6.02c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
            )}
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-6 flex items-center gap-2 justify-center text-red-500 font-bold text-sm animate-pulse">
              <FiAlertCircle className="shrink-0" />
              {error}
            </div>
          )}

          {/* Footer Note */}
          <div className="mt-12 pt-8 border-t border-slate-50">
            <p className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest leading-relaxed">
              Secure Teacher Login for <br />
              <span className="text-[#3B42F2]">EduBari Institution Management</span>
            </p>
          </div>
        </div>

        {/* Branding placeholder */}
        <p className="mt-8 text-center text-[#94A3B8] text-xs font-medium">
          © {new Date().getFullYear()} EduBari. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
