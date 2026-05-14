import React from "react";
import { FiMapPin } from "react-icons/fi";

const ContactMap = () => {
    return (
        <section className="w-full px-6 sm:px-12 lg:px-24 py-12 sm:py-20 bg-white">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black tracking-widest uppercase mb-4 border border-blue-100/50">
                        <FiMapPin className="h-3.5 w-3.5" />
                        OUR LOCATION
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1E293B] leading-tight">
                        Find Us on the <span className="text-[#3B42F2]">Map</span>
                    </h2>
                    <p className="mt-4 text-slate-500 font-medium text-lg max-w-xl mx-auto">
                        Visit our office or plan your route — we're always happy to
                        welcome you.
                    </p>
                </div>

                {/* Map Container */}
                <div className="rounded-[40px] border-8 border-slate-50 overflow-hidden shadow-2xl shadow-slate-200/50">
                    <iframe
                        title="EduBari Office Location"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.902462935049!2d90.39945231498256!3d23.750904284588735!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b087026b81%3A0x8fa563bbdd5904c2!2sDhaka!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd"
                        width="100%"
                        height="500"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="w-full"
                    />
                </div>

                {/* Address Bar */}
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
                    <div className="flex items-center gap-4 bg-slate-50 px-8 py-4 rounded-2xl">
                        <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-[#3B42F2]">
                            <FiMapPin className="h-5 w-5" />
                        </div>
                        <span className="font-black text-[#1E293B] text-sm tracking-tight">
                            Botbari, Dhaka, Bangladesh
                        </span>
                    </div>
                    <a
                        href="https://maps.google.com/?q=23.7509,90.3995"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[#3B42F2] font-black text-xs uppercase tracking-widest group"
                    >
                        GET DIRECTIONS <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default ContactMap;
