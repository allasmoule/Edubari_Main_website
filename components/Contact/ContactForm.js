"use client";

import React, { useState } from "react";
import {
  FiSend,
  FiCheck,
  FiAlertCircle,
  FiLoader,
  FiUser,
  FiMail,
  FiPhone,
  FiMessageSquare,
  FiCheckCircle,
  FiShield,
  FiClock,
  FiHeadphones,
  FiTag,
} from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";

const subjectOptions = [
  { id: "demo", bn: "ফ্রি ডেমো প্রয়োজন", en: "Free Demo Request" },
  { id: "pricing", bn: "প্রাইসিং ও প্যাকেজ", en: "Pricing & Plans" },
  { id: "custom", bn: "কাস্টম ইআরপি ফিচার", en: "Custom ERP Features" },
  { id: "support", bn: "টেকনিক্যাল সাপোর্ট", en: "Technical Support" },
  { id: "general", bn: "সাধারণ জিজ্ঞাসা", en: "General Inquiry" },
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  subject: "Free Demo Request",
  message: "",
};

const ContactForm = () => {
  const { lang } = useLanguage();
  const isBn = lang === "bn";

  const [form, setForm] = useState({
    ...initialForm,
    subject: isBn ? "ফ্রি ডেমো প্রয়োজন" : "Free Demo Request",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = isBn ? "আপনার নাম দিন" : "Name is required";
    }
    if (!form.email.trim()) {
      errs.email = isBn ? "আপনার ইমেইল দিন" : "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = isBn ? "সঠিক ইমেইল ঠিকানায় চেষ্টা করুন" : "Enter a valid email address";
    }
    if (
      form.phone.trim() &&
      !/^[+\d][\d\s()-]{6,19}$/.test(form.phone.trim())
    ) {
      errs.phone = isBn ? "সঠিক ফোন নম্বর দিন" : "Enter a valid phone number";
    }
    if (!form.subject.trim()) {
      errs.subject = isBn ? "বিষয় নির্বাচন করুন" : "Subject is required";
    }
    if (!form.message.trim()) {
      errs.message = isBn ? "আপনার বার্তা বা বিস্তারিত তথ্য লিখুন" : "Message content is required";
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectSubject = (subjText) => {
    setForm((prev) => ({ ...prev, subject: subjText }));
    if (errors.subject) setErrors((prev) => ({ ...prev, subject: "" }));
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

      const res = await fetch("/api/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to send message");

      setStatus("success");
      setForm({
        ...initialForm,
        subject: isBn ? "ফ্রি ডেমো প্রয়োজন" : "Free Demo Request",
      });
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  const inputBase =
    "w-full rounded-xl border bg-slate-50 focus:bg-white pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 font-medium outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500";
  const inputNormal = "border-slate-200 hover:border-slate-300";
  const inputError = "border-red-400 focus:ring-red-400/20 focus:border-red-500";

  return (
    <section id="contact-form-section" className="w-full px-4 sm:px-6 md:px-12 py-12 lg:py-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-12 items-stretch">
          
          {/* Left Column — Support Features & Direct Assurance */}
          <div className="flex flex-col justify-between bg-slate-900 text-white rounded-2xl p-7 sm:p-9 lg:p-10 border border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold uppercase tracking-wider mb-6">
                <FiHeadphones className="w-3.5 h-3.5 text-blue-400" />
                <span>{isBn ? "কাস্টমার সাপোর্ট ডেস্ক" : "Direct Support Desk"}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                {isBn ? "আমরা আপনার প্রশ্নের উত্তর দিতে তৈরি" : "Let's Build Something "}
                <span className="text-blue-400 block mt-1">
                  {isBn ? "একসাথে কাজ করি" : "Great Together"}
                </span>
              </h2>

              <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-300 font-medium">
                {isBn
                  ? "আপনার প্রতিষ্ঠানের যেকোনো প্রশ্নের উত্তর জানতে অথবা EduBari ইআরপি সফটওয়্যারের লাইভ ডেমো দেখতে ডানের ফর্মটি পূরণ করুন।"
                  : "Fill out the contact form and our support team will reach out to you within 15 to 30 minutes during business hours."}
              </p>

              {/* Feature Points */}
              <div className="mt-8 space-y-4">
                {[
                  {
                    title: isBn ? "২৪ ঘণ্টার মধ্যে সমাধান" : "Guaranteed Fast Response",
                    desc: isBn ? "আপনার যেকোনো প্রশ্নের দ্রুত সমাধান দেওয়া আমাদের অঙ্গীকার।" : "We guarantee a response within 24 hours max.",
                    icon: <FiClock className="w-5 h-5 text-slate-300" />,
                  },
                  {
                    title: isBn ? "১০০% নিরাপদ ও গোপনীয়" : "100% Confidential Support",
                    desc: isBn ? "আপনার প্রতিষ্ঠানের তথ্য আমাদের কাছে সম্পূর্ণ নিরাপদ।" : "Your school details & data are kept strictly private.",
                    icon: <FiShield className="w-5 h-5 text-slate-300" />,
                  },
                  {
                    title: isBn ? "ফ্রি ডেমো ও সেটআপ গাইড" : "Free Personalized Onboarding",
                    desc: isBn ? "আমাদের এক্সপার্ট আপনাকে সফটওয়্যার ব্যবহারে সম্পূর্ণ সাহায্য করবে।" : "Step-by-step guidance on how to launch your ERP.",
                    icon: <FiCheckCircle className="w-5 h-5 text-slate-300" />,
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-800/60 border border-slate-800">
                    <div className="p-2 rounded-lg bg-slate-800 shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Manager Card */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-sm">
                  EB
                </div>
                <div>
                  <p className="text-sm font-bold text-white">EduBari Support Desk</p>
                  <p className="text-xs text-slate-400 font-medium">
                    {isBn ? "অনলাইনে উপস্থিত" : "Online & Active"}
                  </p>
                </div>
              </div>

              <a
                href="https://wa.me/8801754958008"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                {isBn ? "হোয়াটসঅ্যাপ কল" : "WhatsApp"}
              </a>
            </div>
          </div>

          {/* Right Column — Clean Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 sm:p-9 lg:p-10 shadow-sm flex flex-col justify-between">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {isBn ? "আমাদের মেসেজ পাঠান" : "Send Us A Message"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  {isBn ? "ফর্মটি পূরণ করুন, আমরা দ্রুত আপনার সাথে যোগাযোগ করব।" : "Please fill out all required fields marked with (*)"}
                </p>
              </div>

              {/* Subject Tags Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FiTag className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isBn ? "বিষয় নির্বাচন করুন" : "Select Topic"}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {subjectOptions.map((opt) => {
                    const labelText = isBn ? opt.bn : opt.en;
                    const isSelected = form.subject === labelText;
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => handleSelectSubject(labelText)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                          isSelected
                            ? "bg-slate-900 border-slate-900 text-white"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {labelText}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name & Email Row */}
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Name */}
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {isBn ? "আপনার নাম" : "Full Name"} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      placeholder={isBn ? "যেমন: মোহাম্মদ রহিম" : "John Doe"}
                      value={form.name}
                      onChange={handleChange}
                      className={`${inputBase} ${errors.name ? inputError : inputNormal}`}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="contact-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {isBn ? "ইমেইল এড্রেস" : "Email Address"} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      placeholder="name@school.com"
                      value={form.email}
                      onChange={handleChange}
                      className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone & Custom Subject Row */}
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Phone */}
                <div>
                  <label htmlFor="contact-phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {isBn ? "ফোন/মোবাইল নম্বর" : "Phone Number"}
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      placeholder="+88017XXXXXXXX"
                      value={form.phone}
                      onChange={handleChange}
                      className={`${inputBase} ${errors.phone ? inputError : inputNormal}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {isBn ? "বিষয়ের শিরোনাম" : "Subject Line"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    placeholder={isBn ? "আপনার মেসেজের বিষয়" : "Subject title"}
                    value={form.subject}
                    onChange={handleChange}
                    className={`w-full rounded-xl border bg-slate-50 focus:bg-white px-4 py-3 text-sm text-slate-900 font-medium outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${errors.subject ? inputError : inputNormal}`}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" />
                      {errors.subject}
                    </p>
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div>
                <label htmlFor="contact-message" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {isBn ? "আপনার বার্তা বা বিস্তারিত তথ্য" : "Your Message"} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiMessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    placeholder={isBn ? "আপনার প্রতিষ্ঠানের বিস্তারিত বিবরণ বা প্রশ্ন লিখুন..." : "Tell us about your institution or inquiry details..."}
                    value={form.message}
                    onChange={handleChange}
                    className={`w-full rounded-xl border bg-slate-50 focus:bg-white pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 font-medium outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none ${errors.message ? inputError : inputNormal}`}
                  />
                </div>
                {errors.message && (
                  <p className="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1">
                    <FiAlertCircle className="w-3 h-3" />
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 px-6 shadow-sm transition-colors duration-200 cursor-pointer border-none disabled:opacity-60"
              >
                {status === "sending" ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    <span>{isBn ? "পাঠানো হচ্ছে..." : "Sending Message..."}</span>
                  </>
                ) : status === "success" ? (
                  <>
                    <FiCheck className="w-4 h-4" />
                    <span>{isBn ? "মেসেজ সফলভাবে পাঠানো হয়েছে" : "Message Sent Successfully"}</span>
                  </>
                ) : (
                  <>
                    <FiSend className="w-4 h-4" />
                    <span>{isBn ? "মেসেজ পাঠান" : "Submit Inquiry"}</span>
                  </>
                )}
              </button>
            </form>

            {/* Status Notifications */}
            {status === "success" && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold flex items-center gap-2.5">
                <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isBn ? "ধন্যবাদ! আমরা খুব শীঘ্রই আপনার সাথে যোগাযোগ করব।" : "Thank you! We have received your message and will respond shortly."}</span>
              </div>
            )}

            {status === "error" && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold flex items-center gap-2.5">
                <FiAlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{isBn ? "মেসেজ পাঠানো সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।" : "Failed to send message. Please try again or call us directly."}</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default ContactForm;
