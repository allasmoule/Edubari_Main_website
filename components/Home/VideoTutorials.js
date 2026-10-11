"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FaPlay, FaYoutube } from "react-icons/fa";
import { FiExternalLink, FiX, FiVideo } from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";

const videoCards = [
  {
    id: "erp-module",
    category: "SCHOOL & COLLEGE ERP",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    playBtnColor: "bg-teal-600 hover:bg-teal-500 shadow-teal-600/30",
    titleBn: "School ERP Module — সম্পূর্ণ বাংলা গাইড",
    titleEn: "School ERP Module — Complete Bangla Guide",
    descBn:
      "পুরো স্কুল ইআরপি বাংলায়: স্টুডেন্ট ভর্তি, ডিজিটাল হাজিরা, শিক্ষক ও স্টাফ প্রোফাইল, রুটিন ম্যানেজমেন্ট, নোটিশ বোর্ড এবং প্রতিষ্ঠানের পূর্ণাঙ্গ ডায়নামিক ওয়েবসাইট সেটআপ।",
    descEn:
      "Full School ERP in Bangla: Student admission, digital attendance, teacher profiles, class routines, notice board, and instant free website setup.",
    youtubeId: "dQw4w9WgXcQ", // Replaceable with client's exact YouTube Video ID / URL
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "/videos/thumb_erp.png",
    duration: "০৮:১৫ মিনিট",
  },
  {
    id: "fee-accounts",
    category: "FEES & ACCOUNTS MANAGEMENT",
    badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
    playBtnColor: "bg-sky-600 hover:bg-sky-500 shadow-sky-600/30",
    titleBn: "Accounts & Fee Collection — সম্পূর্ণ বাংলা গাইড",
    titleEn: "Accounts & Fee Collection — Complete Bangla Guide",
    descBn:
      "ফি কালেকশন মডিউল বাংলায়: অটো রসিদ জেনারেট, বকেয়া ফি ট্র্যাকিং, বিকাশ/নগদ অনলাইন পেমেন্ট ইন্টিগ্রেশন, খরচের ভাউচার এবং দিনশেষের আয়-ব্যয় ও ক্যাশ কাউন্টিং রিপোর্ট।",
    descEn:
      "Fee Collection in Bangla: Auto invoice generation, due tracking, bKash & Nagad online payments, expense vouchers, and daily cash closing reports.",
    youtubeId: "dQw4w9WgXcQ",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "/videos/thumb_fees.png",
    duration: "০৬:৪৫ মিনিট",
  },
  {
    id: "exam-result",
    category: "EXAM & RESULT MANAGEMENT",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    playBtnColor: "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30",
    titleBn: "Exam & Result Sheet — সম্পূর্ণ বাংলা গাইড",
    titleEn: "Exam & Result Sheet — Complete Bangla Guide",
    descBn:
      "পরীক্ষা ও ফলাফল তৈরি বাংলায়: গ্রেডিং সিস্টেম কনফিগারেশন, পরীক্ষার সিট প্ল্যান, বিষয়ভিত্তিক নম্বর এন্ট্রি, টেবুলেশন শিট, মার্কশিট প্রিন্ট এবং এসএমএসে ফলাফল প্রকাশ।",
    descEn:
      "Exam & Result Management in Bangla: Grading system setup, seat plans, subject mark entry, tabulation sheet, marksheets print, and SMS result publishing.",
    youtubeId: "dQw4w9WgXcQ",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "/videos/thumb_exam.png",
    duration: "০৭:২০ মিনিট",
  },
];

const VideoTutorials = () => {
  const { lang } = useLanguage();
  const isBn = lang === "bn";
  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <section id="tutorials" className="w-full px-4 sm:px-6 md:px-12 py-12 lg:py-16 bg-white select-none">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider mb-3">
            <FiVideo className="h-3.5 w-3.5 text-blue-600" />
            <span>{isBn ? "ভিডিও টিউটোরিয়াল" : "Video Tutorials"}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            {isBn ? "ভিডিওতে দেখুন " : "Watch How "}
            <span className="text-blue-600">
              {isBn ? "EduBari যেভাবে কাজ করে" : "EduBari Works"}
            </span>
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            {isBn
              ? "আমাদের প্রতিটি মডিউল ব্যবহার করার নিয়ম বাংলায় ধাপে ধাপে ভিডিও টিউটোরিয়ালে দেখে নিন।"
              : "Step-by-step video guides in Bangla showing how to use each module of EduBari ERP effortlessly."}
          </p>
        </div>

        {/* 3 Video Cards Grid (Exact look & feel as reference image) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
          {videoCards.map((video) => (
            <div
              key={video.id}
              className="group flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 overflow-hidden"
            >
              <div>
                {/* Thumbnail Container with Aspect Ratio */}
                <div
                  onClick={() => setActiveVideo(video)}
                  className="relative aspect-video w-full overflow-hidden bg-slate-900 cursor-pointer"
                >
                  <Image
                    src={video.thumbnail}
                    alt={video.titleBn}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority
                  />

                  {/* Subtle dark gradient overlay */}
                  <div className="absolute inset-0 bg-slate-900/25 group-hover:bg-slate-900/15 transition-colors" />

                  {/* Circular Play Button in Center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full ${video.playBtnColor} text-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110`}
                    >
                      <FaPlay className="w-4 h-4 ml-0.5 text-white" />
                    </div>
                  </div>

                  {/* Duration Pill at bottom right */}
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold">
                    {video.duration}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 sm:p-6">
                  {/* Category Pill */}
                  <div className="mb-2.5">
                    <span
                      className={`inline-block text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-md border ${video.badgeColor}`}
                    >
                      {video.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => setActiveVideo(video)}
                    className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    {isBn ? video.titleBn : video.titleEn}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-xs sm:text-[13px] text-slate-600 font-medium leading-relaxed">
                    {isBn ? video.descBn : video.descEn}
                  </p>
                </div>
              </div>

              {/* Card Footer: Watch on YouTube link */}
              <div className="px-5 sm:px-6 pb-5 pt-0">
                <a
                  href={video.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  <FaYoutube className="w-4 h-4 text-red-600" />
                  <span>Watch on YouTube</span>
                  <FiExternalLink className="w-3 h-3 text-blue-600" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Playback Modal Popup */}
      {activeVideo && (
        <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-[scaleUp_0.25s_ease-out]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-slate-950 border-b border-slate-800 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <FaPlay className="w-3 h-3 ml-0.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">
                    {isBn ? activeVideo.titleBn : activeVideo.titleEn}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    {activeVideo.category}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border-none"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Video Iframe Container */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                className="w-full h-full border-0"
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1`}
                title={activeVideo.titleBn}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Modal Footer */}
            <div className="px-5 sm:px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <p className="font-medium">
                {isBn ? "EduBari অফিসিয়াল ভিডিও গাইড" : "EduBari Official Video Guide"}
              </p>
              <a
                href={activeVideo.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-blue-400 hover:text-blue-300"
              >
                <span>Open in YouTube</span>
                <FiExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default VideoTutorials;
