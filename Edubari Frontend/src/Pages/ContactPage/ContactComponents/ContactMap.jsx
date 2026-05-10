import React from "react";
import { FiMapPin } from "react-icons/fi";

const ContactMap = () => {
    return (
        <section className="w-full px-4 sm:px-6 md:px-12 py-14 sm:py-16">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold tracking-wide uppercase mb-4">
                        <FiMapPin className="h-3.5 w-3.5" />
                        Our Location
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter text-dark leading-tight">
                        Find Us On The{" "}
                        <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]">
                            Map
                        </span>
                    </h2>
                    <p className="mt-3 text-sm text-dark/60 max-w-md mx-auto">
                        Visit our office or plan your route — we're always happy to
                        welcome you.
                    </p>
                </div>

                {/* Map Container */}
                <div className="rounded-2xl border border-white/40 bg-white/50 backdrop-blur-md overflow-hidden shadow-lg shadow-dark/5">
                    <iframe
                        title="EduBari Office Location"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.902462935049!2d90.39945231498256!3d23.750904284588735!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b087026b81%3A0x8fa563bbdd5904c2!2sDhaka!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd"
                        width="100%"
                        height="420"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="w-full"
                    />
                </div>

                {/* Address Bar */}
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm text-dark/60">
                    <div className="flex items-center gap-2">
                        <FiMapPin className="h-4 w-4 text-tertiary" />
                        <span className="font-medium">
                            Botbari, Dhaka, Bangladesh
                        </span>
                    </div>
                    <a
                        href="https://maps.google.com/?q=23.7509,90.3995"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-tertiary font-bold hover:underline"
                    >
                        Open in Google Maps →
                    </a>
                </div>
            </div>
        </section>
    );
};

export default ContactMap;
