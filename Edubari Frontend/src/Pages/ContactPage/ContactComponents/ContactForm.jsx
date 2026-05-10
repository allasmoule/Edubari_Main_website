import React, { useState } from "react";
import { FiSend, FiCheck, FiAlertCircle, FiLoader } from "react-icons/fi";

const API_URL = import.meta.env.VITE_SERVER || "http://localhost:3000";

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
    "w-full rounded-xl border bg-white/60 backdrop-blur-sm px-4 py-3 text-sm text-dark placeholder:text-dark/35 font-medium outline-none transition-all duration-300 focus:ring-2 focus:ring-tertiary/30 focus:border-tertiary/40 hover:bg-white/80";
  const inputNormal = "border-white/40";
  const inputError =
    "border-red-400/60 focus:ring-red-400/30 focus:border-red-400/50";

  return (
    <section className="w-full px-4 sm:px-6 md:px-12 py-14 sm:py-16 bg-primary/30">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 items-start">
          {/* Left — Copy */}
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold tracking-wide uppercase mb-4">
              ✉️ Write To Us
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter text-dark leading-tight">
              Send Us A{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]">
                Message
              </span>
            </h2>

            <p className="mt-4 text-sm sm:text-[15px] leading-7 text-dark/65">
              Fill out the form and our team will respond as soon as possible.
              We typically reply within 24 hours on business days.
            </p>

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { value: "< 24h", label: "Response Time" },
                { value: "99%", label: "Satisfaction" },
                { value: "24/7", label: "Support Access" },
                { value: "5K+", label: "Happy Clients" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-white/40 bg-white/50 backdrop-blur-sm p-4 text-center"
                >
                  <p className="text-xl font-black text-tertiary">{s.value}</p>
                  <p className="mt-0.5 text-xs text-dark/50 font-medium">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Form */}
          <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md p-7 sm:p-9 shadow-lg shadow-dark/5">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Name & Email */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-bold text-dark/70 uppercase tracking-wide mb-1.5"
                  >
                    Full Name{" "}
                    <span className="text-red-500 text-lg font-black leading-none align-middle">
                      *
                    </span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                    className={`${inputBase} ${
                      errors.name ? inputError : inputNormal
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                      <FiAlertCircle className="h-3 w-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-bold text-dark/70 uppercase tracking-wide mb-1.5"
                  >
                    Email Address{" "}
                    <span className="text-red-500 text-lg font-black leading-none align-middle">
                      *
                    </span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className={`${inputBase} ${
                      errors.email ? inputError : inputNormal
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                      <FiAlertCircle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="contact-phone"
                  className="block text-xs font-bold text-dark/70 uppercase tracking-wide mb-1.5"
                >
                  Phone No
                </label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  placeholder="+8801XXXXXXXXX"
                  value={form.phone}
                  onChange={handleChange}
                  className={`${inputBase} ${
                    errors.phone ? inputError : inputNormal
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                    <FiAlertCircle className="h-3 w-3" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-bold text-dark/70 uppercase tracking-wide mb-1.5"
                >
                  Subject{" "}
                  <span className="text-red-500 text-lg font-black leading-none align-middle">
                    *
                  </span>
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  placeholder="What is this about?"
                  value={form.subject}
                  onChange={handleChange}
                  className={`${inputBase} ${
                    errors.subject ? inputError : inputNormal
                  }`}
                />
                {errors.subject && (
                  <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                    <FiAlertCircle className="h-3 w-3" />
                    {errors.subject}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-bold text-dark/70 uppercase tracking-wide mb-1.5"
                >
                  Message{" "}
                  <span className="text-red-500 text-lg font-black leading-none align-middle">
                    *
                  </span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  placeholder="Tell us more about your inquiry..."
                  value={form.message}
                  onChange={handleChange}
                  className={`${inputBase} resize-none ${
                    errors.message ? inputError : inputNormal
                  }`}
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                    <FiAlertCircle className="h-3 w-3" />
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-tertiary to-[#8B5CF6] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-tertiary/25 hover:shadow-xl hover:shadow-tertiary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
              >
                {status === "sending" && (
                  <FiLoader className="h-4 w-4 animate-spin" />
                )}
                {status === "success" && <FiCheck className="h-4 w-4" />}
                {status === "idle" && <FiSend className="h-4 w-4" />}
                {status === "error" && <FiAlertCircle className="h-4 w-4" />}

                {status === "idle" && "Send Message"}
                {status === "sending" && "Sending..."}
                {status === "success" && "Message Sent!"}
                {status === "error" && "Failed — Try Again"}
              </button>
            </form>

            {/* Toast */}
            {status === "success" && (
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-green-300/50 bg-green-50/80 px-4 py-3 text-sm font-medium text-green-700 animate-[fadeInUp_0.3s_ease-out]">
                <FiCheck className="h-4 w-4" />
                Thanks! We'll get back to you soon.
              </div>
            )}

            {status === "error" && (
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-300/50 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-600 animate-[fadeInUp_0.3s_ease-out]">
                <FiAlertCircle className="h-4 w-4" />
                Something went wrong. Please try again later.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
