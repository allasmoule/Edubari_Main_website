"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  FiPlay,
  FiX,
  FiArrowRight,
} from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}?autoplay=1`
    : null;
};

const Feature = () => {
  const { t, lang } = useLanguage();
  const [videos, setVideos] = useState({});
  const [activeVideo, setActiveVideo] = useState(null);
  const isBn = lang === "bn";

  const features = [
    {
      key: "Student Management",
      slug: "student-management",
      icon: <FiBookOpen className="h-5 w-5" />,
      title: t("feature.f1Title"),
      description: t("feature.f1Desc"),
      color: "text-tertiary",
      bg: "bg-tertiary/10",
      border: "group-hover:border-tertiary/25",
    },
    {
      key: "Payment Management",
      slug: "payment-management",
      icon: <FiCreditCard className="h-5 w-5" />,
      title: t("feature.f2Title"),
      description: t("feature.f2Desc"),
      color: "text-[#2563EB]",
      bg: "bg-[#2563EB]/10",
      border: "group-hover:border-[#2563EB]/25",
    },
    {
      key: "Online Payment",
      slug: "online-payment",
      icon: <FiDollarSign className="h-5 w-5" />,
      title: t("feature.f3Title"),
      description: t("feature.f3Desc"),
      color: "text-[#10B981]",
      bg: "bg-[#10B981]/10",
      border: "group-hover:border-[#10B981]/25",
    },
    {
      key: "Garage & Transport",
      slug: "garage-transport",
      icon: <FiTruck className="h-5 w-5" />,
      title: t("feature.f4Title"),
      description: t("feature.f4Desc"),
      color: "text-[#F59E0B]",
      bg: "bg-[#F59E0B]/10",
      border: "group-hover:border-[#F59E0B]/25",
    },
    {
      key: "Hostel Management",
      slug: "hostel-management",
      icon: <FiHome className="h-5 w-5" />,
      title: t("feature.f5Title"),
      description: t("feature.f5Desc"),
      color: "text-[#8B5CF6]",
      bg: "bg-[#8B5CF6]/10",
      border: "group-hover:border-[#8B5CF6]/25",
    },
    {
      key: "Canteen Management",
      slug: "canteen-management",
      icon: <FiCoffee className="h-5 w-5" />,
      title: t("feature.f6Title"),
      description: t("feature.f6Desc"),
      color: "text-[#EC4899]",
      bg: "bg-[#EC4899]/10",
      border: "group-hover:border-[#EC4899]/25",
    },
    {
      key: "Teacher Panel",
      slug: "teacher-panel",
      icon: <FiUsers className="h-5 w-5" />,
      title: t("feature.f7Title"),
      description: t("feature.f7Desc"),
      color: "text-secondary",
      bg: "bg-secondary/10",
      border: "group-hover:border-secondary/25",
    },
    {
      key: "Attendance Tracking",
      slug: "attendance-tracking",
      icon: <FiCheckSquare className="h-5 w-5" />,
      title: t("feature.f8Title"),
      description: t("feature.f8Desc"),
      color: "text-[#8B5CF6]",
      bg: "bg-[#8B5CF6]/10",
      border: "group-hover:border-[#8B5CF6]/25",
    },
    {
      key: "Result & Grade Management",
      slug: "result-grade-management",
      icon: <FiBarChart2 className="h-5 w-5" />,
      title: t("feature.f9Title"),
      description: t("feature.f9Desc"),
      color: "text-tertiary",
      bg: "bg-tertiary/10",
      border: "group-hover:border-tertiary/25",
    },
    {
      key: "Online Exam System",
      slug: "online-exam-system",
      icon: <FiFileText className="h-5 w-5" />,
      title: t("feature.f10Title"),
      description: t("feature.f10Desc"),
      color: "text-[#10B981]",
      bg: "bg-[#10B981]/10",
      border: "group-hover:border-[#10B981]/25",
    },
    {
      key: "Notice Board",
      slug: "notice-board",
      icon: <FiBell className="h-5 w-5" />,
      title: t("feature.f11Title"),
      description: t("feature.f11Desc"),
      color: "text-secondary",
      bg: "bg-secondary/10",
      border: "group-hover:border-secondary/25",
    },
    {
      key: "Reports & Analytics",
      slug: "reports-analytics",
      icon: <FiTrendingUp className="h-5 w-5" />,
      title: t("feature.f12Title"),
      description: t("feature.f12Desc"),
      color: "text-[#2563EB]",
      bg: "bg-[#2563EB]/10",
      border: "group-hover:border-[#2563EB]/25",
    },
  ];

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch("/api/feature-videos");
        if (res.ok) {
          const data = await res.json();
          const videoMap = {};
          data.forEach((item) => {
            videoMap[item.feature_title] = item.video_url;
          });
          setVideos(videoMap);
        }
      } catch (err) {
        console.error("Failed to load feature videos:", err);
      }
    };
    fetchVideos();
  }, []);

  return (
    <section id="features" className="w-full px-3 sm:px-6 md:px-10 py-6 sm:py-8 lg:py-10 bg-slate-50/50 select-none relative overflow-hidden">
      {/* Background Decorative Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-blue-400/10 via-indigo-500/10 to-purple-500/10 rounded-full blur-[110px] pointer-events-none" />

      <div className="w-full rounded-2xl sm:rounded-3xl border border-white/80 bg-white/80 shadow-[0_15px_40px_-15px_rgba(37,99,235,0.06)] backdrop-blur-xl overflow-hidden relative">
        <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-8 sm:py-10 relative z-10">
          {/* Header */}
          <div className="max-w-2xl mx-auto text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-600 text-[10px] font-black tracking-widest uppercase shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              {t("feature.badge") || "EVERYTHING YOUR INSTITUTION NEEDS"}
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              {t("feature.titleMain") || "Everything Your Institution Needs"}{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                {t("feature.titleGradient") || "in One Platform"}
              </span>
            </h2>

            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 max-w-xl mx-auto font-medium">
              {t("feature.subtitle") || "Complete digital automation for admissions, attendance, exams, payments, and guardian communication."}
            </p>
          </div>

          {/* Feature Cards Grid (5 Cards per Row on Desktop, Compact & 3D Animated) */}
          <div className="mt-6 lg:mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-3.5 [perspective:1200px]">
            {features.map((feature, idx) => {
              const videoUrl = videos[feature.key];
              return (
                <Link
                  key={feature.key}
                  href={`/${feature.slug}`}
                  className="group relative rounded-xl border border-slate-200/70 bg-white/90 backdrop-blur-md p-3.5 sm:p-4 transition-all duration-300 ease-out transform-gpu hover:[transform:rotateX(5deg)_rotateY(-5deg)_translateZ(8px)] hover:shadow-lg hover:shadow-indigo-500/10 hover:border-blue-400 flex flex-col justify-between overflow-hidden cursor-pointer"
                  style={{
                    animationDelay: `${idx * 30}ms`,
                    animation: "fadeInUp 0.4s cubic-bezier(0.23, 1, 0.32, 1) backwards",
                  }}
                >
                  {/* Top 3D Accent Line */}
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div>
                    {/* Header: Icon & Demo Button */}
                    <div className="flex items-center justify-between">
                      {/* Icon Container */}
                      <div
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${feature.bg} ${feature.color} shadow-2xs transition-all duration-300 group-hover:scale-105`}
                      >
                        {feature.icon}
                      </div>

                      {/* YouTube Demo Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveVideo(videoUrl || "empty");
                        }}
                        className="group/btn inline-flex items-center gap-1 pl-1 pr-2 py-0.5 rounded-full bg-slate-50 hover:bg-red-50 border border-slate-200/80 hover:border-red-200 transition-all duration-200 cursor-pointer shadow-2xs"
                        title={t("feature.watchDemo") || "Watch Demo"}
                      >
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-2xs group-hover/btn:scale-110 transition-transform">
                          <FiPlay className="h-2 w-2 ml-0.5" />
                        </span>
                        <span className="text-[8.5px] font-black text-slate-700 group-hover/btn:text-red-600 uppercase tracking-wider">
                          {t("feature.demoBtn") || "DEMO"}
                        </span>
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="mt-2.5 text-xs sm:text-[13px] font-extrabold text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-1 text-[10.5px] leading-snug text-slate-500 font-medium line-clamp-2">
                      {feature.description}
                    </p>
                  </div>

                  {/* Bottom Link indicator */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-blue-600 opacity-80 group-hover:opacity-100">
                    <span>{isBn ? "বিস্তারিত দেখুন" : "View Details"}</span>
                    <FiArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/80 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl shadow-2xl overflow-hidden animate-[scaleUp_0.3s_ease-out]">
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute -top-12 right-0 sm:top-4 sm:-right-12 lg:right-4 lg:top-4 bg-white/10 hover:bg-red-500 text-white rounded-full p-2 transition-colors z-50 cursor-pointer"
            >
              <FiX className="w-6 h-6" />
            </button>
            <div className="relative pt-[56.25%] w-full bg-black">
              {getYouTubeEmbedUrl(activeVideo) ? (
                <iframe
                  className="absolute inset-0 w-full h-full border-0"
                  src={getYouTubeEmbedUrl(activeVideo)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/50">
                  <p className="font-bold text-lg">Demo Video Coming Soon!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Feature;
