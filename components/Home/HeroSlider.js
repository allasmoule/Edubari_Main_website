"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/navigation";

const normalizeBanner = (item = {}) => ({
  ...item,
  image: item.image || item.imageUrl || item.bannerImage || "",
  alt: item.alt || item.altText || item.title || "Home banner",
  title: item.title || "",
  subtitle: item.subtitle || item.description || "",
  order: Number.isFinite(Number(item.order_index || item.order)) ? Number(item.order_index || item.order) : 1,
  isActive:
    typeof item.active === "boolean"
      ? item.active
      : typeof item.isActive === "boolean"
        ? item.isActive
        : true,
});

const HeroSlider = () => {
  const [banners, setBanners] = useState(null); // null = not loaded, [] = loaded but empty

  useEffect(() => {
    let isMounted = true;

    const loadBanners = async () => {
      try {
        const response = await fetch("/api/banners");
        if (!response.ok) throw new Error("Failed to fetch banners");

        const data = await response.json();
        const list = Array.isArray(data) ? data : data ? [data] : [];

        if (isMounted) {
          setBanners(list.map(normalizeBanner));
        }
      } catch (error) {
        if (isMounted) setBanners([]);
      }
    };

    loadBanners();

    return () => {
      isMounted = false;
    };
  }, []);

  const slides = useMemo(() => {
    if (!banners) return [];
    return banners
      .map(normalizeBanner)
      .filter((item) => item.isActive && item.image)
      .sort((a, b) => a.order - b.order);
  }, [banners]);

  // Loader while banners are loading
  if (banners === null) {
    return (
      <div className="w-full">
        <div className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] lg:min-h-[600px] bg-gray-200 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500" />
        </div>
      </div>
    );
  }

  // If no dynamic banners are loaded from database, return a static default slide to wow the user
  if (slides.length === 0) {
    return (
      <div className="w-full">
        <div className="relative w-full min-h-[70vh] sm:min-h-[80vh] md:min-h-[85vh] lg:min-h-[680px] overflow-hidden bg-dark flex items-center">
          {/* Subtle tech dot grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          
          {/* Premium Ambient Light Glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-tertiary/10 rounded-full blur-[120px] pointer-events-none -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#8B5CF6]/10 rounded-full blur-[100px] pointer-events-none -ml-48 -mb-48" />

          {/* Gradients */}
          <div className="absolute inset-0 bg-linear-to-r from-dark via-dark/95 to-transparent opacity-95 z-10" />
          
          <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-12 text-white flex flex-col justify-between w-full h-full">
            <div className="grid lg:grid-cols-12 gap-8 items-center my-auto w-full">
              {/* Left Column - Content */}
              <div className="lg:col-span-7 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#a78bfa] text-xs font-bold tracking-wider uppercase mb-6 animate-fadeUp backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a78bfa] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#a78bfa]"></span>
                  </span>
                  Edubari Digital Platform
                </div>

                <h2 className="animate-fadeUp text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight drop-shadow-md">
                  Smart Digital Solutions for Your{" "}
                  <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary via-[#A78BFA] to-[#8B5CF6] drop-shadow-sm font-extrabold">
                    Educational Institution
                  </span>
                </h2>

                <p className="animate-fadeUp delay-200 mt-5 text-base sm:text-lg lg:text-xl text-white/70 font-medium max-w-2xl leading-relaxed">
                  Launch your online coaching center, automate student management, attendance, fees collections, and exams with Edubari.
                </p>

                {/* Action Buttons */}
                <div className="animate-fadeUp delay-200 mt-8 flex flex-wrap gap-4 items-center">
                  <a
                    href="#pricing"
                    className="rounded-full bg-linear-to-r from-tertiary to-[#8B5CF6] hover:from-tertiary-dark hover:to-[#7c3aed] px-8 py-3.5 text-sm font-bold shadow-lg shadow-tertiary/20 hover:shadow-xl hover:shadow-tertiary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                  >
                    Explore Plans
                  </a>
                  <a
                    href="#contact"
                    className="rounded-full bg-white/10 hover:bg-white/15 border border-white/20 px-8 py-3.5 text-sm font-bold backdrop-blur-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                  >
                    Contact Sales
                  </a>
                </div>
              </div>

              {/* Right Column - Image Illustration (Desktop only) */}
              <div className="lg:col-span-5 hidden lg:flex justify-center items-center">
                <div className="relative rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md shadow-2xl shadow-black/40 overflow-hidden group/image hover:-translate-y-1.5 transition-all duration-500 animate-fadeUp delay-200">
                  <img
                    src="/hero-dashboard.png"
                    alt="Edubari school platform system dashboard mockup illustration representation"
                    className="w-full max-w-[420px] rounded-2xl object-contain"
                  />
                  {/* Subtle glossy overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Micro Quick Stats */}
            <div className="animate-fadeUp delay-200 mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl border-t border-white/10 pt-6">
              {[
                { label: "Active Brands", value: "50+" },
                { label: "Setup Delivery", value: "24h" },
                { label: "Platform Uptime", value: "99.9%" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-white to-white/70">
                    {stat.value}
                  </p>
                  <p className="text-[11px] sm:text-xs font-semibold text-white/40 uppercase tracking-wider mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative group">
      <Swiper
        slidesPerView={1}
        loop={true}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1500}
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={true}
        modules={[Autoplay, EffectFade, Pagination, Navigation]}
        className="heroSwiper w-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id || slide.image}>
            <div className="relative w-full h-[65vh] sm:h-[75vh] md:h-[80vh] lg:min-h-[640px] overflow-hidden bg-dark">
              {/* Image with Zoom Effect */}
              <img
                src={slide.image}
                alt={slide.alt}
                className="h-full w-full object-cover animate-zoom opacity-80"
              />

              {/* Overlay with radial gradients for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/45 to-transparent z-10" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_40%)] z-10 pointer-events-none" />

              {/* Content Card with Glassmorphic design to stand out */}
              {(slide.title || slide.subtitle) && (
                <div className="absolute inset-0 flex items-center z-20">
                  <div className="max-w-4xl px-6 sm:px-10 lg:px-14 w-full">
                    <div className="max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 md:p-10 backdrop-blur-md shadow-2xl shadow-black/30 animate-fadeUp">
                      {slide.title && (
                        <h2 className="text-3xl sm:text-4.5xl lg:text-5xl font-black leading-tight tracking-tight text-white drop-shadow-md">
                          {slide.title}
                        </h2>
                      )}

                      {slide.subtitle && (
                        <p className="mt-4 text-sm sm:text-base lg:text-lg text-white/80 font-medium leading-relaxed drop-shadow-sm">
                          {slide.subtitle}
                        </p>
                      )}

                      <div className="mt-6 flex gap-4">
                        <a
                          href="#pricing"
                          className="rounded-full bg-linear-to-r from-tertiary to-[#8B5CF6] hover:from-tertiary-dark hover:to-[#7c3aed] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-tertiary/20 hover:shadow-lg transition-all duration-300"
                        >
                          Get Started
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroSlider;
