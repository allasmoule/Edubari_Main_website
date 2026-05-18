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
    <section className="w-full px-4 sm:px-6 md:px-12 py-4 sm:py-6 lg:py-8 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="max-w-3xl mx-auto text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-widest uppercase mb-4 shadow-sm border border-blue-100/50">
                    <FiUsers className="h-3.5 w-3.5" />
                    TRUSTED PARTNERS
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-[#1E293B] leading-tight mb-2">
                    Our Respected <span className="text-[#3B42F2]">Clients</span>
                </h2>

                <p className="mt-2 text-xs sm:text-sm lg:text-base text-[#64748B] font-medium max-w-2xl mx-auto leading-snug">
                    Trusted by leading academics, professionals, and institutions across the country.
                </p>
            </div>

            {/* Marquee Carousel */}
            <div
                className="relative overflow-hidden group"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {/* Gradient Masks */}
                <div className="absolute inset-y-0 left-0 w-32 bg-linear-to-r from-white to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-32 bg-linear-to-l from-white to-transparent z-10 pointer-events-none" />

                <div
                    ref={trackRef}
                    className="flex will-change-transform gap-6 py-4"
                    style={{ width: "max-content" }}
                >
                    {cards.map((client, index) => (
                        <div
                            key={`${client.id}-${index}`}
                            className="flex-none w-[280px] sm:w-[320px]"
                        >
                            <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300 transition-all duration-500 flex flex-col items-center text-center group/card hover:-translate-y-1">
                                <div className="w-20 h-20 rounded-full p-1 bg-linear-to-br from-[#3B42F2] to-indigo-400 mb-5 group-hover/card:scale-105 transition-transform duration-500">
                                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-white">
                                        <img
                                            src={client.Client_Image}
                                            alt={client.Client_Name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = "https://ui-avatars.com/api/?name=" + client.Client_Name;
                                            }}
                                        />
                                    </div>
                                </div>

                                <h3 className="text-lg font-black text-[#1E293B] mb-0.5 group-hover/card:text-[#3B42F2] transition-colors">
                                    {client.Client_Name}
                                </h3>
                                <p className="text-[#3B42F2] font-black text-[9px] uppercase tracking-widest mb-3">
                                    {client.Client_Designation}
                                </p>
                                <div className="w-12 h-1 bg-slate-100 rounded-full mb-3 group-hover/card:w-20 group-hover/card:bg-[#3B42F2] transition-all duration-500" />
                                <p className="text-[#64748B] text-xs font-semibold leading-snug">
                                    {client.Client_Institutte}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats bar */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-12 sm:gap-20">
                {[
                    { value: "50+", label: "Happy Clients" },
                    { value: "20+", label: "Institutions" },
                    { value: "100%", label: "Satisfaction" },
                ].map((stat) => (
                    <div key={stat.label} className="text-center group">
                        <p className="text-3xl sm:text-4xl font-black text-[#1E293B] tracking-tight mb-0.5 group-hover:text-[#3B42F2] transition-colors duration-300">
                            {stat.value}
                        </p>
                        <p className="text-[#64748B] font-black text-xs uppercase tracking-widest">
                            {stat.label}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    </section>
    );
};

export default OurClients;
