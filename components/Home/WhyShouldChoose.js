"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  FiGlobe,
  FiSettings,
  FiUsers,
  FiTrendingUp,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";

const WhyShouldChoose = () => {
  const router = useRouter();
  
  const features = [
    {
      id: "01",
      icon: <FiGlobe className="h-5 w-5" />,
      title: "Dedicated Domain for Your Brand",
      description:
        "Get your own professional web identity where students can easily find, trust, and connect with your teaching brand.",
      accent: "text-tertiary bg-tertiary/10",
      glow: "from-tertiary/20 to-[#8B5CF6]/10",
    },
    {
      id: "02",
      icon: <FiSettings className="h-5 w-5" />,
      title: "We Handle the Tech, You Focus on Teaching",
      description:
        "We handle the technical side for you, so you can focus on teaching while your platform stays modern, polished, and professional.",
      accent: "text-secondary bg-secondary/10",
      glow: "from-secondary/20 to-sky-400/10",
    },
    {
      id: "03",
      icon: <FiUsers className="h-5 w-5" />,
      title: "Everything Organized in One Place",
      description:
        "Manage your students, study materials, updates, and teaching resources from one organized and easy-to-use system.",
      accent: "text-[#8B5CF6] bg-[#8B5CF6]/10",
      glow: "from-[#8B5CF6]/20 to-tertiary/10",
    },
    {
      id: "04",
      icon: <FiTrendingUp className="h-5 w-5" />,
      title: "Build Trust and Attract More Students",
      description:
        "A branded and structured platform helps you build trust, attract more students, and grow your teaching business with confidence.",
      accent: "text-tertiary bg-tertiary/10",
      glow: "from-tertiary/20 to-secondary/10",
    },
  ];

  return (
    <section className="w-full px-4 sm:px-6 md:px-12 py-10 sm:py-12 lg:py-14 bg-primary/20">
      <div className="w-full rounded-[32px] border border-white bg-primary-light/80 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.08)] backdrop-blur-md overflow-hidden relative">
        {/* Decorative corner glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-tertiary/5 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#8B5CF6]/5 rounded-full blur-3xl pointer-events-none -ml-32 -mb-32" />

        <div className="px-6 sm:px-8 md:px-10 lg:px-12 py-10 sm:py-12 relative z-10">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="text-3xl sm:text-4 sm:text-4.5xl lg:text-5xl font-black tracking-tight text-dark leading-tight">
              Why Should Choose{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary via-[#8B5CF6] to-[#7c3aed] drop-shadow-sm">
                EduBari
              </span>
            </h2>

            <p className="mt-4 text-sm sm:text-base leading-relaxed text-dark/70 max-w-2xl mx-auto font-medium">
              EduBari helps teachers build a strong online identity with a dedicated domain, a professional website, and simple management tools — everything needed to grow a modern teaching brand with confidence.
            </p>
          </div>

          {/* Content */}
          <div className="mt-10 grid gap-6 xl:grid-cols-[1.05fr_1.4fr] items-stretch">
            {/* Left Highlight Box */}
            <div className="relative rounded-[28px] border border-white bg-white/70 backdrop-blur-xs p-5 sm:p-6 shadow-lg overflow-hidden flex flex-col justify-between">
              {/* Background overlays */}
              <div className="absolute inset-0 bg-linear-to-br from-white/40 via-white/10 to-tertiary/5 backdrop-blur-[2px]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.08),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.05),transparent_28%)]" />

              <div className="relative z-10">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-linear-to-r from-tertiary to-[#8B5CF6] text-white shadow-md shadow-tertiary/20">
                  <FiCheckCircle className="h-5 w-5" />
                </div>

                <h3 className="mt-5 text-xl sm:text-2xl font-black tracking-tight text-dark leading-tight max-w-md">
                  More Than Just a Website — It’s Your Teaching Brand
                </h3>

                <p className="mt-3.5 text-sm leading-relaxed text-dark/70 font-medium">
                  Teachers deserve more than scattered links, social posts, and manual management. EduBari gives you a complete branded platform that looks professional, feels trustworthy, and makes daily operations easier.
                </p>

                <div className="mt-5 space-y-3">
                  {[
                    "Your own dedicated teaching domain",
                    "Professional online presence for students",
                    "Simple content and student management",
                    "A smarter way to grow your coaching brand",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 text-left"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-tertiary/8 text-tertiary ring-1 ring-tertiary/10 shadow-inner">
                        <FiCheckCircle className="h-3 w-3" />
                      </span>
                      <p className="text-sm text-dark/85 font-semibold leading-relaxed">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 mt-6">
                <button
                  className="inline-flex items-center gap-2 rounded-full bg-secondary hover:bg-secondary-light px-7 py-3 text-sm font-bold text-white shadow-lg shadow-secondary/25 hover:shadow-xl hover:shadow-secondary/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer border-none"
                  onClick={() => router.push("/payment-purchase")}
                >
                  Start With EduBari
                  <FiArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Right Feature Cards */}
            <div className="grid sm:grid-cols-2 gap-5 [perspective:1400px]">
              {features.map((feature, index) => (
                <div key={feature.id} className="group relative">
                  <div
                    className={`
                      absolute -inset-[1px] rounded-[24px] bg-linear-to-br ${feature.glow}
                      opacity-0 blur-xl transition-all duration-500
                      group-hover:opacity-100
                    `}
                  />

                  <div
                    className={`
                      relative h-full rounded-[24px] border border-white bg-white/70
                      backdrop-blur-xs p-5 shadow-sm transition-all duration-500
                      hover:shadow-[0_30px_60px_-20px_rgba(2,6,23,0.15)]
                      hover:bg-white
                      group-hover:-translate-y-2
                      [transform-style:preserve-3d]
                      ${
                        index % 2 === 0
                          ? "group-hover:[transform:rotateX(8deg)_rotateY(-8deg)_translateZ(12px)]"
                          : "group-hover:[transform:rotateX(8deg)_rotateY(8deg)_translateZ(12px)]"
                      }
                    `}
                  >
                    {/* glossy layer */}
                    <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-linear-to-br from-white/25 via-transparent to-transparent opacity-80" />

                    {/* inner glow */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-[24px] bg-linear-to-b from-white/30 to-transparent" />

                    {/* floating orb */}
                    <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/20 blur-2xl transition-all duration-500 group-hover:scale-125" />

                    <div className="relative z-10 flex h-full flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-4 [transform:translateZ(28px)]">
                          <div
                            className={`
                              h-11 w-11 rounded-2xl flex items-center justify-center
                              ${feature.accent}
                              shadow-sm transition-all duration-500
                              group-hover:scale-110 group-hover:shadow-md
                            `}
                          >
                            {feature.icon}
                          </div>
                        </div>

                        <h3 className="mt-4 text-[18px] leading-snug font-extrabold text-dark tracking-tight transition-colors duration-300 group-hover:text-[#8B5CF6] [transform:translateZ(34px)]">
                          {feature.title}
                        </h3>

                        <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-dark/70 font-medium [transform:translateZ(24px)]">
                          {feature.description}
                        </p>
                      </div>

                      <div className="mt-5 flex items-center gap-2 text-xs font-bold text-secondary opacity-0 translate-y-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 [transform:translateZ(30px)]">
                        <span>Learn More</span>
                        <FiArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyShouldChoose;
