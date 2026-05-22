import React, { useState } from "react";
import { FiSend, FiCheck, FiAlertCircle, FiLoader } from "react-icons/fi";

const API_URL = import.meta.env.VITE_SERVER || "http://localhost:5000";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const ContactForm = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Enter a valid email";
    }
    if (
      form.phone.trim() &&
      !/^[+\d][\d\s()-]{6,19}$/.test(form.phone.trim())
    ) {
      errs.phone = "Enter a valid phone number";
    }
    if (!form.subject.trim()) errs.subject = "Subject is required";
    if (!form.message.trim()) errs.message = "Message is required";
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

    setStatus("sending");

    try {
      const payload = {
        ...form,
        createdAt: new Date().toISOString(),
        status: "To be replied",
        importance: "Usual",
        response: "",
      };

      const res = await fetch(`${API_URL}/contactMessages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed");

      setStatus("success");
      setForm(initialForm);
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  const inputBase =
    "w-full rounded-2xl border-2 border-slate-100 bg-white px-6 py-4 text-sm text-[#1E293B] placeholder:text-slate-400 font-bold outline-none transition-all duration-300 focus:border-[#3B42F2] hover:border-slate-200";
  const inputError =
    "border-red-100 focus:border-red-500 bg-red-50/30";

  return (
    <section className="w-full px-6 sm:px-12 lg:px-24 py-12 sm:py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          {/* Left — Copy */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black tracking-widest uppercase mb-6 border border-blue-100/50">
              ✉️ WRITE TO US
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1E293B] leading-tight mb-8">
              Send Us a <span className="text-[#3B42F2]">Message</span>
            </h2>

            <p className="text-slate-500 font-medium text-lg leading-relaxed mb-12">
              Fill out the form and our team will respond as soon as possible.
              We typically reply within 24 hours on business days.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: "< 24h", label: "Response Time" },
                { value: "99%", label: "Satisfaction" },
                { value: "24/7", label: "Support Access" },
                { value: "5K+", label: "Happy Clients" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm"
                >
                  <p className="text-2xl font-black text-[#3B42F2]">{s.value}</p>
                  <p className="mt-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Form */}
          <div className="lg:col-span-7 bg-white rounded-[40px] border border-slate-100 p-8 sm:p-12 shadow-2xl shadow-slate-200/50">
            <form onSubmit={handleSubmit} noValidate className="space-y-8">
              {/* Name & Email */}
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-2">
                    FULL NAME <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                    className={`${inputBase} ${errors.name ? inputError : ""}`}
                  />
                  {errors.name && (
                    <p className="mt-2 text-xs text-red-500 font-bold pl-2 flex items-center gap-1">
                      <FiAlertCircle className="h-3 w-3" /> {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-2">
                    EMAIL ADDRESS <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className={`${inputBase} ${errors.email ? inputError : ""}`}
                  />
                  {errors.email && (
                    <p className="mt-2 text-xs text-red-500 font-bold pl-2 flex items-center gap-1">
                      <FiAlertCircle className="h-3 w-3" /> {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone & Subject */}
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-2">
                    PHONE NO
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="+8801XXXXXXXXX"
                    value={form.phone}
                    onChange={handleChange}
                    className={`${inputBase} ${errors.phone ? inputError : ""}`}
                  />
                  {errors.phone && (
                    <p className="mt-2 text-xs text-red-500 font-bold pl-2 flex items-center gap-1">
                      <FiAlertCircle className="h-3 w-3" /> {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-2">
                    SUBJECT <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="subject"
                    type="text"
                    placeholder="General Inquiry"
                    value={form.subject}
                    onChange={handleChange}
                    className={`${inputBase} ${errors.subject ? inputError : ""}`}
                  />
                  {errors.subject && (
                    <p className="mt-2 text-xs text-red-500 font-bold pl-2 flex items-center gap-1">
                      <FiAlertCircle className="h-3 w-3" /> {errors.subject}
                    </p>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-2">
                  YOUR MESSAGE <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  rows={6}
                  placeholder="Tell us more about your inquiry..."
                  value={form.message}
                  onChange={handleChange}
                  className={`${inputBase} resize-none ${errors.message ? inputError : ""}`}
                />
                {errors.message && (
                  <p className="mt-2 text-xs text-red-500 font-bold pl-2 flex items-center gap-1">
                    <FiAlertCircle className="h-3 w-3" /> {errors.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-[20px] bg-[#1E293B] px-12 py-5 text-sm font-black text-white shadow-xl hover:bg-[#3B42F2] transition-all duration-300 disabled:opacity-60 uppercase tracking-widest"
              >
                {status === "sending" ? <FiLoader className="h-5 w-5 animate-spin" /> : 
                 status === "success" ? <FiCheck className="h-5 w-5" /> : 
                 <FiSend className="h-5 w-5" />}
                
                {status === "idle" ? "Send Message" : 
                 status === "sending" ? "Sending..." : 
                 status === "success" ? "Message Sent!" : "Try Again"}
              </button>
            </form>

            {/* Success/Error Toasts */}
            {status === "success" && (
              <div className="mt-8 p-4 rounded-2xl bg-green-50 text-green-600 text-sm font-bold flex items-center gap-2 border border-green-100 animate-slideDown">
                <FiCheck className="h-5 w-5" /> Thanks! We'll get back to you soon.
              </div>
            )}
            {status === "error" && (
              <div className="mt-8 p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-bold flex items-center gap-2 border border-red-100 animate-slideDown">
                <FiAlertCircle className="h-5 w-5" /> Something went wrong. Please try again.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
