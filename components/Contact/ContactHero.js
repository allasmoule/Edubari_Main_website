"use client";

import React from "react";
import { FiMessageSquare, FiPhoneCall, FiMail, FiClock, FiCheckCircle, FiZap } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";

const ContactHero = () => {
  const { lang } = useLanguage();
  const isBn = lang === "bn";

  return (
    <section className="relative w-full overflow-hidden bg-slate-900 pt-16 sm:pt-20 pb-16 lg:pb-24 text-white">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-950 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Overlay Pattern */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 pointer-events-none"
      />

      <div className="relative px-4 sm:px-6 md:px-12 max-w-6xl mx-auto z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Top Floating Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs sm:text-sm font-bold tracking-wide uppercase mb-6 backdrop-blur-md shadow-lg shadow-indigo-500/10">
            <FiZap className="h-4 w-4 text-amber-400 animate-bounce" />
            <span>{isBn ? "আমরা আপনাকে সাহায্য করতে প্রস্তুত" : "We Are Ready To Help You"}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
            {isBn ? "যেকোনো প্রয়োজনে আমাদের সাথে " : "Get In Touch With "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-400 via-indigo-300 to-purple-400 drop-shadow-md">
              {isBn ? "যোগাযোগ করুন" : "EduBari Team"}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-300 font-medium max-w-2xl mx-auto">
            {isBn
              ? "আপনার শিক্ষা প্রতিষ্ঠানের ডিজিটাল সমাধানের জন্য যেকোনো প্রশ্ন বা পরামর্শে আমরা আছি আপনার পাশে। কল, ওয়াটসঅ্যাপ অথবা মেসেজ পাঠান এখনই।"
              : "Have questions about EduBari ERP or need a customized solution for your school? Our experts are here to guide you 24/7."}
          </p>

          {/* Quick Action Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href="https://wa.me/8801754958008"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              <FaWhatsapp className="w-4 h-4 text-emerald-100" />
              <span>{isBn ? "হোয়াটসঅ্যাপে চ্যাট করুন" : "WhatsApp Chat"}</span>
            </a>

            <a
              href="tel:+8801754958008"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              <FiPhoneCall className="w-4 h-4 text-indigo-100" />
              <span>+880 1754-958008</span>
            </a>

            <a
              href="mailto:support.edubari@gmail.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-semibold hover:-translate-y-0.5 transition-all duration-300"
            >
              <FiMail className="w-4 h-4 text-purple-400" />
              <span>{isBn ? "ইমেইল করুন" : "Send Email"}</span>
            </a>
          </div>

          {/* Highlights Row */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-slate-300">
              <FiCheckCircle className="text-emerald-400 h-4 w-4 shrink-0" />
              <span>{isBn ? "তাৎক্ষণিক প্রতিক্রিয়া" : "Instant Support Response"}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-slate-300">
              <FiClock className="text-blue-400 h-4 w-4 shrink-0" />
              <span>{isBn ? "সাপ্তাহিক ৬ দিন সেবা" : "6 Days Service Support"}</span>
            </div>
            <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-slate-300">
              <FiZap className="text-amber-400 h-4 w-4 shrink-0" />
              <span>{isBn ? "ফ্রি ডেমো এবং গাইড" : "Free Demo & Guidance"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactHero;
