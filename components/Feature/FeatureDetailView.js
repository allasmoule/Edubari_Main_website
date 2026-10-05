"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FiBookOpen,
  FiCreditCard,
  FiDollarSign,
  FiTruck,
  FiHome,
  FiCoffee,
  FiUsers,
  FiCheckSquare,
  FiBarChart2,
  FiFileText,
  FiBell,
  FiTrendingUp,
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiShield,
  FiHelpCircle,
  FiLayers,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";
import { featuresData, getFeatureBySlug } from "@/lib/featuresData";

const iconMap = {
  FiBookOpen: FiBookOpen,
  FiCreditCard: FiCreditCard,
  FiDollarSign: FiDollarSign,
  FiTruck: FiTruck,
  FiHome: FiHome,
  FiCoffee: FiCoffee,
  FiUsers: FiUsers,
  FiCheckSquare: FiCheckSquare,
  FiBarChart2: FiBarChart2,
  FiFileText: FiFileText,
  FiBell: FiBell,
  FiTrendingUp: FiTrendingUp,
};

export default function FeatureDetailView({ slug }) {
  const { lang } = useLanguage();
  const isBn = lang === "bn";

  const feature = getFeatureBySlug(slug);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  if (!feature) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
          <FiHelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {isBn ? "ফিচারটি পাওয়া যায়নি" : "Feature Not Found"}
        </h1>
        <p className="text-slate-600 max-w-md mb-6">
          {isBn
            ? "আপনার অনুরোধকৃত ফিচার পেজটি বিদ্যমান নেই অথবা রিমুভ করা হয়েছে।"
            : "The feature page you requested does not exist or has been removed."}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-md"
        >
          <FiArrowLeft className="w-4 h-4" />
          {isBn ? "হোম পেজে ফিরে যান" : "Back to Home"}
        </Link>
      </div>
    );
  }

  const IconComponent = iconMap[feature.iconKey] || FiLayers;
  const modules = isBn ? feature.modulesBn : feature.modulesEn;
  const benefits = isBn ? feature.benefitsBn : feature.benefitsEn;
  const faqs = isBn ? feature.faqBn : feature.faqEn;

  // Find next and previous features for navigation
  const currentIndex = featuresData.findIndex((f) => f.slug === slug);
  const prevFeature = featuresData[(currentIndex - 1 + featuresData.length) % featuresData.length];
  const nextFeature = featuresData[(currentIndex + 1) % featuresData.length];

  return (
    <div className="w-full bg-slate-50/50 min-h-screen py-10 sm:py-14 lg:py-16 selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <Link
            href="/#features"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-full border border-slate-200 shadow-xs hover:border-blue-300"
          >
            <FiArrowLeft className="w-4 h-4" />
            {isBn ? "হোম ফিচারসমূহে ফিরে যান" : "Back to Home Features"}
          </Link>

          <Link
            href="/features"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-4 py-2 rounded-full border border-blue-200"
          >
            <FiLayers className="w-4 h-4" />
            {isBn ? "সব ফিচার ওভারভিউ" : "All Features Overview"}
          </Link>
        </div>

        {/* Hero Section */}
        <div className="relative rounded-3xl bg-white border border-slate-200/80 shadow-xl overflow-hidden p-6 sm:p-10 lg:p-12 mb-12">
          {/* Background Glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                {isBn ? feature.badgeBn : feature.badgeEn}
              </div>

              {/* Title & Icon Header */}
              <div className="flex items-start gap-4">
                <div
                  className={`shrink-0 p-3.5 sm:p-4 rounded-2xl ${feature.bg} ${feature.color} border ${feature.border} shadow-xs mt-1`}
                >
                  <IconComponent className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                    {isBn ? feature.titleBn : feature.titleEn}
                  </h1>
                  <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                    {isBn ? feature.subtitleBn : feature.subtitleEn}
                  </p>
                </div>
              </div>

              {/* Overview Text */}
              <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/60">
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  {isBn ? feature.overviewBn : feature.overviewEn}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/payment-purchase"
                  className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 flex items-center gap-2"
                >
                  {isBn ? "প্যাকেজ ও মূল্য দেখুন" : "View Plans & Pricing"}
                  <FiArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="https://erp.edubari.bd/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-md transition-all duration-200 flex items-center gap-2"
                >
                  {isBn ? "লাইভ ডেমো দেখুন" : "Live Software Demo"}
                </Link>
              </div>
            </div>

            {/* Right Mockup Image */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-900 shadow-2xl group">
                {/* Window Header Bar */}
                <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between border-b border-slate-700">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
                    edubari.bd/{feature.slug}
                  </span>
                  <div className="w-10" />
                </div>

                {/* Feature Image */}
                <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={isBn ? feature.titleBn : feature.titleEn}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Modules Grid */}
        <div className="mb-14">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {isBn ? "প্রধান বৈশিষ্ট্যসমূহ" : "Core Capabilities"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              {isBn ? "মডিউলের কার্যকারিতা" : "Module Key Features"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
              {isBn
                ? "আপনার শিক্ষা প্রতিষ্ঠানের দৈনন্দিন কার্যক্রম আরও গতিশীল করার জন্য প্রস্তুতকৃত টুলস"
                : "Designed to elevate operational efficiency and eliminate administrative workload."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((m, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      0{idx + 1}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {m.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {m.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[11px] font-bold text-blue-600">
                  <FiCheckCircle className="w-3.5 h-3.5 mr-1.5" />
                  {isBn ? "সম্পূর্ণ অন্তর্ভুক্ত" : "Fully Included"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 lg:p-12 mb-14 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-800">
              {isBn ? "প্রতিষ্ঠানিক সুফল" : "Key Institutional Benefits"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
              {isBn
                ? "কেন এই ফিচারটি আপনার প্রতিষ্ঠানের জন্য অপরিহার্য?"
                : "Why This Feature is Essential for Your School"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 flex items-start gap-3.5 hover:bg-white/10 transition-colors"
              >
                <div className="shrink-0 p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30">
                  <FiShield className="w-5 h-5" />
                </div>
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed pt-0.5">
                  {benefit}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="max-w-4xl mx-auto mb-14">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {isBn ? "প্রশ্নোত্তর" : "FAQ"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              {isBn ? "সাধারণ জিজ্ঞাসাসমূহ" : "Frequently Asked Questions"}
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden transition-all shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <FiHelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <FiChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <FiChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 border-t border-slate-100 font-medium leading-relaxed bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Feature Navigation Links */}
        <div className="border-t border-slate-200 pt-8 pb-4 flex items-center justify-between gap-4">
          <Link
            href={`/${prevFeature.slug}`}
            className="group flex items-center gap-3 text-left p-3 rounded-2xl hover:bg-white transition-all border border-transparent hover:border-slate-200"
          >
            <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-blue-50 text-slate-600 group-hover:text-blue-600 transition-colors">
              <FiArrowLeft className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {isBn ? "পূর্ববর্তী ফিচার" : "Previous Feature"}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">
                {isBn ? prevFeature.titleBn : prevFeature.titleEn}
              </span>
            </div>
          </Link>

          <Link
            href={`/${nextFeature.slug}`}
            className="group flex items-center gap-3 text-right p-3 rounded-2xl hover:bg-white transition-all border border-transparent hover:border-slate-200"
          >
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {isBn ? "পরবর্তী ফিচার" : "Next Feature"}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">
                {isBn ? nextFeature.titleBn : nextFeature.titleEn}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-blue-50 text-slate-600 group-hover:text-blue-600 transition-colors">
              <FiArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
