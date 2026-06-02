"use client";

import React, { useState, useEffect } from "react";
import { FiX, FiMail, FiCheckCircle, FiAlertCircle, FiLoader, FiSend } from "react-icons/fi";

const NewsletterPopup = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      setStatus("success");
      setMessage("Thank you for subscribing!");

      // Auto close after 2 seconds on success
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      setStatus("error");
      setMessage(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-dark/60 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-[scaleUp_0.4s_cubic-bezier(0.16,1,0.3,1)] border border-white/50">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-dark/5 hover:bg-red-50 text-dark/40 hover:text-red-500 transition-colors duration-300"
          title="Close"
        >
          <FiX className="h-5 w-5" />
        </button>

        {/* Decorative Background Glows */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-tertiary/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none -ml-10 -mb-10" />

        <div className="px-6 py-8 sm:px-8 sm:py-10 relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-tertiary/10 text-tertiary mb-5">
            <FiMail className="h-6 w-6" />
          </div>

          <h3 className="text-2xl font-black text-dark tracking-tight mb-2">
            Stay Updated!
          </h3>
          <p className="text-sm text-dark/60 font-medium mb-8 leading-relaxed max-w-[280px] mx-auto">
            Enter your email to receive our latest updates, newsletters, and exclusive offers.
          </p>

          <form onSubmit={handleSubmit} className="w-full">
            <div className="relative flex items-center">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="you@example.com"
                className="w-full h-12 pl-5 pr-14 rounded-2xl border border-dark/10 bg-dark/5 text-sm text-dark placeholder:text-dark/40 font-medium outline-none focus:border-tertiary focus:bg-white focus:ring-4 focus:ring-tertiary/10 transition-all"
                disabled={status === "loading" || status === "success"}
              />
              <button
                type="submit"
                disabled={status === "loading" || status === "success"}
                className="absolute right-1.5 h-9 w-9 flex items-center justify-center rounded-xl bg-gradient-to-r from-tertiary to-[#8B5CF6] text-white hover:shadow-lg hover:shadow-tertiary/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {status === "loading" ? (
                  <FiLoader className="h-4 w-4 animate-spin" />
                ) : status === "success" ? (
                  <FiCheckCircle className="h-4 w-4" />
                ) : (
                  <FiSend className="h-4 w-4 -ml-0.5" />
                )}
              </button>
            </div>

            {/* Status Message */}
            {message && (
              <div className={`mt-4 flex items-center justify-center gap-1.5 text-xs font-bold animate-[fadeInUp_0.2s_ease-out] ${status === "success" ? "text-green-600" : "text-red-500"
                }`}>
                {status === "success" ? <FiCheckCircle className="h-3.5 w-3.5" /> : <FiAlertCircle className="h-3.5 w-3.5" />}
                {message}
              </div>
            )}
          </form>

          <p className="mt-6 text-[10px] font-bold text-dark/30 uppercase tracking-widest">
            No spam. We promise.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewsletterPopup;
