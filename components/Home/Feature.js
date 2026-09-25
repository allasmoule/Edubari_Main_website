"use client";

import React, { useState, useEffect } from "react";
import {
  FiBookOpen,
  FiUsers,
  FiCheckSquare,
  FiBarChart2,
  FiFileText,
  FiDollarSign,
  FiBell,
  FiTrendingUp,
  FiPlay,
  FiX,
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
  const { t } = useLanguage();
  const [videos, setVideos] = useState({});
  const [activeVideo, setActiveVideo] = useState(null);

  const features = [
    {
      key: "Student Management",
      icon: <FiBookOpen className="h-5 w-5" />,
      title: t("feature.f1Title"),
      description: t("feature.f1Desc"),
      color: "text-tertiary",
      bg: "bg-tertiary/10",
      border: "group-hover:border-tertiary/25",
    },
    {
      key: "Teacher Panel",
      icon: <FiUsers className="h-5 w-5" />,
      title: t("feature.f2Title"),
      description: t("feature.f2Desc"),
      color: "text-secondary",
      bg: "bg-secondary/10",
      border: "group-hover:border-secondary/25",
    },
    {
      key: "Attendance Tracking",
      icon: <FiCheckSquare className="h-5 w-5" />,
      title: t("feature.f3Title"),
      description: t("feature.f3Desc"),
      color: "text-[#8B5CF6]",
      bg: "bg-[#8B5CF6]/10",
      border: "group-hover:border-[#8B5CF6]/25",
    },
    {
      key: "Result & Grade Management",
      icon: <FiBarChart2 className="h-5 w-5" />,
      title: t("feature.f4Title"),
      description: t("feature.f4Desc"),
      color: "text-tertiary",
      bg: "bg-tertiary/10",
      border: "group-hover:border-tertiary/25",
    },
    {
      key: "Online Exam System",
      icon: <FiFileText className="h-5 w-5" />,
      title: t("feature.f5Title"),
      description: t("feature.f5Desc"),
      color: "text-[#10B981]",
      bg: "bg-[#10B981]/10",
      border: "group-hover:border-[#10B981]/25",
    },
    {
      key: "Fee Management",
      icon: <FiDollarSign className="h-5 w-5" />,
      title: t("feature.f6Title"),
      description: t("feature.f6Desc"),
      color: "text-[#F59E0B]",
      bg: "bg-[#F59E0B]/10",
      border: "group-hover:border-[#F59E0B]/25",
    },
    {
      key: "Notice Board",
      icon: <FiBell className="h-5 w-5" />,
      title: t("feature.f7Title"),
      description: t("feature.f7Desc"),
      color: "text-secondary",
      bg: "bg-secondary/10",
      border: "group-hover:border-secondary/25",
    },
    {
      key: "Reports & Analytics",
      icon: <FiTrendingUp className="h-5 w-5" />,
      title: t("feature.f8Title"),
      description: t("feature.f8Desc"),
      color: "text-tertiary",
      bg: "bg-tertiary/10",
      border: "group-hover:border-tertiary/25",
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
    <section className="w-full px-4 sm:px-6 md:px-12 py-8 sm:py-10 bg-primary/20 select-none">
      <div className="w-full rounded-[32px] border border-white bg-primary-light/80 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.08)] backdrop-blur-md overflow-hidden relative">
        {/* Subtle Ambient flows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-tertiary/5 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#8B5CF6]/5 rounded-full blur-3xl pointer-events-none -ml-32 -mb-32" />

        <div className="px-6 sm:px-8 md:px-10 lg:px-12 py-10 sm:py-12 relative z-10">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tertiary/8 border border-tertiary/15 text-tertiary text-xs font-bold tracking-wide uppercase mb-4">
              {t("feature.badge")}
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-4.5xl font-black tracking-tight text-dark leading-tight">
              {t("feature.titleMain")}{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-500 drop-shadow-sm">
                {t("feature.titleGradient")}
              </span>
            </h2>

            <p className="mt-4 text-sm sm:text-base leading-relaxed text-dark/70 max-w-2xl mx-auto font-medium">
              {t("feature.subtitle")}
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="mt-10 lg:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, idx) => {
              const videoUrl = videos[feature.key];
              return (
                <div
                  key={feature.key}
                  className="group relative rounded-2xl border border-white bg-white/70 backdrop-blur-xs p-5 sm:p-5.5 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-tertiary/5 hover:bg-white flex flex-col justify-between"
                  style={{
                    animationDelay: `${idx * 60}ms`,
                    animation: "fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) backwards",
                  }}
                >
                  <div>
                    {/* Header: Icon & Video Button */}
                    <div className="flex items-start justify-between">
                      {/* Icon */}
                      <div
                        className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${feature.bg} ${feature.color} shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:shadow-md`}
                      >
                        {feature.icon}
                      </div>

                      {/* YouTube Button */}
                      <button
                        onClick={() => setActiveVideo(videoUrl || "empty")}
                        className="group/btn inline-flex items-center gap-1.5 pl-1.5 pr-3 py-1.5 rounded-full bg-white border border-red-100 shadow-[0_2px_8px_-2px_rgba(239,68,68,0.15)] hover:shadow-[0_4px_12px_-2px_rgba(239,68,68,0.25)] hover:border-red-300 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                        title={t("feature.watchDemo")}
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-sm group-hover/btn:scale-110 transition-transform duration-300">
                          <FiPlay className="h-3 w-3 ml-0.5" />
                        </span>
                        <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-widest mt-0.5">
                          {t("feature.demoBtn")}
                        </span>
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="mt-4 text-base font-extrabold text-dark tracking-tight leading-snug">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 text-xs leading-relaxed text-dark/60 font-medium">
                      {feature.description}
                    </p>
                  </div>
                </div>
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
