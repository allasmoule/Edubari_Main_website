"use client";

import React, { useState } from "react";
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiCopy,
  FiCheck,
  FiExternalLink,
  FiArrowUpRight,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";

const ContactInfo = () => {
  const { lang } = useLanguage();
  const isBn = lang === "bn";
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const cards = [
    {
      key: "office",
      icon: <FiMapPin className="h-6 w-6 text-blue-600" />,
      badge: isBn ? "হেড অফিস" : "Headquarters",
      title: isBn ? "আমাদের অফিস" : "Our Office",
      detail: "Botbari, Dhaka, Bangladesh",
      subDetail: isBn ? "সরাসরি ভিজিট করুন সকাল ১০টা - রাত ৮টা" : "Visit us Sat - Thu: 10 AM - 8 PM",
      actionText: isBn ? "ম্যাপে দেখুন" : "View Map",
      actionUrl: "https://maps.google.com/?q=23.7509,90.3995",
      accentBg: "bg-blue-50 hover:bg-blue-100/80 text-blue-700 border-blue-200",
      iconBg: "bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20",
    },
    {
      key: "phone",
      icon: <FiPhone className="h-6 w-6 text-indigo-600" />,
      badge: isBn ? "২৪/৭ হটলাইন" : "24/7 Helpline",
      title: isBn ? "কল করুন" : "Direct Call",
      detail: "+880 1754-958008",
      subDetail: isBn ? "সরাসরি কাস্টমার কেয়ারে কল দিন" : "Speak directly to support team",
      actionText: isBn ? "কল করুন" : "Call Now",
      actionUrl: "tel:+8801754958008",
      copyText: "+8801754958008",
      accentBg: "bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 border-indigo-200",
      iconBg: "bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/20",
    },
    {
      key: "whatsapp",
      icon: <FaWhatsapp className="h-6 w-6 text-emerald-600" />,
      badge: isBn ? "ইনস্ট্যান্ট চ্যাট" : "Instant Chat",
      title: isBn ? "হোয়াটসঅ্যাপ সাপোর্ট" : "WhatsApp Support",
      detail: "+880 1754-958008",
      subDetail: isBn ? "মেসেজ দিলে দ্রত রিপ্লাই পাবেন" : "Fast responses on WhatsApp",
      actionText: isBn ? "চ্যাট শুরু করুন" : "Open WhatsApp",
      actionUrl: "https://wa.me/8801754958008",
      isWhatsapp: true,
      accentBg: "bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border-emerald-200",
      iconBg: "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20",
    },
    {
      key: "email",
      icon: <FiMail className="h-6 w-6 text-purple-600" />,
      badge: isBn ? "অফিসিয়াল ইমেইল" : "Official Mail",
      title: isBn ? "ইমেইল পাঠান" : "Email Support",
      detail: "support.edubari@gmail.com",
      subDetail: isBn ? "যেকোনো অফিসিয়াল প্রস্তাবের জন্য" : "For official queries & demo request",
      actionText: isBn ? "মেইল লিখুন" : "Send Mail",
      actionUrl: "mailto:support.edubari@gmail.com",
      copyText: "support.edubari@gmail.com",
      accentBg: "bg-purple-50 hover:bg-purple-100/80 text-purple-700 border-purple-200",
      iconBg: "bg-purple-500/10 text-purple-600 ring-1 ring-purple-500/20",
    },
  ];

  return (
    <section className="relative z-20 -mt-10 sm:-mt-14 px-4 sm:px-6 md:px-12 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {cards.map((card) => (
          <div
            key={card.key}
            className="group relative bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-300 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
          >
            <div>
              {/* Header Badge & Icon */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`inline-flex items-center justify-center p-3 rounded-xl ${card.iconBg} transition-transform duration-300 group-hover:scale-110`}
                >
                  {card.icon}
                </div>

                <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                  {card.badge}
                </span>
              </div>

              {/* Title & Info */}
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {card.title}
              </h3>

              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="text-sm font-extrabold text-slate-800 break-all">
                  {card.detail}
                </p>

                {card.copyText && (
                  <button
                    type="button"
                    onClick={() => handleCopy(card.copyText, card.key)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                    title={isBn ? "কপি করুন" : "Copy"}
                  >
                    {copiedKey === card.key ? (
                      <FiCheck className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <FiCopy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              <p className="mt-1.5 text-xs font-medium text-slate-500">
                {card.subDetail}
              </p>
            </div>

            {/* Action Link Button */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <a
                href={card.actionUrl}
                target={card.actionUrl.startsWith("http") ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className={`w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 border ${card.accentBg}`}
              >
                <span>{card.actionText}</span>
                <FiArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ContactInfo;
