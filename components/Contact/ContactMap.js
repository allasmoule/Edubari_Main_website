"use client";

import React from "react";
import { FiMapPin, FiNavigation, FiClock } from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";

const ContactMap = () => {
  const { lang } = useLanguage();
  const isBn = lang === "bn";

  return (
    <section className="w-full px-4 sm:px-6 md:px-12 py-12 lg:py-16 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <FiMapPin className="h-3.5 w-3.5 text-blue-600" />
            <span>{isBn ? "আমাদের লোকেশন" : "Our Office Location"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
            {isBn ? "সরাসরি ভিজিট করুন " : "Visit Our Office In "}
            <span className="text-blue-600">
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
        <div className="relative rounded-2xl border border-slate-200 bg-white p-2 shadow-sm overflow-hidden">
          <iframe
            title="EduBari Office Location"
            src="https://maps.google.com/maps?ll=23.869212,90.309887&z=15&t=m&hl=en&gl=BD&cid=17919211829164170367&output=embed"
            width="100%"
            height="420"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full rounded-xl"
          />
        </div>

        {/* Location Info Badges Below Map */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="p-2.5 rounded-lg bg-slate-200/70 text-slate-700 shrink-0">
              <FiMapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{isBn ? "ঠিকানা" : "Address"}</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">Botbari, Dhaka, Bangladesh</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="p-2.5 rounded-lg bg-slate-200/70 text-slate-700 shrink-0">
              <FiClock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{isBn ? "অফিস সময়" : "Working Hours"}</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{isBn ? "শনিবার - বৃহস্পতিবার: ১০ AM - ৮ PM" : "Sat - Thu: 10 AM - 8 PM"}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-800 text-white shrink-0">
                <FiNavigation className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{isBn ? "গুগল ম্যাপ" : "Google Maps"}</p>
                <p className="text-sm font-bold text-white mt-0.5">{isBn ? "দিকনির্দেশনা পান" : "Get Directions"}</p>
              </div>
            </div>

            <a
              href="https://www.google.com/maps?ll=23.869212,90.309887&z=15&t=m&hl=en&gl=BD&mapclient=embed&cid=17919211829164170367"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors"
            >
              Open
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactMap;
