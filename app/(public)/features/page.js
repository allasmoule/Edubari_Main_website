"use client";

import React from "react";
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
  FiArrowRight,
  FiLayers,
} from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";
import { featuresData } from "@/lib/featuresData";

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

export default function FeaturesOverviewPage() {
  const { lang } = useLanguage();
  const isBn = lang === "bn";

  return (
    <div className="w-full bg-slate-50/50 min-h-screen py-10 sm:py-14 lg:py-16 selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            {isBn ? "প্রতিষ্ঠানের ডিজিটাল সমাধান" : "INSTITUTIONAL SOLUTIONS"}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {isBn ? "আপনার প্রতিষ্ঠানের প্রয়োজনীয়" : "Everything Your Institution"}{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              {isBn ? "সবকিছু এক সাথে" : "Needs in One ERP"}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            {isBn
              ? "স্টুডেন্ট ভর্তি থেকে শুরু করে উপস্থিতি, পেমেন্ট, অনলাইন পরীক্ষা ও রেজাল্ট অটোমেশনের জন্য ১২টি প্রধান সমন্বিত সিস্টেম।"
              : "Comprehensive automated modules for admissions, payments, online exams, parent SMS alerts, and analytical reporting."}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuresData.map((feature) => {
            const IconComponent = iconMap[feature.iconKey] || FiLayers;
            const title = isBn ? feature.titleBn : feature.titleEn;
            const subtitle = isBn ? feature.subtitleBn : feature.subtitleEn;

            return (
              <Link
                key={feature.slug}
                href={`/${feature.slug}`}
                className="group relative bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-xl hover:border-blue-400 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {/* Top Accent Gradient */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  {/* Image Card Mockup */}
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-100 mb-4 border border-slate-100">
                    <Image
                      src={feature.image}
                      alt={title}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Icon & Title Header */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-xl ${feature.bg} ${feature.color} border ${feature.border}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h2 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                      {title}
                    </h2>
                  </div>

                  {/* Subtitle */}
                  <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3">
                    {subtitle}
                  </p>
                </div>

                {/* Bottom Action Link */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                  <span>{isBn ? "বিস্তারিত দেখুন" : "Learn More"}</span>
                  <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
