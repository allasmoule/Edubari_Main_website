"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-fade";

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
        <div className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] lg:min-h-[600px] overflow-hidden bg-dark flex items-center">
          {/* Default Premium Fallback Image */}
          <div className="absolute inset-0 bg-linear-to-r from-dark via-dark/95 to-tertiary-dark/25 opacity-90 z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-tertiary/20 via-transparent to-transparent z-10" />
          
          <div className="relative z-20 max-w-3xl px-6 sm:px-10 lg:px-14 text-white">
            <h2 className="animate-fadeUp text-3xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight drop-shadow-md">
              Smart Digital Solutions for Your{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]">
                Educational Institution
              </span>
            </h2>
            <p className="animate-fadeUp delay-200 mt-4 text-sm sm:text-[17px] lg:text-lg text-white/80 font-medium max-w-2xl leading-relaxed">
              Launch your online coaching center, automate student management, attendance, fees collections, and exams with Edubari.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Swiper
        slidesPerView={1}
        loop={true}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={2000}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        modules={[Autoplay, EffectFade]}
        className="heroSwiper w-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id || slide.image}>
            <div className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] lg:min-h-[600px] overflow-hidden">
              {/* Image with Zoom Effect */}
              <img
                src={slide.image}
                alt={slide.alt}
                className="h-full w-full object-cover animate-zoom"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Content */}
              {(slide.title || slide.subtitle) && (
                <div className="absolute inset-0 flex items-end">
                  <div className="max-w-3xl px-6 sm:px-10 lg:px-14 pb-10 sm:pb-14 lg:pb-18 text-white">
                    {slide.title && (
                      <h2 className="animate-fadeUp text-2xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight drop-shadow-md">
                        {slide.title}
                      </h2>
                    )}

                    {slide.subtitle && (
                      <p className="animate-fadeUp delay-200 mt-3 text-sm sm:text-base lg:text-lg text-white/90 font-medium max-w-2xl drop-shadow-sm">
                        {slide.subtitle}
                      </p>
                    )}
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
