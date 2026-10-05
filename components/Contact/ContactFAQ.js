"use client";

import React, { useState } from "react";
import { FiChevronDown, FiHelpCircle, FiMessageCircle } from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";

const faqs = [
  {
    id: 1,
    qBn: "EduBari ইআরপি সেটআপ করতে কত সময় লাগে?",
    qEn: "How long does EduBari ERP setup take?",
    aBn: "সাধারণত ২৪ ঘণ্টার মধ্যেই আপনার প্রতিষ্ঠানের লোগো, তথ্য ও ডোমেইন সহ সম্পূর্ণ সফটওয়্যার এবং ওয়েবসাইট রেডি হয়ে যায়।",
    aEn: "Usually within 24 hours, your complete school website, database, and ERP software setup will be ready to use.",
  },
  {
    id: 2,
    qBn: "আমরা কি ফ্রি ডেমো অ্যাকাউন্ট দেখতে পারি?",
    qEn: "Can we request a live software demo first?",
    aBn: "হ্যাঁ, অবশ্যই! আপনি উপরের ফর্মে আপনার যোগাযোগের নম্বর দিলে আমাদের সাপোর্ট টিম লাইভ ডেমো দেখানোর ব্যবস্থা করে দেবে।",
    aEn: "Yes! Simply fill out the contact form or message us on WhatsApp to schedule a live guided walkthrough.",
  },
  {
    id: 3,
    qBn: "কোনো টেকনিক্যাল সমস্যা হলে কীভাবে সাহায্য পাব?",
    qEn: "What kind of support is available after purchasing?",
    aBn: "আমাদের ডেডিকেটেড সাপোর্ট টিম সিক্স ডেজ (শনিবার থেকে বৃহস্পতিবার) সকাল ১০টা থেকে রাত ৮টা পর্যন্ত হোয়াটসঅ্যাপ ও ফোনের মাধ্যমে ইনস্ট্যান্ট সহায়তা দিয়ে থাকে।",
    aEn: "We provide dedicated phone & WhatsApp support 6 days a week (Sat-Thu: 10 AM - 8 PM) for all operational help.",
  },
  {
    id: 4,
    qBn: "বিকাশ, নগদ বা ব্যাংক পেমেন্ট সাপোর্ট আছে কি?",
    qEn: "What payment methods do you accept?",
    aBn: "হ্যাঁ, বিকাশ (bKash), নগদ (Nagad), রকেট ও সকল দেশীয় ও আন্তর্জাতিক ব্যাংক কার্ড দিয়ে সহজে ফি প্রদান করা যায়।",
    aEn: "We support bKash, Nagad, Rocket, card payments, and online bank transfers for subscription activation.",
  },
];

const ContactFAQ = () => {
  const { lang } = useLanguage();
  const isBn = lang === "bn";
  const [activeId, setActiveId] = useState(1);

  const toggleFAQ = (id) => {
    setActiveId(activeId === id ? null : id);
  };

  return (
    <section className="w-full px-4 sm:px-6 md:px-12 py-12 bg-slate-50/70 border-t border-slate-200/60">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-3">
            <FiHelpCircle className="w-3.5 h-3.5" />
            <span>{isBn ? "সাধারণ প্রশ্নোত্তর" : "Frequently Asked Questions"}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
            {isBn ? "সচরাচর জিজ্ঞাসিত " : "Have Questions Before "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600">
              {isBn ? "প্রশ্নাবলী" : "Contacting Us?"}
            </span>
          </h2>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq) => {
            const isOpen = activeId === faq.id;
            const questionText = isBn ? faq.qBn : faq.qEn;
            const answerText = isBn ? faq.aBn : faq.aEn;

            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "bg-white border-indigo-300 shadow-md shadow-indigo-500/5"
                    : "bg-white/70 border-slate-200 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-900 text-base sm:text-lg cursor-pointer border-none bg-transparent"
                >
                  <span className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-indigo-600" : "bg-slate-300"}`} />
                    {questionText}
                  </span>
                  <FiChevronDown
                    className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-indigo-600" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm sm:text-base leading-relaxed text-slate-600 font-medium border-t border-slate-100 animate-[fadeIn_0.2s_ease-out]">
                    {answerText}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ContactFAQ;
