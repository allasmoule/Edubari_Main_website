import React, { useState } from "react";
import { NavLink } from "react-router";
import { FiFacebook, FiTwitter, FiInstagram, FiGlobe, FiClock } from "react-icons/fi";

const Footer = () => {
    const year = new Date().getFullYear();
    const [language, setLanguage] = useState("EN");

    return (
    <footer className="w-full bg-[#1E293B] pt-20 pb-10 px-6 sm:px-12 lg:px-24 text-white overflow-hidden relative">
        {/* Background Decorative Gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#3B42F2] to-transparent opacity-30" />
        
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 items-start mb-20">
                {/* Brand Column */}
                <div className="lg:col-span-4 space-y-8">
                    <NavLink to="/" className="inline-block group">
                        <h2 className="text-3xl font-black tracking-tight flex items-center transition-all duration-300">
                            <span className="text-white">Edu</span>
                            <span className="text-[#3B42F2]">Bari</span>
                        </h2>
                    </NavLink>
                    
                    <p className="text-slate-400 font-medium text-base leading-relaxed max-w-sm">
                        Empowering educational institutions across Bangladesh with smart digital management solutions. One platform, infinite possibilities.
                    </p>

                    <div className="flex items-center gap-4">
                        <a href="https://facebook.com" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-[#3B42F2] hover:-translate-y-1 transition-all duration-300 group shadow-lg">
                            <FiFacebook className="text-lg text-slate-400 group-hover:text-white transition-colors" />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-[#3B42F2] hover:-translate-y-1 transition-all duration-300 group shadow-lg">
                            <FiTwitter className="text-lg text-slate-400 group-hover:text-white transition-colors" />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-[#3B42F2] hover:-translate-y-1 transition-all duration-300 group shadow-lg">
                            <FiInstagram className="text-lg text-slate-400 group-hover:text-white transition-colors" />
                        </a>
                    </div>
                </div>

                {/* Quick Links Column */}
                <div className="lg:col-span-2 space-y-6">
                    <h4 className="text-lg font-black tracking-widest uppercase text-white">Platform</h4>
                    <ul className="space-y-4">
                        <li><NavLink to="/" className="text-slate-400 hover:text-white font-semibold transition-colors">Home</NavLink></li>
                        <li><NavLink to="/#features" className="text-slate-400 hover:text-white font-semibold transition-colors">Features</NavLink></li>
                        <li><NavLink to="/#pricing" className="text-slate-400 hover:text-white font-semibold transition-colors">Pricing</NavLink></li>
                        <li><NavLink to="/work-proof" className="text-slate-400 hover:text-white font-semibold transition-colors">Implementations</NavLink></li>
                    </ul>
                </div>

                {/* Support Column */}
                <div className="lg:col-span-2 space-y-6">
                    <h4 className="text-lg font-black tracking-widest uppercase text-white">Support</h4>
                    <ul className="space-y-4">
                        <li><NavLink to="/contact" className="text-slate-400 hover:text-white font-semibold transition-colors">Contact Us</NavLink></li>
                        <li><NavLink to="/privacy-policy" className="text-slate-400 hover:text-white font-semibold transition-colors">Privacy Policy</NavLink></li>
                        <li><NavLink to="/terms-of-service" className="text-slate-400 hover:text-white font-semibold transition-colors">Terms of Service</NavLink></li>
                        <li><NavLink to="/cookies" className="text-slate-400 hover:text-white font-semibold transition-colors">Cookie Policy</NavLink></li>
                    </ul>
                </div>

                {/* Newsletter Column */}
                <div className="lg:col-span-4 space-y-6">
                    <h4 className="text-lg font-black tracking-widest uppercase text-white">Newsletter</h4>
                    <p className="text-slate-400 font-medium text-sm">Stay updated with the latest digital education trends and product updates.</p>
                    <div className="relative group">
                        <input 
                            type="email" 
                            placeholder="Email address" 
                            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-sm font-semibold focus:outline-none focus:border-[#3B42F2] transition-all"
                        />
                        <button className="absolute right-2 top-2 bottom-2 bg-[#3B42F2] text-white px-6 rounded-xl font-black text-xs hover:bg-blue-700 transition-all">
                            JOIN
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3 text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">
                    <FiClock className="h-4 w-4" />
                    <span>© {year} EduBari — Proudly Made by Botbari.</span>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-slate-500 font-black text-xs uppercase tracking-widest">
                        <FiGlobe className="h-4 w-4" />
                        <span>Language:</span>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-transparent border-none outline-none cursor-pointer text-slate-300 hover:text-white transition-colors"
                        >
                            <option value="EN">English</option>
                            <option value="BN">Bangla</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    </footer>
    );
};

export default Footer;