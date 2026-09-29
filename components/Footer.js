"use client";

import React from "react";
import Link from "next/link";
import { FiFacebook, FiTwitter, FiInstagram, FiGlobe, FiClock } from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";

const Footer = () => {
  const year = new Date().getFullYear();
  const { lang, setLang, t } = useLanguage();

  return (
    <footer className="w-full bg-primary/95 backdrop-blur-sm px-4 sm:px-6 md:px-12 py-10 border-t border-white/20 select-none">
      <div className="w-full">
        <div className="w-full rounded-[28px] border border-white/20 bg-primary/95 backdrop-blur-sm overflow-hidden">
          <div className="px-6 sm:px-8 md:px-10 lg:px-12 py-10 sm:py-12">
            {/* Top Grid */}
            <div className="grid gap-10 lg:grid-cols-[1.2fr_auto_1fr_1fr] items-start">
              {/* Brand */}
              <div className="text-center lg:text-left">
                <Link
                  href="/"
                  className="inline-flex items-center cursor-pointer group select-none"
                >
                  <h2 className="text-[24px] sm:text-[28px] font-black tracking-tighter sm:group-hover:tracking-tight flex items-center transition-all duration-300">
                    <span className="text-dark sm:group-hover:text-tertiary transition-colors duration-300">
                      Edu
                    </span>
                    <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6] sm:group-hover:from-secondary sm:group-hover:to-secondary-light transition-all duration-500 drop-shadow-sm sm:group-hover:drop-shadow-md">
                      Bari
                    </span>
                  </h2>
                </Link>

                <p className="mt-4 text-sm sm:text-[15px] leading-7 text-dark/70 max-w-sm mx-auto lg:mx-0 font-medium">
                  {t("footer.description")}
                </p>

                <p className="mt-4 text-sm text-dark/65 font-bold">
                  {t("footer.slogan")}
                </p>
              </div>

              {/* Vertical Divider */}
              <div className="hidden lg:block h-full w-px justify-self-center bg-white/20" />

              {/* Quick Links */}
              <div className="text-center lg:text-left">
                <h3 className="text-[18px] font-bold text-dark mb-5">
                  {t("footer.quickLinks")}
                </h3>

                <ul className="space-y-3 p-0 list-none">
                  <li>
                    <Link
                      href="/privacy-policy"
                      className="relative inline-flex items-center text-[15px] text-dark/75 hover:text-secondary font-medium transition-all duration-300"
                    >
                      {t("footer.privacyPolicy")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms-of-service"
                      className="relative inline-flex items-center text-[15px] text-dark/75 hover:text-secondary font-medium transition-all duration-300"
                    >
                      {t("footer.termsOfService")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="relative inline-flex items-center text-[15px] text-dark/75 hover:text-secondary font-medium transition-all duration-300"
                    >
                      {t("footer.contactUs")}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Social */}
              <div className="text-center lg:text-left">
                <h3 className="text-[18px] font-bold text-dark mb-5">
                  {t("footer.followUs")}
                </h3>

                <p className="text-sm text-dark/65 font-medium">
                  {t("footer.stayConnected")}
                </p>

                <div className="mt-4 flex items-center justify-center lg:justify-start gap-3">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="group h-10 w-10 rounded-full border border-white/30 bg-white/40 hover:bg-secondary/80 hover:border-white flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <FiFacebook className="text-[18px] text-dark group-hover:text-white transition-colors duration-300" />
                  </a>

                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Twitter"
                    className="group h-10 w-10 rounded-full border border-white/30 bg-white/40 hover:bg-secondary/80 hover:border-white flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <FiTwitter className="text-[18px] text-dark group-hover:text-white transition-colors duration-300" />
                  </a>

                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="group h-10 w-10 rounded-full border border-white/30 bg-white/40 hover:bg-secondary/80 hover:border-white flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <FiInstagram className="text-[18px] text-dark group-hover:text-white transition-colors duration-300" />
                  </a>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="my-8 sm:my-10 h-px bg-white/20" />

            {/* Bottom Row */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto] items-center text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-dark/65 font-medium">
                <FiClock className="h-4 w-4" />
                <span>
                  Copyright © {year} EduBari. {t("footer.copyright")}
                </span>
              </div>

              <div className="text-sm text-dark/65">
                <Link
                  href="/cookies"
                  className="text-sm font-medium text-dark/75 hover:text-secondary transition-colors duration-300"
                >
                  {t("footer.cookies")}
                </Link>
              </div>

              <div className="text-sm text-dark/65">
                <Link
                  href="/sitemap"
                  className="text-sm font-medium text-dark/75 hover:text-secondary transition-colors duration-300"
                >
                  {t("footer.sitemap")}
                </Link>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-dark/65">
                <FiGlobe className="h-4 w-4" />
                <span className="font-bold text-dark/75">{t("footer.languageLabel")}</span>

                <select
                  value={lang.toUpperCase()}
                  onChange={(e) => setLang(e.target.value.toLowerCase())}
                  className="rounded-full border border-white/30 bg-white/40 px-3 py-1.5 text-dark/80 font-bold transition-all duration-300 hover:bg-white/60 hover:text-secondary focus:outline-none cursor-pointer"
                >
                  <option value="BN">BN (বাংলা)</option>
                  <option value="EN">EN (English)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
