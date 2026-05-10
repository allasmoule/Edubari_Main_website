import React, { useState } from "react";
import { NavLink } from "react-router";
import { FiFacebook, FiTwitter, FiInstagram, FiGlobe, FiClock } from "react-icons/fi";

const Footer = () => {
    const year = new Date().getFullYear();
    const [language, setLanguage] = useState("EN");

    return (
        <footer className="w-full bg-primary/95 backdrop-blur-sm px-4 sm:px-6 md:px-12 py-10 border-t border-white/20">
            <div className="w-full">
                <div className="w-full rounded-[28px] border border-white/20 bg-primary/95 backdrop-blur-sm overflow-hidden">
                    <div className="px-6 sm:px-8 md:px-10 lg:px-12 py-10 sm:py-12">
                        {/* Top Grid */}
                        <div className="grid gap-10 lg:grid-cols-[1.2fr_auto_1fr_1fr] items-start">
                            {/* Brand */}
                            <div className="text-center lg:text-left">
                                <NavLink
                                    to="/"
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
                                </NavLink>

                                <p className="mt-4 text-sm sm:text-[15px] leading-7 text-dark/70 max-w-sm mx-auto lg:mx-0">
                                    A modern learning platform built for students with
                                    smart digital learning, accessible resources, and a
                                    seamless online experience.
                                </p>

                                <p className="mt-4 text-sm text-dark/65 font-medium">
                                    Learn smarter. Grow faster.
                                </p>
                            </div>

                            {/* Vertical Divider */}
                            <div className="hidden lg:block h-full w-px justify-self-center bg-white/20" />

                            {/* Quick Links */}
                            <div className="text-center lg:text-left">
                                <h3 className="text-[18px] font-bold text-dark mb-5">
                                    Quick Links
                                </h3>

                                <ul className="space-y-3">
                                    <li>
                                        <NavLink
                                            to="/privacy-policy"
                                            className="relative inline-flex items-center text-[15px] text-dark/75 hover:text-secondary font-medium transition-all duration-300"
                                        >
                                            Privacy Policy
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink
                                            to="/terms-of-service"
                                            className="relative inline-flex items-center text-[15px] text-dark/75 hover:text-secondary font-medium transition-all duration-300"
                                        >
                                            Terms of Service
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink
                                            to="/contact"
                                            className="relative inline-flex items-center text-[15px] text-dark/75 hover:text-secondary font-medium transition-all duration-300"
                                        >
                                            Contact Us
                                        </NavLink>
                                    </li>
                                </ul>
                            </div>

                            {/* Social */}
                            <div className="text-center lg:text-left">
                                <h3 className="text-[18px] font-bold text-dark mb-5">
                                    Follow Us
                                </h3>

                                <p className="text-sm text-dark/65">
                                    Stay connected on social media
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
                            <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-dark/65">
                                <FiClock className="h-4 w-4" />
                                <span>Copyright © {year} EduBari. All rights reserved by Botbari.</span>
                            </div>

                            <div className="text-sm text-dark/65">
                                <NavLink
                                    to="/cookies"
                                    className="text-sm font-medium text-dark/75 hover:text-secondary transition-colors duration-300"
                                >
                                    Cookies
                                </NavLink>
                            </div>

                            <div className="text-sm text-dark/65">
                                <NavLink
                                    to="/sitemap"
                                    className="text-sm font-medium text-dark/75 hover:text-secondary transition-colors duration-300"
                                >
                                    Sitemap
                                </NavLink>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-sm text-dark/65">
                                <FiGlobe className="h-4 w-4" />
                                <span className="font-medium text-dark/75">Language:</span>

                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="rounded-full border border-white/30 bg-white/40 px-3 py-1.5 text-dark/80 transition-all duration-300 hover:bg-white/60 hover:text-secondary focus:outline-none cursor-pointer"
                                >
                                    <option value="EN">EN</option>
                                    <option value="BN">BN</option>
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