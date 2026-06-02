"use client";

import React, { useState, useEffect, useRef } from "react";
import { FiMessageCircle, FiPhone, FiMail, FiArrowRight } from "react-icons/fi";
import NewsletterPopup from "./NewsletterPopup";

const contacts = [
  {
    icon: <FiMessageCircle className="h-5 w-5" />,
    title: "WhatsApp",
    info: "Chat on WhatsApp",
    href: "https://wa.me/8801754958008",
    external: true,
    color: "text-[#25D366]",
    bg: "bg-[#25D366]/10",
    border: "group-hover:border-[#25D366]/25",
  },
  {
    icon: <FiPhone className="h-5 w-5" />,
    title: "Phone",
    info: "Call Now",
    href: "tel:+8801754958008",
    external: false,
    color: "text-tertiary",
    bg: "bg-tertiary/10",
    border: "group-hover:border-tertiary/25",
  },
  {
    icon: <FiMail className="h-5 w-5" />,
    title: "Email",
    info: "support.edubari@gmail.com",
    href: "mailto:support.edubari@gmail.com",
    external: false,
    color: "text-[#8B5CF6]",
    bg: "bg-[#8B5CF6]/10",
    border: "group-hover:border-[#8B5CF6]/25",
  },
];

const GetInTouch = () => {
  const [showPopup, setShowPopup] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const hasSeen = localStorage.getItem("hasSeenNewsletterPopup");
    if (hasSeen === "true") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShowPopup(true);
          localStorage.setItem("hasSeenNewsletterPopup", "true");
          observer.disconnect();
        }
      },
      { threshold: 0.3 } // Trigger when 30% of the section is visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="w-full px-4 sm:px-6 md:px-12 py-8 sm:py-10 bg-primary/20"
    >
      <NewsletterPopup isOpen={showPopup} onClose={() => setShowPopup(false)} />
      <div className="w-full rounded-[32px] border border-white bg-primary-light/80 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.08)] backdrop-blur-md overflow-hidden relative">
        {/* Ambient glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-tertiary/5 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#8B5CF6]/5 rounded-full blur-3xl pointer-events-none -ml-32 -mb-32" />

        <div className="px-6 sm:px-8 md:px-10 lg:px-16 py-8 sm:py-10 lg:py-12 relative z-10">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tertiary/8 border border-tertiary/15 text-tertiary text-xs font-bold tracking-wide uppercase mb-4">
              📞 Contact
            </div>

            <h2 className="text-3xl sm:text-4 sm:text-4.5xl lg:text-5xl font-black tracking-tight text-dark leading-tight">
              Get In{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary via-[#8B5CF6] to-[#7c3aed] drop-shadow-sm">
                Touch
              </span>
            </h2>

            <p className="mt-4 text-sm sm:text-base leading-relaxed text-dark/70 max-w-2xl mx-auto font-medium">
              Have questions? We're here to help
            </p>
          </div>

          {/* Contact Cards */}
          <div className="mt-8 lg:mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {contacts.map((c, idx) => (
              <a
                key={c.title}
                href={c.href}
                {...(c.external && {
                  target: "_blank",
                  rel: "noopener noreferrer",
                })}
                className="group relative rounded-2xl border border-white bg-white/70 backdrop-blur-xs p-4 sm:p-5 flex items-center justify-between transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-tertiary/5 hover:bg-white cursor-pointer decoration-none"
                style={{
                  animationDelay: `${idx * 80}ms`,
                  animation: "fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) backwards",
                }}
              >
                {/* Glow border overlay */}
                <div className={`absolute -inset-[1px] rounded-2xl bg-linear-to-br from-white/10 to-transparent border border-transparent transition-colors duration-500 ${c.border}`} />

                <div className="flex items-center gap-4 relative z-10">
                  {/* Icon */}
                  <div
                    className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${c.bg} ${c.color} shadow-xs transition-all duration-500 group-hover:scale-105 group-hover:shadow-sm`}
                  >
                    {c.icon}
                  </div>

                  {/* Text Details */}
                  <div className="text-left">
                    <h3 className="text-base font-extrabold text-dark tracking-tight leading-none">
                      {c.title}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-dark/50 font-bold leading-none">
                      {c.info}
                    </p>
                  </div>
                </div>

                {/* Right Arrow Indicator */}
                <div className="h-8 w-8 rounded-full bg-dark/5 text-dark/40 flex items-center justify-center relative z-10 transition-all duration-500 group-hover:bg-linear-to-r group-hover:from-tertiary group-hover:to-[#8B5CF6] group-hover:text-white group-hover:translate-x-1">
                  <FiArrowRight className="h-4 w-4" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GetInTouch;
