"use client";

import React from "react";
import { FiMapPin, FiNavigation, FiClock, FiPhoneCall } from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";

const ContactMap = () => {
  const { lang } = useLanguage();
  const isBn = lang === "bn";

  return (
    <section className="w-full px-4 sm:px-6 md:px-12 py-12 lg:py-16 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold uppercase tracking-wider mb-3">
            <FiMapPin className="h-3.5 w-3.5" />
            <span>{isBn ? "আমাদের লোকেশন" : "Our Office Location"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
            {isBn ? "সরাসরি ভিজিট করুন " : "Visit Our Office In "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">
              {isBn ? "বটবাড়ী, ঢাকা" : "Botbari, Dhaka"}
            </span>
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-500 font-medium max-w-md mx-auto">
            {isBn
              ? "অফিসে এসে পরামর্শ নিতে বা যেকোনো প্রাতিষ্ঠানিক চুক্তির জন্য স্বাগতম।"
              : "We welcome school directors, teachers, and partners to visit our office."}
          </p>
        </div>

        {/* Map Container */}
        <div className="relative rounded-3xl border border-slate-200/90 bg-white p-2.5 sm:p-3 shadow-xl shadow-slate-200/50 overflow-hidden">
          <iframe
            title="EduBari Office Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.902462935049!2d90.39945231498256!3d23.750904284588735!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b087026b81%3A0x8fa563bbdd5904c2!2sDhaka!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd"
            width="100%"
            height="420"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full rounded-2xl"
          />
        </div>

        {/* Location Info Badges Below Map */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
              <FiMapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{isBn ? "ঠিকানা" : "Address"}</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">Botbari, Dhaka, Bangladesh</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
              <FiClock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{isBn ? "অফিস সময়" : "Working Hours"}</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{isBn ? "শনিবার - বৃহস্পতিবার: ১০ AM - ৮ PM" : "Sat - Thu: 10 AM - 8 PM"}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/20 text-white shrink-0">
                <FiNavigation className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider">{isBn ? "গুগুল ম্যাপ" : "Google Maps"}</p>
                <p className="text-sm font-extrabold text-white mt-0.5">{isBn ? "দিকনির্দেশনা পান" : "Get Directions"}</p>
              </div>
            </div>

            <a
              href="https://maps.google.com/?q=23.7509,90.3995"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white text-indigo-700 text-xs font-black shadow-xs hover:bg-indigo-50 transition-colors"
            >
              Open →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactMap;
