"use client";

import React, { useState, useEffect } from "react";
import { FiVideo, FiSave, FiLoader, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

const FEATURE_TITLES = [
  "Student Management",
  "Teacher Panel",
  "Attendance Tracking",
  "Result & Grade Management",
  "Online Exam System",
  "Fee Management",
  "Notice Board",
  "Reports & Analytics",
];

export default function FeatureVideosPage() {
  const [videos, setVideos] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // Track which feature is saving
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/feature-videos");
      if (!res.ok) throw new Error("Failed to fetch feature videos");
      const data = await res.json();
      
      const videoMap = {};
      data.forEach(item => {
        videoMap[item.feature_title] = item.video_url;
      });
      setVideos(videoMap);
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to load videos", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (featureTitle) => {
    try {
      setSaving(featureTitle);
      setMessage({ text: "", type: "" });
      
      const videoUrl = videos[featureTitle] || "";
      
      const res = await fetch("/api/feature-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature_title: featureTitle,
          video_url: videoUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      
      setMessage({ text: `Saved video for ${featureTitle}!`, type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to save video", type: "error" });
    } finally {
      setSaving(null);
    }
  };

  const handleChange = (title, url) => {
    setVideos(prev => ({ ...prev, [title]: url }));
  };

  return (
    <div className="space-y-6 animate-[fadeInUp_0.35s_ease-out]">
      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 sm:p-6 shadow-lg shadow-dark/3">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-extrabold text-dark tracking-tight flex items-center gap-2">
            <FiVideo className="text-tertiary" /> Demo Video Add
          </h2>
          <p className="text-xs sm:text-sm text-dark/45 font-medium mt-1">
            Add distinct YouTube video links for each feature card on the Home Page.
          </p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 text-sm font-bold ${
            message.type === "success" ? "bg-green-50 text-green-600 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"
          }`}>
            {message.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center">
            <FiLoader className="w-8 h-8 mx-auto text-tertiary animate-spin mb-3" />
            <p className="text-dark/50 font-semibold text-sm">Loading videos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURE_TITLES.map((title) => (
              <div key={title} className="p-5 rounded-2xl border border-dark/10 bg-white/50 shadow-sm hover:shadow-md transition-all">
                <h3 className="text-sm font-bold text-dark mb-3">{title}</h3>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videos[title] || ""}
                    onChange={(e) => handleChange(title, e.target.value)}
                    className="w-full rounded-xl border border-dark/10 bg-white px-4 py-2.5 text-sm font-medium text-dark outline-none focus:border-tertiary focus:ring-2 focus:ring-tertiary/10 transition-all"
                  />
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSave(title)}
                      disabled={saving === title}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-tertiary to-[#8B5CF6] px-4 py-2 text-white text-xs font-bold shadow-md shadow-tertiary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 border-none cursor-pointer"
                    >
                      {saving === title ? <FiLoader className="animate-spin w-3.5 h-3.5" /> : <FiSave className="w-3.5 h-3.5" />}
                      {saving === title ? "Saving..." : "Save Link"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
