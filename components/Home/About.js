"use client";

import React, { useState, useEffect } from "react";
import { FiHeart, FiTarget, FiShield, FiZap, FiLoader } from "react-icons/fi";

const About = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch("/api/team");
        if (res.ok) {
          const data = await res.json();
          // Filter out inactive members
          setTeam(data.filter((m) => m.active));
        }
      } catch (err) {
        console.error("Failed to load team:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  return (
    <section
      id="about"
      className="w-full px-4 sm:px-6 md:px-12 py-8 sm:py-10 bg-primary/20"
    >
      <div className="w-full rounded-[32px] border border-white bg-primary-light/80 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.08)] backdrop-blur-md overflow-hidden relative">
        {/* Glow decoration */}
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-tertiary/5 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />

        <div className="px-6 sm:px-8 md:px-10 lg:px-16 py-8 sm:py-10 lg:py-12 relative z-10">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tertiary/8 border border-tertiary/15 text-tertiary text-xs font-bold tracking-wide uppercase mb-4">
              <FiHeart className="h-3.5 w-3.5 text-red-500 animate-pulse" />
              About Us
            </div>

            <h2 className="text-3xl sm:text-4 sm:text-4.5xl lg:text-5xl font-black tracking-tight text-dark leading-tight">
              Who We{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary via-[#8B5CF6] to-[#7c3aed] drop-shadow-sm">
                Are
              </span>
            </h2>

            <p className="mt-4 text-sm sm:text-base leading-relaxed text-dark/70 max-w-2xl mx-auto font-medium">
              EduBari is a complete digital management platform built for educational institutions in Bangladesh — helping teachers, schools, and coaching centers run smarter every day.
            </p>
          </div>

          {/* Two-column content */}
          <div className="mt-8 lg:mt-10 grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto items-center">
            {/* Left — narrative */}
            <div className="space-y-4 text-sm sm:text-base leading-relaxed text-dark/70 font-semibold">
              <p>
                We started with a simple observation: thousands of dedicated educators across Bangladesh were still relying on paper registers, scattered WhatsApp groups, and manual fee tracking.
              </p>
              <p>
                EduBari was built to solve that. We give every institution its own branded website, a complete management dashboard, and tools for attendance, exams, results, and fee collection — all set up within 24 hours.
              </p>
              <p>
                Today, we proudly serve{" "}
                <span className="font-extrabold text-tertiary">50+ institutions</span> and{" "}
                <span className="font-extrabold text-[#8B5CF6]">5,000+ students</span>, with a team that believes great technology should be accessible to everyone.
              </p>
            </div>

            {/* Right — stats inline */}
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: <FiTarget className="h-5 w-5" />,
                  value: "50+",
                  label: "Institutions",
                  accent: "text-tertiary bg-tertiary/10 ring-1 ring-tertiary/20",
                },
                {
                  icon: <FiZap className="h-5 w-5" />,
                  value: "24h",
                  label: "Setup Time",
                  accent: "text-[#8B5CF6] bg-[#8B5CF6]/10 ring-1 ring-[#8B5CF6]/20",
                },
                {
                  icon: <FiShield className="h-5 w-5" />,
                  value: "99.9%",
                  label: "Uptime",
                  accent: "text-secondary bg-secondary/10 ring-1 ring-secondary/20",
                },
                {
                  icon: <FiHeart className="h-5 w-5" />,
                  value: "100%",
                  label: "Satisfaction",
                  accent: "text-tertiary bg-tertiary/10 ring-1 ring-tertiary/20",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="group rounded-2xl border border-white bg-white/70 backdrop-blur-xs p-4 sm:p-5 text-center transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-tertiary/5 hover:bg-white"
                >
                  <div
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${stat.accent} mb-3 transition-transform duration-500 group-hover:scale-110`}
                  >
                    {stat.icon}
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-dark tracking-tight">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs font-bold text-dark/45 uppercase tracking-wide">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="mt-16 pt-12 border-t border-dark/5 relative">
            <div className="text-center mb-10">
              <h3 className="text-2xl sm:text-3xl font-black text-dark tracking-tight">
                Meet the <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]">Team</span>
              </h3>
              <p className="text-sm font-medium text-dark/50 mt-2 max-w-lg mx-auto">
                The passionate minds behind EduBari.
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <FiLoader className="w-8 h-8 text-tertiary animate-spin" />
              </div>
            ) : team.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
                {team.map((member) => (
                  <div key={member.id} className="group flex flex-col items-center text-center p-4 rounded-2xl border border-white/50 bg-white/40 backdrop-blur-sm hover:bg-white/80 shadow-md hover:shadow-xl hover:shadow-tertiary/10 transition-all duration-300 hover:-translate-y-1">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-4 border-4 border-white shadow-md relative bg-dark/5">
                      {member.image_url ? (
                        <img 
                          src={member.image_url} 
                          alt={member.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-black text-dark/20 uppercase">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-dark w-full line-clamp-1">{member.name}</h4>
                    <p className="text-xs font-semibold text-tertiary mt-1 w-full line-clamp-2">{member.description}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
