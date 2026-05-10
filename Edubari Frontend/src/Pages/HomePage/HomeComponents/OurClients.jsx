import React, { useState, useEffect, useRef } from "react";
import { FiUsers } from "react-icons/fi";

const OurClients = () => {
    const [clients, setClients] = useState([]);
    const trackRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false);
    const posRef = useRef(0);
    const speedRef = useRef(0.4);

    useEffect(() => {
        fetch("/clients.json")
            .then((res) => res.json())
            .then((data) => setClients(data.clients))
            .catch((error) => console.error("Error fetching clients:", error));
    }, []);

    /* Marquee animation loop */
    useEffect(() => {
        const track = trackRef.current;
        if (!track || clients.length === 0) return;

        let raf;
        const step = () => {
            if (!isPaused) {
                posRef.current += speedRef.current;
                const halfWidth = track.scrollWidth / 2;
                if (posRef.current >= halfWidth) {
                    posRef.current -= halfWidth;
                }
                track.style.transform = `translateX(-${posRef.current}px)`;
            }
            raf = requestAnimationFrame(step);
        };

        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [isPaused, clients]);

    if (clients.length === 0) return null;

    const cards = [...clients, ...clients];

    return (
        <section className="w-full px-4 sm:px-6 md:px-12 py-16 sm:py-20 lg:py-24 bg-primary/40">
            <div className="w-full rounded-[28px] border border-white/20 bg-primary/95 backdrop-blur-sm overflow-hidden">
                <div className="px-6 sm:px-8 md:px-10 lg:px-12 py-12 sm:py-14">
                    {/* ── Header ── */}
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold tracking-wide uppercase mb-4">
                            <FiUsers className="h-3.5 w-3.5" />
                            Our Clients
                        </div>

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-dark leading-tight">
                            Our Respected{" "}
                            <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]">
                                Clients
                            </span>
                        </h2>

                        <p className="mt-5 text-sm sm:text-[15px] lg:text-base leading-7 text-dark/70 max-w-2xl mx-auto">
                            Trusted by leading academics, professionals, and
                            institutions across the country
                        </p>
                    </div>

                    {/* ── Marquee carousel ── */}
                    <div
                        className="mt-12 lg:mt-14 relative overflow-hidden"
                        style={{
                            maskImage:
                                "linear-gradient(90deg, transparent 0%, #000 5%, #000 95%, transparent 100%)",
                            WebkitMaskImage:
                                "linear-gradient(90deg, transparent 0%, #000 5%, #000 95%, transparent 100%)",
                        }}
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        <div
                            ref={trackRef}
                            className="flex will-change-transform"
                            style={{ width: "max-content" }}
                        >
                            {cards.map((client, index) => (
                                <div
                                    key={`${client.id}-${index}`}
                                    className="group flex-none w-[240px] sm:w-[270px] px-2"
                                >
                                    <div className="h-full rounded-2xl border border-white/40 bg-white/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-dark/5 hover:bg-white/80 flex flex-col items-center text-center">
                                        {/* Avatar */}
                                        <div className="w-20 h-20 rounded-full overflow-hidden ring-[3px] ring-tertiary/30 shadow-lg shadow-tertiary/10 transition-transform duration-300 group-hover:scale-105">
                                            <img
                                                src={client.Client_Image}
                                                alt={client.Client_Name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.src =
                                                        "https://via.placeholder.com/150";
                                                }}
                                            />
                                        </div>

                                        {/* Name */}
                                        <h3 className="mt-4 text-[15px] font-bold text-dark leading-snug">
                                            {client.Client_Name}
                                        </h3>

                                        {/* Designation */}
                                        <p className="mt-1 text-xs font-semibold text-tertiary">
                                            {client.Client_Designation}
                                        </p>

                                        {/* Divider */}
                                        <div className="mt-3 w-8 h-[2px] rounded-full bg-linear-to-r from-tertiary to-[#8B5CF6]" />

                                        {/* Institute */}
                                        <p className="mt-3 text-xs text-dark/55 leading-relaxed">
                                            {client.Client_Institutte}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Summary stats bar ── */}
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
                        {[
                            { value: "50+", label: "Happy Clients" },
                            { value: "20+", label: "Institutions" },
                            { value: "100%", label: "Trust" },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="text-2xl sm:text-3xl font-black text-dark tracking-tight">
                                    {stat.value}
                                </p>
                                <p className="mt-1 text-xs sm:text-sm font-medium text-dark/50">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default OurClients;
